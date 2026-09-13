import React from 'react';
import { VerifiedBadge } from '../skills/VerifiedBadge';
import { Badge } from '../ui/Badge';
import { CheckCircle2, XCircle } from 'lucide-react';

export function RequiredSkillsTable({ requiredSkills = [], studentSkills = {} }) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return <p className="text-sm text-slate">No specific skill prerequisites defined.</p>;
  }

  return (
    <div className="overflow-x-auto border border-hairline-grey rounded-lg bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-bone/80 border-b border-hairline-grey font-mono text-xs text-slate uppercase tracking-wider">
            <th className="py-3 px-4">Required Skill</th>
            <th className="py-3 px-4 text-center">Required Min Level</th>
            <th className="py-3 px-4 text-center">Your Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline-grey/60 text-sm">
          {requiredSkills.map((req, idx) => {
            const sName = req.skillName || 'Skill';
            const studentSkill =
              studentSkills[req.skillId] ||
              studentSkills[(req.skillName || '').toLowerCase()];

            const isVerified = studentSkill && studentSkill.status === 'verified';
            const levelMet = isVerified && studentSkill.level >= (req.minLevel || 1);
            const isQualified = isVerified && levelMet;

            return (
              <tr key={idx} className="hover:bg-bone/30">
                <td className="py-3.5 px-4 font-semibold text-ink-navy">{sName}</td>
                <td className="py-3.5 px-4 text-center font-mono font-medium">
                  Level {req.minLevel || 1}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {isQualified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-verified-green">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      Qualified (Lvl {studentSkill.level})
                    </span>
                  ) : isVerified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate">
                      <XCircle className="w-4 h-4 text-alert-coral" />
                      Needs Higher Level (Lvl {studentSkill.level})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-alert-coral">
                      <XCircle className="w-4 h-4" />
                      Not Verified
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
