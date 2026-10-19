"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Lock, User, AlertCircle, ArrowRight, 
  Eye, EyeOff, Smartphone, Sparkles, Shield, Crown
} from 'lucide-react';
import { loadStaffAccounts, StaffAccount } from '@/lib/staffStorage';

export default function Login() {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const inputClean = identifier.trim().toLowerCase();

    // 1. First, check registered local staff accounts (Waiters, Maids, Admins)
    try {
      const staffList = loadStaffAccounts();
      const matchedStaff = staffList.find(
        (s) =>
          s.username.toLowerCase() === inputClean ||
          s.email.toLowerCase() === inputClean
      );

      if (matchedStaff) {
        if (!matchedStaff.isActive) {
          setError('This staff workstation account is currently suspended. Please contact Hotel Administrator.');
          setLoading(false);
          return;
        }

        if (matchedStaff.password !== password) {
          setError('Incorrect security password. Please re-enter or ask Admin to reset.');
          setLoading(false);
          return;
        }

        // Successfully authenticated staff member!
        localStorage.setItem('access_token', `staff-token-${matchedStaff.id}-${Date.now()}`);
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: matchedStaff.id,
            name: `${matchedStaff.firstName} ${matchedStaff.lastName}`,
            email: matchedStaff.email,
            username: matchedStaff.username,
            role: matchedStaff.role,
            phone: matchedStaff.phone,
          })
        );

        // Role-based directional routing
        if (matchedStaff.role === 'WAITER') {
          router.push('/pos/waiter');
        } else if (matchedStaff.role === 'MAID') {
          router.push('/rooms/housekeeper');
        } else {
          router.push('/');
        }
        return;
      }
    } catch (_) {}

    // 2. If not found in staff accounts, try backend API
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const res = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Invalid username/email or password. Please verify credentials.');
        return;
      }

      const data = await res.json();
      if (typeof data.access_token !== 'string' || !data.access_token || !data.user) {
        setError('The authentication service returned an invalid response.');
        return;
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user?.role === 'WAITER') {
        router.push('/pos/waiter');
      } else if (data.user?.role === 'MAID' || data.user?.role === 'HOUSEKEEPING') {
        router.push('/rooms/housekeeper');
      } else {
        router.push('/');
      }
    } catch {
      setError('Unable to authenticate with server. For staff accounts, verify username and password.');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (userVal: string, passVal: string) => {
    setIdentifier(userVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        <div className="p-7 bg-slate-900 text-white text-center border-b border-slate-800">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ADK Hotel OS</h1>
          <p className="text-xs text-slate-400 mt-0.5">Hospitality Enterprise Workstation</p>
        </div>

        <form onSubmit={handleLogin} className="p-7 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Workstation Login</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sign in to your shift with your individual credentials</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{error}</span>
            </div>
          )}

          <div className="hotel-field">
            <label htmlFor="identifier" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Username or Email Address</span>
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="hotel-input text-xs"
              placeholder="e.g. waiter_ravi or admin"
              required
            />
          </div>

          <div className="hotel-field">
            <label htmlFor="password" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Workstation Password</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="hotel-input text-xs pr-10"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="hotel-button hotel-button-emerald w-full justify-center text-xs font-bold py-2.5 rounded-xl shadow-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Shift'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Demo Credentials Pill Bar */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Workstation Switcher
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreset('superadmin', 'Super@123')}
                className="p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                title="Super Admin (Corporate HQ)"
              >
                <Crown className="w-3.5 h-3.5 text-purple-600" />
                <span>Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset('admin', 'Admin@123')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                title="Hotel Administrator"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Hotel Admin</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
