import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Briefcase, Building2, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function JobCard({ job }) {
  const navigate = useNavigate();
  const requiredSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  const challengeCount = job.challenges ? job.challenges.length : 0;

  return (
    <Card className="flex flex-col justify-between hover:border-slate/40">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate mb-1">
              <Building2 className="w-3.5 h-3.5" />
              {job.company ? job.company.name : 'Partner Company'}
            </span>
            <h4 className="font-serif text-xl font-bold text-ink-navy">{job.title}</h4>
          </div>
          {challengeCount > 0 && (
            <Badge variant="gold" icon={false}>
              <Zap className="w-3 h-3 text-ledger-gold mr-0.5 inline" />
              {challengeCount} Challenge{challengeCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <p className="text-xs text-slate line-clamp-2 my-3">{job.description}</p>

        <div className="my-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate block mb-1.5">
            Required Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {requiredSkills.map((sk, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-bone border border-hairline-grey text-xs font-mono font-medium text-ink-navy"
              >
                {sk.skillName || 'Skill'} <span className="text-slate">(Lvl {sk.minLevel || 1})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-hairline-grey/50 mt-4 flex items-center justify-between">
        <span className="text-xs text-slate font-mono">
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/student/jobs/${job.id}`)}
          className="flex items-center gap-1"
        >
          View Job & Prerequisites
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
