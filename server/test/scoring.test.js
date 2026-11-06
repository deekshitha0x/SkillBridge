import { describe, it, expect } from 'vitest';
import { calculateQuizScoreLevel } from '../src/routes/assessments.js';

describe('Quiz Scoring Formula - calculateQuizScoreLevel', () => {
  it('maps zero correct answers to minimum level 1', () => {
    expect(calculateQuizScoreLevel(0, 3)).toBe(1);
    expect(calculateQuizScoreLevel(0, 5)).toBe(1);
  });

  it('maps correct answers proportionally on a 3-question quiz', () => {
    // 1/3 = ~0.33 * 5 = 1.67 -> rounds to 2
    expect(calculateQuizScoreLevel(1, 3)).toBe(2);
    // 2/3 = ~0.67 * 5 = 3.33 -> rounds to 3
    expect(calculateQuizScoreLevel(2, 3)).toBe(3);
    // 3/3 = 1.0 * 5 = 5.0 -> 5
    expect(calculateQuizScoreLevel(3, 3)).toBe(5);
  });

  it('maps full marks on a 5-question quiz to level 5 (maximum cap)', () => {
    expect(calculateQuizScoreLevel(5, 5)).toBe(5);
  });

  it('handles edge case of 0 total questions safely without NaN or crash', () => {
    expect(calculateQuizScoreLevel(0, 0)).toBe(1);
  });
});

