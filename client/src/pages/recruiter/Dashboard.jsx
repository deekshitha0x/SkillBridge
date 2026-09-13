import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Building2, PlusCircle, CheckSquare, Users, Briefcase, ChevronRight } from 'lucide-react';

export function RecruiterDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecruiterData() {
      try {
        const [jData, cData] = await Promise.all([
          apiFetch('/api/jobs'),
          apiFetch('/api/challenges'),
        ]);
        setJobs(jData);
        setChallenges(cData);
      } catch (err) {
        console.error('Failed to load recruiter data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecruiterData();
  }, []);

  const totalSubmissions = challenges.reduce((sum, ch) => sum + (ch._count?.submissions || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-hairline-grey shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif text-2xl font-bold text-ink-navy">
              Recruiter Command Center
            </h1>
            <Badge variant="gold" icon={false}>Employer Portal</Badge>
          </div>
          <p className="text-xs text-slate font-mono">
            Company: {user?.company?.name || `${user?.name}'s Organization`} | Recruiter: {user?.email}
          </p>
        </div>

        <Button variant="primary" onClick={() => navigate('/recruiter/new-job')} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Create New Job & Challenge
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate block mb-1">Active Job Postings</span>
            <span className="text-3xl font-serif font-bold text-ink-navy">{jobs.length}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/recruiter/new-job')} className="mt-4 w-full">
            Post Job
          </Button>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate block mb-1">Total Submissions Received</span>
            <span className="text-3xl font-serif font-bold text-ledger-gold">{totalSubmissions}</span>
          </div>
          <Button variant="gold" size="sm" onClick={() => navigate('/recruiter/submissions')} className="mt-4 w-full">
            Review Submissions
          </Button>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate block mb-1">Verified Candidate Search</span>
            <span className="text-3xl font-serif font-bold text-verified-green">Ready</span>
          </div>
          <Button variant="verified" size="sm" onClick={() => navigate('/recruiter/candidates')} className="mt-4 w-full">
            Search Candidate Pool
          </Button>
        </Card>
      </div>

      {/* Active Postings Overview */}
      <Card>
        <CardHeader
          title="Active Job Prerequisites & Challenges"
          subtitle="Manage requirements and view submitted solutions"
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/recruiter/new-job')}>
              + Add Job
            </Button>
          }
        />
        {loading ? (
          <div className="p-4 text-center text-xs text-slate font-mono">Loading postings...</div>
        ) : (
          <div className="space-y-4">
            {jobs.map((j) => (
              <div key={j.id} className="p-4 rounded-lg border border-hairline-grey hover:border-slate transition bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-lg text-ink-navy">{j.title}</h4>
                    <p className="text-xs text-slate mt-0.5 line-clamp-1">{j.description}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/recruiter/submissions')} className="flex items-center gap-1">
                    Review Code
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
