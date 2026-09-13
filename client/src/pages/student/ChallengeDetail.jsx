import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SubmissionForm } from '../../components/challenges/SubmissionForm';
import { ArrowLeft, ShieldAlert, CheckCircle2, Clock, Zap, Lock } from 'lucide-react';

export function StudentChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadData = async () => {
    try {
      const data = await apiFetch(`/api/challenges/${id}`);
      setChallengeData(data);
    } catch (err) {
      console.error('Failed to load challenge detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSubmitSolution = async ({ content, tabSwitches }) => {
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const res = await apiFetch(`/api/challenges/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ content, tabSwitches }),
      });
      setSubmitSuccess(res.message || 'Solution submitted successfully!');
      loadData();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate font-mono text-sm">Loading challenge environment...</div>;
  }

  if (!challengeData || !challengeData.challenge) {
    return (
      <Card className="max-w-lg mx-auto text-center p-8">
        <h3 className="font-serif text-xl font-bold text-ink-navy mb-2">Challenge Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </Card>
    );
  }

  const { challenge, eligibility } = challengeData;
  const isEligible = eligibility?.eligible !== false;
  const submissions = challenge.submissions || [];
  const hasSubmitted = submissions.length > 0;
  const latestSubmission = hasSubmitted ? submissions[0] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate('/student/dashboard')} className="flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      {/* Challenge Title Banner */}
      <Card className="shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline-grey pb-4 mb-4">
          <div>
            <span className="text-xs font-mono text-slate block mb-1">
              Job Role: {challenge.job ? challenge.job.title : 'Corporate Partner'}
            </span>
            <h1 className="font-serif text-2xl font-bold text-ink-navy">{challenge.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="gold" icon={false}>
              Difficulty: {challenge.difficultyLevel}/5
            </Badge>
            <Badge variant="default">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {challenge.timeLimitMinutes} mins
            </Badge>
          </div>
        </div>

        {/* Real Eligibility Check Result Alert */}
        {!isEligible ? (
          <div className="p-4 bg-alert-coral/10 border border-alert-coral/30 rounded-lg text-alert-coral mb-4">
            <div className="font-semibold flex items-center gap-2 mb-1 text-sm">
              <Lock className="w-4 h-4" />
              Prerequisite Eligibility Check Failed
            </div>
            <p className="text-xs mb-2">
              Your profile does not satisfy the minimum verified skill levels required by the server:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs font-mono">
              {eligibility.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-3 bg-verified-green/10 border border-verified-green/30 rounded-lg text-verified-green text-xs font-medium flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            Eligibility Confirmed: Your verified profile meets all challenge prerequisites.
          </div>
        )}

        <div className="bg-bone/40 p-4 rounded-lg border border-hairline-grey/60">
          <h4 className="text-xs font-mono font-semibold uppercase text-slate mb-2">Problem Statement</h4>
          <p className="text-sm text-ink-navy leading-relaxed whitespace-pre-line font-sans">
            {challenge.description}
          </p>
        </div>
      </Card>

      {/* Submission Feedback Messages */}
      {submitSuccess && (
        <div className="p-4 bg-verified-green/10 border border-verified-green/30 rounded-lg text-verified-green font-medium text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          {submitSuccess}
        </div>
      )}

      {submitError && (
        <div className="p-4 bg-alert-coral/10 border border-alert-coral/30 rounded-lg text-alert-coral font-medium text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          {submitError}
        </div>
      )}

      {/* Submission Area or Existing Submission */}
      {hasSubmitted ? (
        <Card>
          <CardHeader title="Your Submission Record" subtitle="Submitted to recruiter verification queue" />
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono p-3 bg-bone rounded border">
              <span>Status: <strong className="uppercase text-ink-navy">{latestSubmission.status}</strong></span>
              <span>Tab Switches Logged: <strong>{latestSubmission.tabSwitches}</strong></span>
              <span>Submitted: {new Date(latestSubmission.createdAt).toLocaleString()}</span>
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-slate block mb-1">Submitted Source Code</span>
              <pre className="p-4 bg-ink-navy text-bone rounded-lg text-xs font-mono overflow-x-auto">
                {latestSubmission.content}
              </pre>
            </div>
          </div>
        </Card>
      ) : isEligible ? (
        <Card>
          <CardHeader title="Submit Challenge Solution" subtitle="Write or paste your code implementation below" />
          <SubmissionForm onSubmit={handleSubmitSolution} loading={submitting} />
        </Card>
      ) : null}
    </div>
  );
}
