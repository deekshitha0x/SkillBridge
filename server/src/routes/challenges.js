import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { checkEligibility } from '../lib/eligibility.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/challenges
 * List all challenges with job info and student eligibility status if applicable
 */
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = null;
    let userRole = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'skillbridge_hackathon_super_secret_jwt_key_2026'
        );
        userId = decoded.userId;
        userRole = decoded.role;
      } catch (err) {
        // Soft fail
      }
    }

    const challenges = await prisma.challenge.findMany({
      include: {
        job: {
          include: { company: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let enrichedChallenges = [...challenges];

    if (userId && userRole === 'student') {
      enrichedChallenges = await Promise.all(
        challenges.map(async (ch) => {
          const { eligible, reasons } = await checkEligibility(userId, ch.id);
          
          // Check if student already submitted this challenge
          const existingSubmission = await prisma.submission.findFirst({
            where: { challengeId: ch.id, userId },
          });

          return {
            ...ch,
            eligible,
            eligibilityReasons: reasons,
            userSubmission: existingSubmission || null,
          };
        })
      );
    }

    res.json(enrichedChallenges);
  } catch (error) {
    console.error('Fetch challenges error:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

/**
 * GET /api/challenges/:id
 * Get challenge details with eligibility analysis
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        job: {
          include: { company: true },
        },
        submissions: {
          where: req.user.role === 'student' ? { userId: req.user.id } : {},
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    let eligibility = { eligible: true, reasons: [] };
    if (req.user.role === 'student') {
      eligibility = await checkEligibility(req.user.id, id);
    }

    res.json({
      challenge,
      eligibility,
    });
  } catch (error) {
    console.error('Fetch challenge detail error:', error);
    res.status(500).json({ error: 'Failed to fetch challenge detail' });
  }
});

/**
 * POST /api/challenges
 * Create challenge (Recruiter only)
 */
router.post('/', requireAuth, requireRole('recruiter'), async (req, res) => {
  try {
    const { jobId, title, description, requiredSkills, difficultyLevel, timeLimitMinutes } = req.body;

    if (!jobId || !title || !description) {
      return res.status(400).json({ error: 'jobId, title, and description are required' });
    }

    const challenge = await prisma.challenge.create({
      data: {
        jobId,
        title,
        description,
        requiredSkills: requiredSkills || [],
        difficultyLevel: Number(difficultyLevel) || 1,
        timeLimitMinutes: Number(timeLimitMinutes) || 60,
      },
      include: { job: { include: { company: true } } },
    });

    res.status(201).json(challenge);
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

/**
 * POST /api/challenges/:id/submit
 * Submit solution (Student only - must be eligible)
 */
router.post('/:id/submit', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const { content, tabSwitches } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Submission content cannot be empty' });
    }

    // Check eligibility before allowing submission
    const { eligible, reasons } = await checkEligibility(req.user.id, id);
    if (!eligible) {
      return res.status(403).json({
        error: 'Ineligible to attempt this challenge',
        reasons,
      });
    }

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        challengeId: id,
        userId: req.user.id,
        content,
        status: 'pending',
        verifiedByRecruiter: false,
        tabSwitches: tabSwitches || 0,
      },
      include: { challenge: true },
    });

    res.status(201).json({
      message: 'Challenge solution submitted successfully! Pending recruiter review.',
      submission,
    });
  } catch (error) {
    console.error('Submit challenge error:', error);
    res.status(500).json({ error: 'Failed to submit challenge solution' });
  }
});

/**
 * POST /api/challenges/:id/review
 * Recruiter reviews submission and updates StudentSkill level in a single transaction
 */
router.post('/:id/review', requireAuth, requireRole('recruiter'), async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionId, verified, hiringStatus } = req.body;

    if (!submissionId) {
      return res.status(400).json({ error: 'submissionId is required' });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { challenge: true, user: true },
    });

    if (!submission || submission.challengeId !== id) {
      return res.status(404).json({ error: 'Submission not found for this challenge' });
    }

    const isVerified = Boolean(verified);
    const validHiringStatus = ['pending', 'shortlisted', 'hired', 'rejected'].includes(hiringStatus)
      ? hiringStatus
      : submission.hiringStatus || 'pending';

    // Identify primary skill associated with challenge
    const reqSkills = Array.isArray(submission.challenge.requiredSkills)
      ? submission.challenge.requiredSkills
      : [];

    let targetSkillId = reqSkills.length > 0 ? reqSkills[0].skillId : null;

    if (!targetSkillId && reqSkills.length > 0 && reqSkills[0].skillName) {
      const foundSkill = await prisma.skill.findUnique({
        where: { name: reqSkills[0].skillName },
      });
      if (foundSkill) targetSkillId = foundSkill.id;
    }

    // Default to Python or any first skill if unspecified
    if (!targetSkillId) {
      const fallbackSkill = await prisma.skill.findFirst();
      targetSkillId = fallbackSkill ? fallbackSkill.id : null;
    }

    const challengeLevel = submission.challenge.difficultyLevel || 1;

    // Execute in a single Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Submission status & hiringStatus
      const updatedSubmission = await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: 'reviewed',
          verifiedByRecruiter: isVerified,
          hiringStatus: validHiringStatus,
        },
      });

      let updatedStudentSkill = null;

      if (isVerified && targetSkillId) {
        // Update or create StudentSkill status to verified & level to challenge level
        const existingSkill = await tx.studentSkill.findUnique({
          where: {
            userId_skillId: {
              userId: submission.userId,
              skillId: targetSkillId,
            },
          },
        });

        if (existingSkill) {
          updatedStudentSkill = await tx.studentSkill.update({
            where: { id: existingSkill.id },
            data: {
              status: 'verified',
              level: challengeLevel,
            },
          });
        } else {
          updatedStudentSkill = await tx.studentSkill.create({
            data: {
              userId: submission.userId,
              skillId: targetSkillId,
              status: 'verified',
              level: challengeLevel,
            },
          });
        }
      }

      return { updatedSubmission, updatedStudentSkill };
    });

    res.json({
      message: 'Submission review recorded successfully!',
      ...result,
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: 'Failed to record submission review' });
  }
});

/**
 * PATCH /api/challenges/:id/status
 * Toggle or set challenge status ('open' | 'closed') (Recruiter only)
 */
router.patch('/:id/status', requireAuth, requireRole('recruiter'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'open' or 'closed'" });
    }

    const updated = await prisma.challenge.update({
      where: { id },
      data: { status },
    });

    res.json({
      message: `Challenge status updated to ${status}`,
      challenge: updated,
    });
  } catch (error) {
    console.error('Update challenge status error:', error);
    res.status(500).json({ error: 'Failed to update challenge status' });
  }
});

export default router;
