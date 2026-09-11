import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLocalCases, FullCaseData } from '../services/caseService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { canViewCase, sanitizeCaseForUser, hasPermission } from '../lib/permissions.ts';
import { AccessDenied } from './AccessDenied.tsx';
import {
  MapPin,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Lock,
  Phone,
  Building,
  Heart,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { evaluateChildSafeguards } from '../lib/anti-trafficking.ts';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const caseData: FullCaseData | null = React.useMemo(() => {
    const all = getLocalCases();
    return all.find((c) => c.case.id === id || c.case.case_uid === id) || null;
  }, [id]);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTRIBUTES' | 'RECONCILIATION'>('OVERVIEW');

  if (!caseData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-[#dddddd] rounded-xl text-center space-y-4 shadow-elevation-1">
        <h2 className="font-display text-2xl font-normal text-[#181d26]">Case Record Not Found</h2>
        <p className="text-sm text-[#41454d]">
          The requested case identifier does not exist in the active disaster shelter registry.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/cases')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Cases Registry
        </Button>
      </div>
    );
  }

  // Role-based case access check
  if (!canViewCase(profile, caseData)) {
    return (
      <AccessDenied
        moduleName="Case Record"
        reason="You do not have authorization to inspect this confidential operational case record."
      />
    );
  }

  const safeData = sanitizeCaseForUser(caseData, profile);
  const { case: c, report: r, attributes: a } = safeData;
  const childSafeguards = evaluateChildSafeguards(a.age, a.approximate_age);

  const canReview = hasPermission(profile?.role, 'REVIEW_MATCH');
  const canViewDossier = hasPermission(profile?.role, 'VIEW_FORENSIC_DOSSIER');
  const isFamily = profile?.role === 'FAMILY';
  const isOwner =
    (c.created_by && (c.created_by === profile?.id || c.created_by === profile?.auth_user_id)) ||
    (isFamily && (c.created_by === 'family-demo' || c.id === 'case-demo-1'));

  const timelineSteps = [
    {
      title: 'Report Registered in MILAN',
      date: new Date(c.created_at).toLocaleDateString(),
      desc: `Case created with UID ${c.case_uid} via ${r.source_type} intake.`,
      done: true,
    },
    {
      title: 'Distributed to Relief Shelters',
      date: 'Instant Broadcast',
      desc: 'Physical identifiers synchronized across all active relief shelter nodes.',
      done: true,
    },
    {
      title: 'Multi-Attribute Algorithmic Sweep',
      date: 'Continuous Pipeline',
      desc:
        c.status === 'POSSIBLE_MATCH' || c.status === 'VERIFIED_MATCH'
          ? 'High-confidence candidate surfaced through weighted similarity scoring.'
          : 'Algorithmic cross-referencing against rescue shelter intakes active.',
      done: c.status === 'POSSIBLE_MATCH' || c.status === 'VERIFIED_MATCH',
    },
    {
      title: 'Coordinator Verification Decision',
      date: c.status === 'VERIFIED_MATCH' ? 'Audit Verified' : 'Pending',
      desc:
        c.status === 'VERIFIED_MATCH'
          ? 'Relief coordinator reviewed physical scar, clothing, and biometric evidence.'
          : 'Awaiting candidate discovery or reviewer verification decision.',
      done: c.status === 'VERIFIED_MATCH',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          {(isFamily || isOwner) && (
            <Link to={`/cases/${c.id}/status`}>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FileText className="w-3.5 h-3.5" />}
              >
                Family Status View
              </Button>
            </Link>
          )}

          {canViewDossier && (
            <Link to="/dossier">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FileText className="w-3.5 h-3.5" />}
              >
                Forensic Dossier
              </Button>
            </Link>
          )}

          {canReview && c.status === 'POSSIBLE_MATCH' && (
            <Link to="/review">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
              >
                Review Match
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Header Dossier Card */}
      <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-8 shadow-elevation-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#dddddd] pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant={c.case_type === 'MISSING' ? 'coral' : 'forest'} size="sm">
                {c.case_type} PERSON DOSSIER
              </Badge>
              <span className="font-mono text-xs font-bold text-[#41454d] bg-[#f8fafc] px-2 py-0.5 rounded border border-[#dddddd]">
                {c.case_uid}
              </span>
              {childSafeguards.isMinor && (
                <Badge variant="cream" size="sm" icon={<Lock className="w-3 h-3 text-[#aa2d00]" />}>
                  PROTECTED MINOR
                </Badge>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-normal text-[#181d26] tracking-tight">
              {a.full_name || (c.case_type === 'FOUND' ? 'Unidentified Survivor' : 'Name Withheld')}
            </h1>

            <p className="text-xs text-[#41454d] flex flex-wrap items-center gap-2">
              <span>Reported via {r.source_type} intake</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#9297a0]" /> {r.found_location || 'Location not recorded'}
              </span>
              <span>•</span>
              <span className="text-[11px] text-[#9297a0]">[SIMULATED DRILL / DEMO DATA]</span>
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
            <Badge
              variant={
                c.status === 'VERIFIED_MATCH'
                  ? 'forest'
                  : c.status === 'POSSIBLE_MATCH'
                  ? 'cream'
                  : 'shade'
              }
              size="md"
              icon={
                c.status === 'VERIFIED_MATCH' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#006400]" />
                ) : (
                  <Clock className="w-4 h-4 text-[#d9a441]" />
                )
              }
            >
              {c.status.replace('_', ' ')}
            </Badge>
            <span className="text-[11px] text-[#9297a0]">
              Updated {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Child Anti-Trafficking Safeguards Alert */}
        {childSafeguards.isMinor && (
          <div className="p-4 bg-[#f5e9d4] border border-[#e5d4b8] rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#aa2d00] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-semibold text-[#181d26]">
                Anti-Trafficking & Child Protection Protocol Active
              </div>
              <p className="text-[#333840] leading-relaxed">
                The individual is identified as a minor (approximate age {a.age || a.approximate_age || 'under 18'}).
                Under Section 370 IPC disaster emergency safeguards, dual-officer photo ID authorization and verified guardian custody verification are required before shelter release.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#dddddd] gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-3 border-b-2 transition-colors duration-150 ${
              activeTab === 'OVERVIEW'
                ? 'border-[#181d26] text-[#181d26] font-bold'
                : 'border-transparent text-[#41454d] hover:text-[#181d26]'
            }`}
          >
            Case Overview
          </button>
          <button
            onClick={() => setActiveTab('ATTRIBUTES')}
            className={`pb-3 border-b-2 transition-colors duration-150 ${
              activeTab === 'ATTRIBUTES'
                ? 'border-[#181d26] text-[#181d26] font-bold'
                : 'border-transparent text-[#41454d] hover:text-[#181d26]'
            }`}
          >
            Physical Attributes
          </button>
          <button
            onClick={() => setActiveTab('RECONCILIATION')}
            className={`pb-3 border-b-2 transition-colors duration-150 ${
              activeTab === 'RECONCILIATION'
                ? 'border-[#181d26] text-[#181d26] font-bold'
                : 'border-transparent text-[#41454d] hover:text-[#181d26]'
            }`}
          >
            Reconciliation & Shelter Info
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#f8fafc] border border-[#dddddd] rounded-lg space-y-1">
                <div className="text-[#41454d] font-medium">Age & Demographics</div>
                <div className="font-bold text-[#181d26] text-sm">
                  {a.age || a.approximate_age || 'Unknown'} Years • {a.gender || 'Not specified'}
                </div>
                <div className="text-[#41454d]">
                  Blood Group: <strong className="text-[#181d26]">{a.blood_group || 'Unknown'}</strong>
                </div>
              </div>

              <div className="p-4 bg-[#f8fafc] border border-[#dddddd] rounded-lg space-y-1">
                <div className="text-[#41454d] font-medium">Reporting Channel</div>
                <div className="font-bold text-[#181d26] text-sm">
                  {r.source_type} Intake
                </div>
                <div className="text-[#41454d]">
                  Communication Status: <strong className="text-[#181d26]">{r.comm_status || 'Unknown'}</strong>
                </div>
              </div>
            </div>

            {/* Notes */}
            {r.report_notes && (
              <div className="p-4 bg-[#f8fafc] border border-[#dddddd] rounded-lg text-xs space-y-1">
                <div className="font-bold text-[#181d26]">Intake Notes:</div>
                <p className="text-[#333840] leading-relaxed">{r.report_notes}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="font-display text-lg font-normal text-[#181d26]">
                Case Reconciliation Milestones
              </h3>
              <div className="space-y-4 pl-2 border-l-2 border-[#dddddd]">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div
                      className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        step.done ? 'border-[#181d26]' : 'border-[#dddddd]'
                      }`}
                    >
                      {step.done && <span className="w-2 h-2 rounded-full bg-[#181d26]"></span>}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${step.done ? 'text-[#181d26]' : 'text-[#9297a0]'}`}>
                        {step.title}
                      </span>
                      <span className="text-[11px] text-[#9297a0] font-medium">{step.date}</span>
                    </div>
                    <p className="text-xs text-[#41454d] mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTRIBUTES */}
        {activeTab === 'ATTRIBUTES' && (
          <div className="space-y-4 text-xs">
            <div className="border border-[#dddddd] rounded-xl overflow-hidden divide-y divide-[#dddddd]">
              <div className="grid grid-cols-3 p-3.5 bg-[#f8fafc] font-semibold text-[#181d26]">
                <div>Physical Feature</div>
                <div className="col-span-2">Recorded Intake Attributes</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-[#41454d]">Alternative Names</div>
                <div className="col-span-2 text-[#181d26]">{a.alternative_names || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-[#41454d]">Height & Weight</div>
                <div className="col-span-2 text-[#181d26]">
                  {a.height_cm ? `${a.height_cm} cm` : '—'} • {a.weight_kg ? `${a.weight_kg} kg` : '—'} (Build: {a.build || '—'})
                </div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-[#41454d]">Hair & Eyes</div>
                <div className="col-span-2 text-[#181d26]">
                  Hair: {a.hair_colour || '—'} ({a.hair_description || '—'}), Eyes: {a.eye_colour || '—'}
                </div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-[#41454d]">Clothing Recorded</div>
                <div className="col-span-2 text-[#181d26]">{a.clothing || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-[#41454d]">Footwear</div>
                <div className="col-span-2 text-[#181d26]">{a.footwear || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-[#41454d]">Accessories / Items</div>
                <div className="col-span-2 text-[#181d26]">{a.accessories || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-[#41454d]">Scars & Marks</div>
                <div className="col-span-2 text-[#181d26] font-semibold">{a.scars || 'None recorded'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-[#41454d]">Birthmarks & Tattoos</div>
                <div className="col-span-2 text-[#181d26]">{a.birthmarks || a.tattoos || 'None recorded'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5 bg-[#f5e9d4]">
                <div className="font-bold text-[#181d26]">Key Distinguishing Clue</div>
                <div className="col-span-2 font-bold text-[#181d26]">{a.identifying_clue || 'None'}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECONCILIATION */}
        {activeTab === 'RECONCILIATION' && (
          <div className="space-y-6">
            {c.status === 'VERIFIED_MATCH' ? (
              <div className="p-6 bg-[#f5e9d4] border border-[#e5d4b8] rounded-xl space-y-4">
                <div className="flex items-center gap-2.5 text-[#181d26] font-semibold text-base">
                  <CheckCircle2 className="w-5 h-5 text-[#006400]" />
                  Verified Positive Match Confirmed
                </div>
                <p className="text-xs text-[#333840] leading-relaxed">
                  Relief coordinators have audited the evidence and verified that this case matches active rescue intake records. The person is safe and accounted for in the relief shelter network.
                </p>

                <div className="p-5 bg-white border border-[#dddddd] rounded-xl space-y-3 text-xs text-[#181d26]">
                  <div className="font-semibold text-sm text-[#181d26] border-b border-[#dddddd] pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#41454d]" /> Designated Reunion Location
                    </span>
                    <span className="text-[11px] font-mono text-[#9297a0]">CONFIDENTIAL</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[#41454d] block">Shelter Camp:</span>
                      <strong className="text-sm">Camp Relief Zone 2 (NDRF Battalion 4 Intake)</strong>
                    </div>
                    <div>
                      <span className="text-[#41454d] block">Designated Coordinator:</span>
                      <strong className="text-sm">Major Vikram Rathore</strong>
                    </div>
                    <div>
                      <span className="text-[#41454d] block">Helpline Verification PIN:</span>
                      <span className="font-mono font-bold bg-[#f8fafc] border border-[#dddddd] px-2 py-0.5 rounded text-[#181d26] inline-block mt-0.5">
                        {c.case_uid}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#41454d] block">Emergency Desk Helpline:</span>
                      <strong className="text-sm flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-[#006400]" /> +91 98765 43210 (24/7)
                      </strong>
                    </div>
                  </div>

                  {childSafeguards.isMinor && (
                    <div className="mt-3 p-3 bg-[#f8fafc] border border-[#dddddd] rounded-lg text-xs space-y-1">
                      <span className="font-semibold text-[#aa2d00] flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Chain of Custody Guardian Requirement
                      </span>
                      <p className="text-[#41454d]">
                        In-person custody handover requires claimant Aadhaar/Voter ID matching the registered next of kin records, co-signed by the on-site Camp Magistrate.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : c.status === 'POSSIBLE_MATCH' ? (
              <div className="p-6 bg-[#f5e9d4] border border-[#e5d4b8] rounded-xl space-y-4">
                <div className="flex items-center gap-2.5 text-[#181d26] font-semibold text-base">
                  <Clock className="w-5 h-5 text-[#d9a441]" />
                  Potential Algorithmic Candidate Under Review
                </div>
                <p className="text-xs text-[#333840] leading-relaxed">
                  Our weighted matching engine has flagged a high-similarity candidate record matching key physical clues. Coordinators are currently auditing evidence side-by-side.
                </p>
                {canReview ? (
                  <Link to="/review">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<ShieldCheck className="w-4 h-4" />}
                    >
                      Open Match Reviewer Audit
                    </Button>
                  </Link>
                ) : isFamily ? (
                  <div className="p-4 bg-white rounded-lg border border-[#dddddd] text-xs space-y-2">
                    <div className="font-semibold text-[#181d26]">Status of Verification:</div>
                    <p className="text-[#41454d] leading-relaxed">
                      A trained humanitarian reviewer is actively verifying the physical clues with shelter officers. You will be notified immediately when identity verification is complete.
                    </p>
                    <Link to={`/cases/${c.id}/status`}>
                      <Button variant="primary" size="sm" leftIcon={<Heart className="w-4 h-4" />}>
                        Open Family Status Tracker
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="p-6 bg-[#f8fafc] border border-[#dddddd] rounded-xl space-y-2 text-xs text-[#41454d]">
                <div className="font-semibold text-[#181d26] text-sm">Active Algorithmic Sweep</div>
                <p className="leading-relaxed">
                  This case is continuously checked against all incoming survivor admissions from rescue boats, shelters, and medical intake desks.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
