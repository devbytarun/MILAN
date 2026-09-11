import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, PhoneCall, AlertTriangle, Radio } from 'lucide-react';
import { useI18n } from '../../context/I18nContext.tsx';
import { LanguageSwitcher } from '../common/LanguageSwitcher.tsx';

export const Footer: React.FC = () => {
  const location = useLocation();
  const { t } = useI18n();
  const isCinematic = location.pathname === '/';

  return (
    <footer
      className={`mt-auto transition-colors duration-200 ${
        isCinematic
          ? 'bg-slate-950 text-slate-400 border-t border-slate-800'
          : 'bg-white text-slate-600 border-t border-slate-200'
      } py-12 sm:py-16`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className={`font-display text-xl font-black tracking-wider uppercase ${
                isCinematic ? 'text-white' : 'text-primary'
              }`}>
                MILAN
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                DISASTER GRID
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              National disaster reconciliation connecting family missing-person reports, field rescue camps, and hospital emergency triage through explainable attribute matching and mandatory human evidence verification.
            </p>
            <div className="flex items-center gap-2 text-xs pt-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Zero automated reunion confirmations — 100% human signed.</span>
            </div>
          </div>

          {/* Emergency Hotlines Desk */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
              National Emergency Desks
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">NDRF Control Room</span>
                <span className="font-mono font-bold text-rose-600">1078</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">National Emergency</span>
                <span className="font-mono font-bold text-rose-600">112</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Medical Ambulance</span>
                <span className="font-mono font-bold text-emerald-600">108</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Childline Distress</span>
                <span className="font-mono font-bold text-blue-600">1098</span>
              </div>
            </div>
          </div>

          {/* Operational Protocols */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Operational Nodes
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Distressed Relatives:</strong> Multi-lingual intake with voice assistance.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Field Rescue Units:</strong> Offline-first reporting with VHF radio transcript parser.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Medical Centers:</strong> Triage condition tracking and trauma ward registries.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Relief Reviewers:</strong> Forensic side-by-side audit and anti-trafficking checkpoints.
              </li>
            </ul>
          </div>

          {/* Regional Multilingual Access */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-500" />
              Regional Language Access
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              MILAN supports 13 Official Scheduled Indian Languages with full RTL support for crisis field operations.
            </p>
            <div className="pt-1">
              <LanguageSwitcher variant="footer" />
            </div>
            <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-[11px] text-amber-900 leading-tight flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {t('emergency_notice_desc')}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Transparency Disclosure */}
        <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-3 ${
          isCinematic ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'
        }`}>
          <div>
            © {new Date().getFullYear()} MILAN National Disaster Coordination Platform. [SIMULATED DRILL / DEMO DATA IN SANDBOX MODE].
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              PROTOCOL v1.2-ALPHA
            </span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              NDMA / CDAC Operational Alignment
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
