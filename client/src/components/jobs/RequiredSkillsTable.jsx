import React from 'react';
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
            const reqLevel = req.minLevel || 1;
            const studentSkill =
              studentSkills[req.skillId] ||
              studentSkills[(req.skillName || '').toLowerCase()];

            const currentLevel = studentSkill ? studentSkill.level : 0;
            const currentStatus = studentSkill ? studentSkill.status : null;

            // 1. Verified: verified and meets or exceeds required level
            const isVerified = currentStatus === 'verified' && currentLevel >= reqLevel;

            // 2. Claimed: claimed and meets or exceeds required level (eligible for challenge)
            const isClaimedEligible = currentStatus === 'claimed' && currentLevel >= reqLevel;

            // 3. Reason for non-eligibility
            let reason = '';
            if (!studentSkill) {
              reason = `Not on profile (Level 0 / req Level ${reqLevel}+)`;
            } else if (currentStatus === 'pending') {
              reason = `Pending quiz (Level ${currentLevel} / req Level ${reqLevel}+)`;
            } else if (currentLevel < reqLevel) {
              reason = `Level too low (Level ${currentLevel} / req Level ${reqLevel}+)`;
            } else if (currentStatus !== 'claimed' && currentStatus !== 'verified') {
              reason = `Status is "${currentStatus}" (req Level ${reqLevel}+)`;
            }

            return (
              <tr key={idx} className="hover:bg-bone/30">
                <td className="py-3.5 px-4 font-semibold text-ink-navy">{sName}</td>
                <td className="py-3.5 px-4 text-center font-mono font-medium">
                  Level {reqLevel}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-verified-green/10 border border-verified-green/30 text-xs font-semibold text-verified-green">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      Verified (Level {currentLevel})
                    </span>
                  ) : isClaimedEligible ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ledger-gold/15 border border-ledger-gold/30 text-xs font-semibold text-ink-navy">
                      <CheckCircle2 className="w-4 h-4 text-ledger-gold stroke-[2.5]" />
                      Claimed — eligible for challenge (Level {currentLevel})
                    </span>
                  ) : (
                    <div className="inline-flex flex-col items-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-alert-coral/10 border border-alert-coral/20 text-xs font-medium text-alert-coral">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        Not eligible
                      </span>
                      <span className="text-[10px] font-mono text-slate mt-1">
                        {reason}
                      </span>
                    </div>
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
