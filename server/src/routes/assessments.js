import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/assessments/:skillId
 * Get assessment quiz questions for a skill
 */
router.get('/:skillId', requireAuth, async (req, res) => {
  try {
    const { skillId } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { skillId },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found for this skill' });
    }

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    // Strip out correctAnswerIndex when serving client
    const rawQuestions = Array.isArray(assessment.questions)
      ? assessment.questions
      : [];

    const sanitizedQuestions = rawQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    res.json({
      assessmentId: assessment.id,
      skillId: assessment.skillId,
      skillName: skill ? skill.name : 'Skill',
      passScore: assessment.passScore,
      questions: sanitizedQuestions,
      questionCount: sanitizedQuestions.length,
    });
  } catch (error) {
    console.error('Fetch assessment error:', error);
    res.status(500).json({ error: 'Failed to load assessment' });
  }
});

/**
 * POST /api/assessments/:skillId/submit
 * Submit quiz answers -> Verify skill if score >= passScore
 */
router.post(
  '/:skillId/submit',
  requireAuth,
  requireRole('student'),
  async (req, res) => {
    try {
      const { skillId } = req.params;
      const { answers, timeSpentSeconds, tabSwitches } = req.body;

      const assessment = await prisma.assessment.findUnique({
        where: { skillId },
      });

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      const questions = Array.isArray(assessment.questions)
        ? assessment.questions
        : [];

      let correctCount = 0;
      const totalQuestions = questions.length;

      questions.forEach((q) => {
        const studentChoice = answers ? answers[q.id] : undefined;
        if (studentChoice === q.correctAnswerIndex) {
          correctCount += 1;
        }
      });

      const percentageScore =
        totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      const passed = percentageScore >= assessment.passScore;

      let studentSkill = null;
      if (passed) {
        const existing = await prisma.studentSkill.findUnique({
          where: {
            userId_skillId: {
              userId: req.user.id,
              skillId,
            },
          },
        });

        const scoreLevel = Math.min(
          5,
          Math.max(1, Math.round((correctCount / (totalQuestions || 1)) * 5))
        );

        studentSkill = await prisma.studentSkill.upsert({
          where: {
            userId_skillId: {
              userId: req.user.id,
              skillId,
            },
          },
          update: {
            status: existing && existing.status === 'verified' ? 'verified' : 'claimed',
            level: existing && existing.status === 'verified' ? Math.max(existing.level, scoreLevel) : scoreLevel,
          },
          create: {
            userId: req.user.id,
            skillId,
            status: 'claimed',
            level: scoreLevel,
          },
          include: { skill: true },
        });
      }

      res.json({
        passed,
        score: percentageScore,
        correctCount,
        totalQuestions,
        passScore: assessment.passScore,
        tabSwitches: tabSwitches || 0,
        timeSpentSeconds: timeSpentSeconds || 0,
        studentSkill,
        message: passed
          ? 'Congratulations! Assessment quiz passed and skill claimed.'
          : 'Assessment score was below passing threshold. Try again after revision.',
      });
    } catch (error) {
      console.error('Submit assessment error:', error);
      res.status(500).json({ error: 'Failed to process assessment submission' });
    }
  }
);

export default router;
