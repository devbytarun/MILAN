import React from 'react';
import { Stethoscope, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HospitalReportPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-purple-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto">
          <Stethoscope className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 uppercase">
            Clinical & Hospital Triage Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Hospital Medical Intake</h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            Secure clinical reporting for admitted patients. Links to existing Milan UIDs or creates new found cases with privacy-restricted medical observations.
          </p>
        </div>

        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-left text-xs text-purple-900 space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Ready for Phase 2 Implementation
          </div>
          <p>
            Enforces strict Role-Based Access Control: medical condition status and anatomical details remain visible only to authorized Hospital and Admin roles.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-xl text-sm hover:bg-purple-500 transition shadow-sm"
        >
          Return to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
