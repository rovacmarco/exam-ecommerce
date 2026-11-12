'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest, setSession } from '../../lib/api';
import { IconStore, IconShield, IconEye, IconEyeOff, IconCheck } from '../../components/Icons';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  })();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        useApiKey: true,
        body: { name, email, password },
      });
      if (data.user) {
        setSession(data.user);
      }
      if (data.emailSent === false) {
        setError(data.emailError || data.success || 'Account created, but Gmail OTP delivery failed.');
      } else {
        setSuccess(data.success || 'Account created! Enter the verification OTP sent to your email.');
      }
      setStep('verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/otp', {
        method: 'POST',
        body: { email, otp },
      });
      if (data.user) {
        setSession(data.user);
      }
      setSuccess(data.success || 'Account verified! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/');
      }, 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/resend-otp', {
        method: 'POST',
        body: { email },
      });
      setSuccess(data.success || 'New OTP sent to your email!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-950/30 to-slate-950 border-r border-slate-800/80 p-12 flex-col justify-between">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <IconStore className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">NovaCommerce</span>
            <span className="block text-xs text-slate-400">Onboarding & Verification</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <IconShield className="w-3.5 h-3.5" />
            API-Key Protected Registration
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
            Launch your store operations in seconds.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every registration validates inputs, hashes passwords with bcryptjs, stores the profile in MongoDB, and issues a 6-digit email verification OTP.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Protected by secureApi Authorization header',
              '6-digit OTP email verification workflow',
              'Instant access to Products, Orders & Customers',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <IconCheck className="w-3.5 h-3.5" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
          <span>NovaCommerce Admin v2.0</span>
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition font-medium">
            Already registered? Sign in →
          </Link>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex lg:hidden items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white">
                <IconStore className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white">NovaCommerce</span>
            </div>
            <Link href="/" className="text-xs text-indigo-400 hover:text-indigo-300">
              Dashboard →
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {step === 'register' ? 'Create your account' : 'Verify your email'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {step === 'register'
                  ? 'Register an admin or store operator account.'
                  : `Enter the 6-digit OTP sent to ${email || 'your email'}.`}
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              Step {step === 'register' ? '1/2' : '2/2'}
            </span>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
              <IconCheck className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@novacommerce.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>

                {password && (
                  <div className="mt-2 flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition ${
                          passwordStrength >= level
                            ? passwordStrength >= 3
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-60 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setStep('verify');
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1"
              >
                Already have an OTP? Verify account →
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@novacommerce.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">6-Digit Verification OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center text-lg tracking-[0.4em] font-mono text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition"
              >
                {loading ? 'Verifying...' : 'Verify Account'}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || !email}
                  className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ← Back to Register
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Sign in
              </Link>
            </span>
            <Link href="/" className="text-slate-300 hover:text-white font-medium">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
