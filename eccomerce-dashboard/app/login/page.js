'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest, setSession } from '../../lib/api';
import { IconStore, IconShield, IconEye, IconEyeOff, IconCheck } from '../../components/Icons';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setSession(data.user || { name: data.userName, email, isVerified: true });
      setSuccess(data.success || 'Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/');
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/forgetpassword', {
        method: 'POST',
        body: { email },
      });
      setSuccess(data.success || 'Password reset OTP sent to your email!');
      setMode('reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/resetpassword', {
        method: 'POST',
        body: { email, otp, newPassword },
      });
      setSuccess(data.success || 'Password updated! You can now sign in.');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setMode('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-950 border-r border-slate-800/80 p-12 flex-col justify-between">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <IconStore className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">NovaCommerce</span>
            <span className="block text-xs text-slate-400">Enterprise Store Console</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <IconShield className="w-3.5 h-3.5" />
            Bcrypt & OTP Secured Authentication
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
            Manage products, orders, and customers in one place.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Connected directly to your Express & MongoDB backend with real-time inventory management, order tracking, and OTP account security.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-xs text-slate-400 mt-1">API Uptime Ready</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-2xl font-bold text-emerald-400">256-bit</div>
              <div className="text-xs text-slate-400 mt-1">Hashed Credentials</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
          <span>NovaCommerce Admin v2.0</span>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition font-medium">
            Open Dashboard →
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

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {mode === 'login' && 'Sign in to your account'}
              {mode === 'forgot' && 'Recover your password'}
              {mode === 'reset' && 'Set a new password'}
            </h2>
            <p className="text-sm text-slate-400 mt-1.5">
              {mode === 'login' && 'Enter your credentials to access the e-commerce admin console.'}
              {mode === 'forgot' && 'Enter your registered email and we will generate a 6-digit reset OTP.'}
              {mode === 'reset' && 'Enter the 6-digit OTP and choose your new password.'}
            </p>
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

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@novacommerce.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccess('');
                      setMode('forgot');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-60 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
              >
                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setMode('login');
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-2"
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">6-Digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm tracking-widest font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password (min 6 chars)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-2"
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Create account
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
