import { describe, it, expect } from 'vitest';
import { checkEligibility } from '../src/lib/eligibility.js';

describe('Skill Eligibility - checkEligibility', () => {
  it('returns ineligible when challenge does not exist', async () => {
    const mockPrisma = {
      challenge: {
        findUnique: async () => null,
      },
    };

    const result = await checkEligibility('user-1', 'invalid-challenge-id', mockPrisma);
    expect(result.eligible).toBe(false);
    expect(result.allAlreadyVerified).toBe(false);
    expect(result.reasons).toContain('Challenge not found');
  });

  it('returns eligible when student holds required skills with status "claimed" at or above required level', async () => {
    const mockPrisma = {
      challenge: {
        findUnique: async () => ({
          id: 'challenge-1',
          requiredSkills: [
            { skillId: 'skill-py', skillName: 'Python', minLevel: 2 },
            { skillId: 'skill-sql', skillName: 'SQL', minLevel: 1 },
          ],
        }),
      },
      studentSkill: {
        findMany: async () => [
          { skillId: 'skill-py', status: 'claimed', level: 2, skill: { name: 'Python' } },
          { skillId: 'skill-sql', status: 'claimed', level: 3, skill: { name: 'SQL' } },
        ],
      },
    };

    const result = await checkEligibility('user-1', 'challenge-1', mockPrisma);
    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
    // Neither is verified yet, so allAlreadyVerified must be false
    expect(result.allAlreadyVerified).toBe(false);
    expect(result.requiredSkills[0].alreadyVerified).toBe(false);
    expect(result.requiredSkills[1].alreadyVerified).toBe(false);
  });

  it('returns eligible when student holds required skills with status "verified" at or above required level', async () => {
    const mockPrisma = {
      challenge: {
        findUnique: async () => ({
          id: 'challenge-1',
          requiredSkills: [
            { skillId: 'skill-py', skillName: 'Python', minLevel: 2 },
            { skillId: 'skill-sql', skillName: 'SQL', minLevel: 1 },
          ],
        }),
      },
      studentSkill: {
        findMany: async () => [
          { skillId: 'skill-py', status: 'verified', level: 3, skill: { name: 'Python' } },
          { skillId: 'skill-sql', status: 'verified', level: 1, skill: { name: 'SQL' } },
        ],
      },
    };

    const result = await checkEligibility('user-1', 'challenge-1', mockPrisma);
    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
    // Both skills are verified at or above minLevel, so allAlreadyVerified must be true
    expect(result.allAlreadyVerified).toBe(true);
    expect(result.requiredSkills[0].alreadyVerified).toBe(true);
    expect(result.requiredSkills[1].alreadyVerified).toBe(true);
  });

  it('handles mixed claimed and verified skills: eligible, but allAlreadyVerified is false', async () => {
    const mockPrisma = {
      challenge: {
        findUnique: async () => ({
          id: 'challenge-1',
          requiredSkills: [
            { skillId: 'skill-py', skillName: 'Python', minLevel: 2 },
            { skillId: 'skill-sql', skillName: 'SQL', minLevel: 1 },
          ],
        }),
      },
      studentSkill: {
        findMany: async () => [
          { skillId: 'skill-py', status: 'verified', level: 2, skill: { name: 'Python' } },
          { skillId: 'skill-sql', status: 'claimed', level: 1, skill: { name: 'SQL' } },
        ],
      },
    };

    const result = await checkEligibility('user-1', 'challenge-1', mockPrisma);
    expect(result.eligible).toBe(true);
    expect(result.allAlreadyVerified).toBe(false);
    expect(result.requiredSkills[0].alreadyVerified).toBe(true);
    expect(result.requiredSkills[1].alreadyVerified).toBe(false);
  });

  it('returns ineligible when student does not have the required skill on their profile', async () => {
    const mockPrisma = {
      challenge: {
        findUnique: async () => ({
          id: 'challenge-1',
          requiredSkills: [
            { skillId: 'skill-py', skillName: 'Python', minLevel: 2 },
          ],
        }),
      },
      studentSkill: {
        findMany: async () => [],
      },
    };

    const result = await checkEligibility('user-1', 'challenge-1', mockPrisma);
    expect(result.eligible).toBe(false);
    expect(result.allAlreadyVerified).toBe(false);
    expect(result.reasons[0]).toContain('Skill "Python" is not on your Skill Profile (skill not claimed).');
    expect(result.requiredSkills[0].alreadyVerified).toBe(false);
  });

  it('returns ineligible when one of several required skills is missing', async () => {
    const mockPrisma = {
      challenge: {
        findUnique: async () => ({
          id: 'challenge-1',
          requiredSkills: [
            { skillId: 'skill-py', skillName: 'Python', minLevel: 2 },
            { skillId: 'skill-dsa', skillName: 'Data Structures', minLevel: 1 },
          ],
        }),
      },
      studentSkill: {
        findMany: async () => [
          { skillId: 'skill-py', status: 'claimed', level: 3, skill: { name: 'Python' } },
        ],
      },
    };

    const result = await checkEligibility('user-1', 'challenge-1', mockPrisma);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('Skill "Data Structures" is not on your Skill Profile');
    expect(result.requiredSkills[0].eligible).toBe(true);
    expect(result.requiredSkills[1].eligible).toBe(false);
  });

  it('returns ineligible when skill status is pending (must take verification quiz first)', async () => {
    const mockPrisma = {
      challenge: {
        findUnique: async () => ({
          id: 'challenge-1',
          requiredSkills: [
            { skillId: 'skill-py', skillName: 'Python', minLevel: 1 },
          ],
        }),
      },
      studentSkill: {
        findMany: async () => [
          { skillId: 'skill-py', status: 'pending', level: 0, skill: { name: 'Python' } },
        ],
      },
    };

    const result = await checkEligibility('user-1', 'challenge-1', mockPrisma);
    expect(result.eligible).toBe(false);
    expect(result.allAlreadyVerified).toBe(false);
    expect(result.reasons[0]).toContain('status is Pending (Level 0). Take the verification quiz to claim it first.');
  });

  it('returns ineligible when skill level is below the required minimum level (whether claimed or verified)', async () => {
    const mockPrisma = {
      challenge: {
        findUnique: async () => ({
          id: 'challenge-1',
          requiredSkills: [
            { skillId: 'skill-py', skillName: 'Python', minLevel: 3 },
          ],
        }),
      },
      studentSkill: {
        findMany: async () => [
          { skillId: 'skill-py', status: 'claimed', level: 2, skill: { name: 'Python' } },
        ],
      },
    };

    const result = await checkEligibility('user-1', 'challenge-1', mockPrisma);
    expect(result.eligible).toBe(false);
    expect(result.allAlreadyVerified).toBe(false);
    expect(result.reasons[0]).toContain('Skill "Python" level is 2, but Level 3+ is required.');
  });

  it('returns eligible if challenge has no prerequisite skills required', async () => {
    const mockPrisma = {
      challenge: {
        findUnique: async () => ({
          id: 'challenge-open',
          requiredSkills: [],
        }),
      },
      studentSkill: {
        findMany: async () => [],
      },
    };

    const result = await checkEligibility('user-1', 'challenge-open', mockPrisma);
    expect(result.eligible).toBe(true);
    expect(result.allAlreadyVerified).toBe(false);
    expect(result.reasons).toHaveLength(0);
  });
});
