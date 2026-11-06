import { describe, it, expect } from 'vitest';
import { getSimilarJobs } from '../src/lib/matching.js';

describe('Job Recommendation & Matching - getSimilarJobs', () => {
  it('returns empty array when target job does not exist', async () => {
    const mockPrisma = {
      job: {
        findUnique: async () => null,
      },
    };

    const result = await getSimilarJobs('non-existent-id', mockPrisma);
    expect(result).toEqual([]);
  });

  it('returns empty array when target job has empty requiredSkills', async () => {
    const mockPrisma = {
      job: {
        findUnique: async () => ({
          id: 'job-1',
          requiredSkills: [],
        }),
      },
    };

    const result = await getSimilarJobs('job-1', mockPrisma);
    expect(result).toEqual([]);
  });

  it('correctly ranks candidate jobs by shared skill count descending', async () => {
    const mockPrisma = {
      job: {
        findUnique: async () => ({
          id: 'job-target',
          requiredSkills: [
            { skillName: 'Python' },
            { skillName: 'React' },
            { skillName: 'SQL' },
          ],
        }),
        findMany: async () => [
          {
            id: 'job-low-match',
            title: 'Junior SQL Analyst',
            requiredSkills: [{ skillName: 'SQL' }],
          },
          {
            id: 'job-high-match',
            title: 'Full Stack Engineer',
            requiredSkills: [{ skillName: 'Python' }, { skillName: 'React' }],
          },
          {
            id: 'job-no-match',
            title: 'C++ Systems Engineer',
            requiredSkills: [{ skillName: 'C++' }, { skillName: 'Rust' }],
          },
        ],
      },
    };

    const result = await getSimilarJobs('job-target', mockPrisma);

    // Job with 0 matches should be filtered out
    expect(result).toHaveLength(2);

    // First result should have 2 shared skills
    expect(result[0].id).toBe('job-high-match');
    expect(result[0].sharedSkillCount).toBe(2);
    expect(result[0].matchingSkills).toEqual(['Python', 'React']);
    expect(result[0].matchPercentage).toBe(67); // Math.round(2 / 3 * 100)

    // Second result should have 1 shared skill
    expect(result[1].id).toBe('job-low-match');
    expect(result[1].sharedSkillCount).toBe(1);
    expect(result[1].matchingSkills).toEqual(['SQL']);
    expect(result[1].matchPercentage).toBe(33); // Math.round(1 / 3 * 100)
  });
});

