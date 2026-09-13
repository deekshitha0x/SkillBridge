import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/profile
 * Get current student user profile with verified/claimed skills
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        institution: true,
        studentSkills: {
          include: { skill: true },
        },
        submissions: {
          include: { challenge: { include: { job: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const verifiedSkillsCount = student.studentSkills.filter(
      (ss) => ss.status === 'verified'
    ).length;

    const claimedSkillsCount = student.studentSkills.filter(
      (ss) => ss.status === 'claimed'
    ).length;

    res.json({
      profile: student,
      verifiedSkillsCount,
      claimedSkillsCount,
      pendingSkillsCount: student.studentSkills.filter((ss) => ss.status === 'pending').length,
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * GET /api/profile/:id
 * Get specific student profile details (for Recruiter / Candidate view)
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        institution: true,
        studentSkills: {
          include: { skill: true },
        },
        submissions: {
          include: { challenge: { include: { job: true } } },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      profile: student,
      verifiedSkillsCount: student.studentSkills.filter((ss) => ss.status === 'verified').length,
      claimedSkillsCount: student.studentSkills.filter((ss) => ss.status === 'claimed').length,
    });
  } catch (error) {
    console.error('Fetch student profile error:', error);
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});

export default router;
