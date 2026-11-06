import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { checkEligibility, isEligibleForWaiver, evaluateWaiverEligibility } from '../lib/eligibility.js';
import { isValidHiringStatus, ALLOWED_HIRING_STATUSES } from '../lib/reviewValidation.js';

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
          process.env.JWT_SECRET
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
          const { eligible, reasons, allAlreadyVerified } = await checkEligibility(userId, ch.id);
          
          // Check if student already submitted this challenge
          const existingSubmission = await prisma.submission.findFirst({
            where: { challengeId: ch.id, userId },
          });

          return {
            ...ch,
            eligible,
            allAlreadyVerified,
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
 * Role-scoped submissions access:
 * - Student: only sees own submission (no user object, no skills tree)
 * - Recruiter: only sees submissions if they own the challenge's company (user id, name, skills only, NO email)
 * - Institution: 403 Forbidden
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Institution users get 403 on challenge submissions
    if (req.user.role === 'institution') {
      return res.status(403).json({ error: 'Access denied: Institution users cannot view challenge submissions' });
    }

    const challengeBase = await prisma.challenge.findUnique({
      where: { id },
      include: {
        job: {
          include: { company: true },
        },
      },
    });

    if (!challengeBase) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Recruiter ownership check: only the recruiter who owns the challenge may view it
    if (req.user.role === 'recruiter') {
      const companyRecruiterId = challengeBase.job?.company?.recruiterId;
      if (companyRecruiterId !== req.user.id) {
        return res.status(403).json({
          error: 'Access denied: You can only view submissions for challenges owned by your company',
        });
      }
    }

    // Role-specific submissions query
    let submissions = [];
    if (req.user.role === 'student') {
      submissions = await prisma.submission.findMany({
        where: { challengeId: id, userId: req.user.id },
        select: {
          id: true,
          challengeId: true,
          content: true,
          isWaiver: true,
          status: true,
          hiringStatus: true,
          verifiedByRecruiter: true,
          tabSwitches: true,
          createdAt: true,
        },
      });
    } else if (req.user.role === 'recruiter') {
      submissions = await prisma.submission.findMany({
        where: { challengeId: id },
        select: {
          id: true,
          challengeId: true,
          content: true,
          isWaiver: true,
          status: true,
          hiringStatus: true,
          verifiedByRecruiter: true,
          tabSwitches: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              studentSkills: {
                select: {
                  skillId: true,
                  skill: { select: { name: true } },
                  status: true,
                  level: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    let eligibility = undefined;
    if (req.user.role === 'student') {
      const rawEligibility = await checkEligibility(req.user.id, id);
      eligibility = {
        eligible: rawEligibility.eligible,
        allAlreadyVerified: rawEligibility.allAlreadyVerified,
        reasons: rawEligibility.reasons,
        requiredSkills: rawEligibility.requiredSkills,
      };
    }

    // Strip recruiterId from company object if present
    let sanitizedJob = challengeBase.job;
    if (sanitizedJob && sanitizedJob.company) {
      const { recruiterId, ...sanitizedCompany } = sanitizedJob.company;
      sanitizedJob = {
        ...sanitizedJob,
        company: sanitizedCompany,
      };
    }

    const challenge = {
      ...challengeBase,
      job: sanitizedJob,
      submissions,
    };

    const responsePayload = { challenge };
    if (req.user.role === 'student') {
      responsePayload.eligibility = eligibility;
    }

    res.json(responsePayload);
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
    const { jobId, title, description, requiredSkills, difficultyLevel, timeLimitMinutes, allowWaiver } = req.body;

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
        allowWaiver: allowWaiver !== false,
      },
      include: { job: { include: { company: true } } },
    });

    if (challenge.job?.company) {
      const { recruiterId, ...sanitizedCompany } = challenge.job.company;
      challenge.job.company = sanitizedCompany;
    }

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

    // Check existing submission record
    const existingSubmission = await prisma.submission.findFirst({
      where: { challengeId: id, userId: req.user.id },
    });
    if (existingSubmission) {
      return res.status(400).json({ error: 'You have already submitted an application for this challenge' });
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
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'You have already submitted an application for this challenge' });
    }
    console.error('Submit challenge error:', error);
    res.status(500).json({ error: 'Failed to submit challenge solution' });
  }
});

/**
 * POST /api/challenges/:id/waiver
 * Apply with pre-verified skills without re-solving challenge (Student only)
 */
router.post('/:id/waiver', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
    });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check recruiter toggle: allowWaiver
    if (challenge.allowWaiver === false) {
      return res.status(403).json({
        error: 'Pre-verified waivers are not accepted for this challenge. You must complete the challenge.',
      });
    }

    // Reject if the student already has any submission for this challenge (waiver or real)
    const existingSubmission = await prisma.submission.findFirst({
      where: { challengeId: id, userId: req.user.id },
    });
    if (existingSubmission) {
      return res.status(400).json({
        error: 'You have already submitted an application for this challenge',
      });
    }

    // Re-run checkEligibility on the server. Require eligible === true AND allAlreadyVerified === true.
    const eligibility = await checkEligibility(req.user.id, id);
    const waiverDecision = evaluateWaiverEligibility({
      eligibility,
      allowWaiver: challenge.allowWaiver,
      existingSubmission,
    });

    if (!waiverDecision.allowed) {
      return res.status(403).json({
        error: waiverDecision.reason || 'Ineligible for pre-verified waiver.',
        reasons: eligibility.reasons,
        eligible: eligibility.eligible,
        allAlreadyVerified: eligibility.allAlreadyVerified,
      });
    }

    // Create a Submission with isWaiver: true, content: '', tabSwitches: 0, verifiedByRecruiter: false, hiringStatus: 'pending'
    const submission = await prisma.submission.create({
      data: {
        challengeId: id,
        userId: req.user.id,
        content: '',
        isWaiver: true,
        status: 'pending',
        hiringStatus: 'pending',
        verifiedByRecruiter: false,
        tabSwitches: 0,
      },
      include: { challenge: true },
    });

    res.status(201).json({
      message: 'Applied with pre-verified skills successfully! Pending recruiter review.',
      submission,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'You have already submitted an application for this challenge' });
    }
    console.error('Apply waiver error:', error);
    res.status(500).json({ error: 'Failed to apply with verified skills waiver' });
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
      include: { challenge: { include: { job: { include: { company: true } } } }, user: true },
    });

    if (!submission || submission.challengeId !== id) {
      return res.status(404).json({ error: 'Submission not found for this challenge' });
    }

    // Recruiter ownership check
    if (submission.challenge?.job?.company?.recruiterId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only review submissions for challenges owned by your company' });
    }

    const isVerified = Boolean(verified);
    const isWaiver = Boolean(submission.isWaiver);

    if (!isValidHiringStatus(hiringStatus)) {
      return res.status(400).json({
        error: `Invalid hiringStatus "${hiringStatus}". Allowed values: ${ALLOWED_HIRING_STATUSES.join(', ')}`,
      });
    }
    const validHiringStatus = hiringStatus || submission.hiringStatus || 'pending';

    // Identify all skills associated with challenge
    const reqSkills = Array.isArray(submission.challenge.requiredSkills)
      ? submission.challenge.requiredSkills
      : [];

    const targetSkillIds = [];
    for (const req of reqSkills) {
      let sId = req.skillId || null;
      if (!sId && req.skillName) {
        const foundSkill = await prisma.skill.findUnique({
          where: { name: req.skillName },
        });
        if (foundSkill) sId = foundSkill.id;
      }
      if (sId && !targetSkillIds.includes(sId)) {
        targetSkillIds.push(sId);
      }
    }

    // Default to Python or any first skill if unspecified
    if (targetSkillIds.length === 0) {
      const fallbackSkill = await prisma.skill.findFirst();
      if (fallbackSkill) {
        targetSkillIds.push(fallbackSkill.id);
      }
    }

    const challengeLevel = submission.challenge.difficultyLevel || 1;

    // Execute in a single Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Submission status & hiringStatus
      // IMPORTANT: Waiver review must NOT set verifiedByRecruiter to true!
      const updatedSubmission = await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: 'reviewed',
          verifiedByRecruiter: isWaiver ? false : isVerified,
          hiringStatus: validHiringStatus,
        },
      });

      const updatedStudentSkills = [];

      // When recruiter reviews a waiver submission, do NOT run skill level-up logic (skills are already verified)
      if (!isWaiver && isVerified && targetSkillIds.length > 0) {
        for (const skillId of targetSkillIds) {
          // Update or create StudentSkill status to verified & level to challenge level (no downgrades)
          const existingSkill = await tx.studentSkill.findUnique({
            where: {
              userId_skillId: {
                userId: submission.userId,
                skillId,
              },
            },
          });

          if (existingSkill) {
            const newLevel = Math.max(existingSkill.level, challengeLevel);
            const updated = await tx.studentSkill.update({
              where: { id: existingSkill.id },
              data: {
                status: 'verified',
                level: newLevel,
              },
            });
            updatedStudentSkills.push(updated);
          } else {
            const created = await tx.studentSkill.create({
              data: {
                userId: submission.userId,
                skillId,
                status: 'verified',
                level: challengeLevel,
              },
            });
            updatedStudentSkills.push(created);
          }
        }
      }

      return {
        updatedSubmission,
        updatedStudentSkill: updatedStudentSkills[0] || null,
        updatedStudentSkills,
      };
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
