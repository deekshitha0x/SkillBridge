import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { JobCard } from '../../components/jobs/JobCard';
import { Search, Briefcase } from 'lucide-react';

export function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await apiFetch('/api/jobs');
        setJobs(data);
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.company && j.company.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-navy">Corporate Job Opportunities</h1>
          <p className="text-xs text-slate mt-1 font-mono">
            Discover roles with explicit verified skill level prerequisites defined by corporate partners.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate font-mono text-sm">Loading job opportunities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
