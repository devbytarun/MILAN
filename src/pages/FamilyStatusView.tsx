import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLocalCases, FullCaseData } from '../services/caseService.ts';
import {
  Heart,
  Clock,
  CheckCircle2,
  Phone,
  ArrowLeft,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';

export const FamilyStatusView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const caseData: FullCaseData | null = React.useMemo(() => {
    const all = getLocalCases();
    return all.find((c) => c.case.id === id || c.case.case_uid === id) || null;
  }, [id]);

  if (!caseData) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200/90 rounded-2xl text-center space-y-4 shadow-card">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Case Not Found</h2>
        <p className="text-xs text-slate-600">
          The requested case identifier does not exist in the active shelter registry.
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

  const { case: c, attributes: a } = caseData;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Case Record
        </Button>

        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
          <Clock className="w-3.5 h-3.5" /> Updated Live
        </span>
      </div>

      {/* Main Empathetic Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-card space-y-8">
        {/* Header with Heart Icon */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto border border-orange-200/60 shadow-xs">
            <Heart className="w-5 h-5 fill-orange-600/10 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80">
                CASE #{c.case_uid}
              </span>
              <Badge variant={c.status === 'VERIFIED_MATCH' ? 'verified' : c.status === 'POSSIBLE_MATCH' ? 'pending' : 'shade'} size="sm">
                {c.status.replace('_', ' ')}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Case Status: {a.full_name || 'Missing Relative'}
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-1.5 leading-relaxed">
              We know waiting in a disaster is difficult. Here is the exact, honest status of what relief teams are doing for your case right now.
            </p>
          </div>
        </div>

        {/* Dynamic Status Block */}
        {c.status === 'VERIFIED_MATCH' ? (
          <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 space-y-4">
            <div className="flex items-center gap-2 font-bold text-base text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Verified Match Confirmed!
            </div>
            <p className="text-xs leading-relaxed text-emerald-700">
              Relief coordinators have verified that {a.full_name || 'your loved one'} has been located and safe at a designated relief shelter.
            </p>

            <div className="p-4 bg-white rounded-xl border border-emerald-200/80 space-y-2 text-xs text-slate-900 shadow-xs">
              <div className="font-bold text-sm flex items-center gap-1.5 text-slate-900">
                <MapPin className="w-4 h-4 text-emerald-600" /> Current Location & Contact
              </div>
              <div><strong>Relief Center:</strong> Camp Relief Zone 2 (NDRF Battalion 4 Shelter)</div>
              <div><strong>Coordinating Officer:</strong> Major Vikram Rathore</div>
              <div><strong>Case Tracking UID:</strong> <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-900">{c.case_uid}</span></div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-emerald-700 font-semibold">
                <Phone className="w-4 h-4" /> 24/7 Family Reunion Desk: +91 98765 43210
              </div>
            </div>
          </div>
        ) : c.status === 'POSSIBLE_MATCH' ? (
          <div className="p-6 bg-amber-50/80 border border-amber-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2 font-bold text-base text-amber-900">
              <Clock className="w-5 h-5 text-amber-600" />
              Potential Match Being Verified by Relief Coordinators
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              A potential candidate survivor in one of our rescue shelters shares key physical characteristics with your report.
            </p>
            <div className="p-4 bg-white rounded-xl border border-amber-200/80 text-xs space-y-1 shadow-xs">
              <strong className="text-slate-900 font-semibold">Why hasn't this been confirmed yet?</strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never make automatic decisions that could cause false hope. An authorized humanitarian reviewer is verifying the physical clues before connecting you directly.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-base text-slate-900">
              <RefreshCw className="w-4 h-4 text-slate-600" />
              Active Search & Continuous Cross-Matching
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your report is registered and continuously checked against every incoming survivor admission across all field rescue camps and hospital beds.
            </p>
          </div>
        )}

        {/* Transparency Counters */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl">
            <div className="text-2xl font-bold tracking-tight text-slate-900">94</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Shelter Intakes Checked</div>
          </div>
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl">
            <div className="text-2xl font-bold tracking-tight text-slate-900">6</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Relief Camps Active</div>
          </div>
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl">
            <div className="text-2xl font-bold tracking-tight text-slate-900">24/7</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Matching Frequency</div>
          </div>
        </div>

        {/* Recorded Details Snapshot */}
        <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs space-y-2">
          <div className="font-semibold text-slate-900">Attributes Tracked in System:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-xs">
            <div>• Name: <strong className="text-slate-900 font-medium">{a.full_name || '—'}</strong></div>
            <div>• Age: <strong className="text-slate-900 font-medium">{a.age || '—'} yrs</strong></div>
            <div>• Clothing: <strong className="text-slate-900 font-medium">{a.clothing || '—'}</strong></div>
            <div>• Key Clue: <strong className="text-slate-900 font-medium">{a.identifying_clue || '—'}</strong></div>
          </div>
        </div>

        {/* Need Help CTA */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-600 mb-3">
            Have more photographs or updated details about what they were wearing?
          </p>
          <a
            href="tel:1078"
            className="inline-flex items-center gap-2"
          >
            <Button
              variant="brand"
              size="md"
              leftIcon={<Phone className="w-4 h-4" />}
              className="shadow-sm"
            >
              Call National Disaster Helpline (1078)
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
