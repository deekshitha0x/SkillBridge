import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Search, ShieldCheck, Filter } from 'lucide-react';

export function RecruiterCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [minLevel, setMinLevel] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkillsList() {
      try {
        const data = await apiFetch('/api/skills');
        setSkills(data);
      } catch (err) {
        console.error('Failed to load skills:', err);
      }
    }
    loadSkillsList();
  }, []);

  const loadCandidatePool = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedSkill) query.append('skillId', selectedSkill);
      if (minLevel) query.append('minLevel', minLevel);
      if (search) query.append('search', search);

      const data = await apiFetch(`/api/institution/candidates?${query.toString()}`);
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load candidate pool:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidatePool();
  }, [selectedSkill, minLevel, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-navy">Verified Candidate Pool</h1>
          <p className="text-xs text-slate mt-1 font-mono">
            Search candidates across institutions filtered by verified skill levels.
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-hairline-grey px-2.5 py-1.5 rounded-md text-xs">
            <Filter className="w-3.5 h-3.5 text-slate" />
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="bg-transparent font-mono focus:outline-none"
            >
              <option value="">All Skills</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-hairline-grey px-2.5 py-1.5 rounded-md text-xs">
            <span className="font-mono text-slate text-[11px]">Min Level:</span>
            <select
              value={minLevel}
              onChange={(e) => setMinLevel(e.target.value)}
              className="bg-transparent font-mono focus:outline-none"
            >
              <option value="">Any</option>
              <option value="1">Level 1+</option>
              <option value="2">Level 2+</option>
              <option value="3">Level 3+</option>
              <option value="4">Level 4+</option>
              <option value="5">Level 5</option>
            </select>
          </div>

          <div className="relative w-full md:w-56">
            <Search className="w-4 h-4 text-slate absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by candidate name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate font-mono text-sm">Loading candidates database...</div>
      ) : candidates.length === 0 ? (
        <div className="p-8 text-center text-slate font-mono text-xs bg-bone/40 border border-dashed rounded-lg">
          No candidates match the specified skill level criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => (
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

                <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-bone rounded border font-mono text-xs">
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

                {cand.studentSkills && cand.studentSkills.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate block">Skills Breakdown:</span>
                    <div className="flex flex-wrap gap-1">
                      {cand.studentSkills.map((sk) => (
                        <span
                          key={sk.skillId}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            sk.status === 'verified'
                              ? 'bg-verified-green/10 text-verified-green border-verified-green/30 font-bold'
                              : sk.status === 'claimed'
                              ? 'bg-ledger-gold/15 text-ink-navy border-ledger-gold/30'
                              : 'bg-bone text-slate border-hairline-grey'
                          }`}
                        >
                          {sk.skillName} (L{sk.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 mt-4 border-t border-hairline-grey/50">
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

