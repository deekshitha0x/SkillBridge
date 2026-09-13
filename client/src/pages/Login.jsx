import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ShieldCheck, GraduationCap, Building2, Users, CheckSquare, Square, ArrowRight } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login, user, updateRole, verifyAadhaarSimulated, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  // Step 2: Role selection if user.role is missing
  const [selectedRole, setSelectedRole] = useState('student');

  // Step 3: Simulated Aadhaar check for student onboarding
  const [aadhaarChecked, setAadhaarChecked] = useState(false);

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      login(data.token, data.user);
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSimulated = async (e) => {
    e.preventDefault();
    if (!googleEmail) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ email: googleEmail, name: googleEmail.split('@')[0] }),
      });
      login(data.token, data.user);
      if (data.user.role) {
        navigate(`/${data.user.role}/dashboard`);
      }
    } catch (err) {
      setError(err.message || 'Google Auth failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const updated = await updateRole(selectedRole);
      if (selectedRole !== 'student') {
        navigate(`/${selectedRole}/dashboard`);
      }
    } catch (err) {
      setError(err.message || 'Role selection failed');
    } finally {
      setLoading(false);
    }
  };

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

  // View state check:
  // 1) Not logged in -> Show login options
  // 2) Logged in but user.role is null -> Show Role Selector
  // 3) Logged in as student & aadhaarVerified is false -> Show Simulated Aadhaar verification step
  const needsRole = isAuthenticated && user && !user.role;
  const needsAadhaar = isAuthenticated && user && user.role === 'student' && !user.aadhaarVerified;

  return (
    <div className="min-h-screen bg-bone flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-ink-navy text-bone mx-auto flex items-center justify-center font-serif font-bold text-2xl shadow-md mb-3">
            SB
          </div>
          <h2 className="font-serif text-3xl font-bold text-ink-navy">SkillBridge Auth</h2>
          <p className="text-xs text-slate mt-1">Hackathon SIH 2026 Authentication Gateway</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-alert-coral/10 border border-alert-coral/30 rounded-md text-xs text-alert-coral text-center font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: LOGIN OPTIONS */}
        {!isAuthenticated && (
          <Card className="shadow-lg">
            <h3 className="font-serif text-lg font-bold text-ink-navy mb-4 text-center">
              Choose Login Method
            </h3>

            {/* Quick Demo Logins for Hackathon Evaluators */}
            <div className="space-y-2 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate block mb-1">
                Instant Demo Logins (No Credentials Needed)
              </span>

              <Button
                variant="primary"
                onClick={() => handleDemoLogin('student')}
                disabled={loading}
                className="w-full flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Login as Demo Student (Alex Chen)
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="gold"
                onClick={() => handleDemoLogin('recruiter')}
                disabled={loading}
                className="w-full flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Login as Demo Recruiter (TechCorp)
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => handleDemoLogin('institution')}
                disabled={loading}
                className="w-full flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Login as Demo Institution (NIT Dean)
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hairline-grey"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate font-mono">OR GOOGLE OAUTH SIMULATION</span>
              </div>
            </div>

            <form onSubmit={handleGoogleSimulated} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate mb-1">Google Account Email</label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  required
                  className="w-full px-3 py-2 text-sm bg-bone/50 border border-hairline-grey rounded-md focus:outline-none focus:ring-2 focus:ring-ink-navy"
                />
              </div>

              <Button type="submit" variant="secondary" disabled={loading} className="w-full">
                {loading ? 'Authenticating...' : 'Sign in with Google OAuth'}
              </Button>
            </form>
          </Card>
        )}

        {/* STEP 2: ROLE SELECTION SCREEN */}
        {needsRole && (
          <Card className="shadow-lg">
            <h3 className="font-serif text-xl font-bold text-ink-navy mb-2 text-center">
              Select Your Role
            </h3>
            <p className="text-xs text-slate text-center mb-6">
              Select your user type to initialize your platform environment.
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

        {/* STEP 3: SIMULATED AADHAAR VERIFICATION STEP */}
        {needsAadhaar && (
          <Card className="shadow-lg">
            <div className="w-10 h-10 rounded-full bg-verified-green/10 text-verified-green mx-auto flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-ink-navy mb-1 text-center">
              Identity Onboarding
            </h3>
            <p className="text-xs text-slate text-center mb-6">
              Simulated Aadhaar Verification (UIDAI hackathon placeholder step)
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
                    I confirm my identity verification for SkillBridge verified profile credentials. (No real UIDAI API called for SIH MVP).
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
