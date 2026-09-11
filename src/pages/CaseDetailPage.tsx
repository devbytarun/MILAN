import React, { useState } from 'react';
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
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const caseData: FullCaseData | null = React.useMemo(() => {
    const all = getLocalCases();
    return all.find((c) => c.case.id === id || c.case.case_uid === id) || null;
  }, [id]);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTRIBUTES' | 'RECONCILIATION'>('OVERVIEW');

  if (!caseData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-canvas-light border border-hairline-light rounded-lg text-center space-y-4 shadow-elevation-3">
        <h2 className="type-heading-lg text-ink">Case Record Not Found</h2>
        <p className="type-caption text-shade-50">
          The requested case identifier does not exist in the active shelter registry.
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

  const { case: c, report: r, attributes: a } = caseData;

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
      desc: 'Physical identifiers distributed across all emergency shelter nodes.',
      done: true,
    },
    {
      title: 'Multi-Attribute Algorithmic Sweep',
      date: 'Continuous Pipeline',
      desc: c.status === 'POSSIBLE_MATCH' || c.status === 'VERIFIED_MATCH'
        ? 'High-confidence candidate surfaced through weighted similarity scoring.'
        : 'Algorithmic cross-referencing against rescue shelter intakes active.',
      done: c.status === 'POSSIBLE_MATCH' || c.status === 'VERIFIED_MATCH',
    },
    {
      title: 'Coordinator Verification Decision',
      date: c.status === 'VERIFIED_MATCH' ? 'Audit Verified' : 'Pending',
      desc: c.status === 'VERIFIED_MATCH'
        ? 'Relief coordinator reviewed physical scar and clothing evidence.'
        : 'Awaiting candidate discovery or reviewer verification decision.',
      done: c.status === 'VERIFIED_MATCH',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        <Link to={`/cases/${c.id}/status`}>
          <Button
            variant="aloe"
            size="sm"
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            Family Status View
          </Button>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 sm:p-8 shadow-elevation-3 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline-light pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge variant={c.case_type === 'MISSING' ? 'shade' : 'mint'} size="sm">
                {c.case_type} PERSON CASE
              </Badge>
              <span className="font-mono text-xs font-bold text-shade-50">
                {c.case_uid}
              </span>
            </div>
            <h1 className="type-display-md text-ink">
              {a.full_name || (c.case_type === 'FOUND' ? 'Unidentified Survivor' : 'Name Withheld')}
            </h1>
            <p className="type-caption text-shade-50 flex items-center gap-2">
              <span>Reported by {r.source_type}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-shade-40" /> {r.found_location || 'Location not recorded'}
              </span>
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5">
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
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )
              }
            >
              {c.status}
            </Badge>
            <span className="text-[10px] text-shade-40">
              Updated {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-hairline-light gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-3 border-b-2 transition-colors duration-150 ${
              activeTab === 'OVERVIEW'
                ? 'border-ink text-ink font-bold'
                : 'border-transparent text-shade-50 hover:text-ink'
            }`}
          >
            Case Overview
          </button>
          <button
            onClick={() => setActiveTab('ATTRIBUTES')}
            className={`pb-3 border-b-2 transition-colors duration-150 ${
              activeTab === 'ATTRIBUTES'
                ? 'border-ink text-ink font-bold'
                : 'border-transparent text-shade-50 hover:text-ink'
            }`}
          >
            Physical Attributes
          </button>
          <button
            onClick={() => setActiveTab('RECONCILIATION')}
            className={`pb-3 border-b-2 transition-colors duration-150 ${
              activeTab === 'RECONCILIATION'
                ? 'border-ink text-ink font-bold'
                : 'border-transparent text-shade-50 hover:text-ink'
            }`}
          >
            Reconciliation & Shelter Info
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-canvas-cream border border-hairline-light rounded-md space-y-1">
                <div className="text-shade-50 font-medium">Age & Demographics</div>
                <div className="font-bold text-ink text-sm">
                  {a.age || a.approximate_age || 'Unknown'} Years • {a.gender || 'Not specified'}
                </div>
                <div className="text-shade-60 type-caption">
                  Blood Group: <strong className="text-ink">{a.blood_group || 'Unknown'}</strong>
                </div>
              </div>

              <div className="p-4 bg-canvas-cream border border-hairline-light rounded-md space-y-1">
                <div className="text-shade-50 font-medium">Reporting Channel</div>
                <div className="font-bold text-ink text-sm">
                  {r.source_type} Intake
                </div>
                <div className="text-shade-60 type-caption">
                  Communication Status: <strong className="text-ink">{r.comm_status || 'Unknown'}</strong>
                </div>
              </div>
            </div>

            {/* Notes */}
            {r.report_notes && (
              <div className="p-4 bg-canvas-cream border border-hairline-light rounded-md text-xs space-y-1">
                <div className="font-bold text-ink">Intake Notes:</div>
                <p className="type-caption text-shade-60 leading-relaxed">{r.report_notes}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="type-heading-md text-ink">Case Reconciliation Milestones</h3>
              <div className="space-y-4 pl-2 border-l-2 border-hairline-light">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div
                      className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-pill border-2 bg-canvas-light flex items-center justify-center ${
                        step.done ? 'border-ink' : 'border-shade-40'
                      }`}
                    >
                      {step.done && <span className="w-2 h-2 rounded-pill bg-ink"></span>}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${step.done ? 'text-ink' : 'text-shade-40'}`}>
                        {step.title}
                      </span>
                      <span className="text-[10px] text-shade-40 font-medium">{step.date}</span>
                    </div>
                    <p className="type-caption text-shade-50 mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTRIBUTES */}
        {activeTab === 'ATTRIBUTES' && (
          <div className="space-y-4 text-xs">
            <div className="border border-hairline-light rounded-md overflow-hidden divide-y divide-hairline-light">
              <div className="grid grid-cols-3 p-3.5 bg-canvas-cream font-semibold text-shade-70">
                <div>Feature</div>
                <div className="col-span-2">Recorded Attributes</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-shade-50">Alternative Names</div>
                <div className="col-span-2 text-ink">{a.alternative_names || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-shade-50">Height & Weight</div>
                <div className="col-span-2 text-ink">
                  {a.height_cm ? `${a.height_cm} cm` : '—'} • {a.weight_kg ? `${a.weight_kg} kg` : '—'} (Build: {a.build || '—'})
                </div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-shade-50">Hair & Eyes</div>
                <div className="col-span-2 text-ink">
                  Hair: {a.hair_colour || '—'} ({a.hair_description || '—'}), Eyes: {a.eye_colour || '—'}
                </div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-shade-50">Clothing Recorded</div>
                <div className="col-span-2 text-ink">{a.clothing || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-shade-50">Footwear</div>
                <div className="col-span-2 text-ink">{a.footwear || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-shade-50">Accessories / Items</div>
                <div className="col-span-2 text-ink">{a.accessories || '—'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-shade-50">Scars & Marks</div>
                <div className="col-span-2 text-ink font-semibold">{a.scars || 'None recorded'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5">
                <div className="font-medium text-shade-50">Birthmarks & Tattoos</div>
                <div className="col-span-2 text-ink">{a.birthmarks || a.tattoos || 'None recorded'}</div>
              </div>
              <div className="grid grid-cols-3 p-3.5 bg-aloe/15">
                <div className="font-bold text-ink">Key Distinguishing Clue</div>
                <div className="col-span-2 font-bold text-ink">{a.identifying_clue || 'None'}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECONCILIATION */}
        {activeTab === 'RECONCILIATION' && (
          <div className="space-y-6">
            {c.status === 'VERIFIED_MATCH' ? (
              <div className="p-6 bg-aloe border border-aloe/60 rounded-md space-y-4">
                <div className="flex items-center gap-2.5 text-ink font-bold text-base">
                  <CheckCircle2 className="w-6 h-6 text-ink" />
                  Verified Positive Match Confirmed
                </div>
                <p className="type-caption text-ink leading-relaxed">
                  Relief coordinators have audited the evidence and verified that this case matches active rescue intake records. The person is safe and accounted for in the relief shelter network.
                </p>

                <div className="p-4 bg-canvas-light border border-hairline-light rounded-md space-y-2 text-xs text-ink">
                  <div className="font-bold text-ink text-sm">Designated Reunion Location:</div>
                  <div><strong>Shelter Camp:</strong> Camp Relief Zone 2 (NDRF Battalion 4 Intake)</div>
                  <div><strong>Designated Coordinator:</strong> Major Vikram Rathore</div>
                  <div><strong>Helpline Verification PIN:</strong> <span className="font-mono font-bold bg-shade-30 px-2 py-0.5 rounded text-ink">{c.case_uid}</span></div>
                  <div><strong>Emergency Desk Contact:</strong> +91 98765 43210 (24/7 Disaster Helpline)</div>
                </div>
              </div>
            ) : c.status === 'POSSIBLE_MATCH' ? (
              <div className="p-6 bg-canvas-cream border border-hairline-light rounded-md space-y-4">
                <div className="flex items-center gap-2.5 text-ink font-bold text-base">
                  <Clock className="w-6 h-6 text-amber-600" />
                  Potential Algorithmic Candidate Under Review
                </div>
                <p className="type-caption text-shade-60 leading-relaxed">
                  Our weighted matching engine has flagged a high-similarity candidate record matching key physical clues. Coordinators are currently auditing evidence side-by-side.
                </p>
                <Link to="/review">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Open Match Reviewer Audit
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-6 bg-canvas-cream border border-hairline-light rounded-md space-y-2 text-xs text-shade-60">
                <div className="font-bold text-ink text-sm">Active Algorithmic Sweep</div>
                <p className="type-caption">
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
