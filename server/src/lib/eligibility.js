import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Validates whether a student user meets the skill level requirements for a challenge.
 * A student is eligible if, for every required skill, they hold that skill with status
 * 'claimed' OR 'verified', at a level >= the minimum required level.
 *
 * @param {string} studentUserId
 * @param {string} challengeId
 * @param {object} [prismaClient=prisma]
 * @returns {Promise<{
 *   eligible: boolean,
 *   allAlreadyVerified: boolean,
 *   reasons: string[],
 *   studentSkills: object,
 *   requiredSkills: Array<{
 *     skillId: string,
 *     skillName: string,
 *     minLevel: number,
 *     currentLevel: number,
 *     status: string|null,
 *     eligible: boolean,
 *     alreadyVerified: boolean,
 *     reason: string|null
 *   }>
 * }>}
 */
export async function checkEligibility(studentUserId, challengeId, prismaClient = prisma) {
  const challenge = await prismaClient.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) {
    return {
      eligible: false,
      allAlreadyVerified: false,
      reasons: ['Challenge not found'],
      studentSkills: {},
      requiredSkills: [],
    };
  }

  const requiredSkills = Array.isArray(challenge.requiredSkills)
    ? challenge.requiredSkills
    : [];

  // Fetch student's skills
  const studentSkills = await prismaClient.studentSkill.findMany({
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
  const requiredSkillDetails = [];
  let eligible = true;
  let allAlreadyVerified = requiredSkills.length > 0;

  for (const req of requiredSkills) {
    const sName = req.skillName || 'Skill';
    const reqLevel = req.minLevel || 1;

    const studentSkill =
      studentSkillMap[req.skillId] ||
      studentSkillMap[(req.skillName || '').toLowerCase()];

    const currentLevel = studentSkill ? studentSkill.level : 0;
    const currentStatus = studentSkill ? studentSkill.status : null;

    // A skill is already verified if it has status 'verified' and meets or exceeds the required level
    const isAlreadyVerified = currentStatus === 'verified' && currentLevel >= reqLevel;
    if (!isAlreadyVerified) {
      allAlreadyVerified = false;
    }

    let skillEligible = true;
    let reason = null;

    if (!studentSkill) {
      eligible = false;
      skillEligible = false;
      reason = `Skill "${sName}" is not on your Skill Profile (skill not claimed).`;
      reasons.push(reason);
    } else if (currentStatus === 'pending') {
      eligible = false;
      skillEligible = false;
      reason = `Skill "${sName}" status is Pending (Level ${currentLevel}). Take the verification quiz to claim it first.`;
      reasons.push(reason);
    } else if (currentStatus !== 'claimed' && currentStatus !== 'verified') {
      eligible = false;
      skillEligible = false;
      reason = `Skill "${sName}" status is "${currentStatus}". A claimed or verified status is required.`;
      reasons.push(reason);
    } else if (currentLevel < reqLevel) {
      eligible = false;
      skillEligible = false;
      reason = `Skill "${sName}" level is ${currentLevel}, but Level ${reqLevel}+ is required.`;
      reasons.push(reason);
    }

    requiredSkillDetails.push({
      skillId: req.skillId || (studentSkill ? studentSkill.skillId : null),
      skillName: sName,
      minLevel: reqLevel,
      currentLevel,
      status: currentStatus,
      eligible: skillEligible,
      alreadyVerified: isAlreadyVerified,
      reason,
    });
  }

  return {
    eligible,
    allAlreadyVerified,
    reasons,
    studentSkills: studentSkillMap,
    requiredSkills: requiredSkillDetails,
  };
}

/**
 * Pure helper function deciding whether a waiver application is allowed given:
 * - eligibility result
 * - challenge allowWaiver setting
 * - existing submission record
 *
 * @param {object} params
 * @param {{ eligible?: boolean, allAlreadyVerified?: boolean }} [params.eligibility]
 * @param {boolean} [params.allowWaiver=true]
 * @param {object|null} [params.existingSubmission=null]
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function evaluateWaiverEligibility({ eligibility, allowWaiver = true, existingSubmission = null } = {}) {
  if (existingSubmission) {
    return { allowed: false, reason: 'Duplicate submission: You have already submitted an application for this challenge.' };
  }
  if (allowWaiver === false) {
    return { allowed: false, reason: 'Pre-verified waivers are not accepted for this challenge. You must complete the challenge.' };
  }
  if (!eligibility || !eligibility.eligible) {
    return { allowed: false, reason: 'Ineligible: Minimum skill prerequisites not met.' };
  }
  if (!eligibility.allAlreadyVerified) {
    return { allowed: false, reason: 'Ineligible for pre-verified waiver: All required skills must already be verified at or above the required level.' };
  }
  return { allowed: true };
}

/**
 * Checks whether an eligibility result satisfies the conditions for a pre-verified waiver.
 * Returns true only if the candidate is eligible and all required skills are already verified.
 *
 * @param {{ eligible?: boolean, allAlreadyVerified?: boolean }} eligibilityResult
 * @param {boolean} [allowWaiver=true]
 * @returns {boolean}
 */
export function isEligibleForWaiver(eligibilityResult, allowWaiver = true) {
  return Boolean(
    eligibilityResult &&
    eligibilityResult.eligible === true &&
    eligibilityResult.allAlreadyVerified === true &&
    allowWaiver !== false
  );
}
