/**
 * Pure helper functions for review validation and privacy scoping
 */

export const ALLOWED_HIRING_STATUSES = ['pending', 'shortlisted', 'hired', 'rejected'];

/**
 * Validates whether a provided hiringStatus string is permitted.
 * @param {string} status 
 * @returns {boolean}
 */
export function isValidHiringStatus(status) {
  if (status === undefined || status === null) return true;
  return ALLOWED_HIRING_STATUSES.includes(status);
}

/**
 * Determines whether candidate email should be visible to the caller.
 * - Institution users can see emails for all students.
 * - Recruiters can ONLY see email if the candidate has submitted an application
 *   to a challenge owned by that recruiter's company.
 * 
 * @param {string} role - 'institution' | 'recruiter' | 'student'
 * @param {string} candidateId - User ID of candidate
 * @param {Set<string>|Array<string>} applicantUserIds - Set/Array of user IDs who applied to caller's company
 * @returns {boolean}
 */
export function shouldShowCandidateEmail(role, candidateId, applicantUserIds = new Set()) {
  if (role === 'institution') return true;
  if (role === 'recruiter') {
    if (applicantUserIds instanceof Set) {
      return applicantUserIds.has(candidateId);
    }
    return Array.isArray(applicantUserIds) && applicantUserIds.includes(candidateId);
  }
  return false;
}

