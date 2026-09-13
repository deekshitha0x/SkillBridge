import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { VerifiedBadge } from '../../components/skills/VerifiedBadge';
import { ShieldCheck, Clock, ShieldAlert, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export function SkillAssessment() {
  const { skillId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // Anti-cheat & timing states
  const [timeSpent, setTimeSpent] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const data = await apiFetch(`/api/assessments/${skillId}`);
        setAssessment(data);
      } catch (err) {
        console.error('Failed to load assessment:', err);
      } finally {
        setLoading(false);
      }
    }
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

  // Timer interval
  useEffect(() => {
    if (!assessment || result) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [assessment, result]);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const data = await apiFetch(`/api/assessments/${skillId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers,
          timeSpentSeconds: timeSpent,
          tabSwitches,
        }),
      });
      setResult(data);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate font-mono text-sm">Loading proctored assessment quiz...</div>;
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate('/student/skill-profile')} className="flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Skill Profile
        </Button>
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-hairline-grey rounded-md">
            <Clock className="w-4 h-4 text-slate" />
            <span>Time: <strong>{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</strong></span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border ${
            tabSwitches > 0 ? 'bg-alert-coral/10 border-alert-coral/30 text-alert-coral' : 'bg-white border-hairline-grey text-slate'
          }`}>
            <ShieldAlert className="w-4 h-4" />
            <span>Tab Switches: <strong>{tabSwitches}</strong></span>
          </div>
        </div>
      </div>

      {!result ? (
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
                <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
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
              Basic anti-cheat tracking tab switches and completion duration.
            </span>
            <Button
              variant="verified"
              size="lg"
              disabled={answeredCount < questions.length || submitting}
              onClick={handleSubmitQuiz}
              className="flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              {submitting ? 'Evaluating Assessment...' : 'Submit Verification Quiz'}
            </Button>
          </div>
        </Card>
      ) : (
        /* RESULT VIEW */
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

          {result.passed && (
            <div className="my-6 p-4 bg-verified-green/5 border border-verified-green/30 rounded-lg inline-flex items-center gap-3">
              <Badge variant="claimed">Claimed Level {result.studentSkill?.level || 1}</Badge>
              <span className="text-xs text-ink-navy font-semibold">
                Quiz Passed! Status updated to Claimed on your Skill Profile.
              </span>
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
