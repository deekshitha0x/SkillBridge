import React from 'react';
import { VerifiedBadge } from './VerifiedBadge';
import { Badge } from '../ui/Badge';
import { Award, ShieldAlert } from 'lucide-react';

const STATUS_ORDER = { verified: 1, claimed: 2, pending: 3 };

export function SkillProfileTable({ skills = [] }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="p-8 text-center bg-bone/40 rounded-lg border border-dashed border-hairline-grey">
        <ShieldAlert className="w-8 h-8 text-slate mx-auto mb-2 opacity-60" />
        <p className="text-sm text-slate">No skills on profile yet.</p>
      </div>
    );
  }

  const sortedSkills = [...skills].sort((a, b) => {
    const orderA = STATUS_ORDER[a.status] || 99;
    const orderB = STATUS_ORDER[b.status] || 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    const nameA = (a.skill ? a.skill.name : a.name) || '';
    const nameB = (b.skill ? b.skill.name : b.name) || '';
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="overflow-x-auto border border-hairline-grey rounded-lg bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-bone/80 border-b border-hairline-grey font-mono text-xs text-slate uppercase tracking-wider">
            <th className="py-3 px-4">Skill Name</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Current Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline-grey/60 text-sm">
          {sortedSkills.map((item) => {
            const skillName = item.skill ? item.skill.name : item.name || 'Skill';
            const isVerified = item.status === 'verified';
            const isClaimed = item.status === 'claimed';

            return (
              <tr key={item.id || skillName} className="hover:bg-bone/30">
                <td className="py-3.5 px-4 font-semibold text-ink-navy">{skillName}</td>
                <td className="py-3.5 px-4">
                  {isVerified ? (
                    <VerifiedBadge />
                  ) : isClaimed ? (
                    <Badge variant="claimed">Claimed</Badge>
                  ) : (
                    <Badge variant="pending">Pending</Badge>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-ink-navy">
                  Level {item.level || 0} / 5
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
