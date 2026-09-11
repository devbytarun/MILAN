import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Badge } from '../components/ui/Badge.tsx';

const ROLE_OPTIONS: { role: UserRole; title: string; desc: string; badge: string; autoApproved: boolean }[] = [
  {
    role: 'FAMILY',
    title: 'Family & Next of Kin',
    desc: 'Self-service reporting for missing family members. Track live case reconciliation.',
    badge: 'Immediate Access',
    autoApproved: true,
  },
  {
    role: 'NGO',
    title: 'Relief NGO / Red Cross',
    desc: 'Authorized field relief teams registering found survivors at camp shelters.',
    badge: 'Org Verification',
    autoApproved: false,
  },
  {
    role: 'ARMY_RESCUE',
    title: 'Army / NDRF / Rescue',
    desc: 'Military civil defense units conducting active evacuation and rescue triage.',
    badge: 'Org Verification',
    autoApproved: false,
  },
  {
    role: 'HOSPITAL',
    title: 'Hospital / Trauma Center',
    desc: 'Clinical intake, medical condition tagging, and survivor referral tracking.',
    badge: 'Org Verification',
    autoApproved: false,
  },
  {
    role: 'VOLUNTEER',
    title: 'Community Volunteer',
    desc: 'Submit community observations and sighting tips subject to coordinator review.',
    badge: 'Community Access',
    autoApproved: false,
  },
];

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('FAMILY');
  const [orgName, setOrgName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signUp(email, password, fullName, role, orgName, phone);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Registration failed. Please check your inputs.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-12 space-y-6 pb-16">
      <div className="text-center space-y-2">
        <Badge variant="shade" size="sm">
          Operational Role Enrollment
        </Badge>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mt-2">
          Register for MILAN
        </h1>
        <p className="text-xs text-slate-600">
          Select your operational role to establish proper data access and reporting authorization.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection Grid */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700">
              Select Your Role in Disaster Response <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const selected = role === opt.role;
                return (
                  <div
                    key={opt.role}
                    onClick={() => setRole(opt.role)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                      selected
                        ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20 shadow-sm'
                        : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                        {selected ? (
                          <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{opt.desc}</p>
                    </div>
                    <div className="mt-3">
                      <Badge variant={opt.autoApproved ? 'verified' : 'shade'} size="sm">
                        {opt.badge}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Legal Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Chandra"
            />

            <Input
              label="Contact Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.org"
            />

            <Input
              label="Account Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>

          {/* Org Name if not FAMILY */}
          {role !== 'FAMILY' && (
            <Input
              label="Organization / Camp / Hospital Name"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. NDRF Battalion 4 / Civil Hospital"
            />
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="brand"
              size="lg"
              isLoading={loading}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="w-full"
            >
              Complete Registration
            </Button>
          </div>
        </form>
      </div>

      <div className="text-center text-xs text-slate-600">
        Already registered?{' '}
        <Link to="/login" className="text-orange-600 font-semibold hover:text-orange-700 hover:underline">
          Sign In here
        </Link>
      </div>
    </div>
  );
};
