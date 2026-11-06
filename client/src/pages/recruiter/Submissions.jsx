import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Award, ShieldAlert, CheckCircle2, Clock, Code } from 'lucide-react';

export function RecruiterSubmissions() {
  const [challenges, setChallenges] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadSubmissions = async () => {
    try {
      const chs = await apiFetch('/api/challenges');
      // For each challenge, fetch full details with submissions
      const fullDetails = await Promise.all(
        chs.map((c) => apiFetch(`/api/challenges/${c.id}`))
      );
      setChallenges(fullDetails);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleReviewSubmission = async (challengeId, submissionId, verified, hiringStatus = 'pending') => {
    setActionLoading(true);
    setMessage('');
    try {
      const res = await apiFetch(`/api/challenges/${challengeId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          submissionId,
          verified,
          hiringStatus,
        }),
      });

      setMessage(res.message || 'Submission review recorded successfully!');
      loadSubmissions();
    } catch (err) {
      console.error('Failed to review submission:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-navy">Challenge Solution Submissions</h1>
        <p className="text-xs text-slate mt-1 font-mono">
          Review candidate code solutions, verify skill levels, and manage hiring outcomes.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-verified-green/10 border border-verified-green/30 rounded-md text-xs text-verified-green font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          {message}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate font-mono text-sm">Loading challenge submissions...</div>
      ) : (
        <div className="space-y-6">
          {challenges.map((chData) => {
            const ch = chData.challenge;
            const submissions = ch.submissions || [];
            const reqSkills = Array.isArray(ch.requiredSkills) ? ch.requiredSkills : [];

            return (
              <Card key={ch.id}>
                <CardHeader
                  title={ch.title}
                  subtitle={`Job: ${ch.job ? ch.job.title : 'Posting'} | Difficulty: Level ${ch.difficultyLevel}/5`}
                  action={
                    <div className="flex items-center gap-2">
                      <Badge variant={ch.status === 'closed' ? 'coral' : 'verified'} icon={false}>
                        {ch.status === 'closed' ? 'Challenge Closed' : 'Active Challenge'}
                      </Badge>
                      <Badge variant="gold" icon={false}>
                        {submissions.length} Submission{submissions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  }
                />

                {submissions.length === 0 ? (
                  <p className="text-xs text-slate font-mono p-4 bg-bone/40 border border-dashed rounded text-center">
                    No student submissions received for this challenge yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((sub) => {
                      const hiringState = sub.hiringStatus || 'pending';
                      const isWaiver = sub.isWaiver === true;

                      return (
                        <div
                          key={sub.id}
                          className="p-4 rounded-lg border border-hairline-grey bg-bone/30 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline-grey/60 pb-3">
                            <div>
                              <span className="font-serif font-bold text-sm text-ink-navy">
                                Candidate: {sub.user ? sub.user.name : 'Student'}
                              </span>
                              <span className="text-xs font-mono text-slate block">
                                Email: {sub.user ? sub.user.email : 'Unknown'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {isWaiver ? (
                                <Badge variant="gold" icon={false}>
                                  Pre-verified
                                </Badge>
                              ) : (
                                <>
                                  <span className="text-xs font-mono text-slate mr-2">
                                    Tab Switches: <strong className={sub.tabSwitches > 0 ? 'text-alert-coral' : 'text-verified-green'}>{sub.tabSwitches}</strong>
                                  </span>

                                  {sub.verifiedByRecruiter ? (
                                    <Badge variant="verified">Skill Verified</Badge>
                                  ) : (
                                    <Badge variant="coral">Pending Skill Verification</Badge>
                                  )}
                                </>
                              )}

                              {hiringState === 'hired' && <Badge variant="verified">Hired 🎉</Badge>}
                              {hiringState === 'shortlisted' && <Badge variant="gold">Shortlisted ⭐</Badge>}
                              {hiringState === 'rejected' && <Badge variant="coral">Not Selected</Badge>}
                            </div>
                          </div>

                          {isWaiver ? (
                            <div className="p-3 bg-white rounded-lg border border-verified-green/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-semibold uppercase text-slate flex items-center gap-1.5">
                                  <Award className="w-4 h-4 text-verified-green" />
                                  Pre-Verified Skills Summary
                                </span>
                                <span className="text-[11px] font-mono text-verified-green font-medium">
                                  Challenge code test waived
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                                {reqSkills.map((req, i) => {
                                  const studentSkill = (sub.user?.studentSkills || []).find(
                                    (ss) =>
                                      (req.skillId && ss.skillId === req.skillId) ||
                                      (req.skillName && ss.skill?.name?.toLowerCase() === req.skillName.toLowerCase())
                                  );
                                  const verifiedLevel = studentSkill ? studentSkill.level : (req.minLevel || 1);
                                  return (
                                    <div
                                      key={i}
                                      className="p-2.5 bg-bone/40 rounded border border-hairline-grey text-xs flex items-center justify-between"
                                    >
                                      <div>
                                        <span className="font-semibold text-ink-navy block">
                                          {req.skillName || 'Skill'}
                                        </span>
                                        <span className="text-[10px] text-slate font-mono">
                                          Required: Level {req.minLevel}+
                                        </span>
                                      </div>
                                      <Badge variant="verified">
                                        Verified Lvl {verifiedLevel}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate block mb-1">
                                Candidate Code Solution
                              </span>
                              <pre className="p-3 bg-ink-navy text-bone rounded font-mono text-xs overflow-x-auto">
                                {sub.content}
                              </pre>
                            </div>
                          )}

                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-hairline-grey/60">
                            {isWaiver ? (
                              <span className="text-xs font-mono text-verified-green font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Pre-Verified Credentials • Skills already verified
                              </span>
                            ) : !sub.verifiedByRecruiter ? (
                              <Button
                                variant="verified"
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => handleReviewSubmission(ch.id, sub.id, true, hiringState)}
                                className="flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                                Approve & Verify Skill Level
                              </Button>
                            ) : (
                              <span className="text-xs font-mono text-verified-green font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Candidate Skill Level Verified
                              </span>
                            )}

                            {/* Hiring Actions */}
                            <div className="flex items-center gap-2 ml-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={actionLoading || hiringState === 'shortlisted'}
                                onClick={() => handleReviewSubmission(ch.id, sub.id, isWaiver ? sub.verifiedByRecruiter : sub.verifiedByRecruiter, 'shortlisted')}
                              >
                                Shortlist
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={actionLoading || hiringState === 'hired'}
                                onClick={() => handleReviewSubmission(ch.id, sub.id, true, 'hired')}
                              >
                                Hire Candidate
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={actionLoading || hiringState === 'rejected'}
                                onClick={() => handleReviewSubmission(ch.id, sub.id, isWaiver ? sub.verifiedByRecruiter : sub.verifiedByRecruiter, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
