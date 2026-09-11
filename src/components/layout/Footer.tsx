import React from 'react';
import { ShieldCheck, HeartHandshake, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-auto text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              MILAN COORDINATION SYSTEM
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Disaster-time information reconciliation platform connecting family missing reports with field rescue and hospital intakes via multi-attribute deterministic matching.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>All candidate matches require human review verification.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Operational Roles
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• <strong className="text-slate-300">Family:</strong> Submit missing person details & track case timeline.</li>
              <li>• <strong className="text-slate-300">NGO & Army:</strong> Field intake for rescued persons (communicative & non-communicative).</li>
              <li>• <strong className="text-slate-300">Hospitals:</strong> Medical intake and condition tracking with privacy locks.</li>
              <li>• <strong className="text-slate-300">Reviewers:</strong> Verify and audit algorithmic candidate matches.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Important Disclaimer
            </h4>
            <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs leading-relaxed text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                Emergency Notice
              </div>
              <p className="text-[11px] text-slate-400">
                MILAN does not replace national emergency distress response services. In imminent life-safety emergencies, immediately contact local first responders and designated relief numbers.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            © {new Date().getFullYear()} MILAN Disaster Information Network. Built for disaster resilience.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Version 0.1.0-alpha</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" /> Community Supported
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
