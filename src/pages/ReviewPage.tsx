import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export const ReviewPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-indigo-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 uppercase">
                Human-in-the-Loop Audit Queue
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Match Candidate Review Queue</h1>
            </div>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Pending Review: <strong className="text-indigo-600">3 Candidates</strong>
          </div>
        </div>

        {/* Demo Candidate Card Preview */}
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700">PAIR #MC-2026-081</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  CONFIDENCE: HIGH (84%)
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Source: <strong className="text-slate-800">MILAN-2026-081 (Missing)</strong> vs Candidate: <strong className="text-slate-800">MILAN-2026-094 (Found)</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verify Match
              </button>
              <button className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 transition flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="font-semibold text-slate-800">Evidence Summary:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>• <strong>Age match:</strong> Reported 9 years old vs Observed 8-10 years.</div>
              <div>• <strong>Location proximity:</strong> 2.4 km from last known sighting.</div>
              <div>• <strong>Physical marks:</strong> Distinct scar on left forearm matches reported clue.</div>
              <div>• <strong>Clothing:</strong> Red collared polo shirt verified by NDRF intake.</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong>Phase 3 Matching & Review Engine Ready:</strong> Side-by-side interactive comparison module and live PostgreSQL RPC matching connections will be activated in Phase 3.
          </div>
        </div>
      </div>
    </div>
  );
};
