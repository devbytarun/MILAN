import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLocalCases, FullCaseData } from '../services/caseService.ts';
import {
  MapPin,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<FullCaseData | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTRIBUTES' | 'RECONCILIATION'>('OVERVIEW');

  useEffect(() => {
    const all = getLocalCases();
    const found = all.find((c) => c.case.id === id || c.case.case_uid === id);
    if (found) {
      setCaseData(found);
    }
  }, [id]);

  if (!caseData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Case Record Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested case identifier does not exist in the active shelter registry.
        </p>
        <Link
          to="/cases"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cases Registry
        </Link>
      </div>
    );
  }

  const { case: c, report: r, attributes: a } = caseData;

  const statusColors = {
    SUBMITTED: 'bg-slate-100 text-slate-700 border-slate-200',
    SEARCHING: 'bg-blue-100 text-blue-800 border-blue-200',
    NO_CANDIDATE: 'bg-slate-100 text-slate-700 border-slate-200',
    POSSIBLE_MATCH: 'bg-amber-100 text-amber-800 border-amber-200',
    UNDER_REVIEW: 'bg-purple-100 text-purple-800 border-purple-200',
    VERIFIED_MATCH: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    MATCH_REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
    MORE_INFO_NEEDED: 'bg-amber-100 text-amber-800 border-amber-200',
    CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
    ARCHIVED: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const timelineSteps = [
    {
      title: 'Report Registered in MILAN',
      date: new Date(c.created_at).toLocaleDateString(),
      desc: `Case created with UID ${c.case_uid} by ${r.source_type} intake channel.`,
      done: true,
    },
    {
      title: 'Distributed to Field Shelters',
      date: 'Automatic Broadcast',
      desc: 'Physical attributes distributed across all emergency relief nodes.',
      done: true,
    },
    {
      title: 'Multi-Attribute Matching',
      date: 'Continuous Pipeline',
      desc: c.status === 'POSSIBLE_MATCH' || c.status === 'VERIFIED_MATCH'
        ? 'High-confidence candidate surfaced through weighted algorithm.'
        : 'Algorithmic cross-referencing against rescue shelter intakes active.',
      done: c.status === 'POSSIBLE_MATCH' || c.status === 'VERIFIED_MATCH',
    },
    {
      title: 'Coordinator Human Verification',
      date: c.status === 'VERIFIED_MATCH' ? 'Audit Verified' : 'Pending',
      desc: c.status === 'VERIFIED_MATCH'
        ? 'Relief coordinator reviewed physical scar and clothing evidence.'
        : 'Awaiting candidate discovery or reviewer verification decision.',
      done: c.status === 'VERIFIED_MATCH',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <Link
          to={`/cases/${c.id}/status`}
          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" /> Family Status Timeline View
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                  c.case_type === 'MISSING'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {c.case_type} PERSON CASE
              </span>
              <span className="font-mono text-xs font-bold text-slate-400">
                {c.case_uid}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mt-2">
              {a.full_name || (c.case_type === 'FOUND' ? 'Unidentified Survivor' : 'Name Withheld')}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Reported by {r.source_type}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {r.found_location || 'Location not recorded'}
              </span>
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 ${
                statusColors[c.status] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {c.status === 'VERIFIED_MATCH' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600" />
              )}
              {c.status}
            </span>
            <span className="text-[10px] text-slate-400">
              Updated {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'OVERVIEW'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Case Overview
          </button>
          <button
            onClick={() => setActiveTab('ATTRIBUTES')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'ATTRIBUTES'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Physical & Observable Attributes
          </button>
          <button
            onClick={() => setActiveTab('RECONCILIATION')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'RECONCILIATION'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Reconciliation & Shelter Info
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-500 font-medium">Age & Demographics</div>
                <div className="font-bold text-slate-900 text-sm">
                  {a.age || a.approximate_age || 'Unknown'} Years • {a.gender || 'Not specified'}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Blood Group: <strong>{a.blood_group || 'Unknown'}</strong>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-500 font-medium">Reporting Channel</div>
                <div className="font-bold text-slate-900 text-sm">
                  {r.source_type} Intake
                </div>
                <div className="text-slate-500 text-[11px]">
                  Communication Status: <strong>{r.comm_status || 'Unknown'}</strong>
                </div>
              </div>
            </div>

            {/* Notes */}
            {r.report_notes && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-700">Intake Notes:</div>
                <p className="text-slate-600 leading-relaxed">{r.report_notes}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900">Case Reconciliation Milestones</h3>
              <div className="space-y-4 pl-2 border-l-2 border-slate-200">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div
                      className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        step.done ? 'border-emerald-500' : 'border-slate-300'
                      }`}
                    >
                      {step.done && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{step.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTRIBUTES */}
        {activeTab === 'ATTRIBUTES' && (
          <div className="space-y-4 text-xs">
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="grid grid-cols-3 p-3 bg-slate-50 font-semibold text-slate-700">
                <div>Feature</div>
                <div className="col-span-2">Recorded Attributes</div>
              </div>
              <div className="grid grid-cols-3 p-3">
                <div className="font-medium text-slate-500">Alternative Names</div>
                <div className="col-span-2 text-slate-900">{a.alternative_names || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3">
                <div className="font-medium text-slate-500">Height & Weight</div>
                <div className="col-span-2 text-slate-900">
                  {a.height_cm ? `${a.height_cm} cm` : '—'} • {a.weight_kg ? `${a.weight_kg} kg` : '—'} (Build: {a.build || '—'})
                </div>
              </div>
              <div className="grid grid-cols-3 p-3">
                <div className="font-medium text-slate-500">Hair & Eyes</div>
                <div className="col-span-2 text-slate-900">
                  Hair: {a.hair_colour || '—'} ({a.hair_description || '—'}), Eyes: {a.eye_colour || '—'}
                </div>
              </div>
              <div className="grid grid-cols-3 p-3">
                <div className="font-medium text-slate-500">Clothing Recorded</div>
                <div className="col-span-2 text-slate-900">{a.clothing || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3">
                <div className="font-medium text-slate-500">Footwear</div>
                <div className="col-span-2 text-slate-900">{a.footwear || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3">
                <div className="font-medium text-slate-500">Accessories / Threads</div>
                <div className="col-span-2 text-slate-900">{a.accessories || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3">
                <div className="font-medium text-slate-500">Scars & Marks</div>
                <div className="col-span-2 text-slate-900 font-semibold text-blue-900">{a.scars || 'None recorded'}</div>
              </div>
              <div className="grid grid-cols-3 p-3">
                <div className="font-medium text-slate-500">Birthmarks & Tattoos</div>
                <div className="col-span-2 text-slate-900">{a.birthmarks || a.tattoos || 'None recorded'}</div>
              </div>
              <div className="grid grid-cols-3 p-3 bg-amber-50/50">
                <div className="font-bold text-amber-900">Key Distinguishing Clue</div>
                <div className="col-span-2 font-bold text-amber-900">{a.identifying_clue || 'None'}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECONCILIATION */}
        {activeTab === 'RECONCILIATION' && (
          <div className="space-y-6">
            {c.status === 'VERIFIED_MATCH' ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-base">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  Verified Positive Match Confirmed
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Relief coordinators have audited the evidence and verified that this case matches active rescue intake records. The person is safe and accounted for in the relief shelter network.
                </p>

                <div className="p-4 bg-white border border-emerald-200 rounded-xl space-y-2 text-xs text-slate-800">
                  <div className="font-bold text-emerald-800 text-sm">Designated Reunion Location:</div>
                  <div><strong>Shelter Camp:</strong> Camp Relief Zone 2 (NDRF Battalion 4 Intake)</div>
                  <div><strong>Designated Coordinator:</strong> Major Vikram Rathore</div>
                  <div><strong>Helpline Verification PIN:</strong> <span className="font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">{c.case_uid}</span></div>
                  <div><strong>Emergency Desk Contact:</strong> +91 98765 43210 (24/7 Disaster Helpline)</div>
                </div>
              </div>
            ) : c.status === 'POSSIBLE_MATCH' ? (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2.5 text-amber-800 font-bold text-base">
                  <Clock className="w-6 h-6 text-amber-600" />
                  Potential Algorithmic Candidate Under Review
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Our weighted matching engine has flagged a high-similarity candidate record matching key physical clues (surgical scar & sacred thread). Coordinators are currently auditing evidence side-by-side.
                </p>
                <Link
                  to="/review"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition"
                >
                  <ShieldCheck className="w-4 h-4" /> Open Match Reviewer Audit
                </Link>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs text-slate-600">
                <div className="font-bold text-slate-800 text-sm">Active Algorithmic Sweep</div>
                <p>
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
