import { describe, it, expect, beforeEach } from 'vitest';
import {
  quizSessions,
  getOrCreateQuizSession,
  validateAndConsumeQuizSession,
  cleanupExpiredSessions,
  GRACE_WINDOW_SECONDS,
} from '../src/routes/assessments.js';

describe('Server-Side Quiz Session & Timer Logic', () => {
  beforeEach(() => {
    quizSessions.clear();
  });

  it('creates a new session with startTime and timeLimitSeconds', () => {
    const session = getOrCreateQuizSession('user-1', 'skill-py', 180);
    expect(session).toBeDefined();
    expect(session.timeLimitSeconds).toBe(180);
    expect(session.startTime).toBeLessThanOrEqual(Date.now());
  });

  it('does NOT reset start time on subsequent calls (e.g. page refresh)', () => {
    const firstSession = getOrCreateQuizSession('user-1', 'skill-py', 180);
    const initialStartTime = firstSession.startTime;

    // Simulate page refresh after 2 seconds
    firstSession.startTime = initialStartTime - 2000;

    const secondSession = getOrCreateQuizSession('user-1', 'skill-py', 180);
    expect(secondSession.startTime).toBe(initialStartTime - 2000);
    expect(secondSession.timeLimitSeconds).toBe(180);
  });

  it('creates a fresh session if the previous session has fully expired', () => {
    const sessionKey = 'user-1:skill-py';
    // Expired session (startTime was 300 seconds ago, duration was 180s)
    quizSessions.set(sessionKey, {
      startTime: Date.now() - 300 * 1000,
      timeLimitSeconds: 180,
    });

    const newSession = getOrCreateQuizSession('user-1', 'skill-py', 180);
    expect(newSession.startTime).toBeGreaterThan(Date.now() - 1000);
  });

  it('validates and consumes an on-time session, removing it from memory', () => {
    const session = getOrCreateQuizSession('user-1', 'skill-py', 180);
    // Simulate 30s elapsed
    session.startTime = Date.now() - 30 * 1000;

    const result = validateAndConsumeQuizSession('user-1', 'skill-py');
    expect(result.valid).toBe(true);
    expect(result.timeSpentSeconds).toBeGreaterThanOrEqual(29);
    expect(result.timeSpentSeconds).toBeLessThanOrEqual(32);

    // Session must be deleted after consumption
    expect(quizSessions.has('user-1:skill-py')).toBe(false);
  });

  it('rejects submission when no session exists at all', () => {
    const result = validateAndConsumeQuizSession('user-unknown', 'skill-sql');
    expect(result.valid).toBe(false);
    expect(result.sessionMissing).toBe(true);
    expect(result.error).toContain('No active quiz session found');
  });

  it('rejects submission when time exceeds limit plus grace window', () => {
    const duration = 60;
    const session = getOrCreateQuizSession('user-1', 'skill-py', duration);
    // Simulate exceeding limit + grace window: 60s + 15s grace = 75s. Set to 80s elapsed.
    session.startTime = Date.now() - 80 * 1000;

    const result = validateAndConsumeQuizSession('user-1', 'skill-py');
    expect(result.valid).toBe(false);
    expect(result.timedOut).toBe(true);
    expect(result.error).toContain('Quiz time limit exceeded');

    // Consumed/deleted upon timed-out attempt as well
    expect(quizSessions.has('user-1:skill-py')).toBe(false);
  });

  it('cleanupExpiredSessions removes expired sessions and preserves active ones', () => {
    const now = Date.now();
    // Active session
    quizSessions.set('active-user:skill-1', {
      startTime: now - 30 * 1000,
      timeLimitSeconds: 180,
    });
    // Expired session (older than duration + grace)
    quizSessions.set('abandoned-user:skill-2', {
      startTime: now - 250 * 1000,
      timeLimitSeconds: 180,
    });

    cleanupExpiredSessions();

    expect(quizSessions.has('active-user:skill-1')).toBe(true);
    expect(quizSessions.has('abandoned-user:skill-2')).toBe(false);
  });
});

