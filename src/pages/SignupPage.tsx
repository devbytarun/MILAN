import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { LifeBuoy, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    badge: 'Requires Org Approval',
    autoApproved: false,
  },
  {
    role: 'ARMY_RESCUE',
    title: 'Army / NDRF / Rescue',
    desc: 'Military civil defense units conducting active evacuation and rescue triage.',
    badge: 'Requires Org Approval',
    autoApproved: false,
  },
  {
    role: 'HOSPITAL',
    title: 'Hospital / Trauma Center',
    desc: 'Clinical intake, medical condition tagging, and survivor referral tracking.',
    badge: 'Requires Org Approval',
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
    <div className="max-w-2xl mx-auto my-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-500/20 mb-2">
          <LifeBuoy className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register for MILAN</h1>
        <p className="text-xs text-slate-600">
          Select your operational role to establish proper data access and reporting authorization.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Select Your Role in Disaster Response <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const selected = role === opt.role;
                return (
                  <div
                    key={opt.role}
                    onClick={() => setRole(opt.role)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      selected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                        {selected ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                    </div>
                    <div className="mt-2.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          opt.autoApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.org"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Org Name if not FAMILY */}
          {role !== 'FAMILY' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization / Camp / Hospital Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. NDRF Battalion 4 / District Civil Hospital"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : <><UserPlus className="w-4 h-4" /> Complete Registration</>}
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-600">
        Already registered?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Sign In here
        </Link>
      </div>
    </div>
  );
};
