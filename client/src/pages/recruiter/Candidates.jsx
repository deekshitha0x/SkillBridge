import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Card, CardHeader } from '../../components/ui/Card';
import { VerifiedBadge } from '../../components/skills/VerifiedBadge';
import { Badge } from '../../components/ui/Badge';
import { Search, Award, Users, ShieldCheck } from 'lucide-react';

export function RecruiterCandidates() {
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCandidatePool() {
      try {
        const data = await apiFetch('/api/institution/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load candidate pool:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCandidatePool();
  }, []);

  const candidates = stats?.topStudents || [];
  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-navy">Verified Candidate Pool</h1>
          <p className="text-xs text-slate mt-1 font-mono">
            Search students across institutions with verified skill profiles.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate font-mono text-sm">Loading candidates database...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((cand) => (
            <Card key={cand.id} className="hover:border-slate/40 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-ink-navy">{cand.name}</h4>
                    <span className="text-xs font-mono text-slate block">{cand.email}</span>
                  </div>
                  {cand.aadhaarVerified ? (
                    <Badge variant="verified">Verified Identity</Badge>
                  ) : (
                    <Badge variant="pending">Unverified</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-bone rounded border font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate uppercase block font-sans">Verified Skills</span>
                    <span className="font-bold text-verified-green text-sm">
                      {cand.verifiedSkillsCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate uppercase block font-sans">Claimed Skills</span>
                    <span className="font-bold text-ink-navy text-sm">
                      {cand.claimedSkillsCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-hairline-grey/50">
                <span className="text-xs font-mono text-slate flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-verified-green" />
                  Prerequisite qualified candidate
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
