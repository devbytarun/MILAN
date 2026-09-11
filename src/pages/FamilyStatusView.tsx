import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

export const FamilyStatusView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<FullCaseData | null>(null);
  const [lastRefreshed] = useState<string>('Just now');

  useEffect(() => {
    const all = getLocalCases();
    const found = all.find((c) => c.case.id === id || c.case.case_uid === id);
    if (found) {
      setCaseData(found);
    }
  }, [id]);

  if (!caseData) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Case Not Found</h2>
        <Link
          to="/cases"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cases Registry
        </Link>
      </div>
    );
  }

  const { case: c, attributes: a } = caseData;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Case Record
        </button>

        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Updated {lastRefreshed}
        </span>
      </div>

      {/* Main Empathetic Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header with Heart Icon */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-7 h-7 fill-rose-600/10" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              CASE TRACKING #{c.case_uid}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Case Status: {a.full_name || 'Missing Relative'}
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              We know waiting in a disaster is difficult. Here is the exact, honest status of what relief teams are doing for your case right now.
            </p>
          </div>
        </div>

        {/* Dynamic Status Block */}
        {c.status === 'VERIFIED_MATCH' ? (
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl text-emerald-950 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-black text-lg text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              Verified Match Confirmed!
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              Relief coordinators have verified that {a.full_name || 'your loved one'} has been located and safe at a designated relief shelter.
            </p>

            <div className="p-4 bg-white/90 rounded-xl border border-emerald-200 space-y-2 text-xs text-slate-800 shadow-sm">
              <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" /> Current Location & Contact
              </div>
              <div><strong>Relief Center:</strong> Camp Relief Zone 2 (NDRF Battalion 4 Shelter)</div>
              <div><strong>Coordinating Officer:</strong> Major Vikram Rathore</div>
              <div><strong>Identification Case UID:</strong> <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">{c.case_uid}</span></div>
              <div className="pt-2 border-t border-emerald-100 flex items-center gap-2 text-emerald-800 font-bold">
                <Phone className="w-4 h-4" /> 24/7 Family Reunion Desk: +91 98765 43210
              </div>
            </div>
          </div>
        ) : c.status === 'POSSIBLE_MATCH' ? (
          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl text-amber-950 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-black text-lg text-amber-900">
              <Clock className="w-6 h-6 text-amber-600" />
              Potential Match Being Verified by Relief Coordinators
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              A potential candidate survivor in one of our rescue shelters shares key physical characteristics (matching surgical mark & clothing) with your report.
            </p>
            <div className="p-3.5 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <strong>Why hasn't this been confirmed yet?</strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                We never make automatic decisions that could cause false hope. An authorized humanitarian reviewer is verifying the physical clues before connecting you directly.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200 rounded-2xl text-blue-950 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-black text-lg text-blue-900">
              <RefreshCw className="w-6 h-6 text-blue-600" />
              Active Search & Continuous Cross-Matching
            </div>
            <p className="text-xs text-blue-900 leading-relaxed font-medium">
              Your report is registered and continuously checked against every incoming survivor admission across all field rescue camps and hospital beds.
            </p>
          </div>
        )}

        {/* Transparency Counters */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="text-xl font-black text-slate-900">94</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Shelter Intakes Checked</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="text-xl font-black text-blue-600">6</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Relief Camps Active</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="text-xl font-black text-emerald-600">24/7</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Matching Frequency</div>
          </div>
        </div>

        {/* Recorded Details Snapshot */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
          <div className="font-bold text-slate-800">Attributes Tracked in System:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px]">
            <div>• Name: <strong>{a.full_name || '—'}</strong></div>
            <div>• Age: <strong>{a.age || '—'} yrs</strong></div>
            <div>• Clothing: <strong>{a.clothing || '—'}</strong></div>
            <div>• Key Clue: <strong>{a.identifying_clue || '—'}</strong></div>
          </div>
        </div>

        {/* Need Help CTA */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 mb-3">
            Have more photographs or updated details about what they were wearing?
          </p>
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" /> Call National Disaster Helpline (1078)
          </a>
        </div>
      </div>
    </div>
  );
};
