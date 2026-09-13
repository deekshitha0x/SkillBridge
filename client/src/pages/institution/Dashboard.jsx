import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { VerifiedBadge } from '../../components/skills/VerifiedBadge';
import { GraduationCap, ShieldCheck, Award, Users, BarChart3 } from 'lucide-react';

export function InstitutionDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiFetch('/api/institution/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load institution aggregate stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate font-mono text-sm">Aggregating institution metrics...</div>;
  }

  const instName = stats?.institution?.name || 'National Institute of Technology (NIT)';
  const totalStudents = stats?.totalStudents || 0;
  const verifiedRate = stats?.aadhaarVerificationRate || 0;
  const skillStats = stats?.skillStats || [];
  const topStudents = stats?.topStudents || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-hairline-grey shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif text-2xl font-bold text-ink-navy">{instName}</h1>
            <Badge variant="verified">Partner Institution</Badge>
          </div>
          <p className="text-xs text-slate font-mono">
            Institution Code: {stats?.institution?.code || 'NIT-2026'} | Campus Skill Readiness Analytics
          </p>
        </div>

        <div className="flex items-center gap-4 bg-bone/60 p-3 rounded-lg border border-hairline-grey font-mono">
          <div>
            <span className="text-[10px] uppercase text-slate block">Total Students</span>
            <span className="text-xl font-bold text-ink-navy">{totalStudents}</span>
          </div>
          <div className="w-px h-8 bg-hairline-grey"></div>
          <div>
            <span className="text-[10px] uppercase text-slate block">Aadhaar Verified</span>
            <span className="text-xl font-bold text-verified-green">{verifiedRate}%</span>
          </div>
        </div>
      </div>

      {/* Aggregate Skill Metrics Table */}
      <Card>
        <CardHeader
          title="Campus Skill Verification Profile"
          subtitle="Aggregate breakdowns: Claimed vs Verified vs Level 2+ Proficiency"
        />
        <div className="overflow-x-auto border border-hairline-grey rounded-lg bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bone/80 border-b border-hairline-grey font-mono text-xs text-slate uppercase tracking-wider">
                <th className="py-3 px-4">Skill Name</th>
                <th className="py-3 px-4 text-center">Claimed Count</th>
                <th className="py-3 px-4 text-center">Verified Count</th>
                <th className="py-3 px-4 text-center">Level ≥ 2 Proficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-grey/60 text-sm">
              {skillStats.map((st) => {
                const verifiedPct = st.claimedCount > 0 ? Math.round((st.verifiedCount / st.claimedCount) * 100) : 0;
                return (
                  <tr key={st.skillId} className="hover:bg-bone/30">
                    <td className="py-3.5 px-4 font-semibold text-ink-navy">{st.skillName}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium">
                      {st.claimedCount} students
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-verified-green">
                      {st.verifiedCount} ({verifiedPct}%)
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-ink-navy">
                      <span className="px-2.5 py-0.5 rounded bg-ledger-gold/15 text-ledger-gold border border-ledger-gold/30">
                        {st.level2PlusCount} students
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Campus Leaderboard */}
      <Card>
        <CardHeader title="Student Leaderboard & Verified Skill Profiles" subtitle="Top performing students ranked by verified skills count" />
        <div className="space-y-3">
          {topStudents.map((st, idx) => (
            <div
              key={st.id}
              className="p-3.5 rounded-lg border border-hairline-grey/80 bg-bone/30 flex items-center justify-between font-mono text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-ink-navy text-bone flex items-center justify-center font-bold">
                  #{idx + 1}
                </span>
                <div>
                  <span className="font-sans font-bold text-sm text-ink-navy block">{st.name}</span>
                  <span className="text-[10px] text-slate">{st.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate">
                  Verified Skills: <strong className="text-verified-green">{st.verifiedSkillsCount}</strong>
                </span>
                <span className="text-slate">
                  Claimed Skills: <strong className="text-ink-navy">{st.claimedSkillsCount}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
