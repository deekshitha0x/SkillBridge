import { describe, it, expect } from 'vitest';
import { isValidHiringStatus, shouldShowCandidateEmail, ALLOWED_HIRING_STATUSES } from '../src/lib/reviewValidation.js';

describe('Review & Privacy Validation Pure Logic Helpers', () => {
  describe('isValidHiringStatus', () => {
    it('allows valid hiring statuses', () => {
      expect(isValidHiringStatus('pending')).toBe(true);
      expect(isValidHiringStatus('shortlisted')).toBe(true);
      expect(isValidHiringStatus('hired')).toBe(true);
      expect(isValidHiringStatus('rejected')).toBe(true);
    });

    it('treats undefined or null as valid (optional fallback to current status)', () => {
      expect(isValidHiringStatus(undefined)).toBe(true);
      expect(isValidHiringStatus(null)).toBe(true);
    });

    it('rejects invalid or unknown statuses', () => {
      expect(isValidHiringStatus('banana')).toBe(false);
      expect(isValidHiringStatus('accepted')).toBe(false);
      expect(isValidHiringStatus('')).toBe(false);
      expect(isValidHiringStatus(123)).toBe(false);
    });
  });

  describe('shouldShowCandidateEmail', () => {
    const applicantSet = new Set(['user-alex-123', 'user-priya-456']);

    it('always shows email to institution users', () => {
      expect(shouldShowCandidateEmail('institution', 'user-alex-123', applicantSet)).toBe(true);
      expect(shouldShowCandidateEmail('institution', 'unknown-user-789', applicantSet)).toBe(true);
      expect(shouldShowCandidateEmail('institution', 'unknown-user-789', new Set())).toBe(true);
    });

    it('shows email to recruiters ONLY if candidate submitted to recruiter company', () => {
      expect(shouldShowCandidateEmail('recruiter', 'user-alex-123', applicantSet)).toBe(true);
      expect(shouldShowCandidateEmail('recruiter', 'user-priya-456', applicantSet)).toBe(true);
      expect(shouldShowCandidateEmail('recruiter', 'user-rohan-789', applicantSet)).toBe(false);
      expect(shouldShowCandidateEmail('recruiter', 'user-alex-123', new Set())).toBe(false);
    });

    it('supports array of applicant IDs as fallback', () => {
      const applicantArray = ['user-alex-123'];
      expect(shouldShowCandidateEmail('recruiter', 'user-alex-123', applicantArray)).toBe(true);
      expect(shouldShowCandidateEmail('recruiter', 'user-rohan-789', applicantArray)).toBe(false);
    });

    it('hides email for other roles like student', () => {
      expect(shouldShowCandidateEmail('student', 'user-alex-123', applicantSet)).toBe(false);
    });
  });
});

