import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { LogIn, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Badge } from '../components/ui/Badge.tsx';

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
    <div className="max-w-md mx-auto my-12 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="mint" size="sm">
          Authorized Access
        </Badge>
        <h1 className="type-display-md text-ink mt-2">Sign In to MILAN</h1>
        <p className="type-caption text-shade-50">
          Enter your authorized credentials or select an evaluation demo account below.
        </p>
      </div>

      <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 sm:p-8 shadow-elevation-3 space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. family@milan.demo or your@email.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full"
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="relative pt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline-light"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-canvas-light px-3 text-shade-40 font-semibold tracking-wider">
              1-Click Evaluation Personas
            </span>
          </div>
        </div>

        {/* Quick Demo Logins */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DEMO_USERS) as UserRole[]).filter((r) => r !== 'VOLUNTEER').map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleQuickLogin(role)}
                className="p-2.5 border border-hairline-light hover:border-shade-60 hover:bg-canvas-cream rounded-md text-left transition-colors duration-150"
              >
                <div className="text-[10px] font-semibold text-shade-60 uppercase tracking-wider">
                  {role.replace('_', ' ')}
                </div>
                <div className="text-xs font-semibold text-ink truncate mt-0.5">
                  {DEMO_USERS[role].fullName.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center type-caption text-shade-50">
        Don't have an account?{' '}
        <Link to="/signup" className="text-ink font-semibold hover:underline">
          Register new account
        </Link>
      </div>
    </div>
  );
};
