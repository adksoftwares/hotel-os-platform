"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@hotel.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user || { role: 'SUPER_ADMIN', email }));
        router.push('/');
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Invalid email or password. Please verify credentials.');
      }
    } catch (err) {
      // If backend is unreachable, offer graceful offline staff authentication
      setError('Backend server offline. You can proceed using the Local Staff Mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineBypass = () => {
    localStorage.setItem('access_token', 'mock_offline_token_' + Date.now());
    localStorage.setItem('user', JSON.stringify({
      id: 'usr_admin',
      email: 'admin@hotel.com',
      role: 'SUPER_ADMIN',
      firstName: 'Hotel',
      lastName: 'Administrator'
    }));
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Brand Header */}
        <div className="p-8 bg-slate-900 text-white text-center border-b border-slate-800">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ADK Hotel OS</h1>
          <p className="text-xs text-slate-400 mt-1">Hospitality Enterprise Workstation</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Staff Authentication</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your workstation credentials to begin shift</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {error.includes('offline') && (
                  <button
                    type="button"
                    onClick={handleOfflineBypass}
                    className="block mt-2 font-bold text-rose-900 underline hover:text-black"
                  >
                    Click here to enter Local Staff Mode →
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="hotel-field">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hotel-input"
              placeholder="e.g. staff@hotel.com"
              required
            />
          </div>

          <div className="hotel-field">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Security Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hotel-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="hotel-button hotel-button-emerald w-full justify-center text-sm font-bold"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Shift'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo: admin@hotel.com / admin123</span>
            </div>
            <button
              type="button"
              onClick={handleOfflineBypass}
              className="text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
            >
              Instant Offline Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
