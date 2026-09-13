import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Clock, ShieldAlert, CheckCircle2, Zap, Lock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ChallengeCard({ challenge }) {
  const navigate = useNavigate();

  const isEligible = challenge.eligible !== false;
  const isSubmitted = !!challenge.userSubmission;

  return (
    <Card className="flex flex-col justify-between hover:border-slate/40">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-mono text-slate block mb-1">
              Job Posting: {challenge.job ? challenge.job.title : 'Target Role'}
            </span>
            <h4 className="font-serif text-xl font-bold text-ink-navy">{challenge.title}</h4>
          </div>

          {isSubmitted ? (
            <Badge variant="verified">Submitted</Badge>
          ) : isEligible ? (
            <Badge variant="gold" icon={false}>
              <Zap className="w-3 h-3 text-ledger-gold mr-1 inline" />
              Eligible to Attempt
            </Badge>
          ) : (
            <Badge variant="coral">
              <Lock className="w-3 h-3 mr-1 inline" />
              Locked (Ineligible)
            </Badge>
          )}
        </div>

        <p className="text-xs text-slate line-clamp-2 my-3">{challenge.description}</p>

        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-bone rounded-md border border-hairline-grey/60 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-slate">
            <Zap className="w-3.5 h-3.5 text-ledger-gold" />
            <span>Difficulty: <strong className="text-ink-navy font-bold">{challenge.difficultyLevel || 1}/5</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate">
            <Clock className="w-3.5 h-3.5" />
            <span>Limit: <strong className="text-ink-navy font-bold">{challenge.timeLimitMinutes || 60}m</strong></span>
          </div>
        </div>

        {!isEligible && challenge.eligibilityReasons && challenge.eligibilityReasons.length > 0 && (
          <div className="p-2.5 bg-alert-coral/10 border border-alert-coral/20 rounded text-xs text-alert-coral my-2">
            <div className="font-semibold mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Prerequisites Not Met:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              {challenge.eligibilityReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-hairline-grey/50 mt-3">
        {isSubmitted ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-1"
            onClick={() => navigate(`/student/challenges/${challenge.id}`)}
          >
            View Submission Status
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            variant={isEligible ? 'verified' : 'secondary'}
            disabled={!isEligible}
            size="sm"
            className="w-full flex items-center justify-center gap-1.5"
            onClick={() => navigate(`/student/challenges/${challenge.id}`)}
          >
            {isEligible ? (
              <>
                Attempt Challenge
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Locked — Verify Required Skills
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
