import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Rule-based recommendation algorithm for similar jobs.
 * Compares required skills between target job and all other active postings.
 * Sorts descending by overlapping skill count.
 * Exported as a clean isolated module for easy future swapping with a Python/ML microservice.
 *
 * @param {string} jobId
 * @returns {Promise<Array>} List of similar job objects with matchScore
 */
export async function getSimilarJobs(jobId, prismaClient = prisma) {
  const targetJob = await prismaClient.job.findUnique({
    where: { id: jobId },
    include: { company: true },
  });

  if (!targetJob) {
    return [];
  }

  const targetSkills = Array.isArray(targetJob.requiredSkills)
    ? targetJob.requiredSkills
    : [];

  const targetSkillSet = new Set(
    targetSkills.map((s) => (s.skillName || '').toLowerCase().trim())
  );

  if (targetSkillSet.size === 0) {
    return [];
  }

  const allJobs = await prismaClient.job.findMany({
    where: {
      id: { not: jobId },
    },
    include: {
      company: true,
    },
  });

  const rankedJobs = allJobs.map((job) => {
    const jobSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
    let sharedCount = 0;
    const matchingSkills = [];

    jobSkills.forEach((s) => {
      const sName = (s.skillName || '').toLowerCase().trim();
      if (targetSkillSet.has(sName)) {
        sharedCount += 1;
        matchingSkills.push(s.skillName);
      }
    });

    return {
      ...job,
      sharedSkillCount: sharedCount,
      matchingSkills,
      matchPercentage: Math.round((sharedCount / targetSkillSet.size) * 100),
    };
  });

  // Filter jobs with at least 1 shared skill and sort descending by sharedSkillCount
  return rankedJobs
    .filter((j) => j.sharedSkillCount > 0)
    .sort((a, b) => b.sharedSkillCount - a.sharedSkillCount);
}
