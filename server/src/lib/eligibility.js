import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Validates whether a student user meets the skill level requirements for a challenge.
 *
 * @param {string} studentUserId
 * @param {string} challengeId
 * @returns {Promise<{ eligible: boolean, reasons: string[], studentSkills: object }>}
 */
export async function checkEligibility(studentUserId, challengeId) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) {
    return { eligible: false, reasons: ['Challenge not found'], studentSkills: {} };
  }

  const requiredSkills = Array.isArray(challenge.requiredSkills)
    ? challenge.requiredSkills
    : [];

  // Fetch student's skills
  const studentSkills = await prisma.studentSkill.findMany({
    where: {
      userId: studentUserId,
    },
    include: {
      skill: true,
    },
  });

  // Map student skill data by skillId and skillName
  const studentSkillMap = {};
  studentSkills.forEach((ss) => {
    studentSkillMap[ss.skillId] = ss;
    if (ss.skill) {
      studentSkillMap[ss.skill.name.toLowerCase()] = ss;
    }
  });

  const reasons = [];
  let eligible = true;

  for (const req of requiredSkills) {
    const sName = req.skillName || 'Skill';
    const reqLevel = req.minLevel || 1;

    const studentSkill =
      studentSkillMap[req.skillId] ||
      studentSkillMap[(req.skillName || '').toLowerCase()];

    if (!studentSkill) {
      eligible = false;
      reasons.push(`Skill "${sName}" is not on your Skill Profile.`);
      continue;
    }

    if (studentSkill.status === 'pending') {
      eligible = false;
      reasons.push(
        `Skill "${sName}" status is Pending. Take the verification quiz to claim it first.`
      );
      continue;
    }

    if (studentSkill.level < reqLevel) {
      eligible = false;
      reasons.push(
        `Skill "${sName}" level is ${studentSkill.level}, but Level ${reqLevel}+ is required.`
      );
    }
  }

  return {
    eligible,
    reasons,
    studentSkills: studentSkillMap,
  };
}
