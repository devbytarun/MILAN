import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { getCasesForUser, FullCaseData } from '../services/caseService.ts';
import {
  Users,
  Building2,
  ShieldCheck,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Heart,
  Phone,
  Radio,
  FileText,
  Search,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const role = profile?.role || 'FAMILY';
  const userCases: FullCaseData[] = React.useMemo(() => {
    return getCasesForUser(profile);
  }, [profile]);

  const roleLabels: Record<string, string> = {
    FAMILY: 'Family Member / Relative',
    NGO: 'Relief Organization (NGO)',
    ARMY_RESCUE: 'Army / Civil Rescue Unit',
    HOSPITAL: 'Hospital / Medical Center',
    REVIEWER: 'Verification Reviewer',
    ADMIN: 'System Administrator',
    VOLUNTEER: 'Community Volunteer',
  };

  // -------------------------------------------------------------------------
  // 1. FAMILY DASHBOARD VIEW
  // -------------------------------------------------------------------------
  if (role === 'FAMILY') {
    const familyCases = userCases.filter(
      (c) =>
        c.case.case_type === 'MISSING' ||
        c.case.created_by === profile?.id ||
        c.case.created_by === 'family-demo'
    );

    return (
      <div className="space-y-8 pb-12 max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge variant="shade" size="sm">
                {roleLabels.FAMILY}
              </Badge>
              <Badge variant="brand" size="sm" icon={<Heart className="w-3 h-3 text-orange-600" />}>
                Family Support Portal
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {profile?.full_name || 'Anita Sharma'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Live status tracking for your reported missing relatives across all emergency relief nodes.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="brand"
              size="md"
              onClick={() => navigate('/report/missing')}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="w-full md:w-auto whitespace-nowrap shadow-sm"
            >
              Report Another Missing Person
            </Button>
          </div>
        </div>

        {/* My Registered Cases (Empathetic Status Cards) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                My Missing Person Case Reports
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Continuously monitored by humanitarian search teams
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono font-medium">
              {familyCases.length} Registered Report{familyCases.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {familyCases.map((item) => {
              const { case: c, attributes: a, report: r } = item;
              const isVerified = c.status === 'VERIFIED_MATCH';
              const isPossible = c.status === 'POSSIBLE_MATCH';

              return (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
                        <Heart className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">
                            {a.full_name || 'Missing Relative'}
                          </span>
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                            {c.case_uid}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {a.age ? `Age ${a.age}` : 'Age Unknown'} • {a.gender || 'Unknown'} • Last seen: {r.found_location || 'Incident zone'}
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={isVerified ? 'verified' : isPossible ? 'pending' : 'shade'}
                      size="md"
                      icon={isVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
                    >
                      {isVerified ? 'VERIFIED MATCH' : isPossible ? 'POTENTIAL MATCH UNDER AUDIT' : 'SEARCHING'}
                    </Badge>
                  </div>

                  {/* Empathetic Progress Status Note */}
                  <div className={`p-4 rounded-xl text-xs leading-relaxed ${
                    isVerified
                      ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
                      : isPossible
                      ? 'bg-amber-50/80 border border-amber-200 text-amber-900'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-700'
                  }`}>
                    {isVerified ? (
                      <div className="space-y-1">
                        <strong className="block text-sm text-emerald-800 flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Good News: Match Confirmed by Relief Coordinators!
                        </strong>
                        <p className="text-emerald-700">
                          Your relative has been verified and is safe at Camp Relief Zone 2. Please open the Status Tracker to view reunion desk coordination and contact details.
                        </p>
                      </div>
                    ) : isPossible ? (
                      <div className="space-y-1">
                        <strong className="block text-sm text-amber-900 flex items-center gap-1.5 font-semibold">
                          <Clock className="w-4 h-4 text-amber-600" /> Potential Match Under Active Verification
                        </strong>
                        <p className="text-amber-800">
                          A rescue camp intake shares physical characteristics with your report. Humanitarian officers are actively verifying identifying marks with shelter staff. You will receive direct updates as soon as verification completes.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <strong className="block text-sm text-slate-900 flex items-center gap-1.5 font-semibold">
                          <RefreshCw className="w-4 h-4 text-slate-600" /> Active Search in Progress
                        </strong>
                        <p className="text-slate-600">
                          Your report is active across all relief shelter networks and is continuously matched against incoming boat rescues and medical registrations.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500">
                      Identifying clue: <strong className="text-slate-800 font-semibold">{a.identifying_clue || a.scars || 'Recorded'}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/cases/${c.id}`}>
                        <Button variant="secondary" size="sm">
                          Case Record
                        </Button>
                      </Link>
                      <Link to={`/cases/${c.id}/status`}>
                        <Button variant="brand" size="sm" leftIcon={<Heart className="w-3.5 h-3.5" />}>
                          Live Status Tracker
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transparency Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card text-center hover:shadow-card-hover transition-all duration-200">
            <div className="text-2xl font-bold tracking-tight text-slate-900">94</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Rescue Intakes Cross-Checked
            </div>
            <div className="text-[11px] text-slate-600 mt-1">Shelter & camp arrivals</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card text-center hover:shadow-card-hover transition-all duration-200">
            <div className="text-2xl font-bold tracking-tight text-slate-900">6</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Active Relief Zones
            </div>
            <div className="text-[11px] text-slate-600 mt-1">Sector 4, NDRF Camps 1-5</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card text-center hover:shadow-card-hover transition-all duration-200">
            <div className="text-2xl font-bold tracking-tight text-slate-900">24 / 7</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Live Reconciliation Sweep
            </div>
            <div className="text-[11px] text-slate-600 mt-1">Continuous multi-factor matching</div>
          </div>
        </div>

        {/* Emergency & Official Helplines */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Phone className="w-5 h-5 text-orange-600" />
            Official Emergency Helpline Directory
          </div>
          <p className="text-xs text-slate-600">
            Need immediate assistance or have urgent information about a missing person? Call authorized disaster helplines:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <a
              href="tel:1078"
              className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-orange-500 hover:bg-orange-50/30 transition-all block text-center group"
            >
              <div className="font-mono text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">1078</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">NDMA Helpline</div>
              <div className="text-[11px] text-slate-500">National Disaster Management (Toll Free)</div>
            </a>

            <a
              href="tel:112"
              className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-orange-500 hover:bg-orange-50/30 transition-all block text-center group"
            >
              <div className="font-mono text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">112</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">National Emergency</div>
              <div className="text-[11px] text-slate-500">Police, Fire & Rescue Dispatch</div>
            </a>

            <a
              href="tel:1098"
              className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-orange-500 hover:bg-orange-50/30 transition-all block text-center group"
            >
              <div className="font-mono text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">1098</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">Childline India</div>
              <div className="text-[11px] text-slate-500">24/7 Missing & Unaccompanied Children</div>
            </a>

            <a
              href="tel:+919876543210"
              className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-orange-500 hover:bg-orange-50/30 transition-all block text-center group"
            >
              <div className="font-mono text-base font-bold text-emerald-700 group-hover:text-orange-600 transition-colors truncate">+91 98765 43210</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">Family Reunion Desk</div>
              <div className="text-[11px] text-slate-500">NDRF Central Camp Coordination Desk</div>
            </a>
          </div>
        </div>

        {/* Protection & Privacy Notice */}
        <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-xs space-y-2">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-slate-400" />
            Victim Protection & Data Safeguards
          </div>
          <p className="text-slate-600 leading-relaxed">
            To prevent fraud, exploitation, and unauthorized approaches, detailed shelter rosters, confidential clinical records, and algorithmic match scores are restricted to vetted humanitarian personnel. All identity verifications are performed by authorized officers in person before public reunion notifications.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. REVIEWER DASHBOARD VIEW
  // -------------------------------------------------------------------------
  if (role === 'REVIEWER') {
    return (
      <div className="space-y-8 pb-12">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge variant="shade" size="sm">
                {roleLabels.REVIEWER}
              </Badge>
              <Badge variant="verified" size="sm" icon={<ShieldCheck className="w-3 h-3 text-emerald-600" />}>
                Humanitarian Audit Authority
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {profile?.full_name || 'Kavita Nair'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {profile?.organization_name || 'Disaster Coordination Cell'} • Multi-Attribute Verification Audit Active
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="brand"
              size="md"
              onClick={() => navigate('/review')}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              className="w-full md:w-auto shadow-sm"
            >
              Open Verification Queue
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/dossier')}
              leftIcon={<FileText className="w-4 h-4" />}
              className="w-full md:w-auto"
            >
              Forensic Dossiers
            </Button>
          </div>
        </div>

        {/* Reviewer Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Awaiting Verification</div>
            <div className="text-3xl font-bold tracking-tight text-amber-600 mt-2">17</div>
            <div className="text-xs text-slate-600 mt-1">High-similarity candidate pairs</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Minor Protection Alerts</div>
            <div className="text-3xl font-bold tracking-tight text-rose-600 mt-2">3</div>
            <div className="text-xs text-slate-600 mt-1">Dual-officer custody requirement</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Conflicting Clues Flagged</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 mt-2">5</div>
            <div className="text-xs text-slate-600 mt-1">Field officer clarification pending</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verified Reunions</div>
            <div className="text-3xl font-bold tracking-tight text-emerald-600 mt-2">32</div>
            <div className="text-xs text-slate-600 mt-1">Audited and certified by team</div>
          </div>
        </div>

        {/* Verification Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                Side-by-Side Audit
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare deterministic matrices, physical scars, clothing, and field notes side by side.
              </p>
            </div>
            <Link to="/review" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 pt-2">
              Audit Candidates <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <FileText className="w-4 h-4 text-orange-600" />
                Forensic Verification Dossiers
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect multi-factor confidence ratings, breakdown scores, and field telemetry data.
              </p>
            </div>
            <Link to="/dossier" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 pt-2">
              View Dossier Engine <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <Search className="w-4 h-4 text-orange-600" />
                Disaster Case Registry
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse full operational logs across missing, found, and hospitalized intakes.
              </p>
            </div>
            <Link to="/cases" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 pt-2">
              Browse Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Priority Audit Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Candidates Requiring Human Audit</h3>
              <p className="text-xs text-slate-500 mt-0.5">High-confidence candidates matching physical clues</p>
            </div>
            <Link to="/review" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1">
              View Full Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Candidate Match Pair</th>
                  <th className="p-3.5">Matched Physical Features</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Special Protocol</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-medium text-slate-900">
                    Aarav Sharma (9) <span className="text-slate-400">↔</span> Unidentified Minor (Boy, ~9)
                    <div className="font-mono text-[10px] text-slate-400">MILAN-2026-081 ↔ MILAN-2026-094</div>
                  </td>
                  <td className="p-3.5 text-slate-600">Left forearm scar, red polo shirt, black wrist thread</td>
                  <td className="p-3.5 font-mono font-bold text-amber-600">88%</td>
                  <td className="p-3.5">
                    <Badge variant="brand" size="sm" icon={<Lock className="w-3 h-3 text-orange-600" />}>
                      Protected Minor
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Link to="/review" className="text-orange-600 font-semibold hover:text-orange-700 hover:underline">
                      Audit Candidate
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 3. HOSPITAL DASHBOARD VIEW
  // -------------------------------------------------------------------------
  if (role === 'HOSPITAL') {
    return (
      <div className="space-y-8 pb-12">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge variant="shade" size="sm">
                {roleLabels.HOSPITAL}
              </Badge>
              <Badge variant="verified" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
                Clinical Triage Center
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {profile?.full_name || 'Dr. Sunita Patel'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {profile?.organization_name || 'Central Trauma Hospital'} • Emergency Inpatient Reconciliation
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="brand"
              size="md"
              onClick={() => navigate('/report/hospital')}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="w-full md:w-auto shadow-sm"
            >
              Hospital Patient Intake
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/report/voice')}
              leftIcon={<Radio className="w-4 h-4" />}
              className="w-full md:w-auto"
            >
              Voice Intake
            </Button>
          </div>
        </div>

        {/* Hospital Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unidentified Patients</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 mt-2">14</div>
            <div className="text-xs text-slate-600 mt-1">Non-verbal / ICU / Unconscious</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Trauma Registrations</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 mt-2">38</div>
            <div className="text-xs text-slate-600 mt-1">Total disaster admissions</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Family Identified</div>
            <div className="text-3xl font-bold tracking-tight text-emerald-600 mt-2">9</div>
            <div className="text-xs text-slate-600 mt-1">Next of kin verified</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Referrals</div>
            <div className="text-3xl font-bold tracking-tight text-amber-600 mt-2">4</div>
            <div className="text-xs text-slate-600 mt-1">Ambulance intake transfers</div>
          </div>
        </div>

        {/* Action Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <Building2 className="w-4 h-4 text-orange-600" />
                Unidentified Inpatient Intake
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log physical scars, surgical marks, tattoos, and clothing for non-communicative trauma patients.
              </p>
            </div>
            <Link to="/report/hospital" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 pt-2">
              New Hospital Intake <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <Radio className="w-4 h-4 text-orange-600" />
                Radio & Voice Parser
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dictate physician triage notes and intake audio directly into structured attributes.
              </p>
            </div>
            <Link to="/report/voice" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 pt-2">
              Open Voice Parser <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <Search className="w-4 h-4 text-orange-600" />
                Case Directory
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search missing person records filed by relatives to cross-reference patient physical marks.
              </p>
            </div>
            <Link to="/cases" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 pt-2">
              Search Cases <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 4. NGO / ARMY_RESCUE DASHBOARD VIEW
  // -------------------------------------------------------------------------
  if (role === 'NGO' || role === 'ARMY_RESCUE') {
    return (
      <div className="space-y-8 pb-12">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge variant="shade" size="sm">
                {roleLabels[role]}
              </Badge>
              <Badge variant="verified" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
                Field Rescue Command
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {profile?.full_name || (role === 'ARMY_RESCUE' ? 'Major Vikram Rathore' : 'Rajesh Verma')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {profile?.organization_name || 'NDRF Rescue Unit 8'} • Shelter Registry & Evacuation Coordination
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="brand"
              size="md"
              onClick={() => navigate('/report/found')}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="w-full md:w-auto shadow-sm"
            >
              Register Rescued / Found Person
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/report/voice')}
              leftIcon={<Radio className="w-4 h-4" />}
              className="w-full md:w-auto"
            >
              Radio / Voice Intake
            </Button>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Shelter Intakes</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 mt-2">94</div>
            <div className="text-xs text-slate-600 mt-1">Rescued persons accommodated</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unidentified Minors</div>
            <div className="text-3xl font-bold tracking-tight text-rose-600 mt-2">7</div>
            <div className="text-xs text-slate-600 mt-1">Under child protective custody</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Potential Matches</div>
            <div className="text-3xl font-bold tracking-tight text-amber-600 mt-2">17</div>
            <div className="text-xs text-slate-600 mt-1">Reviewers cross-referencing</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completed Reunions</div>
            <div className="text-3xl font-bold tracking-tight text-emerald-600 mt-2">32</div>
            <div className="text-xs text-slate-600 mt-1">Handover protocols signed</div>
          </div>
        </div>

        {/* Operational Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <Building2 className="w-4 h-4 text-orange-600" />
                Shelter Intake Registration
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log evacuated individuals and trauma survivors. Supports non-verbal and distressed victims.
              </p>
            </div>
            <Link to="/report/found" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 pt-2">
              Launch Rescue Intake <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <Radio className="w-4 h-4 text-orange-600" />
                Radio Dispatch & Voice AI
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Convert tactical boat radio transmissions and field voice notes into verified case records.
              </p>
            </div>
            <Link to="/report/voice" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 pt-2">
              Open Voice Parser <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <Search className="w-4 h-4 text-orange-600" />
                Disaster Case Registry
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check active missing person reports filed by families to assist on-the-ground identification.
              </p>
            </div>
            <Link to="/cases" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 pt-2">
              Browse Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 5. VOLUNTEER DASHBOARD VIEW (COMMUNITY CITIZEN RESPONSE)
  // -------------------------------------------------------------------------
  if (role === 'VOLUNTEER') {
    return (
      <div className="space-y-8 pb-12">
        {/* Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge variant="shade" size="sm">
                {roleLabels.VOLUNTEER}
              </Badge>
              <Badge variant="brand" size="sm" icon={<Users className="w-3 h-3 text-orange-600" />}>
                Field Volunteer Support
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {profile?.full_name || 'Rahul Verma'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {profile?.organization_name || 'Civil Defense Volunteers'} • Community Disaster Relief & Victim Support
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="brand"
              size="md"
              onClick={() => navigate('/cases')}
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full md:w-auto whitespace-nowrap shadow-sm"
            >
              Browse Public Directory
            </Button>
          </div>
        </div>

        {/* Volunteer Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Public Missing Reports</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 mt-2">128</div>
            <div className="text-xs text-slate-600 mt-1">Reports to cross-reference</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Shelter Arrivals</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 mt-2">94</div>
            <div className="text-xs text-slate-600 mt-1">Accommodated in relief camps</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Relief Zones</div>
            <div className="text-3xl font-bold tracking-tight text-emerald-600 mt-2">6</div>
            <div className="text-xs text-slate-600 mt-1">Camp coordination centers</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verified Reunions</div>
            <div className="text-3xl font-bold tracking-tight text-emerald-600 mt-2">32</div>
            <div className="text-xs text-slate-600 mt-1">Reunited by search teams</div>
          </div>
        </div>

        {/* Volunteer Field Action & Guidance Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <Search className="w-4 h-4 text-orange-600" />
                Public Case Directory
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Look up registered missing persons by name, physical marks, or last-known district while assisting in shelters and relief distribution.
              </p>
            </div>
            <Link to="/cases" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 pt-2">
              Search Cases <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <Heart className="w-4 h-4 text-orange-600" />
                Family Guidance Protocol
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When encountering searching relatives, guide them to register official reports via the Family Support Portal or at the nearest camp help desk.
              </p>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              Family Desk: NDRF Zone 2 Central Command
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                <Building2 className="w-4 h-4 text-orange-600" />
                Camp Assistance & Triage
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Support camp officers with survivor needs. Immediately escalate unaccompanied minors or injured persons to authorized medical and child protection officers.
              </p>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              Escalation: Contact On-Site Camp Medical Unit
            </div>
          </div>
        </div>

        {/* Volunteer Code of Conduct & Safeguards */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Volunteer Field Protocol & Ethical Safeguards
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1.5">
              <strong className="text-slate-900 block font-semibold">1. Minor Protection</strong>
              <p className="text-slate-600 leading-relaxed">
                Never separate an unaccompanied minor from shelter coordinators. All child reunions must follow official dual-officer magistrate sign-off.
              </p>
            </div>
            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1.5">
              <strong className="text-slate-900 block font-semibold">2. Victim Dignity & Privacy</strong>
              <p className="text-slate-600 leading-relaxed">
                Strictly do not photograph distressed survivors, injured persons, or post unverified case files to personal social media accounts.
              </p>
            </div>
            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1.5">
              <strong className="text-slate-900 block font-semibold">3. Verified Escalation</strong>
              <p className="text-slate-600 leading-relaxed">
                If you recognize someone from a missing report, immediately inform the on-site NDRF or police coordinator rather than promising a reunion.
              </p>
            </div>
          </div>
        </div>

        {/* Official Emergency & Relief Helplines */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <Phone className="w-5 h-5 text-orange-600" />
            Official Emergency & Relief Helplines
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <a href="tel:1078" className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-orange-500 hover:bg-orange-50/30 transition-all block text-center group">
              <div className="font-mono text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">1078</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">NDMA Toll Free</div>
              <div className="text-[11px] text-slate-500">National Disaster Management</div>
            </a>
            <a href="tel:112" className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-orange-500 hover:bg-orange-50/30 transition-all block text-center group">
              <div className="font-mono text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">112</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">National Emergency</div>
              <div className="text-[11px] text-slate-500">Police, Fire & Rescue</div>
            </a>
            <a href="tel:1098" className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-orange-500 hover:bg-orange-50/30 transition-all block text-center group">
              <div className="font-mono text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">1098</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">Childline India</div>
              <div className="text-[11px] text-slate-500">Lost & Found Children</div>
            </a>
            <a href="tel:+919876543210" className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-orange-500 hover:bg-orange-50/30 transition-all block text-center group">
              <div className="font-mono text-base font-bold text-emerald-700 group-hover:text-orange-600 transition-colors truncate">+91 98765 43210</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">Reunion Desk</div>
              <div className="text-[11px] text-slate-500">Central Camp Coordination</div>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 6. ADMIN DASHBOARD VIEW (SYSTEM OVERVIEW & OVERSIGHT)
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Badge variant="shade" size="sm">
              {roleLabels.ADMIN}
            </Badge>
            <Badge variant="verified" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
              System Coordination Grid
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome, {profile?.full_name || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {profile?.organization_name || 'MILAN Disaster Coordination HQ'} • Central Grid Operations & Oversight
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/cases')}
            leftIcon={<Search className="w-4 h-4" />}
          >
            Case Directory
          </Button>
          <Button
            variant="brand"
            size="md"
            onClick={() => navigate('/review')}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            className="shadow-sm"
          >
            Verification Audit
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/dossier')}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Forensic Dossiers
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Missing Cases</div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 mt-2">128</div>
          <div className="text-xs text-slate-600 mt-1">Active reports filed</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Found / Rescued</div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 mt-2">94</div>
          <div className="text-xs text-slate-600 mt-1">Camp & shelter intakes</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Potential Matches</div>
          <div className="text-3xl font-bold tracking-tight text-amber-600 mt-2">17</div>
          <div className="text-xs text-slate-600 mt-1">Algorithmic candidates</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verified Matches</div>
          <div className="text-3xl font-bold tracking-tight text-emerald-600 mt-2">32</div>
          <div className="text-xs text-slate-600 mt-1">Reunited by reviewers</div>
        </div>
      </div>

      {/* Complete Operational Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Users className="w-4 h-4 text-orange-600" />
              Family Reporting Portal
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record comprehensive missing person details: height, hair colour, birthmarks, footwear, and personal clothing.
            </p>
          </div>
          <Link
            to="/report/missing"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline pt-3"
          >
            Launch Missing Intake <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Building2 className="w-4 h-4 text-orange-600" />
              Rescue Camp Intake
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field reports for shelter arrivals. Automatically supports non-communicative and unidentified persons.
            </p>
          </div>
          <Link
            to="/report/found"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline pt-3"
          >
            Launch Rescue Intake <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Building2 className="w-4 h-4 text-orange-600" />
              Hospital Patient Intake
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Register trauma patients, unconscious victims, and inpatient emergency referrals under clinical privacy.
            </p>
          </div>
          <Link
            to="/report/hospital"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline pt-3"
          >
            Launch Hospital Intake <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Radio className="w-4 h-4 text-orange-600" />
              Radio & Voice AI Parser
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transcribe tactical boat radio transmissions and emergency voice transcripts into structured case attributes.
            </p>
          </div>
          <Link
            to="/report/voice"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline pt-3"
          >
            Open Voice Parser <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Review & Verification Audit
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Side-by-side evidence inspection: view field comparisons, matched attributes, and conflict indicators.
            </p>
          </div>
          <Link
            to="/review"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline pt-3"
          >
            Review Candidates <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <FileText className="w-4 h-4 text-orange-600" />
              Forensic Dossier Engine
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-factor confidence scoring, discrepancy detection, and printable humanitarian verification certificates.
            </p>
          </div>
          <Link
            to="/dossier"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline pt-3"
          >
            Forensic Dossiers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
