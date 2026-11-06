import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function RecruiterNewJob() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);

  // Job form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([
    { skillId: '', skillName: '', minLevel: 1 },
  ]);

  // Challenge form fields
  const [createChallenge, setCreateChallenge] = useState(true);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDesc, setChallengeDesc] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [timeLimit, setTimeLimit] = useState(45);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSkills() {
      try {
        const data = await apiFetch('/api/skills');
        setSkills(data);
        if (data.length > 0) {
          setRequiredSkills([{ skillId: data[0].id, skillName: data[0].name, minLevel: 1 }]);
        }
      } catch (err) {
        console.error('Failed to load skills list:', err);
      }
    }
    loadSkills();
  }, []);

  const handleAddSkillReq = () => {
    if (skills.length === 0) return;
    const defaultSk = skills[0];
    setRequiredSkills([...requiredSkills, { skillId: defaultSk.id, skillName: defaultSk.name, minLevel: 1 }]);
  };

  const handleRemoveSkillReq = (idx) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== idx));
  };

  const handleSkillChange = (idx, skillId) => {
    const sk = skills.find((s) => s.id === skillId);
    const updated = [...requiredSkills];
    updated[idx].skillId = skillId;
    updated[idx].skillName = sk ? sk.name : '';
    setRequiredSkills(updated);
  };

  const handleReqNumericChange = (idx, field, value) => {
    const updated = [...requiredSkills];
    updated[idx][field] = Number(value) || 0;
    setRequiredSkills(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setLoading(true);
    setError('');

    try {
      // 1. Create Job
      const createdJob = await apiFetch('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          requiredSkills,
        }),
      });

      // 2. Create Challenge if toggled
      if (createChallenge && challengeTitle && challengeDesc) {
        await apiFetch('/api/challenges', {
          method: 'POST',
          body: JSON.stringify({
            jobId: createdJob.id,
            title: challengeTitle,
            description: challengeDesc,
            requiredSkills,
            difficultyLevel: difficulty,
            timeLimitMinutes: timeLimit,
            allowWaiver,
          }),
        });
      }

      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate('/recruiter/dashboard')} className="flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <Card className="shadow-lg">
        <CardHeader title="Create New Job Posting & Prerequisites" subtitle="Define explicit verified skill levels required from candidates" />

        {error && (
          <div className="mb-4 p-3 bg-alert-coral/10 border border-alert-coral/30 rounded-md text-xs text-alert-coral">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate mb-1">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer (React & TypeScript)"
                className="w-full px-3 py-2 text-sm bg-bone/50 border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate mb-1">Role Description</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe role responsibilities, tech stack, and project goals..."
                className="w-full px-3 py-2 text-sm bg-bone/50 border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
              />
            </div>
          </div>

          {/* Required Skills Profile */}
          <div className="border-t border-hairline-grey pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold uppercase text-slate">
                Required Prerequisite Skills Profile
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSkillReq} className="flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                Add Skill Req
              </Button>
            </div>

            <div className="space-y-3">
              {requiredSkills.map((req, idx) => (
                <div key={idx} className="p-3 bg-bone/40 rounded-md border border-hairline-grey flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-mono text-slate uppercase">Select Skill</label>
                    <select
                      value={req.skillId}
                      onChange={(e) => handleSkillChange(idx, e.target.value)}
                      className="w-full p-1.5 text-xs bg-white border border-hairline-grey rounded focus:outline-none"
                    >
                      {skills.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-32">
                    <label className="block text-[10px] font-mono text-slate uppercase">Min Level (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={req.minLevel}
                      onChange={(e) => handleReqNumericChange(idx, 'minLevel', e.target.value)}
                      className="w-full p-1.5 text-xs bg-white border border-hairline-grey rounded focus:outline-none"
                    />
                  </div>

                  {requiredSkills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkillReq(idx)}
                      className="text-alert-coral hover:text-alert-coral/80 p-1 mt-3 md:mt-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Attached Hiring Challenge Section */}
          <div className="border-t border-hairline-grey pt-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="toggleChallenge"
                checked={createChallenge}
                onChange={(e) => setCreateChallenge(e.target.checked)}
                className="w-4 h-4 rounded text-ink-navy focus:ring-ink-navy"
              />
              <label htmlFor="toggleChallenge" className="text-xs font-mono font-bold uppercase text-ink-navy cursor-pointer">
                Attach Hiring Challenge to Job Posting
              </label>
            </div>

            {createChallenge && (
              <div className="p-4 bg-bone/40 rounded-lg border border-hairline-grey space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate mb-1">Challenge Title</label>
                  <input
                    type="text"
                    value={challengeTitle}
                    onChange={(e) => setChallengeTitle(e.target.value)}
                    placeholder="e.g. Asynchronous State Virtualization Challenge"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-hairline-grey rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate mb-1">Challenge Problem Statement</label>
                  <textarea
                    rows={3}
                    value={challengeDesc}
                    onChange={(e) => setChallengeDesc(e.target.value)}
                    placeholder="Describe problem details, inputs, outputs, and edge cases..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-hairline-grey rounded focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate mb-1">Difficulty (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={difficulty}
                      onChange={(e) => setDifficulty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-hairline-grey rounded focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate mb-1">Time Limit (Minutes)</label>
                    <input
                      type="number"
                      min={15}
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-hairline-grey rounded focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-hairline-grey/60">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-ink-navy">
                    <input
                      type="checkbox"
                      checked={allowWaiver}
                      onChange={(e) => setAllowWaiver(e.target.checked)}
                      className="w-4 h-4 rounded border-hairline-grey text-ink-navy focus:ring-ink-navy"
                    />
                    Accept pre-verified skills (students already verified in all required skills can apply without solving this challenge)
                  </label>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
            {loading ? 'Publishing Job Posting...' : 'Publish Job & Prerequisites'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
