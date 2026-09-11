import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useI18n } from '../context/I18nContext.tsx';
import {
  Users,
  Building2,
  ShieldCheck,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

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
    <div className="space-y-8 pb-12">
      {/* Profile Header Banner */}
      <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-8 shadow-elevation-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Badge variant="shade" size="sm">
              {profile ? roleLabels[profile.role] || profile.role : 'Guest'}
            </Badge>
            {profile?.verification_status === 'APPROVED' && (
              <Badge variant="verified" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                Verified Operational Account
              </Badge>
            )}
          </div>
          <h1 className="type-display-md text-ink">
            Welcome, {profile?.full_name || 'Coordinator'}
          </h1>
          <p className="type-caption text-shade-50">
            {profile?.organization_name ? `${profile.organization_name} • ` : ''}
            Disaster Coordination Portal Active
          </p>
        </div>

        {/* Quick Action Pill Button Based on Role */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {profile?.role === 'FAMILY' && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/report/missing')}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="w-full md:w-auto"
            >
              {t('nav_report_missing')}
            </Button>
          )}

          {(profile?.role === 'NGO' || profile?.role === 'ARMY_RESCUE' || profile?.role === 'ADMIN') && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/report/found')}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="w-full md:w-auto"
            >
              {t('nav_report_found')}
            </Button>
          )}

          {(profile?.role === 'HOSPITAL' || profile?.role === 'ADMIN') && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/report/hospital')}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="w-full md:w-auto"
            >
              {t('nav_report_hospital')}
            </Button>
          )}

          {(profile?.role === 'REVIEWER' || profile?.role === 'ADMIN') && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/review')}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              className="w-full md:w-auto"
            >
              {t('nav_review')}
            </Button>
          )}
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 shadow-elevation-3">
          <div className="text-[10px] font-semibold text-shade-50 uppercase tracking-wider">Missing Cases</div>
          <div className="type-display-md font-light text-ink mt-2">128</div>
          <div className="type-caption text-shade-50 mt-1">Active reports filed</div>
        </div>

        <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 shadow-elevation-3">
          <div className="text-[10px] font-semibold text-shade-50 uppercase tracking-wider">Found / Rescued</div>
          <div className="type-display-md font-light text-ink mt-2">94</div>
          <div className="type-caption text-shade-50 mt-1">Camp & shelter intakes</div>
        </div>

        <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 shadow-elevation-3">
          <div className="text-[10px] font-semibold text-shade-50 uppercase tracking-wider">Potential Matches</div>
          <div className="type-display-md font-light text-amber-700 mt-2">17</div>
          <div className="type-caption text-shade-50 mt-1">Algorithmic candidates</div>
        </div>

        <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 shadow-elevation-3">
          <div className="text-[10px] font-semibold text-shade-50 uppercase tracking-wider">Verified Matches</div>
          <div className="type-display-md font-light text-ink mt-2">32</div>
          <div className="type-caption text-shade-50 mt-1">Reunited by reviewers</div>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 sm:p-8 shadow-elevation-3 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-ink font-semibold text-sm">
              <Users className="w-4 h-4 text-ink" />
              Family Reporting
            </div>
            <p className="type-caption text-shade-50 leading-relaxed">
              Record comprehensive physical details: height, hair colour, birthmarks, footwear, and personal clothing.
            </p>
          </div>
          <Link
            to="/report/missing"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:underline pt-3"
          >
            Launch 6-Step Form <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 sm:p-8 shadow-elevation-3 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-ink font-semibold text-sm">
              <Building2 className="w-4 h-4 text-ink" />
              Rescue Camp Intake
            </div>
            <p className="type-caption text-shade-50 leading-relaxed">
              Field reports for shelter intake. Automatically supports non-communicative and unidentified persons.
            </p>
          </div>
          <Link
            to="/report/found"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:underline pt-3"
          >
            Launch Rescue Intake <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 sm:p-8 shadow-elevation-3 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-ink font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-ink" />
              Review & Verification
            </div>
            <p className="type-caption text-shade-50 leading-relaxed">
              Side-by-side evidence inspection: view field comparisons, matched attributes, and conflict indicators.
            </p>
          </div>
          <Link
            to="/review"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:underline pt-3"
          >
            Review Candidates <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Case Registry Snapshot */}
      <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-8 shadow-elevation-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="type-heading-lg text-ink">{t('nav_cases')}</h3>
            <p className="type-caption text-shade-50 mt-1">Live reconciliation status across emergency shelter nodes</p>
          </div>
          <Link
            to="/cases"
            className="text-xs font-semibold text-ink hover:underline flex items-center gap-1"
          >
            View All Cases <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-canvas-cream text-shade-60 font-semibold border-b border-hairline-light">
              <tr>
                <th className="p-3.5">Case UID</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Reported Subject</th>
                <th className="p-3.5">Last Known Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-light">
              <tr className="hover:bg-canvas-cream/60 transition-colors">
                <td className="p-3.5 font-mono font-bold text-ink">MILAN-2026-081</td>
                <td className="p-3.5">
                  <Badge variant="shade" size="sm">MISSING</Badge>
                </td>
                <td className="p-3.5 font-semibold text-ink">Aarav Sharma (Age 9)</td>
                <td className="p-3.5 text-shade-60">Alaknanda Riverside Market, Sector 4</td>
                <td className="p-3.5">
                  <Badge variant="pending" size="sm" icon={<Clock className="w-3 h-3" />}>
                    POSSIBLE_MATCH
                  </Badge>
                </td>
                <td className="p-3.5 text-right">
                  <Link to="/cases" className="text-ink hover:underline font-semibold">
                    Inspect Timeline
                  </Link>
                </td>
              </tr>
              <tr className="hover:bg-canvas-cream/60 transition-colors">
                <td className="p-3.5 font-mono font-bold text-ink">MILAN-2026-094</td>
                <td className="p-3.5">
                  <Badge variant="mint" size="sm">FOUND</Badge>
                </td>
                <td className="p-3.5 font-semibold text-ink">Unidentified Minor (Boy, ~8-10)</td>
                <td className="p-3.5 text-shade-60">Camp Relief Zone 2 (NDRF Intake)</td>
                <td className="p-3.5">
                  <Badge variant="pending" size="sm" icon={<Clock className="w-3 h-3" />}>
                    POSSIBLE_MATCH
                  </Badge>
                </td>
                <td className="p-3.5 text-right">
                  <Link to="/review" className="text-ink hover:underline font-semibold">
                    Review Match
                  </Link>
                </td>
              </tr>
              <tr className="hover:bg-canvas-cream/60 transition-colors">
                <td className="p-3.5 font-mono font-bold text-ink">MILAN-2026-065</td>
                <td className="p-3.5">
                  <Badge variant="shade" size="sm">MISSING</Badge>
                </td>
                <td className="p-3.5 font-semibold text-ink">Meera Sen (Age 64)</td>
                <td className="p-3.5 text-shade-60">Bridge Colony, Block C</td>
                <td className="p-3.5">
                  <Badge variant="verified" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                    VERIFIED_MATCH
                  </Badge>
                </td>
                <td className="p-3.5 text-right">
                  <Link to="/cases" className="text-ink hover:underline font-semibold">
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
