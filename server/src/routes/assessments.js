import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();
const prisma = new PrismaClient();

// In-memory store for server-side quiz start times and sessions
// Key: `${userId}:${skillId}` -> { startTime, timeLimitSeconds }
export const quizSessions = new Map();
export const GRACE_WINDOW_SECONDS = 15;
export const DEFAULT_QUIZ_DURATION_SECONDS = 180; // 3 minutes default

/**
 * Removes abandoned, expired quiz sessions from the in-memory map
 */
export function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [key, session] of quizSessions.entries()) {
    const maxAllowedMs = (session.timeLimitSeconds + GRACE_WINDOW_SECONDS) * 1000;
    if (now - session.startTime > maxAllowedMs) {
      quizSessions.delete(key);
    }
  }
}

/**
 * Returns an existing active, unexpired session for the user and skill,
 * or registers a new session if none exists or the previous session expired.
 */
export function getOrCreateQuizSession(userId, skillId, durationSeconds = DEFAULT_QUIZ_DURATION_SECONDS) {
  cleanupExpiredSessions();
  const sessionKey = `${userId}:${skillId}`;
  const existing = quizSessions.get(sessionKey);
  const now = Date.now();

  // If a valid unexpired session already exists, reuse it (do not reset timer)
  if (existing && (now - existing.startTime) < (existing.timeLimitSeconds + GRACE_WINDOW_SECONDS) * 1000) {
    return existing;
  }

  // Otherwise, initialize a fresh session
  const newSession = {
    startTime: now,
    timeLimitSeconds: durationSeconds,
  };
  quizSessions.set(sessionKey, newSession);
  return newSession;
}

/**
 * Validates the quiz submission against the server-recorded session timer.
 * Consumes and deletes the session upon submission attempt so retakes start fresh.
 */
export function validateAndConsumeQuizSession(userId, skillId) {
  const sessionKey = `${userId}:${skillId}`;
  const session = quizSessions.get(sessionKey);

  // Always delete session on submission attempt so retakes start fresh and memory is freed
  if (session) {
    quizSessions.delete(sessionKey);
  }

  // Sweep any other abandoned expired sessions
  cleanupExpiredSessions();

  if (!session) {
    return {
      valid: false,
      error: 'No active quiz session found. You must start the quiz before submitting.',
      sessionMissing: true,
    };
  }

  const now = Date.now();
  const calculatedTimeSpent = Math.round((now - session.startTime) / 1000);
  const maxAllowed = session.timeLimitSeconds + GRACE_WINDOW_SECONDS;

  if (calculatedTimeSpent > maxAllowed) {
    return {
      valid: false,
      timedOut: true,
      timeSpentSeconds: calculatedTimeSpent,
      error: `Quiz time limit exceeded (${calculatedTimeSpent}s elapsed; limit was ${session.timeLimitSeconds}s + ${GRACE_WINDOW_SECONDS}s grace window).`,
    };
  }

  return {
    valid: true,
    timeSpentSeconds: calculatedTimeSpent,
  };
}

/**
 * Maps a quiz score to a skill level (1 to 5)
 */
export function calculateQuizScoreLevel(correctCount, totalQuestions) {
  return Math.min(
    5,
    Math.max(1, Math.round((correctCount / (totalQuestions || 1)) * 5))
  );
}

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

    const durationSeconds = Math.max(
      DEFAULT_QUIZ_DURATION_SECONDS,
      sanitizedQuestions.length * 60
    );

    // Get existing unexpired session or create a new one (prevents timer reset on page refresh)
    const session = getOrCreateQuizSession(req.user.id, skillId, durationSeconds);
    const elapsedSeconds = Math.round((Date.now() - session.startTime) / 1000);
    const remainingSeconds = Math.max(0, session.timeLimitSeconds - elapsedSeconds);

    res.json({
      assessmentId: assessment.id,
      skillId: assessment.skillId,
      skillName: skill ? skill.name : 'Skill',
      passScore: assessment.passScore,
      questions: sanitizedQuestions,
      questionCount: sanitizedQuestions.length,
      timeLimitSeconds: session.timeLimitSeconds,
      remainingSeconds,
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
      const { answers, tabSwitches } = req.body;

      // Server-side timer check
      const sessionResult = validateAndConsumeQuizSession(req.user.id, skillId);
      if (!sessionResult.valid) {
        return res.status(400).json({
          error: sessionResult.error,
          timedOut: sessionResult.timedOut || false,
          sessionMissing: sessionResult.sessionMissing || false,
          timeSpentSeconds: sessionResult.timeSpentSeconds || 0,
        });
      }

      const calculatedTimeSpent = sessionResult.timeSpentSeconds;

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

        const scoreLevel = calculateQuizScoreLevel(correctCount, totalQuestions);

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
        timeSpentSeconds: calculatedTimeSpent,
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
