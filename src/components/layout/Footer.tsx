import React from 'react';
import { ShieldCheck, PhoneCall, AlertTriangle, Radio } from 'lucide-react';
import { useI18n } from '../../context/I18nContext.tsx';
import { LanguageSwitcher } from '../common/LanguageSwitcher.tsx';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="mt-auto bg-white text-[#333840] border-t border-[#dddddd] py-16 w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-black tracking-wider uppercase text-[#181d26]">
                MILAN
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                DISASTER GRID
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#41454d]">
              {t('footer_tagline')}
            </p>
            <div className="flex items-center gap-2 text-xs pt-1 text-[#0a2e0e] font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#0a2e0e]" />
              <span>{t('footer_disclaimer')}</span>
            </div>
          </div>

          {/* Emergency Hotlines Desk */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#181d26] flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-[#aa2d00]" />
              {t('footer_emergency_contacts')}
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#f8fafc] border border-[#dddddd]">
                <span className="font-semibold text-[#181d26]">NDRF Control Room</span>
                <span className="font-mono font-bold text-[#aa2d00]">1078</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#f8fafc] border border-[#dddddd]">
                <span className="font-semibold text-[#181d26]">National Emergency</span>
                <span className="font-mono font-bold text-[#aa2d00]">112</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#f8fafc] border border-[#dddddd]">
                <span className="font-semibold text-[#181d26]">Medical Ambulance</span>
                <span className="font-mono font-bold text-[#0a2e0e]">108</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#f8fafc] border border-[#dddddd]">
                <span className="font-semibold text-[#181d26]">Childline Distress</span>
                <span className="font-mono font-bold text-[#1b61c9]">1098</span>
              </div>
            </div>
          </div>

          {/* Operational Protocols */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#181d26]">
              {t('footer_quick_links')}
            </h4>
            <ul className="space-y-2 text-xs text-[#41454d]">
              <li>
                <strong className="text-[#181d26]">Distressed Relatives:</strong> Multi-lingual intake with voice assistance.
              </li>
              <li>
                <strong className="text-[#181d26]">Field Rescue Units:</strong> Offline-first reporting with VHF radio transcript parser.
              </li>
              <li>
                <strong className="text-[#181d26]">Medical Centers:</strong> Triage condition tracking and trauma ward registries.
              </li>
              <li>
                <strong className="text-[#181d26]">Relief Reviewers:</strong> Forensic side-by-side audit and anti-trafficking checkpoints.
              </li>
            </ul>
          </div>

          {/* Regional Multilingual Access */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#181d26] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#1b61c9]" />
              Regional Language Access
            </h4>
            <p className="text-xs text-[#41454d] leading-relaxed">
              MILAN supports all 22 Eighth Schedule Indian Languages + English with full RTL support for crisis field operations.
            </p>
            <div className="pt-1">
              <LanguageSwitcher variant="footer" />
            </div>
            <div className="p-2.5 rounded-md border border-[#fcab79] bg-[#fcab79]/15 text-[11px] text-[#aa2d00] leading-tight flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#aa2d00] shrink-0 mt-0.5" />
              <span>
                {t('notice_banner_desc')}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Transparency Disclosure */}
        <div className="pt-8 border-t border-[#dddddd] flex flex-col sm:flex-row items-center justify-between text-xs text-[#41454d] gap-3">
          <div>
            {t('footer_copyright')}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-sm bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
              PROTOCOL v1.2-ALPHA
            </span>
            <span>•</span>
            <span className="text-[#333840] font-medium">
              NDMA / CDAC Operational Alignment
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
