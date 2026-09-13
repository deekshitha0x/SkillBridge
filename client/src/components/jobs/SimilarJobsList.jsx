import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Building2, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SimilarJobsList({ similarJobs = [] }) {
  const navigate = useNavigate();

  if (!similarJobs || similarJobs.length === 0) {
    return (
      <Card className="bg-bone/30 text-center p-6 border-dashed">
        <Sparkles className="w-6 h-6 text-slate mx-auto mb-2 opacity-50" />
        <p className="text-sm text-slate">No similar job postings found with overlapping skills yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold uppercase text-slate tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-ledger-gold" />
          Rule-Based Skill Overlap Recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {similarJobs.map((item) => (
          <Card key={item.id} className="hover:border-slate/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate inline-flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {item.company ? item.company.name : 'Company'}
                </span>
                <Badge variant="gold" icon={false}>
                  {item.sharedSkillCount} Shared Skill{item.sharedSkillCount > 1 ? 's' : ''}
                </Badge>
              </div>

              <h5 className="font-serif text-lg font-bold text-ink-navy mb-2">{item.title}</h5>

              <div className="flex flex-wrap gap-1 mb-3">
                {item.matchingSkills &&
                  item.matchingSkills.map((skName, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-verified-green/10 text-verified-green text-xs font-mono font-semibold"
                    >
                      ✓ {skName}
                    </span>
                  ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/student/jobs/${item.id}`)}
              className="w-full flex items-center justify-center gap-1.5 mt-2"
            >
              View Similar Posting
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
