import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VerifiedBadge } from '../../components/skills/VerifiedBadge';
import { SkillProfileTable } from '../../components/skills/SkillProfileTable';
import { ShieldCheck, Award, Zap, Briefcase, Clock, ChevronRight, AlertCircle } from 'lucide-react';

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prof, chs] = await Promise.all([
          apiFetch('/api/profile'),
          apiFetch('/api/challenges'),
        ]);
        setProfileData(prof);
        setChallenges(chs);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate font-mono text-sm">
        Loading Student Skill Profile...
      </div>
    );
  }

  const profile = profileData?.profile || {};
  const studentSkills = profile.studentSkills || [];
  const submissions = profile.submissions || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-hairline-grey shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif text-2xl font-bold text-ink-navy">
              Welcome back, {user?.name || 'Student'}
            </h1>
            {user?.aadhaarVerified ? (
              <Badge variant="verified">Identity Verified</Badge>
            ) : (
              <Badge variant="coral">Simulated Aadhaar Pending</Badge>
            )}
          </div>
          <p className="text-xs text-slate font-mono">
            Institution: {profile.institution ? profile.institution.name : 'NIT'} | Student ID: {user?.id?.slice(0, 8)}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-bone/60 p-3 rounded-lg border border-hairline-grey font-mono">
          <div>
            <span className="text-[10px] uppercase text-slate block">Verified Skills</span>
            <span className="text-lg font-bold text-verified-green">
              {profileData?.verifiedSkillsCount || 0}
            </span>
          </div>
          <div className="w-px h-8 bg-hairline-grey"></div>
          <div>
            <span className="text-[10px] uppercase text-slate block">Claimed Skills</span>
            <span className="text-lg font-bold text-ink-navy">
              {profileData?.claimedSkillsCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Profile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between hover:border-slate/40">
          <div>
            <div className="w-9 h-9 rounded-lg bg-verified-green/10 text-verified-green flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-ink-navy mb-1">Skill Verification</h3>
            <p className="text-xs text-slate mb-4">
              Declare skills and complete proctored quiz assessments to earn claimed status and skill levels.
            </p>
          </div>
          <Button variant="verified" size="sm" onClick={() => navigate('/student/skill-profile')} className="w-full">
            Browse & Verify Skills
          </Button>
        </Card>

        <Card className="flex flex-col justify-between hover:border-slate/40">
          <div>
            <div className="w-9 h-9 rounded-lg bg-ledger-gold/10 text-ledger-gold flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-ink-navy mb-1">Hiring Challenges</h3>
            <p className="text-xs text-slate mb-4">
              Attempt corporate challenge problems matching your verified skill prerequisites.
            </p>
          </div>
          <Button variant="gold" size="sm" onClick={() => navigate('/student/jobs')} className="w-full">
            Explore Open Jobs
          </Button>
        </Card>

        <Card className="flex flex-col justify-between hover:border-slate/40">
          <div>
            <div className="w-9 h-9 rounded-lg bg-ink-navy/10 text-ink-navy flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-ink-navy mb-1">Skill Profile Ledger</h3>
            <p className="text-xs text-slate mb-4">
              View your persistent skill profile asset portfolio with level progression.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/student/skill-profile')} className="w-full">
            View Skill Breakdown
          </Button>
        </Card>
      </div>

      {/* Verified Skill Profile Table */}
      <Card>
        <CardHeader
          title="Verified Skill Profile"
          subtitle="Real-time skill status and verified level allocations"
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/student/skill-profile')}>
              Manage Skill Profile
            </Button>
          }
        />
        <SkillProfileTable skills={studentSkills} />
      </Card>

      {/* Active Challenges & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Available Hiring Challenges" subtitle="Matched to your profile prerequisites" />
          <div className="space-y-3">
            {challenges.slice(0, 3).map((ch) => (
              <div
                key={ch.id}
                onClick={() => navigate(`/student/challenges/${ch.id}`)}
                className="p-3.5 rounded-lg border border-hairline-grey hover:border-slate cursor-pointer transition flex items-center justify-between bg-white"
              >
                <div>
                  <h4 className="font-serif font-bold text-sm text-ink-navy">{ch.title}</h4>
                  <p className="text-xs text-slate mt-0.5">
                    Job: {ch.job ? ch.job.title : 'Company Challenge'}
                  </p>
                </div>
                {ch.eligible !== false ? (
                  <Badge variant="gold" icon={false}>Eligible</Badge>
                ) : (
                  <Badge variant="coral">Prerequisite Required</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Submissions Activity */}
        <Card>
          <CardHeader title="Recent Submission Reviews" subtitle="Recruiter evaluations and challenge verifications" />
          {submissions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate font-mono border border-dashed rounded-lg">
              No challenge submissions yet. Complete hiring challenges for verified level upgrades.
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded border border-hairline-grey/60 flex items-center justify-between font-mono text-xs bg-bone/30"
                >
                  <div>
                    <span className="font-bold text-ink-navy block">
                      {sub.challenge ? sub.challenge.title : 'Hiring Challenge'}
                    </span>
                    <span className="text-[10px] text-slate font-sans">
                      Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {sub.isWaiver ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="gold" icon={false}>Pre-verified application</Badge>
                      {sub.hiringStatus && sub.hiringStatus !== 'pending' && (
                        <Badge variant={sub.hiringStatus === 'hired' ? 'verified' : sub.hiringStatus === 'shortlisted' ? 'gold' : 'coral'}>
                          {sub.hiringStatus.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  ) : sub.verifiedByRecruiter ? (
                    <Badge variant="verified">Verified</Badge>
                  ) : sub.status === 'reviewed' ? (
                    <Badge variant="claimed">Reviewed</Badge>
                  ) : (
                    <Badge variant="pending">Pending Review</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
