import React from 'react';
import { ShieldCheck, PhoneCall, AlertTriangle, Radio } from 'lucide-react';
import { useI18n } from '../../context/I18nContext.tsx';
import { LanguageSwitcher } from '../common/LanguageSwitcher.tsx';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="mt-auto bg-slate-50/80 text-slate-600 border-t border-slate-200/90 py-16 w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xl font-bold tracking-tight text-slate-900">
                MILAN
              </span>
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-sm">
                DISASTER GRID
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              {t('footer_tagline')}
            </p>
            <div className="flex items-center gap-2 text-xs pt-1 text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{t('footer_disclaimer')}</span>
            </div>
          </div>

          {/* Emergency Hotlines Desk */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-orange-600" />
              {t('footer_emergency_contacts')}
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                <span className="font-medium text-slate-900">NDRF Control Room</span>
                <span className="font-mono font-bold text-orange-600">1078</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                <span className="font-medium text-slate-900">National Emergency</span>
                <span className="font-mono font-bold text-orange-600">112</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                <span className="font-medium text-slate-900">Medical Ambulance</span>
                <span className="font-mono font-bold text-emerald-700">108</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                <span className="font-medium text-slate-900">Childline Distress</span>
                <span className="font-mono font-bold text-blue-600">1098</span>
              </div>
            </div>
          </div>

          {/* Operational Protocols */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              {t('footer_quick_links')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <strong className="text-slate-900 font-medium">Distressed Relatives:</strong> Multi-lingual intake with voice assistance.
              </li>
              <li>
                <strong className="text-slate-900 font-medium">Field Rescue Units:</strong> Offline-first reporting with VHF radio transcript parser.
              </li>
              <li>
                <strong className="text-slate-900 font-medium">Medical Centers:</strong> Triage condition tracking and trauma ward registries.
              </li>
              <li>
                <strong className="text-slate-900 font-medium">Relief Reviewers:</strong> Forensic side-by-side audit and anti-trafficking checkpoints.
              </li>
            </ul>
          </div>

          {/* Regional Multilingual Access */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-orange-600" />
              Regional Language Access
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              MILAN provides deep native Hindi and English localization with real-time zero-latency neural translation for crisis field operations.
            </p>
            <div className="pt-1">
              <LanguageSwitcher variant="footer" />
            </div>
            <div className="p-2.5 rounded-lg border border-orange-200 bg-orange-50/80 text-[11px] text-orange-900 leading-tight flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
              <span>
                {t('notice_banner_desc')}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Transparency Disclosure */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            {t('footer_copyright')}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-sm font-semibold">
              PROTOCOL v1.2-ALPHA
            </span>
            <span>•</span>
            <span className="text-slate-700 font-medium">
              NDMA / CDAC Operational Alignment
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
