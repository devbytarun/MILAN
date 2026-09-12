import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLocalCases, FullCaseData } from '../services/caseService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { canViewCase, sanitizeCaseForUser, hasPermission } from '../lib/permissions.ts';
import { AccessDenied } from './AccessDenied.tsx';
import {
  MapPin,
  CheckCircle2,
  Check,
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
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-slate-200/90 rounded-2xl text-center space-y-4 shadow-card">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Case Record Not Found</h2>
        <p className="text-sm text-slate-600">
          The requested case identifier does not exist in the active disaster shelter registry.
        </p>
        <Button
          variant="brand"
          size="sm"
          onClick={() => navigate('/cases')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="shadow-sm"
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
                variant="brand"
                size="sm"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                className="shadow-sm"
              >
                Review Match
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Header Dossier Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant={c.case_type === 'MISSING' ? 'brand' : 'verified'} size="sm">
                {c.case_type} PERSON DOSSIER
              </Badge>
              <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                {c.case_uid}
              </span>
              {childSafeguards.isMinor && (
                <Badge variant="brand" size="sm" icon={<Lock className="w-3 h-3 text-orange-600" />}>
                  PROTECTED MINOR
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {a.full_name || (c.case_type === 'FOUND' ? 'Unidentified Survivor' : 'Name Withheld')}
            </h1>

            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <span>Reported via {r.source_type} intake</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {r.found_location || 'Location not recorded'}
              </span>
              <span>•</span>
              <span className="text-[11px] text-slate-400 font-mono">[SIMULATED DRILL / DEMO DATA]</span>
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
            <Badge
              variant={
                c.status === 'VERIFIED_MATCH'
                  ? 'verified'
                  : c.status === 'POSSIBLE_MATCH'
                  ? 'pending'
                  : 'shade'
              }
              size="md"
              icon={
                c.status === 'VERIFIED_MATCH' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )
              }
            >
              {c.status.replace('_', ' ')}
            </Badge>
            <span className="text-[11px] text-slate-400 font-mono">
              Updated {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Child Anti-Trafficking Safeguards Alert */}
        {childSafeguards.isMinor && (
          <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-semibold text-rose-900">
                Anti-Trafficking & Child Protection Protocol Active
              </div>
              <p className="text-rose-800 leading-relaxed">
                The individual is identified as a minor (approximate age {a.age || a.approximate_age || 'under 18'}).
                Under Section 370 IPC disaster emergency safeguards, dual-officer photo ID authorization and verified guardian custody verification are required before shelter release.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-3 border-b-2 transition-colors duration-150 ${
              activeTab === 'OVERVIEW'
                ? 'border-orange-500 text-orange-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Case Overview
          </button>
          <button
            onClick={() => setActiveTab('ATTRIBUTES')}
            className={`pb-3 border-b-2 transition-colors duration-150 ${
              activeTab === 'ATTRIBUTES'
                ? 'border-orange-500 text-orange-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Physical Attributes
          </button>
          <button
            onClick={() => setActiveTab('RECONCILIATION')}
            className={`pb-3 border-b-2 transition-colors duration-150 ${
              activeTab === 'RECONCILIATION'
                ? 'border-orange-500 text-orange-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Reconciliation & Shelter Info
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1">
                <div className="text-slate-500 font-medium">Age & Demographics</div>
                <div className="font-bold text-slate-900 text-sm">
                  {a.age || a.approximate_age || 'Unknown'} Years • {a.gender || 'Not specified'}
                </div>
                <div className="text-slate-500">
                  Blood Group: <strong className="text-slate-900">{a.blood_group || 'Unknown'}</strong>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1">
                <div className="text-slate-500 font-medium">Reporting Channel</div>
                <div className="font-bold text-slate-900 text-sm">
                  {r.source_type} Intake
                </div>
                <div className="text-slate-500">
                  Communication Status: <strong className="text-slate-900">{r.comm_status || 'Unknown'}</strong>
                </div>
              </div>
            </div>

            {/* Notes */}
            {r.report_notes && (
              <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900">Intake Notes:</div>
                <p className="text-slate-600 leading-relaxed">{r.report_notes}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900">
                    Case Reconciliation Milestones
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    End-to-end audit tracking across shelter nodes and verification desks.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {timelineSteps.filter((s) => s.done).length} of {timelineSteps.length} Completed
                </span>
              </div>

              <div className="space-y-0">
                {timelineSteps.map((step, idx) => {
                  const isLast = idx === timelineSteps.length - 1;
                  const isCurrent = !step.done && (idx === 0 || timelineSteps[idx - 1].done);

                  return (
                    <div key={idx} className="flex gap-4 group">
                      {/* Node indicator & connecting line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            step.done
                              ? 'bg-orange-600 text-white shadow-xs ring-4 ring-orange-100/60'
                              : isCurrent
                              ? 'border-2 border-orange-500 bg-white text-orange-600 ring-4 ring-orange-50 shadow-xs'
                              : 'border-2 border-slate-200 bg-white text-slate-300'
                          }`}
                        >
                          {step.done ? (
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 my-1.5 flex-1 min-h-[36px] transition-colors ${
                              step.done && timelineSteps[idx + 1].done
                                ? 'bg-orange-500'
                                : step.done
                                ? 'bg-gradient-to-b from-orange-400 to-slate-200'
                                : 'bg-slate-200'
                            }`}
                          />
                        )}
                      </div>

                      {/* Content block */}
                      <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold tracking-tight ${
                                step.done
                                  ? 'text-slate-900'
                                  : isCurrent
                                  ? 'text-orange-950 font-bold'
                                  : 'text-slate-500'
                              }`}
                            >
                              {step.title}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                                In Progress
                              </span>
                            )}
                          </div>
                          <span
                            className={`inline-flex items-center self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-medium font-sans ${
                              step.done
                                ? 'bg-orange-50 text-orange-700 border border-orange-200/60'
                                : isCurrent
                                ? 'bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold'
                                : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                            }`}
                          >
                            {step.date}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            step.done
                              ? 'text-slate-600'
                              : isCurrent
                              ? 'text-slate-700 font-medium'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTRIBUTES */}
        {activeTab === 'ATTRIBUTES' && (
          <div className="space-y-4 text-xs">
            <div className="border border-slate-200/90 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-xs">
              <div className="grid grid-cols-3 p-3.5 bg-slate-50/80 font-semibold text-slate-900">
                <div>Physical Feature</div>
                <div className="col-span-2">Recorded Intake Attributes</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-slate-500">Alternative Names</div>
                <div className="col-span-2 text-slate-900">{a.alternative_names || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-slate-500">Height & Weight</div>
                <div className="col-span-2 text-slate-900">
                  {a.height_cm ? `${a.height_cm} cm` : '—'} • {a.weight_kg ? `${a.weight_kg} kg` : '—'} (Build: {a.build || '—'})
                </div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-slate-500">Hair & Eyes</div>
                <div className="col-span-2 text-slate-900">
                  Hair: {a.hair_colour || '—'} ({a.hair_description || '—'}), Eyes: {a.eye_colour || '—'}
                </div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-slate-500">Clothing Recorded</div>
                <div className="col-span-2 text-slate-900">{a.clothing || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-slate-500">Footwear</div>
                <div className="col-span-2 text-slate-900">{a.footwear || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-slate-500">Accessories / Items</div>
                <div className="col-span-2 text-slate-900">{a.accessories || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-slate-500">Scars & Marks</div>
                <div className="col-span-2 text-slate-900 font-semibold">{a.scars || 'None recorded'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-slate-500">Birthmarks & Tattoos</div>
                <div className="col-span-2 text-slate-900">{a.birthmarks || a.tattoos || 'None recorded'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5 bg-orange-50/40">
                <div className="font-bold text-slate-900">Key Distinguishing Clue</div>
                <div className="col-span-2 font-bold text-orange-700">{a.identifying_clue || 'None'}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECONCILIATION */}
        {activeTab === 'RECONCILIATION' && (
          <div className="space-y-6">
            {c.status === 'VERIFIED_MATCH' ? (
              <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Verified Positive Match Confirmed
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Relief coordinators have audited the evidence and verified that this case matches active rescue intake records. The person is safe and accounted for in the relief shelter network.
                </p>

                <div className="p-5 bg-white border border-emerald-200/80 rounded-xl space-y-3 text-xs text-slate-900 shadow-xs">
                  <div className="font-semibold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-500" /> Designated Reunion Location
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">CONFIDENTIAL</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-500 block">Shelter Camp:</span>
                      <strong className="text-sm text-slate-900">Camp Relief Zone 2 (NDRF Battalion 4 Intake)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Designated Coordinator:</span>
                      <strong className="text-sm text-slate-900">Major Vikram Rathore</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Helpline Verification PIN:</span>
                      <span className="font-mono font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-900 inline-block mt-0.5">
                        {c.case_uid}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Emergency Desk Helpline:</span>
                      <strong className="text-sm flex items-center gap-1.5 mt-0.5 text-emerald-700">
                        <Phone className="w-3.5 h-3.5" /> +91 98765 43210 (24/7)
                      </strong>
                    </div>
                  </div>

                  {childSafeguards.isMinor && (
                    <div className="mt-3 p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-xs space-y-1">
                      <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-rose-600" /> Chain of Custody Guardian Requirement
                      </span>
                      <p className="text-rose-700">
                        In-person custody handover requires claimant Aadhaar/Voter ID matching the registered next of kin records, co-signed by the on-site Camp Magistrate.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : c.status === 'POSSIBLE_MATCH' ? (
              <div className="p-6 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Potential Algorithmic Candidate Under Review
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Our weighted matching engine has flagged a high-similarity candidate record matching key physical clues. Coordinators are currently auditing evidence side-by-side.
                </p>
                {canReview ? (
                  <Link to="/review">
                    <Button
                      variant="brand"
                      size="sm"
                      leftIcon={<ShieldCheck className="w-4 h-4" />}
                      className="shadow-sm"
                    >
                      Open Match Reviewer Audit
                    </Button>
                  </Link>
                ) : isFamily ? (
                  <div className="p-4 bg-white rounded-xl border border-amber-200/80 text-xs space-y-2 shadow-xs">
                    <div className="font-semibold text-slate-900">Status of Verification:</div>
                    <p className="text-slate-600 leading-relaxed">
                      A trained humanitarian reviewer is actively verifying the physical clues with shelter officers. You will be notified immediately when identity verification is complete.
                    </p>
                    <Link to={`/cases/${c.id}/status`}>
                      <Button variant="brand" size="sm" leftIcon={<Heart className="w-4 h-4" />} className="shadow-sm">
                        Open Family Status Tracker
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="p-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2 text-xs text-slate-600">
                <div className="font-semibold text-slate-900 text-sm">Active Algorithmic Sweep</div>
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
