import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RequiredSkillsTable } from '../../components/jobs/RequiredSkillsTable';
import { SimilarJobsList } from '../../components/jobs/SimilarJobsList';
import { StudyMaterials } from '../../components/jobs/StudyMaterials';
import { Building2, ArrowLeft, Zap, Briefcase } from 'lucide-react';

export function StudentJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jobData, setJobData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobAndProfile() {
      try {
        const [jData, pData] = await Promise.all([
          apiFetch(`/api/jobs/${id}`),
          apiFetch('/api/profile'),
        ]);
        setJobData(jData);
        setProfileData(pData);
      } catch (err) {
        console.error('Failed to load job details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobAndProfile();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate font-mono text-sm">Loading job detail analysis...</div>;
  }

  if (!jobData || !jobData.job) {
    return (
      <Card className="max-w-lg mx-auto text-center p-8">
        <h3 className="font-serif text-xl font-bold text-ink-navy mb-2">Job Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/student/jobs')}>
          Back to Jobs
        </Button>
      </Card>
    );
  }

  const { job, similarJobs } = jobData;
  const requiredSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  const challenges = Array.isArray(job.challenges) ? job.challenges : [];

  // Map student verified skills
  const studentSkillMap = {};
  if (profileData?.profile?.studentSkills) {
    profileData.profile.studentSkills.forEach((ss) => {
      studentSkillMap[ss.skillId] = ss;
      if (ss.skill) {
        studentSkillMap[ss.skill.name.toLowerCase()] = ss;
      }
    });
  }

  return (
    <div className="space-y-8">
      <Button variant="outline" size="sm" onClick={() => navigate('/student/jobs')} className="flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs List
      </Button>

      {/* Main Header */}
      <Card className="shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate mb-1">
              <Building2 className="w-4 h-4 text-ink-navy" />
              {job.company ? job.company.name : 'Partner Organization'}
            </span>
            <h1 className="font-serif text-3xl font-bold text-ink-navy">{job.title}</h1>
            <span className="text-xs font-mono text-slate block mt-1">
              Posted on {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <p className="text-sm text-ink-navy mt-4 leading-relaxed bg-bone/40 p-4 rounded-lg border border-hairline-grey/60">
          {job.description}
        </p>
      </Card>

      {/* Prerequisites Table */}
      <Card>
        <CardHeader
          title="Skill Prerequisites vs Your Verified Profile"
          subtitle="Verification checks required minimum levels on your profile"
        />
        <RequiredSkillsTable requiredSkills={requiredSkills} studentSkills={studentSkillMap} />
      </Card>

      {/* Study Materials & Preparation Resources (Section 5.5) */}
      <StudyMaterials requiredSkills={requiredSkills} />

      {/* Linked Hiring Challenges */}
      <Card>
        <CardHeader
          title="Linked Hiring Challenges"
          subtitle="Solve corporate challenges to prove competence directly to recruiters"
        />
        {challenges.length === 0 ? (
          <p className="text-xs text-slate font-mono p-4 bg-bone border rounded">
            No specific code challenge attached to this job posting yet.
          </p>
        ) : (
          <div className="space-y-3">
            {challenges.map((ch) => (
              <div
                key={ch.id}
                onClick={() => navigate(`/student/challenges/${ch.id}`)}
                className="p-4 rounded-lg border border-hairline-grey hover:border-slate cursor-pointer transition flex items-center justify-between bg-white"
              >
                <div>
                  <h4 className="font-serif font-bold text-base text-ink-navy">{ch.title}</h4>
                  <p className="text-xs text-slate mt-1 line-clamp-1">{ch.description}</p>
                </div>
                <Button variant="gold" size="sm" className="flex items-center gap-1 shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                  View Challenge
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Similar Jobs Recommendation List */}
      <SimilarJobsList similarJobs={similarJobs} />
    </div>
  );
}
