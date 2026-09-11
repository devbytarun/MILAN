import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { 
  LogIn, 
  AlertCircle,
} from 'lucide-react';
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
    setTimeout(() => {
      navigate('/dashboard');
    }, 200);
  };

  return (
    <div className="max-w-md mx-auto my-12 space-y-6 pb-12">
      <div className="text-center space-y-2">
        <Badge variant="shade" size="sm">
          Authorized Agency & Family Access
        </Badge>
        <h1 className="font-display text-2xl sm:text-3xl font-normal text-[#181d26] tracking-tight mt-2">
          Sign In to MILAN
        </h1>
        <p className="text-xs text-[#41454d]">
          Enter your authorized credentials or select an evaluation demo account below.
        </p>
      </div>

      <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-8 shadow-elevation-1 space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Authorized Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. family@milan.demo or your@email.com"
          />

          <Input
            label="Security Password"
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
              Sign In to Portal
            </Button>
          </div>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#dddddd]"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white px-3 text-[#9297a0] font-semibold tracking-wider">
              1-Click Evaluation Personas
            </span>
          </div>
        </div>

        {/* Quick Demo Logins */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(DEMO_USERS) as UserRole[]).filter((r) => r !== 'VOLUNTEER').map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleQuickLogin(role)}
                className="p-3 border border-[#dddddd] hover:border-[#181d26] hover:bg-[#f8fafc] rounded-lg text-left transition-colors duration-150"
              >
                <div className="text-[10px] font-semibold text-[#41454d] uppercase tracking-wider">
                  {role.replace('_', ' ')}
                </div>
                <div className="text-xs font-semibold text-[#181d26] truncate mt-0.5">
                  {DEMO_USERS[role].fullName.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>
          <div className="text-[10px] text-center text-[#9297a0] pt-1">
            [SIMULATED DRILL / DEMO DATA]
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[#41454d] space-y-1">
        <div>
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#181d26] font-semibold hover:underline">
            Register new account
          </Link>
        </div>
        <p className="text-[10px] text-[#9297a0]">
          MILAN Disaster Portal • Offline Sync & IndexedDB Enabled
        </p>
      </div>
    </div>
  );
};
