import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { BookOpen, ExternalLink, GraduationCap, Code } from 'lucide-react';

const SKILL_RESOURCE_MAP = {
  python: [
    { title: 'Official Python Docs & Standard Library', type: 'Documentation', link: 'https://docs.python.org/3/', icon: BookOpen },
    { title: 'Python Advanced Data Structures & Async', type: 'Course', link: 'https://realpython.com/', icon: GraduationCap },
    { title: 'Python Practice Problems & Algorithmic Challenges', type: 'Practice', link: 'https://leetcode.com/', icon: Code },
  ],
  sql: [
    { title: 'PostgreSQL & SQL Query Optimization Guide', type: 'Documentation', link: 'https://www.postgresql.org/docs/', icon: BookOpen },
    { title: 'Mode Analytics Interactive SQL Tutorial', type: 'Course', link: 'https://mode.com/sql-tutorial/', icon: GraduationCap },
    { title: 'SQLZoo Interactive Queries Practice', type: 'Practice', link: 'https://sqlzoo.net/', icon: Code },
  ],
  'c++': [
    { title: 'cppreference.com Modern C++ Reference', type: 'Documentation', link: 'https://en.cppreference.com/', icon: BookOpen },
    { title: 'Object-Oriented C++ & Memory Management', type: 'Course', link: 'https://www.learncpp.com/', icon: GraduationCap },
  ],
  react: [
    { title: 'Official React Documentation & Hooks Guide', type: 'Documentation', link: 'https://react.dev/', icon: BookOpen },
    { title: 'Fullstack React Architecture & State Management', type: 'Course', link: 'https://fullstackopen.com/', icon: GraduationCap },
  ],
};

export function StudyMaterials({ requiredSkills = [] }) {
  // Aggregate prep resources for all required skills of this job
  const aggregatedResources = [];

  requiredSkills.forEach((req) => {
    const sName = (req.skillName || '').toLowerCase();
    const matches = SKILL_RESOURCE_MAP[sName];
    if (matches) {
      matches.forEach((res) => {
        aggregatedResources.push({
          ...res,
          skillName: req.skillName,
          minLevel: req.minLevel || 1,
        });
      });
    } else {
      // Default fallback resource for any skill
      aggregatedResources.push({
        title: `${req.skillName} Core Concepts & Advanced Guide`,
        type: 'Documentation',
        link: 'https://developer.mozilla.org/',
        icon: BookOpen,
        skillName: req.skillName,
        minLevel: req.minLevel || 1,
      });
    }
  });

  if (aggregatedResources.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        title="Study Materials & Preparation Resources"
        subtitle="Curated documentation, courses, and practice links tailored to this job's required skills"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aggregatedResources.map((res, idx) => {
          const Icon = res.icon;
          return (
            <a
              key={idx}
              href={res.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg border border-hairline-grey hover:border-slate/60 bg-bone/30 hover:bg-bone/60 transition flex items-start justify-between group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-white border border-hairline-grey flex items-center justify-center shrink-0 mt-0.5 text-ink-navy">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-ledger-gold/15 text-ledger-gold border border-ledger-gold/30 font-bold">
                      {res.skillName} (Level {res.minLevel}+)
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate">{res.type}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-ink-navy group-hover:text-ledger-gold transition">
                    {res.title}
                  </h4>
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-slate group-hover:text-ink-navy shrink-0 mt-1" />
            </a>
          );
        })}
      </div>
    </Card>
  );
}
