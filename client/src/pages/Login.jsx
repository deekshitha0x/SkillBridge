import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ShieldCheck, GraduationCap, Building2, Users, CheckSquare, Square, ArrowRight, UserPlus, LogIn as LogInIcon } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithCredentials, signup, user, updateRole, verifyAadhaarSimulated, isAuthenticated, login } = useAuth();

  // Mode: 'login' | 'signup'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [authMode, setAuthMode] = useState(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [signupRole, setSignupRole] = useState('student');

  // Role selection state for role-less accounts
  const [selectedRole, setSelectedRole] = useState('student');

  // Simulated Aadhaar onboarding state
  const [aadhaarChecked, setAadhaarChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync mode if query param changes
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setAuthMode('signup');
    }
  }, [searchParams]);

  // Handle standard credential login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const loggedUser = await loginWithCredentials(email, password);
      if (loggedUser?.role) {
        if (loggedUser.role === 'student' && !loggedUser.aadhaarVerified) {
          // Stay on /login to complete Aadhaar verification step
        } else {
          navigate(`/${loggedUser.role}/dashboard`);
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick helper for demo credential filling and login
  const handleFillDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError('');
    try {
      const loggedUser = await loginWithCredentials(demoEmail, demoPass);
      if (loggedUser?.role) {
        if (loggedUser.role === 'student' && !loggedUser.aadhaarVerified) {
          // Stay for onboarding
        } else {
          navigate(`/${loggedUser.role}/dashboard`);
        }
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle sign up submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const newUser = await signup({ email, password, name, role: signupRole });
      if (newUser.role) {
        if (newUser.role === 'student' && !newUser.aadhaarVerified) {
          // Stay on /login to show Aadhaar verification step
        } else {
          navigate(`/${newUser.role}/dashboard`);
        }
      }
    } catch (err) {
      setError(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  // Role submit for first-time / role-less accounts
  const handleRoleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const updated = await updateRole(selectedRole);
      if (selectedRole === 'student' && !updated.aadhaarVerified) {
        // Stay to complete Aadhaar onboarding step
      } else {
        navigate(`/${selectedRole}/dashboard`);
      }
    } catch (err) {
      setError(err.message || 'Role selection failed');
    } finally {
      setLoading(false);
    }
  };

  // Aadhaar onboarding submit for students
  const handleAadhaarSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (aadhaarChecked) {
        await verifyAadhaarSimulated();
      }
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Aadhaar simulation failed');
    } finally {
      setLoading(false);
    }
  };

  // 1) AUTO-REDIRECT if user is already authenticated with a role (and verified if student)
  if (isAuthenticated && user?.role && (user.role !== 'student' || user.aadhaarVerified)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // 2) STEP CHECK FOR AUTHENTICATED STATES
  const needsRole = isAuthenticated && user && !user.role;
  const needsAadhaar = isAuthenticated && user && user.role === 'student' && !user.aadhaarVerified;

  return (
    <div className="min-h-screen bg-bone flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-xl bg-ink-navy text-bone mx-auto flex items-center justify-center font-serif font-bold text-2xl shadow-md mb-3 cursor-pointer hover:bg-slate transition"
          >
            SB
          </div>
          <h2 className="font-serif text-3xl font-bold text-ink-navy">SkillBridge Portal</h2>
          <p className="text-xs text-slate mt-1">Verified Skill & Capability Authentication</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-alert-coral/10 border border-alert-coral/30 rounded-md text-xs text-alert-coral text-center font-medium">
            {error}
          </div>
        )}

        {/* --- STATE 1: UNAUTHENTICATED LOGIN / SIGN UP FORM --- */}
        {!isAuthenticated && (
          <Card className="shadow-lg">
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-hairline-grey mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); }}
                className={`flex-1 py-3 text-sm font-serif font-bold border-b-2 transition flex items-center justify-center gap-2 ${
                  authMode === 'login'
                    ? 'border-ink-navy text-ink-navy'
                    : 'border-transparent text-slate hover:text-ink-navy'
                }`}
              >
                <LogInIcon className="w-4 h-4" />
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(''); }}
                className={`flex-1 py-3 text-sm font-serif font-bold border-b-2 transition flex items-center justify-center gap-2 ${
                  authMode === 'signup'
                    ? 'border-ink-navy text-ink-navy'
                    : 'border-transparent text-slate hover:text-ink-navy'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>

            {/* TAB A: LOG IN */}
            {authMode === 'login' && (
              <div className="space-y-6">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full px-3 py-2 text-sm bg-bone/50 border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2 text-sm bg-bone/50 border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
                    />
                  </div>

                  <Button type="submit" variant="primary" disabled={loading} className="w-full">
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </Button>
                </form>

                {/* Quick Demo Credentials Selection */}
                <div className="pt-4 border-t border-hairline-grey">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate block mb-2 text-center">
                    Instant Quick-Fill Demo Accounts
                  </span>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleFillDemo('demo.student@skillbridge.test', 'student123')}
                      disabled={loading}
                      className="w-full p-2.5 rounded border border-hairline-grey hover:bg-bone text-left flex items-center justify-between text-xs transition"
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-ink-navy" />
                        <span className="font-semibold text-ink-navy">Demo Student</span>
                        <span className="text-slate font-mono text-[11px]">(Alex Chen)</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFillDemo('demo.recruiter@skillbridge.test', 'recruiter123')}
                      disabled={loading}
                      className="w-full p-2.5 rounded border border-hairline-grey hover:bg-bone text-left flex items-center justify-between text-xs transition"
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-ledger-gold" />
                        <span className="font-semibold text-ink-navy">Demo Recruiter</span>
                        <span className="text-slate font-mono text-[11px]">(TechCorp)</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFillDemo('demo.institution@skillbridge.test', 'institution123')}
                      disabled={loading}
                      className="w-full p-2.5 rounded border border-hairline-grey hover:bg-bone text-left flex items-center justify-between text-xs transition"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-verified-green" />
                        <span className="font-semibold text-ink-navy">Demo Institution</span>
                        <span className="text-slate font-mono text-[11px]">(NIT Dean)</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB B: SIGN UP */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full px-3 py-2 text-sm bg-bone/50 border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    required
                    className="w-full px-3 py-2 text-sm bg-bone/50 border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 text-sm bg-bone/50 border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate mb-1">Select Account Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'student', label: 'Student', icon: GraduationCap },
                      { id: 'recruiter', label: 'Recruiter', icon: Building2 },
                      { id: 'institution', label: 'Institution', icon: Users },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSel = signupRole === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSignupRole(item.id)}
                          className={`p-2.5 rounded border flex flex-col items-center gap-1 text-xs transition ${
                            isSel
                              ? 'border-ink-navy bg-ink-navy text-bone font-bold'
                              : 'border-hairline-grey text-slate hover:border-slate'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button type="submit" variant="primary" disabled={loading} className="w-full">
                  {loading ? 'Creating Account...' : 'Create Account & Continue'}
                </Button>
              </form>
            )}
          </Card>
        )}

        {/* --- STATE 2: ROLE SELECTION FOR ROLE-LESS ACCOUNTS --- */}
        {needsRole && (
          <Card className="shadow-lg">
            <h3 className="font-serif text-xl font-bold text-ink-navy mb-2 text-center">
              Select Your Account Type
            </h3>
            <p className="text-xs text-slate text-center mb-6">
              Choose your role to initialize your SkillBridge platform environment.
            </p>

            <div className="space-y-3 mb-6">
              {[
                {
                  id: 'student',
                  title: 'Student / Job Seeker',
                  desc: 'Claim skills, verify abilities via assessments, and complete hiring challenges.',
                  icon: GraduationCap,
                },
                {
                  id: 'recruiter',
                  title: 'Recruiter / Employer',
                  desc: 'Post job requirements, issue code challenges, and verify student submissions.',
                  icon: Building2,
                },
                {
                  id: 'institution',
                  title: 'Institution / Educator',
                  desc: 'Monitor campus skill distribution and verified proficiency matrices.',
                  icon: Users,
                },
              ].map((roleItem) => {
                const Icon = roleItem.icon;
                const isSelected = selectedRole === roleItem.id;
                return (
                  <div
                    key={roleItem.id}
                    onClick={() => setSelectedRole(roleItem.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? 'border-ink-navy bg-ink-navy/5 shadow-sm'
                        : 'border-hairline-grey hover:border-slate/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-ink-navy text-bone' : 'bg-bone text-slate'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-ink-navy">{roleItem.title}</h4>
                        <p className="text-xs text-slate">{roleItem.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button variant="primary" onClick={handleRoleSubmit} disabled={loading} className="w-full">
              Confirm Role & Continue
            </Button>
          </Card>
        )}

        {/* --- STATE 3: SIMULATED AADHAAR ONBOARDING FOR STUDENTS --- */}
        {needsAadhaar && (
          <Card className="shadow-lg">
            <div className="w-10 h-10 rounded-full bg-verified-green/10 text-verified-green mx-auto flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-ink-navy mb-1 text-center">
              Identity Onboarding
            </h3>
            <p className="text-xs text-slate text-center mb-6">
              Simulated Aadhaar Verification (UIDAI SIH prototype onboarding)
            </p>

            <div className="p-4 bg-bone rounded-lg border border-hairline-grey mb-6">
              <div
                onClick={() => setAadhaarChecked(!aadhaarChecked)}
                className="flex items-start gap-3 cursor-pointer"
              >
                {aadhaarChecked ? (
                  <CheckSquare className="w-5 h-5 text-verified-green shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-slate shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-sm font-semibold text-ink-navy block">
                    Verify with Aadhaar (Simulated)
                  </span>
                  <span className="text-xs text-slate block mt-0.5">
                    I confirm my identity verification for SkillBridge verified profile credentials.
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="verified"
              onClick={handleAadhaarSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Complete Onboarding
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

