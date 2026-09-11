import React from 'react';
import { Building2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FoundReportPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
            NGO & Army Field Rescue Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Register Found / Rescued Person</h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            Branching field intake form for camp shelters: seamlessly captures self-reported identity or observational attributes for non-communicative/unidentified survivors.
          </p>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-left text-xs text-blue-900 space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Ready for Phase 2 Implementation
          </div>
          <p>
            Supports `can_communicate: YES / NO / UNKNOWN` branches with observation-based physical features, scars, tattoos, and shelter intake coordinates.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-500 transition shadow-sm"
        >
          Return to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
