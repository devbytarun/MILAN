import React from 'react';
import { Users, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FamilyReportPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-emerald-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
          <Users className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
            Family Reporting Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">File Missing Person Report</h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            This module guides families through a 6-step questionnaire capturing basic identity, physical appearance, clothing, birthmarks, and distinguishing personal clues.
          </p>
        </div>

        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-left text-xs text-emerald-900 space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Ready for Phase 2 Implementation
          </div>
          <p>
            The 6-step form architecture (`Identity` $\rightarrow$ `Appearance` $\rightarrow$ `Clothing` $\rightarrow$ `Last-Known` $\rightarrow$ `Photo` $\rightarrow$ `Distinguishing Clue`) is scaffolded and ready for component wiring in Phase 2.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-500 transition shadow-sm"
        >
          Return to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
