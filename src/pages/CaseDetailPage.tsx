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
  Dna,
  Upload,
  Download,
  FileCheck,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { evaluateChildSafeguards } from '../lib/anti-trafficking.ts';
import { canViewField } from '../lib/permissions.ts';
import { formatIndianPhoneNumber } from '../lib/phoneValidation.ts';
import {
  getDnaReportsForCase,
  uploadDnaReport,
  getDnaReportDownloadUrl,
  canUploadDnaReport,
  canViewDnaReport,
  DnaReport,
} from '../services/dnaReportService.ts';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const caseData: FullCaseData | null = React.useMemo(() => {
    const all = getLocalCases();
    return all.find((c) => c.case.id === id || c.case.case_uid === id) || null;
  }, [id]);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTRIBUTES' | 'RECONCILIATION' | 'DNA'>('OVERVIEW');
  const [dnaReports, setDnaReports] = useState<DnaReport[]>([]);
  const [dnaLoading, setDnaLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  const canViewDna = canViewDnaReport(profile?.role);
  const caseId = caseData?.case?.id;

  // Load DNA reports for case if authorized
  React.useEffect(() => {
    if (caseId && canViewDna) {
      setDnaLoading(true);
      getDnaReportsForCase(caseId)
        .then((reports) => setDnaReports(reports))
        .finally(() => setDnaLoading(false));
    }
  }, [caseId, canViewDna]);

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

  const canViewContact = canViewField(profile?.role, 'contact', isOwner);
  const canUploadDna = canUploadDnaReport(profile?.role);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadErrorMsg('Please select a DNA report file to upload.');
      return;
    }

    setUploading(true);
    setUploadErrorMsg(null);

    const res = await uploadDnaReport({
      caseId: c.id,
      file: selectedFile,
      uploaderId: profile?.id || null,
      uploaderName: profile?.full_name || profile?.organization_name || 'Hospital Triage Team',
      uploaderRole: profile?.role || 'HOSPITAL',
      notes: uploadNotes,
    });

    setUploading(false);

    if (res.success && res.report) {
      setDnaReports((prev) => [res.report!, ...prev.filter((r) => r.id !== res.report!.id)]);
      setUploadSuccessMsg(`✓ DNA report uploaded successfully: ${res.report.file_name}`);
      setSelectedFile(null);
      setUploadNotes('');
      setUploadModalOpen(false);
    } else {
      setUploadErrorMsg(res.error || 'Failed to upload DNA report.');
    }
  };

  const handleDownload = async (report: DnaReport) => {
    const url = await getDnaReportDownloadUrl(report);
    window.open(url, '_blank');
  };

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

        {/* Responder Family Contact Card */}
        {canViewContact && c.family_contact_phone && (
          <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Family Contact (Authorized Responders Only)
              </div>
              <div className="text-xl font-mono font-bold text-slate-900 tracking-wide flex items-center gap-2">
                📞 {formatIndianPhoneNumber(c.family_contact_phone)}
              </div>
              <p className="text-xs text-slate-600">
                Primary emergency contact registered by family. Authorized responders may use this number to coordinate family communication.
              </p>
            </div>
            <a
              href={`tel:${c.family_contact_phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Phone className="w-3.5 h-3.5" /> Contact Family
            </a>
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
          {canViewDna && (
            <button
              onClick={() => setActiveTab('DNA')}
              className={`pb-3 border-b-2 transition-colors duration-150 flex items-center gap-1.5 ${
                activeTab === 'DNA'
                  ? 'border-indigo-600 text-indigo-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Dna className="w-3.5 h-3.5" />
              <span>DNA Reports</span>
              {dnaReports.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-full font-bold">
                  {dnaReports.length}
                </span>
              )}
            </button>
          )}
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

            {/* DNA Report Quick Card — visible on OVERVIEW for authorized roles */}
            {canViewDna && (
              <div className="p-4 sm:p-5 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-indigo-100 border border-indigo-300 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                      <Dna className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Forensic DNA Reports</h4>
                      <p className="text-[11px] text-slate-500">
                        {dnaLoading
                          ? 'Loading...'
                          : dnaReports.length === 0
                          ? 'No DNA reports attached to this case'
                          : `${dnaReports.length} report${dnaReports.length > 1 ? 's' : ''} on file`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {dnaReports.length > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          dnaReports[0].status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : dnaReports[0].status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {dnaReports[0].status}
                      </span>
                    )}

                    {canUploadDna && (
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => {
                          setActiveTab('DNA');
                          setUploadModalOpen(true);
                        }}
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                        className="shadow-sm"
                      >
                        Upload DNA Report
                      </Button>
                    )}

                    {dnaReports.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('DNA')}
                        className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline underline-offset-2"
                      >
                        View All →
                      </button>
                    )}
                  </div>
                </div>

                {/* Show first DNA report name if exists */}
                {dnaReports.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-white/60 rounded-lg p-2.5 border border-indigo-100">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-medium truncate">{dnaReports[0].file_name}</span>
                    <span className="text-slate-400 shrink-0">•</span>
                    <span className="text-slate-500 shrink-0">
                      {new Date(dnaReports[0].uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
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

        {/* TAB 4: DNA REPORTS */}
        {activeTab === 'DNA' && canViewDna && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Dna className="w-4 h-4 text-indigo-600" /> Official Forensic DNA Reports
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official hospital lab reference documentation and buccal swab records. (Candidate evidence only; MILAN does not perform automated sequencing).
                </p>
              </div>

              {canUploadDna && (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setUploadModalOpen(true)}
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                  className="shadow-sm"
                >
                  Upload DNA Report
                </Button>
              )}
            </div>

            {uploadSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadSuccessMsg(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Upload Modal / Form */}
            {uploadModalOpen && (
              <div className="p-6 bg-slate-50 border border-indigo-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-600" /> Attach Official Hospital DNA Report
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadModalOpen(false);
                      setUploadErrorMsg(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Report Document (PDF, JPG, JPEG, PNG • Max 15 MB) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedFile(file);
                      }}
                      className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-300 rounded-lg p-1 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lab / Specimen Intake Notes
                    </label>
                    <textarea
                      rows={2}
                      value={uploadNotes}
                      onChange={(e) => setUploadNotes(e.target.value)}
                      placeholder="e.g. Reference buccal swab specimen collected from maternal aunt at Disaster Triage Desk."
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  {uploadErrorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadErrorMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setUploadModalOpen(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="brand"
                      size="sm"
                      disabled={uploading || !selectedFile}
                    >
                      {uploading ? 'Attaching Report...' : 'Attach DNA Report'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* List of DNA Reports */}
            {dnaLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading DNA documentation...</div>
            ) : dnaReports.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-2">
                <Dna className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-800">No DNA Reports Attached</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No official forensic laboratory reports have been attached to this case. Authorized HOSPITAL personnel may upload reference documentation when face recognition is inconclusive.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dnaReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-card space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{report.file_name}</div>
                          <div className="text-[11px] text-slate-500">
                            Uploaded by <strong className="text-slate-700">{report.uploader_name || 'Hospital Authority'}</strong> ({report.uploader_role || 'HOSPITAL'}) • {new Date(report.uploaded_at).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                            report.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : report.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          Status: {report.status}
                        </span>
                      </div>
                    </div>

                    {report.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <strong className="text-slate-800">Lab Notes:</strong> {report.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {report.file_size ? `${(report.file_size / 1024).toFixed(0)} KB` : 'Attached Document'}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(report)}
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                      >
                        Open / Download Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Forensic evidence note */}
            <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-xl text-xs text-indigo-950 leading-relaxed">
              <strong>Forensic Chain-of-Custody Notice:</strong> DNA reports stored in MILAN are official reference documents securely associated with case files for cross-verification. MILAN does not perform automated genetic sequencing or statistical probability algorithms. Final verification requires authorized forensic coordinator sign-off.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
