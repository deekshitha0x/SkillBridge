import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  ShieldCheck,
  Zap,
  Briefcase,
  Award,
  ArrowRight,
  CheckCircle2,
  Building2,
  GraduationCap,
  Users,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleCTA = () => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-bone text-ink-navy flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-hairline-grey bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-ink-navy flex items-center justify-center text-bone font-serif font-bold text-xl shadow">
              SB
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-ink-navy">
              SkillBridge
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button variant="primary" onClick={handleCTA}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button variant="primary" onClick={() => navigate('/login')}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-verified-green/10 border border-verified-green/30 text-verified-green text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          Verified Skill & Proof-of-Capability Hiring Platform
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-ink-navy leading-tight mb-6">
          Bridge the Gap Between <br className="hidden sm:inline" />
          <span className="italic font-normal text-slate">Claimed Skills</span> and{' '}
          <span className="underline decoration-ledger-gold decoration-4 underline-offset-4">
            Verified Talent
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
          SkillBridge enables students to claim skills, pass assessment quizzes with anti-cheat monitoring, attempt eligible company hiring challenges, and build a reusable verified skill ledger.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={handleCTA} className="w-full sm:w-auto shadow-md">
            Enter Platform Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3 rounded-md border border-hairline-grey text-ink-navy text-sm font-medium hover:bg-white text-center transition"
          >
            Explore Core Loop
          </a>
        </div>
      </section>

      {/* Core Loop Pipeline (Claim -> Verify -> Discover -> Prepare -> Challenge -> Credit) */}
      <section id="how-it-works" className="py-16 bg-white border-y border-hairline-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl font-bold text-ink-navy">
              The SkillBridge Core Loop
            </h2>
            <p className="text-sm text-slate mt-2">
              From self-reported skill claim to recruiter-verified hiring levels in 6 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                step: '01',
                title: 'Declare Skill',
                desc: 'Select skills from curriculum & industry profile.',
                icon: Zap,
              },
              {
                step: '02',
                title: 'Take Assessment',
                desc: 'Pass MCQ quiz with anti-cheat timer & switch detection.',
                icon: ShieldCheck,
              },
              {
                step: '03',
                title: 'Claimed Skill',
                desc: 'Earn Claimed status & quiz score level on your Skill Profile.',
                icon: CheckCircle2,
                highlight: true,
              },
              {
                step: '04',
                title: 'Discover Job',
                desc: 'Rule-based matching unlocks prerequisite job postings.',
                icon: Briefcase,
              },
              {
                step: '05',
                title: 'Challenge-to-Hire',
                desc: 'Attempt real-world corporate code challenges.',
                icon: Building2,
              },
              {
                step: '06',
                title: 'Advance Skill Level',
                desc: 'Recruiter verifies submission & upgrades skill level.',
                icon: Award,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-lg border transition-all ${
                    item.highlight
                      ? 'bg-verified-green/5 border-verified-green/40 shadow-sm'
                      : 'bg-bone/40 border-hairline-grey'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-ledger-gold">
                      STEP {item.step}
                    </span>
                    <Icon
                      className={`w-5 h-5 ${
                        item.highlight ? 'text-verified-green' : 'text-slate'
                      }`}
                    />
                  </div>
                  <h4 className="font-serif font-bold text-base text-ink-navy mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Role Profile */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-ink-navy">
            Tailored Dashboards for 3 Key Stakeholders
          </h2>
          <p className="text-sm text-slate mt-2">
            Seamless monorepo experience with role-gated access control
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:border-ink-navy">
            <div className="w-10 h-10 rounded-lg bg-ink-navy/10 flex items-center justify-center text-ink-navy mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink-navy mb-2">For Students</h3>
            <p className="text-sm text-slate mb-4">
              Declare skills, take anti-cheat verification quizzes, check job prerequisite eligibility, and submit challenge solutions.
            </p>
            <ul className="space-y-2 text-xs font-mono text-slate mb-6">
              <li className="flex items-center gap-1.5">✓ Simulated Aadhaar verification</li>
              <li className="flex items-center gap-1.5">✓ Verified Skill Profile portfolio</li>
              <li className="flex items-center gap-1.5">✓ Challenge submissions with recruiter review</li>
            </ul>
          </Card>

          <Card className="hover:border-ink-navy">
            <div className="w-10 h-10 rounded-lg bg-ledger-gold/10 flex items-center justify-center text-ledger-gold mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink-navy mb-2">For Recruiters</h3>
            <p className="text-sm text-slate mb-4">
              Post job prerequisites, create challenge assessments, review candidate code, and verify candidate skill levels in a single transaction.
            </p>
            <ul className="space-y-2 text-xs font-mono text-slate mb-6">
              <li className="flex items-center gap-1.5">✓ Rule-based job similarity ranking</li>
              <li className="flex items-center gap-1.5">✓ One-click submission verification</li>
              <li className="flex items-center gap-1.5">✓ Verified candidate pool search</li>
            </ul>
          </Card>

          <Card className="hover:border-ink-navy">
            <div className="w-10 h-10 rounded-lg bg-verified-green/10 flex items-center justify-center text-verified-green mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink-navy mb-2">For Institutions</h3>
            <p className="text-sm text-slate mb-4">
              Track aggregate student skill analytics, verified skill ratios, level readiness breakdowns, and student leaderboards.
            </p>
            <ul className="space-y-2 text-xs font-mono text-slate mb-6">
              <li className="flex items-center gap-1.5">✓ Real-time skill readiness matrix</li>
              <li className="flex items-center gap-1.5">✓ Level 2+ skill proficiency tracking</li>
              <li className="flex items-center gap-1.5">✓ Aggregate credit distribution</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline-grey bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate font-mono">
          <div>
            © 2026 SkillBridge. All Rights Reserved.
          </div>
          <div className="mt-4 sm:mt-0 flex gap-6">
            <span>Node + Express REST API</span>
            <span>React + Tailwind CSS</span>
            <span>Prisma + PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
