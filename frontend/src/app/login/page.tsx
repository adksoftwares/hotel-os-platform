"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


      const res = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Invalid email or password. Please verify your credentials.');
        return;
      }

      const data = await res.json();
      if (typeof data.access_token !== 'string' || !data.access_token || !data.user) {
        setError('The authentication service returned an invalid response.');
        return;
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch {
      setError('Unable to connect to the authentication service. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
        <div className="p-8 bg-slate-900 text-white text-center border-b border-slate-800">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ADK Hotel OS</h1>
          <p className="text-xs text-slate-400 mt-1">Hospitality Enterprise Workstation</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Staff Authentication</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your workstation credentials to begin shift</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          <div className="hotel-field">
            <label htmlFor="email" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hotel-input"
              placeholder="e.g. staff@hotel.com"
              required
            />
          </div>

          <div className="hotel-field">
            <label htmlFor="password" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Security Password</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hotel-input"
              placeholder="Enter your password"
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
        </form>
      </div>
    </div>
  );
}
