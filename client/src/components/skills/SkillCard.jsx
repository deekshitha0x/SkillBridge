import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { VerifiedBadge } from './VerifiedBadge';
import { Award, Zap } from 'lucide-react';

export function SkillCard({ skill, onClaim, onAssess }) {
  const isVerified = skill.status === 'verified';
  const isClaimed = skill.status === 'claimed';
  const isPending = skill.status === 'pending' || (!isVerified && !isClaimed);

  return (
    <Card className="flex flex-col justify-between hover:border-slate/40">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-serif text-lg font-bold text-ink-navy">{skill.name}</h4>
          {isVerified ? (
            <VerifiedBadge />
          ) : isClaimed ? (
            <Badge variant="claimed">Claimed</Badge>
          ) : (
            <Badge variant="pending">Pending</Badge>
          )}
        </div>

        <div className="my-4 p-3 bg-bone/60 rounded-md border border-hairline-grey/60 font-mono text-xs">
          <span className="text-slate block text-[10px] uppercase tracking-wider font-sans">Current Level</span>
          <span className="font-bold text-ink-navy text-base">{skill.level || 0} / 5</span>
        </div>
      </div>

      <div className="pt-2 border-t border-hairline-grey/50 mt-2">
        {isPending ? (
          <Button
            variant="verified"
            size="sm"
            className="w-full flex items-center justify-center gap-1.5"
            onClick={() => onAssess && onAssess(skill)}
          >
            <Zap className="w-3.5 h-3.5" />
            Take Verification Quiz
          </Button>
        ) : isClaimed ? (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="w-full opacity-70 cursor-default text-verified-green border-verified-green/30 bg-verified-green/5"
          >
            Quiz Passed (Claimed)
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="w-full opacity-70 cursor-default text-verified-green border-verified-green/30 bg-verified-green/5"
          >
            Challenge Verified
          </Button>
        )}
      </div>
    </Card>
  );
}
