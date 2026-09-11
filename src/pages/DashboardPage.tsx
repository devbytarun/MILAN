import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Users,
  Building2,
  ShieldCheck,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();

  const roleLabels: Record<string, string> = {
    FAMILY: 'Family Member / Relative',
    NGO: 'Relief Organization (NGO)',
    ARMY_RESCUE: 'Army / Civil Rescue Unit',
    HOSPITAL: 'Hospital / Medical Center',
    REVIEWER: 'Verification Reviewer',
    ADMIN: 'System Administrator',
    VOLUNTEER: 'Community Volunteer',
  };

  return (
    <div className="space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {profile ? roleLabels[profile.role] || profile.role : 'Guest'}
            </span>
            {profile?.verification_status === 'APPROVED' && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Verified Account
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Welcome, {profile?.full_name || 'Coordinator'}
          </h1>
          <p className="text-xs text-slate-500">
            {profile?.organization_name ? `${profile.organization_name} • ` : ''}
            Disaster Coordination Portal Active
          </p>
        </div>

        {/* Quick Action Button Based on Role */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {profile?.role === 'FAMILY' && (
            <Link
              to="/report/missing"
              className="w-full md:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" /> Submit Missing Report
            </Link>
          )}

          {(profile?.role === 'NGO' || profile?.role === 'ARMY_RESCUE' || profile?.role === 'ADMIN') && (
            <Link
              to="/report/found"
              className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" /> Register Found Person
            </Link>
          )}

          {(profile?.role === 'HOSPITAL' || profile?.role === 'ADMIN') && (
            <Link
              to="/report/hospital"
              className="w-full md:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" /> Hospital Medical Intake
            </Link>
          )}

          {(profile?.role === 'REVIEWER' || profile?.role === 'ADMIN') && (
            <Link
              to="/review"
              className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <ShieldCheck className="w-4 h-4" /> Open Verification Queue
            </Link>
          )}
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Missing Cases</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">128</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Active reports filed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Found / Rescued</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">94</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">Camp & shelter intakes</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Potential Matches</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">17</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Algorithmic candidates</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Matches</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">32</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Reunited by reviewers</div>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Users className="w-4 h-4 text-emerald-600" />
            Family Reporting
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Record comprehensive physical details: height, hair colour, birthmarks, footwear, and personal clothing.
          </p>
          <Link
            to="/report/missing"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Launch 6-Step Form <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Building2 className="w-4 h-4 text-blue-600" />
            Rescue Camp Intake
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Field reports for shelter intake. Automatically supports non-communicative and unidentified persons.
          </p>
          <Link
            to="/report/found"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800"
          >
            Launch Rescue Intake <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Review & Verification
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Side-by-side evidence inspection: view field comparisons, matched attributes, and conflict indicators.
          </p>
          <Link
            to="/review"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800"
          >
            Review Candidates <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Case Registry Snapshot */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Case Directory</h3>
            <p className="text-xs text-slate-500">Live reconciliation status across emergency shelter nodes</p>
          </div>
          <Link
            to="/cases"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Cases <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Case UID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Reported Subject</th>
                <th className="p-3">Last Known Location</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/70 transition">
                <td className="p-3 font-mono font-bold text-blue-700">MILAN-2026-081</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    MISSING
                  </span>
                </td>
                <td className="p-3 font-semibold text-slate-800">Aarav Sharma (Age 9)</td>
                <td className="p-3 text-slate-600">Alaknanda Riverside Market, Sector 4</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                    <Clock className="w-3 h-3" /> POSSIBLE_MATCH
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link to="/cases" className="text-blue-600 hover:underline font-medium">
                    Inspect Timeline
                  </Link>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition">
                <td className="p-3 font-mono font-bold text-blue-700">MILAN-2026-094</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    FOUND
                  </span>
                </td>
                <td className="p-3 font-semibold text-slate-800">Unidentified Minor (Boy, ~8-10)</td>
                <td className="p-3 text-slate-600">Camp Relief Zone 2 (NDRF Intake)</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                    <Clock className="w-3 h-3" /> POSSIBLE_MATCH
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link to="/review" className="text-indigo-600 hover:underline font-medium">
                    Review Match
                  </Link>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition">
                <td className="p-3 font-mono font-bold text-blue-700">MILAN-2026-065</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    MISSING
                  </span>
                </td>
                <td className="p-3 font-semibold text-slate-800">Meera Sen (Age 64)</td>
                <td className="p-3 text-slate-600">Bridge Colony, Block C</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED_MATCH
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link to="/cases" className="text-emerald-700 hover:underline font-medium">
                    Reunited
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
