import React from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Public Pages
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';

// Student Pages
import { StudentDashboard } from '../pages/student/Dashboard';
import { StudentSkillProfile } from '../pages/student/SkillProfile';
import { SkillAssessment } from '../pages/student/SkillAssessment';
import { StudentJobs } from '../pages/student/Jobs';
import { StudentJobDetail } from '../pages/student/JobDetail';
import { StudentChallengeDetail } from '../pages/student/ChallengeDetail';

// Recruiter Pages
import { RecruiterDashboard } from '../pages/recruiter/Dashboard';
import { RecruiterNewJob } from '../pages/recruiter/NewJob';
import { RecruiterCandidates } from '../pages/recruiter/Candidates';
import { RecruiterSubmissions } from '../pages/recruiter/Submissions';

// Institution Page
import { InstitutionDashboard } from '../pages/institution/Dashboard';

import { LogOut, GraduationCap, Building2, Users, ShieldCheck, Zap, Briefcase, Award } from 'lucide-react';

/**
 * Route Guard Component for Authentication & Role enforcement
 */
function RequireRole({ role, children }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-slate font-mono text-sm">Validating Auth Session...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

/**
 * Main Layout wrapper with Sidebar Navigation for authenticated users
 */
function AuthenticatedLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || 'student';

  const navItems = {
    student: [
      { path: '/student/dashboard', label: 'Dashboard', icon: GraduationCap },
      { path: '/student/skill-profile', label: 'Skill Profile', icon: ShieldCheck },
      { path: '/student/jobs', label: 'Jobs & Prerequisites', icon: Briefcase },
    ],
    recruiter: [
      { path: '/recruiter/dashboard', label: 'Dashboard', icon: Building2 },
      { path: '/recruiter/new-job', label: '+ Post Job', icon: Zap },
      { path: '/recruiter/submissions', label: 'Review Code', icon: Award },
      { path: '/recruiter/candidates', label: 'Candidate Pool', icon: Users },
    ],
    institution: [
      { path: '/institution/dashboard', label: 'Analytics Profile', icon: Users },
    ],
  };

  const currentItems = navItems[role] || navItems.student;

  return (
    <div className="min-h-screen bg-bone flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-ink-navy text-bone flex flex-col justify-between shrink-0 border-r border-slate/30">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate/20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-ledger-gold text-ink-navy font-serif font-bold flex items-center justify-center text-lg">
                SB
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-bone">SkillBridge</span>
            </Link>
          </div>

          {/* Role badge */}
          <div className="px-6 py-3 bg-white/5 border-b border-slate/20 flex items-center justify-between font-mono text-xs text-slate">
            <span className="uppercase text-[10px]">Role Context</span>
            <span className="font-bold text-ledger-gold capitalize">{role}</span>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            {currentItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-mono transition ${
                    isActive
                      ? 'bg-ledger-gold text-ink-navy font-bold shadow'
                      : 'text-bone/80 hover:bg-white/10 hover:text-bone'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate/20 bg-white/5">
          <div className="mb-3 px-2">
            <span className="font-serif font-bold text-sm text-bone block truncate">{user?.name}</span>
            <span className="text-[11px] font-mono text-slate block truncate">{user?.email}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-alert-coral/20 hover:bg-alert-coral/30 text-alert-coral text-xs font-mono font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Unauthenticated Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Student Protected Routes */}
      <Route
        path="/student/dashboard"
        element={
          <RequireRole role="student">
            <AuthenticatedLayout>
              <StudentDashboard />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />
      <Route
        path="/student/skill-profile"
        element={
          <RequireRole role="student">
            <AuthenticatedLayout>
              <StudentSkillProfile />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />
      <Route path="/student/skills" element={<Navigate to="/student/skill-profile" replace />} />
      <Route
        path="/student/assessment/:skillId"
        element={
          <RequireRole role="student">
            <AuthenticatedLayout>
              <SkillAssessment />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />
      <Route
        path="/student/jobs"
        element={
          <RequireRole role="student">
            <AuthenticatedLayout>
              <StudentJobs />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />
      <Route
        path="/student/jobs/:id"
        element={
          <RequireRole role="student">
            <AuthenticatedLayout>
              <StudentJobDetail />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />
      <Route
        path="/student/challenges/:id"
        element={
          <RequireRole role="student">
            <AuthenticatedLayout>
              <StudentChallengeDetail />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />

      {/* Recruiter Protected Routes */}
      <Route
        path="/recruiter/dashboard"
        element={
          <RequireRole role="recruiter">
            <AuthenticatedLayout>
              <RecruiterDashboard />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />
      <Route
        path="/recruiter/new-job"
        element={
          <RequireRole role="recruiter">
            <AuthenticatedLayout>
              <RecruiterNewJob />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />
      <Route
        path="/recruiter/candidates"
        element={
          <RequireRole role="recruiter">
            <AuthenticatedLayout>
              <RecruiterCandidates />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />
      <Route
        path="/recruiter/submissions"
        element={
          <RequireRole role="recruiter">
            <AuthenticatedLayout>
              <RecruiterSubmissions />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />

      {/* Institution Protected Routes */}
      <Route
        path="/institution/dashboard"
        element={
          <RequireRole role="institution">
            <AuthenticatedLayout>
              <InstitutionDashboard />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
