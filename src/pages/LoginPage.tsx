import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { LifeBuoy, LogIn, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    switchDemoRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-500/20 mb-2">
          <LifeBuoy className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to MILAN</h1>
        <p className="text-xs text-slate-600">
          Enter your authorized credentials or select an evaluation demo account below.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. family@milan.demo or your@email.com"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : <><LogIn className="w-4 h-4" /> Sign In</>}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold">Or 1-Click Demo Login</span>
          </div>
        </div>

        {/* Quick Demo Logins */}
        <div className="space-y-2">
          <p className="text-[11px] text-slate-500 text-center">
            Instantly test the system with seeded credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DEMO_USERS) as UserRole[]).filter((r) => r !== 'VOLUNTEER').map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleQuickLogin(role)}
                className="px-2.5 py-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-left transition"
              >
                <div className="text-[10px] font-bold text-blue-700 uppercase">
                  {role.replace('_', ' ')}
                </div>
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {DEMO_USERS[role].fullName.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
          Register new account
        </Link>
      </div>
    </div>
  );
};
