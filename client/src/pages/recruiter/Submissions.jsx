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

  const handleReviewSubmission = async (challengeId, submissionId, verified) => {
    setActionLoading(true);
    setMessage('');
    try {
      const res = await apiFetch(`/api/challenges/${challengeId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          submissionId,
          verified,
        }),
      });

      setMessage(res.message || 'Submission reviewed and skill level verified!');
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
          Review candidate code solutions and verify hiring challenge capabilities.
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

            return (
              <Card key={ch.id}>
                <CardHeader
                  title={ch.title}
                  subtitle={`Job: ${ch.job ? ch.job.title : 'Posting'} | Difficulty: ${ch.difficultyLevel}/5`}
                  action={
                    <Badge variant="gold" icon={false}>
                      {submissions.length} Submission{submissions.length !== 1 ? 's' : ''}
                    </Badge>
                  }
                />

                {submissions.length === 0 ? (
                  <p className="text-xs text-slate font-mono p-4 bg-bone/40 border border-dashed rounded text-center">
                    No student submissions received for this challenge yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((sub) => (
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

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate">
                              Tab Switches: <strong className={sub.tabSwitches > 0 ? 'text-alert-coral' : 'text-verified-green'}>{sub.tabSwitches}</strong>
                            </span>
                            {sub.verifiedByRecruiter ? (
                              <Badge variant="verified">Reviewed & Verified</Badge>
                            ) : (
                              <Badge variant="coral">Pending Review</Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate block mb-1">
                            Candidate Code Solution
                          </span>
                          <pre className="p-3 bg-ink-navy text-bone rounded font-mono text-xs overflow-x-auto">
                            {sub.content}
                          </pre>
                        </div>

                        {!sub.verifiedByRecruiter && (
                          <div className="pt-2 flex justify-end border-t border-hairline-grey/60">
                            <Button
                              variant="verified"
                              size="sm"
                              disabled={actionLoading}
                              onClick={() => handleReviewSubmission(ch.id, sub.id, true)}
                              className="flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                              Approve & Verify Skill Level
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
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
