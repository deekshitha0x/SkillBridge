import { describe, it, expect } from 'vitest';
import { checkEligibility, isEligibleForWaiver, evaluateWaiverEligibility } from '../src/lib/eligibility.js';

describe('Pre-Verified Waiver Logic', () => {
  describe('evaluateWaiverEligibility pure helper', () => {
    it('allows waiver when student is eligible, all required skills are verified, allowWaiver is true, and no existing submission', () => {
      const result = evaluateWaiverEligibility({
        eligibility: { eligible: true, allAlreadyVerified: true, reasons: [] },
        allowWaiver: true,
        existingSubmission: null,
      });
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('rejects with clear reason when skills are only claimed (claimed-only rejected)', () => {
      const result = evaluateWaiverEligibility({
        eligibility: { eligible: true, allAlreadyVerified: false, reasons: [] },
        allowWaiver: true,
        existingSubmission: null,
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/All required skills must already be verified/i);
    });

    it('rejects with clear reason when challenge has allowWaiver: false (allowWaiver false rejected)', () => {
      const result = evaluateWaiverEligibility({
        eligibility: { eligible: true, allAlreadyVerified: true, reasons: [] },
        allowWaiver: false,
        existingSubmission: null,
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/Pre-verified waivers are not accepted for this challenge/i);
    });

    it('rejects with clear reason when student already has a submission (duplicate rejected)', () => {
      const result = evaluateWaiverEligibility({
        eligibility: { eligible: true, allAlreadyVerified: true, reasons: [] },
        allowWaiver: true,
        existingSubmission: { id: 'existing-sub-1', status: 'pending' },
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/Duplicate submission/i);
    });

    it('rejects when student is not eligible at all (e.g. missing prerequisites)', () => {
      const result = evaluateWaiverEligibility({
        eligibility: { eligible: false, allAlreadyVerified: false, reasons: ['Missing React'] },
        allowWaiver: true,
        existingSubmission: null,
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/Minimum skill prerequisites not met/i);
    });
  });

  describe('isEligibleForWaiver helper', () => {
    it('returns true when candidate is eligible and all required skills are verified', () => {
      const eligibility = {
        eligible: true,
        allAlreadyVerified: true,
        reasons: [],
      };
      expect(isEligibleForWaiver(eligibility, true)).toBe(true);
    });

    it('returns false when allowWaiver is false', () => {
      const eligibility = {
        eligible: true,
        allAlreadyVerified: true,
        reasons: [],
      };
      expect(isEligibleForWaiver(eligibility, false)).toBe(false);
    });

    it('returns false when candidate is eligible but holds skills only as "claimed" (allAlreadyVerified = false)', () => {
      const eligibility = {
        eligible: true,
        allAlreadyVerified: false,
        reasons: [],
      };
      expect(isEligibleForWaiver(eligibility)).toBe(false);
    });

    it('returns false when candidate is ineligible (e.g. missing skills or level too low)', () => {
      const eligibility = {
        eligible: false,
        allAlreadyVerified: false,
        reasons: ['Skill "React" level is 1, but Level 2+ is required.'],
      };
      expect(isEligibleForWaiver(eligibility)).toBe(false);
    });

    it('handles null, undefined, and malformed inputs gracefully', () => {
      expect(isEligibleForWaiver(null)).toBe(false);
      expect(isEligibleForWaiver(undefined)).toBe(false);
      expect(isEligibleForWaiver({})).toBe(false);
      expect(isEligibleForWaiver({ eligible: true })).toBe(false);
      expect(isEligibleForWaiver({ allAlreadyVerified: true })).toBe(false);
    });
  });

  describe('checkEligibility with waiver qualification (mocked Prisma)', () => {
    it('qualifies for waiver when student has all required skills verified at or above minLevel', async () => {
      const mockPrisma = {
        challenge: {
          findUnique: async () => ({
            id: 'ch-react-ts',
            requiredSkills: [
              { skillId: 's-react', skillName: 'React', minLevel: 2 },
              { skillId: 's-ts', skillName: 'TypeScript', minLevel: 2 },
            ],
          }),
        },
        studentSkill: {
          findMany: async () => [
            { skillId: 's-react', status: 'verified', level: 3, skill: { name: 'React' } },
            { skillId: 's-ts', status: 'verified', level: 2, skill: { name: 'TypeScript' } },
          ],
        },
      };

      const result = await checkEligibility('user-alex', 'ch-react-ts', mockPrisma);
      expect(result.eligible).toBe(true);
      expect(result.allAlreadyVerified).toBe(true);
      expect(isEligibleForWaiver(result)).toBe(true);
    });

    it('does NOT qualify for waiver when skills are only claimed (eligible to solve challenge, but cannot waive)', async () => {
      const mockPrisma = {
        challenge: {
          findUnique: async () => ({
            id: 'ch-react-ts',
            requiredSkills: [
              { skillId: 's-react', skillName: 'React', minLevel: 2 },
              { skillId: 's-ts', skillName: 'TypeScript', minLevel: 2 },
            ],
          }),
        },
        studentSkill: {
          findMany: async () => [
            { skillId: 's-react', status: 'claimed', level: 2, skill: { name: 'React' } },
            { skillId: 's-ts', status: 'claimed', level: 2, skill: { name: 'TypeScript' } },
          ],
        },
      };

      const result = await checkEligibility('user-priya', 'ch-react-ts', mockPrisma);
      expect(result.eligible).toBe(true);
      expect(result.allAlreadyVerified).toBe(false);
      expect(isEligibleForWaiver(result)).toBe(false);
    });

    it('does NOT qualify for waiver when one skill is verified but another is only claimed', async () => {
      const mockPrisma = {
        challenge: {
          findUnique: async () => ({
            id: 'ch-fullstack',
            requiredSkills: [
              { skillId: 's-react', skillName: 'React', minLevel: 2 },
              { skillId: 's-node', skillName: 'Node.js', minLevel: 2 },
            ],
          }),
        },
        studentSkill: {
          findMany: async () => [
            { skillId: 's-react', status: 'verified', level: 3, skill: { name: 'React' } },
            { skillId: 's-node', status: 'claimed', level: 2, skill: { name: 'Node.js' } },
          ],
        },
      };

      const result = await checkEligibility('user-hybrid', 'ch-fullstack', mockPrisma);
      expect(result.eligible).toBe(true);
      expect(result.allAlreadyVerified).toBe(false);
      expect(isEligibleForWaiver(result)).toBe(false);
    });

    it('does NOT qualify for waiver when verified skill level is below required level', async () => {
      const mockPrisma = {
        challenge: {
          findUnique: async () => ({
            id: 'ch-senior-py',
            requiredSkills: [
              { skillId: 's-py', skillName: 'Python', minLevel: 4 },
            ],
          }),
        },
        studentSkill: {
          findMany: async () => [
            { skillId: 's-py', status: 'verified', level: 2, skill: { name: 'Python' } },
          ],
        },
      };

      const result = await checkEligibility('user-junior', 'ch-senior-py', mockPrisma);
      expect(result.eligible).toBe(false);
      expect(result.allAlreadyVerified).toBe(false);
      expect(isEligibleForWaiver(result)).toBe(false);
    });
  });
});
