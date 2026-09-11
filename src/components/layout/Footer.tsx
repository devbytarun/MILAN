import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isCinematic = location.pathname === '/';

  return (
    <footer
      className={`mt-auto transition-colors duration-200 ${
        isCinematic
          ? 'bg-canvas-night text-shade-40 border-t border-hairline-dark'
          : 'bg-canvas-light text-shade-60 border-t border-hairline-light'
      } py-12 sm:py-16`}
    >
      <div className={isCinematic ? 'container-cinematic' : 'container-transactional'}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-10">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`font-display text-lg font-light tracking-[0.2em] uppercase ${
                isCinematic ? 'text-on-dark' : 'text-ink'
              }`}>
                MILAN
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-shade-40">
                Disaster Coordination
              </span>
            </div>
            <p className="type-caption leading-relaxed max-w-sm">
              Critical disaster reconciliation connecting missing person reports with field rescue camps and hospital triage records through multi-attribute explainable matching.
            </p>
            <div className="flex items-center gap-2 text-xs pt-1">
              <ShieldCheck className={`w-4 h-4 ${isCinematic ? 'text-aloe' : 'text-ink'}`} />
              <span className={isCinematic ? 'text-shade-30' : 'text-ink font-medium'}>
                Human review verification required for all candidate matches.
              </span>
            </div>
          </div>

          {/* Operational Roles */}
          <div className="space-y-3">
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${
              isCinematic ? 'text-shade-30' : 'text-ink'
            }`}>
              Operational Protocols
            </h4>
            <ul className="space-y-2 type-caption">
              <li>
                <strong className={isCinematic ? 'text-on-dark' : 'text-ink'}>Family:</strong> Comprehensive intake & case timeline tracking.
              </li>
              <li>
                <strong className={isCinematic ? 'text-on-dark' : 'text-ink'}>Rescue Units:</strong> Field intake for communicative & shock survivors.
              </li>
              <li>
                <strong className={isCinematic ? 'text-on-dark' : 'text-ink'}>Medical Centers:</strong> Triage conditions & medical status updates.
              </li>
              <li>
                <strong className={isCinematic ? 'text-on-dark' : 'text-ink'}>Reviewers:</strong> Side-by-side verification and family notification.
              </li>
            </ul>
          </div>

          {/* Emergency Notice */}
          <div className="space-y-3">
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${
              isCinematic ? 'text-shade-30' : 'text-ink'
            }`}>
              Emergency Notice
            </h4>
            <div className={`p-4 rounded-lg text-xs leading-relaxed space-y-1.5 border ${
              isCinematic
                ? 'bg-canvas-night-elevated border-hairline-dark text-shade-30'
                : 'bg-canvas-cream border-hairline-light text-shade-70'
            }`}>
              <div className="flex items-center gap-1.5 font-semibold text-amber-500">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Immediate Danger Notice</span>
              </div>
              <p className="type-caption">
                MILAN complements relief coordination and does not replace emergency response (112 / 108 / NDRF). In immediate life-threatening situations, notify emergency dispatch directly.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-3 ${
          isCinematic ? 'border-hairline-dark text-shade-50' : 'border-hairline-light text-shade-50'
        }`}>
          <div>
            © {new Date().getFullYear()} MILAN Disaster Information Network. Built for disaster resilience.
          </div>
          <div className="flex items-center gap-4">
            <span>Version 0.1.0-alpha</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-500" /> Open Disaster Protocol
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
