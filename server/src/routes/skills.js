import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/skills
 * Get all available skills with student's claim/verified status if logged in
 */
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'skillbridge_hackathon_super_secret_jwt_key_2026'
        );
        userId = decoded.userId;
      } catch (err) {
        // Soft fail optional auth
      }
    }

    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });

    let studentSkillsMap = {};
    if (userId) {
      const studentSkills = await prisma.studentSkill.findMany({
        where: { userId },
      });
      studentSkills.forEach((ss) => {
        studentSkillsMap[ss.skillId] = ss;
      });
    }

    const enrichedSkills = skills.map((skill) => {
      const userSkill = studentSkillsMap[skill.id];
      return {
        ...skill,
        status: userSkill ? userSkill.status : 'pending', // verified | claimed | pending
        level: userSkill ? userSkill.level : 0,
        studentSkillId: userSkill ? userSkill.id : null,
      };
    });

    res.json(enrichedSkills);
  } catch (error) {
    console.error('Fetch skills error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

/**
 * POST /api/skills/claim
 * Declare a skill -> status=pending, level=0
 */
router.post('/claim', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { skillId } = req.body;
    if (!skillId) {
      return res.status(400).json({ error: 'skillId is required' });
    }

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Upsert StudentSkill
    const studentSkill = await prisma.studentSkill.upsert({
      where: {
        userId_skillId: {
          userId: req.user.id,
          skillId,
        },
      },
      update: {
        // Keep existing status if already verified or claimed
      },
      create: {
        userId: req.user.id,
        skillId,
        status: 'pending',
        level: 0,
      },
      include: {
        skill: true,
      },
    });

    res.json({
      message: `Skill ${skill.name} added to your profile!`,
      studentSkill,
    });
  } catch (error) {
    console.error('Claim skill error:', error);
    res.status(500).json({ error: 'Failed to claim skill' });
  }
});

export default router;
