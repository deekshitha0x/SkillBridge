import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { VerifiedBadge } from '../../components/skills/VerifiedBadge';
import { ShieldCheck, Clock, ShieldAlert, CheckCircle2, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export function SkillAssessment() {
  const { skillId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // Anti-cheat & timing states
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [tabSwitches, setTabSwitches] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Keep refs to avoid stale closures in countdown timer
  const answersRef = useRef(answers);
  const tabSwitchesRef = useRef(tabSwitches);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    tabSwitchesRef.current = tabSwitches;
  }, [tabSwitches]);

  // Load or resume quiz session from server
  const loadQuiz = async () => {
    setLoading(true);
    setSubmissionError(null);
    setResult(null);
    try {
      const data = await apiFetch(`/api/assessments/${skillId}`);
      setAssessment(data);
      if (data.remainingSeconds !== undefined) {
        setRemainingSeconds(data.remainingSeconds);
      } else {
        setRemainingSeconds(data.timeLimitSeconds || 180);
      }
    } catch (err) {
      console.error('Failed to load assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [skillId]);

  // Anti-cheat visibility change listener
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Server-synchronized countdown timer interval
  useEffect(() => {
    if (remainingSeconds === null || result || submissionError || submitting) return;

    if (remainingSeconds <= 0) {
      // Auto-submit when timer hits 0
      handleSubmitQuiz(true);
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, result, submissionError, submitting]);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async (isAuto = false) => {
    if (submitting || result) return;
    setSubmitting(true);
    setSubmissionError(null);

    try {
      const data = await apiFetch(`/api/assessments/${skillId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers: answersRef.current,
          tabSwitches: tabSwitchesRef.current,
        }),
      });
      setResult(data);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      const isTimeout =
        err?.data?.timedOut ||
        (err?.message && err.message.toLowerCase().includes('time limit exceeded'));
      const isMissing =
        err?.data?.sessionMissing ||
        (err?.message && err.message.toLowerCase().includes('no active quiz session'));

      setSubmissionError({
        message:
          err.message ||
          (isTimeout
            ? 'Quiz time limit exceeded.'
            : 'Failed to submit assessment.'),
        isTimeout,
        isMissing,
        isAuto,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestartQuiz = () => {
    setAnswers({});
    setTabSwitches(0);
    setResult(null);
    setSubmissionError(null);
    loadQuiz();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate font-mono text-sm">
        Loading proctored assessment quiz...
      </div>
    );
  }

  if (!assessment) {
    return (
      <Card className="max-w-lg mx-auto text-center p-8">
        <h3 className="font-serif text-xl font-bold text-ink-navy mb-2">Assessment Unavailable</h3>
        <p className="text-xs text-slate mb-6">No assessment quiz is currently configured for this skill.</p>
        <Button variant="outline" onClick={() => navigate('/student/skill-profile')}>
          Back to Skill Profile
        </Button>
      </Card>
    );
  }

  const questions = assessment.questions || [];
  const answeredCount = Object.keys(answers).length;
  const isUrgent = remainingSeconds !== null && remainingSeconds <= 30;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate('/student/skill-profile')} className="flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Skill Profile
        </Button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border transition-colors ${
              isUrgent
                ? 'bg-alert-coral/10 border-alert-coral/40 text-alert-coral font-bold'
                : 'bg-white border-hairline-grey text-slate'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              Time Remaining:{' '}
              <strong>
                {remainingSeconds !== null
                  ? `${Math.floor(remainingSeconds / 60)}m ${String(remainingSeconds % 60).padStart(2, '0')}s`
                  : '--:--'}
              </strong>
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border ${
              tabSwitches > 0
                ? 'bg-alert-coral/10 border-alert-coral/30 text-alert-coral'
                : 'bg-white border-hairline-grey text-slate'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Tab Switches: <strong>{tabSwitches}</strong></span>
          </div>
        </div>
      </div>

      {/* STATE A: SUBMISSION ERROR / TIMEOUT / MISSING SESSION */}
      {submissionError ? (
        <Card className="text-center p-8 shadow-xl border-alert-coral/40">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-alert-coral/10 text-alert-coral">
            <Clock className="w-10 h-10" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-ink-navy mb-2">
            {submissionError.isTimeout
              ? 'Quiz Time Limit Exceeded'
              : submissionError.isMissing
              ? 'No Active Quiz Session Found'
              : 'Assessment Submission Error'}
          </h2>

          <p className="text-sm text-slate mb-6 max-w-md mx-auto">
            {submissionError.isTimeout
              ? 'The server-enforced time limit for this assessment has expired. To maintain assessment integrity, expired submissions are not scored.'
              : submissionError.isMissing
              ? 'Your quiz session could not be verified on the server or has timed out. Please start a fresh quiz attempt.'
              : submissionError.message}
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button variant="verified" onClick={handleRestartQuiz} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Restart Quiz
            </Button>
            <Button variant="outline" onClick={() => navigate('/student/skill-profile')}>
              Back to Skill Profile
            </Button>
          </div>
        </Card>
      ) : !result ? (
        /* STATE B: ACTIVE QUIZ VIEW */
        <Card className="shadow-lg">
          <div className="border-b border-hairline-grey pb-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate uppercase tracking-wider">
                Proctored Verification Assessment
              </span>
              <Badge variant="gold" icon={false}>
                Pass Score: {assessment.passScore}%
              </Badge>
            </div>
            <h2 className="font-serif text-2xl font-bold text-ink-navy">
              {assessment.skillName} Verification Quiz
            </h2>
            <div className="mt-3">
              <div className="flex justify-between text-xs font-mono text-slate mb-1">
                <span>Progress: {answeredCount} of {questions.length} answered</span>
                <span>{Math.round((answeredCount / (questions.length || 1)) * 100)}%</span>
              </div>
              <ProgressBar value={answeredCount} max={questions.length} variant="verified" />
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-8">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-bone/40 rounded-lg border border-hairline-grey/60">
                <h4 className="font-serif font-bold text-base text-ink-navy mb-3">
                  <span className="font-mono text-xs text-ledger-gold mr-2">Q{idx + 1}.</span>
                  {q.question}
                </h4>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3 rounded-md border text-sm cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-ink-navy text-bone border-ink-navy shadow-sm'
                            : 'bg-white border-hairline-grey hover:border-slate/50 text-ink-navy'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full border border-current text-xs flex items-center justify-center font-mono">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-hairline-grey mt-8 flex items-center justify-between">
            <span className="text-xs text-slate font-mono">
              Server-synchronized timer with automatic submission on expiration.
            </span>
            <Button
              variant="verified"
              size="lg"
              disabled={answeredCount < questions.length || submitting}
              onClick={() => handleSubmitQuiz(false)}
              className="flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              {submitting ? 'Evaluating Assessment...' : 'Submit Verification Quiz'}
            </Button>
          </div>
        </Card>
      ) : (
        /* STATE C: RESULT VIEW */
        <Card className="text-center p-8 shadow-xl">
          <div
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
              result.passed ? 'bg-verified-green/10 text-verified-green' : 'bg-alert-coral/10 text-alert-coral'
            }`}
          >
            {result.passed ? <CheckCircle2 className="w-10 h-10 stroke-[2.5]" /> : <XCircle className="w-10 h-10" />}
          </div>

          <h2 className="font-serif text-3xl font-bold text-ink-navy mb-2">
            {result.passed ? 'Assessment Passed!' : 'Assessment Unsuccessful'}
          </h2>
          <p className="text-sm text-slate mb-6">{result.message}</p>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto my-6 p-4 bg-bone rounded-lg border font-mono text-center">
            <div>
              <span className="text-[10px] text-slate block uppercase">Score</span>
              <span className={`text-xl font-bold ${result.passed ? 'text-verified-green' : 'text-alert-coral'}`}>
                {result.score}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate block uppercase">Correct</span>
              <span className="text-xl font-bold text-ink-navy">
                {result.correctCount}/{result.totalQuestions}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate block uppercase">Tab Switches</span>
              <span className="text-xl font-bold text-slate">
                {result.tabSwitches}
              </span>
            </div>
          </div>

          {result.passed ? (
            <div className="my-6 p-4 bg-verified-green/5 border border-verified-green/30 rounded-lg inline-flex items-center gap-3">
              <Badge variant="claimed">Claimed Level {result.studentSkill?.level || 1}</Badge>
              <span className="text-xs text-ink-navy font-semibold">
                Quiz Passed! Status updated to Claimed on your Skill Profile.
              </span>
            </div>
          ) : (
            <div className="my-6">
              <Button variant="verified" size="sm" onClick={handleRestartQuiz} className="inline-flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" onClick={() => navigate('/student/skill-profile')}>
              Return to Skill Profile
            </Button>
            <Button variant="primary" onClick={() => navigate('/student/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
