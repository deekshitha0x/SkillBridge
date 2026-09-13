import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { SkillCard } from '../../components/skills/SkillCard';
import { ShieldCheck, Search } from 'lucide-react';

const STATUS_ORDER = { verified: 1, claimed: 2, pending: 3 };

export function StudentSkillProfile() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadSkills = async () => {
    try {
      const data = await apiFetch('/api/skills');
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleClaimSkill = async (skill) => {
    try {
      const res = await apiFetch('/api/skills/claim', {
        method: 'POST',
        body: JSON.stringify({ skillId: skill.id }),
      });
      setMessage(res.message || `Skill "${skill.name}" added to profile successfully!`);
      loadSkills();
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleAssessSkill = (skill) => {
    navigate(`/student/assessment/${skill.id}`);
  };

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    const orderA = STATUS_ORDER[a.status] || 99;
    const orderB = STATUS_ORDER[b.status] || 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-navy">Skill Profile & Verification</h1>
          <p className="text-xs text-slate mt-1 font-mono">
            Your persistent skill asset portfolio. Pass verification quizzes to claim skills or complete recruiter challenges for verified level advancement.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
          />
        </div>
      </div>

      {message && (
        <div className="p-3 bg-verified-green/10 border border-verified-green/30 rounded-md text-xs text-verified-green font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          {message}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate font-mono text-sm">Loading skill profile...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onClaim={handleClaimSkill}
              onAssess={handleAssessSkill}
            />
          ))}
        </div>
      )}
    </div>
  );
}
