import React, { useState, useEffect, useCallback } from 'react';
import { Radio } from 'lucide-react';

interface RadioChatter {
  id: number;
  sender: string;
  message: string;
  role: 'HELI' | 'AMBULANCE' | 'ARMY' | 'COMMAND';
  x: number;
  y: number;
}

export const ReliefOperationsWorld: React.FC = () => {
  const [activeChatter, setActiveChatter] = useState<RadioChatter | null>(null);
  const [clickFlares, setClickFlares] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [colorIndex, setColorIndex] = useState(0);

  const flareColors = [
    'rgba(34, 211, 238, 0.7)', // Cyan
    'rgba(168, 85, 247, 0.7)', // Purple
    'rgba(16, 185, 129, 0.7)', // Emerald
    'rgba(245, 158, 11, 0.7)', // Amber
    'rgba(244, 63, 94, 0.7)',  // Rose
    'rgba(59, 130, 246, 0.7)', // Blue
  ];

  // Global click color flare handler
  const handleGlobalClick = useCallback((e: MouseEvent) => {
    // Avoid triggering on inputs or buttons if desired, but ripple makes everything feel tactile
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    const newColor = flareColors[colorIndex % flareColors.length];
    setColorIndex((prev) => prev + 1);

    const flare = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      color: newColor,
    };

    setClickFlares((prev) => [...prev.slice(-6), flare]);

    setTimeout(() => {
      setClickFlares((prev) => prev.filter((f) => f.id !== flare.id));
    }, 900);
  }, [colorIndex, flareColors]);

  useEffect(() => {
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [handleGlobalClick]);

  const triggerChatter = (sender: string, message: string, role: RadioChatter['role'], x: number, y: number) => {
    const chatter: RadioChatter = {
      id: Date.now(),
      sender,
      message,
      role,
      x,
      y,
    };
    setActiveChatter(chatter);
    setTimeout(() => {
      setActiveChatter((prev) => (prev?.id === chatter.id ? null : prev));
    }, 4500);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* 1. Interactive Click Shockwave Ripples */}
      {clickFlares.map((flare) => (
        <div
          key={flare.id}
          className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-shockwave"
          style={{
            left: `${flare.x}px`,
            top: `${flare.y}px`,
            border: `2px solid ${flare.color}`,
            boxShadow: `0 0 25px ${flare.color}, inset 0 0 15px ${flare.color}`,
          }}
        />
      ))}

      {/* 2. Flying Army / NDRF Rescue Helicopter 1 (Top Airspace - Left to Right) */}
      <div className="absolute top-16 left-0 w-full h-24 overflow-hidden pointer-events-none">
        <div
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            triggerChatter(
              'NDRF Air-Wing Chetak 04',
              'Sector 3 flood sweep in progress. Thermal cameras scanning rooftops for stranded families.',
              'HELI',
              rect.left + 50,
              rect.top + 70
            );
          }}
          className="absolute flex items-center pointer-events-auto cursor-pointer animate-helicopter-fly group"
          style={{ top: '10px' }}
          title="Click to intercept radio transmission from NDRF Helicopter"
        >
          {/* Helicopter SVG */}
          <div className="relative transform scale-75 sm:scale-90 hover:scale-105 transition-transform">
            {/* Spinning Rotor Blades */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-slate-400/80 rounded-full animate-spin-fast shadow-md" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-2 bg-slate-700" />

            {/* Heli Body */}
            <div className="w-20 h-9 bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-800 rounded-2xl border border-emerald-400/60 shadow-lg relative flex items-center px-2">
              <span className="text-[7px] font-black font-mono text-emerald-200 tracking-tighter">NDRF-AIR</span>
              <div className="w-4 h-5 bg-cyan-300/60 rounded-r-lg ml-auto border border-cyan-200/60" />
            </div>

            {/* Tail & Tail Rotor */}
            <div className="absolute top-3.5 -left-10 w-11 h-2 bg-slate-800 rounded-l border border-slate-700">
              <div className="absolute -left-1 -top-2 w-1 h-6 bg-slate-400/90 animate-spin-fast rounded-full" />
            </div>

            {/* Skids / Landing Gear */}
            <div className="absolute -bottom-2 left-2 w-16 h-1 bg-slate-700 rounded-full">
              <div className="absolute -top-1.5 left-3 w-0.5 h-2 bg-slate-600" />
              <div className="absolute -top-1.5 right-3 w-0.5 h-2 bg-slate-600" />
            </div>

            {/* Searchlight Beam */}
            <div className="absolute -bottom-16 left-6 w-16 h-20 bg-gradient-to-b from-cyan-400/25 to-transparent clip-light pointer-events-none transform -rotate-12" />

            {/* Beacon Strobe */}
            <div className="absolute -top-2 left-3 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
          </div>

          <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded-full bg-slate-900/90 text-cyan-300 text-[9px] font-mono border border-cyan-500/40 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            🚁 NDRF Air-04 (Click to Listen)
          </span>
        </div>
      </div>

      {/* 3. Flying Army Medical Evac Chopper 2 (Right to Left - Higher Altitude) */}
      <div className="absolute top-28 left-0 w-full h-20 overflow-hidden pointer-events-none">
        <div
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            triggerChatter(
              'Army MedEvac Chetak 09',
              'Critical patient air-lifted from Riverside Camp. En route to Central Trauma Base.',
              'HELI',
              rect.left + 50,
              rect.top + 70
            );
          }}
          className="absolute flex items-center pointer-events-auto cursor-pointer animate-helicopter-return group"
          style={{ top: '8px' }}
          title="Click to intercept Army MedEvac radio"
        >
          <div className="relative transform scale-70 hover:scale-95 transition-transform">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-slate-300/80 rounded-full animate-spin-fast" />
            <div className="w-16 h-8 bg-gradient-to-r from-rose-900 via-amber-800 to-slate-800 rounded-2xl border border-rose-400/60 shadow-lg relative flex items-center px-2">
              <span className="text-[7px] font-black font-mono text-rose-200">MED-EVAC</span>
              <div className="w-3.5 h-4 bg-cyan-300/70 rounded-l-lg mr-auto border border-cyan-200" />
            </div>
            <div className="absolute top-3 -right-8 w-9 h-1.5 bg-slate-800 rounded-r">
              <div className="absolute -right-1 -top-2 w-1 h-5 bg-slate-300 animate-spin-fast rounded-full" />
            </div>
            <div className="absolute -top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* 4. Ground Disaster Relief Ambulance (Cruising Along Bottom) */}
      <div className="absolute bottom-2 left-0 w-full h-14 overflow-hidden pointer-events-none">
        <div
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            triggerChatter(
              'Ambulance Unit 108',
              'Siren active! Priority corridor requested for triage intake at Hospital Station.',
              'AMBULANCE',
              rect.left + 50,
              rect.top - 80
            );
          }}
          className="absolute flex items-center pointer-events-auto cursor-pointer animate-ambulance-drive group"
          style={{ bottom: '4px' }}
          title="Click to check status of Disaster Relief Ambulance"
        >
          {/* Ambulance Body */}
          <div className="relative transform scale-80 sm:scale-95 hover:scale-110 transition-transform">
            {/* Flashing Emergency Lightbar */}
            <div className="absolute -top-2.5 left-6 flex items-center gap-1">
              <div className="w-2.5 h-2 bg-rose-500 rounded-sm animate-ping shadow-[0_0_10px_#f43f5e]" />
              <div className="w-2.5 h-2 bg-blue-500 rounded-sm animate-pulse shadow-[0_0_10px_#3b82f6]" />
            </div>

            {/* Van Body */}
            <div className="w-24 h-10 bg-white rounded-lg border-2 border-slate-300 shadow-xl relative flex items-center overflow-hidden">
              {/* Red Cross / Life line */}
              <div className="absolute top-0 bottom-0 left-0 w-7 bg-blue-600 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white font-mono">108</span>
              </div>
              <div className="ml-8 flex items-center gap-1.5">
                <div className="w-3 h-3 bg-rose-600 rounded-full flex items-center justify-center text-white text-[9px] font-black">
                  +
                </div>
                <span className="text-[8px] font-black text-slate-800 font-mono tracking-tighter">DISASTER RELIEF</span>
              </div>
              <div className="absolute top-1 right-1 w-5 h-4 bg-cyan-200 border border-slate-300 rounded-sm" />
            </div>

            {/* Wheels */}
            <div className="absolute -bottom-1.5 left-3 w-4 h-4 bg-slate-900 border-2 border-slate-500 rounded-full animate-spin-medium flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            </div>
            <div className="absolute -bottom-1.5 right-4 w-4 h-4 bg-slate-900 border-2 border-slate-500 rounded-full animate-spin-medium flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            </div>
          </div>

          <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded-full bg-slate-900/90 text-rose-300 text-[9px] font-mono border border-rose-500/40 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            🚑 Emergency Ambulance 108 (Click)
          </span>
        </div>
      </div>

      {/* 5. Patrolling Army & NDRF Officers (Interactive Floating Station Checkpoint) */}
      <div className="absolute bottom-16 right-4 sm:right-10 pointer-events-auto flex items-end gap-3 z-30">
        {/* Officer 1: Major Vikram (Army Rescue Specialist) */}
        <div
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            triggerChatter(
              'Major Vikram (Army Rescue 9th Para)',
              'Relief Sector secure. Coordinating field survivor transfers to camp registers.',
              'ARMY',
              rect.left - 120,
              rect.top - 80
            );
          }}
          className="cursor-pointer group flex flex-col items-center hover:scale-110 transition-transform"
          title="Major Vikram — Army Relief Patrol"
        >
          {/* Officer SVG Avatar */}
          <div className="relative">
            {/* Helmet with Army Camo Band */}
            <div className="w-7 h-5 bg-emerald-900 rounded-t-full border border-emerald-500/50 relative shadow">
              <div className="absolute bottom-0 w-full h-1 bg-amber-600/80 rounded-sm" />
            </div>
            {/* Head */}
            <div className="w-5 h-4 bg-amber-200 rounded-b-md mx-auto relative border border-amber-300/60">
              <div className="absolute top-1 left-1 w-1 h-1 bg-slate-800 rounded-full" />
              <div className="absolute top-1 right-1 w-1 h-1 bg-slate-800 rounded-full" />
            </div>
            {/* Tactical Vest */}
            <div className="w-8 h-8 bg-gradient-to-b from-emerald-800 to-slate-800 rounded-md border border-emerald-500/40 relative flex items-center justify-center shadow-lg">
              <div className="w-3 h-2 bg-amber-500/30 rounded-xs border border-amber-400/40" />
              {/* Radio Antenna on shoulder */}
              <div className="absolute -top-3 -right-0.5 w-0.5 h-4 bg-slate-400 animate-pulse" />
            </div>
            {/* Legs */}
            <div className="flex gap-1 justify-center -mt-0.5">
              <div className="w-2.5 h-3 bg-slate-900 rounded-b-xs" />
              <div className="w-2.5 h-3 bg-slate-900 rounded-b-xs" />
            </div>
          </div>

          <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 text-[8px] font-bold font-mono border border-emerald-500/40 shadow group-hover:bg-emerald-800 transition">
            🪖 Major Vikram
          </span>
        </div>

        {/* Officer 2: Officer Priya (NDRF Medical Triage Coordinator) */}
        <div
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            triggerChatter(
              'Officer Priya (NDRF Medical Coordinator)',
              'Field triage intake online. Verifying missing child biometric matches.',
              'ARMY',
              rect.left - 120,
              rect.top - 80
            );
          }}
          className="cursor-pointer group flex flex-col items-center hover:scale-110 transition-transform"
          title="Officer Priya — NDRF Medical Lead"
        >
          <div className="relative">
            {/* Orange NDRF Helmet */}
            <div className="w-7 h-5 bg-amber-600 rounded-t-full border border-amber-400 relative shadow">
              <div className="absolute bottom-0 w-full h-1 bg-blue-900 rounded-sm" />
            </div>
            {/* Head */}
            <div className="w-5 h-4 bg-amber-100 rounded-b-md mx-auto relative border border-amber-300/60">
              <div className="absolute top-1 left-1 w-1 h-1 bg-slate-800 rounded-full" />
              <div className="absolute top-1 right-1 w-1 h-1 bg-slate-800 rounded-full" />
            </div>
            {/* High-Vis Orange NDRF Vest */}
            <div className="w-8 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-md border border-amber-300 relative flex items-center justify-center shadow-lg">
              <span className="text-[6px] font-black text-white font-mono">NDRF</span>
            </div>
            {/* Legs */}
            <div className="flex gap-1 justify-center -mt-0.5">
              <div className="w-2.5 h-3 bg-slate-900 rounded-b-xs" />
              <div className="w-2.5 h-3 bg-slate-900 rounded-b-xs" />
            </div>
          </div>

          <span className="mt-1 px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 text-[8px] font-bold font-mono border border-amber-500/40 shadow group-hover:bg-amber-800 transition">
            🦺 NDRF Priya
          </span>
        </div>
      </div>

      {/* 6. Active Radio Transmission Speech Bubble */}
      {activeChatter && (
        <div
          className="fixed pointer-events-auto z-50 animate-pop-in max-w-sm"
          style={{
            left: `${Math.min(window.innerWidth - 320, Math.max(20, activeChatter.x))}px`,
            top: `${Math.min(window.innerHeight - 140, Math.max(60, activeChatter.y))}px`,
          }}
        >
          <div className="p-3.5 bg-slate-950/95 border-2 border-cyan-400 rounded-2xl shadow-2xl backdrop-blur-md space-y-1.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-[11px] font-black text-cyan-300 font-mono tracking-tight">
                  {activeChatter.sender}
                </span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                DISASTER COMMS
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic">
              "{activeChatter.message}"
            </p>
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
              <span>Channel: SECURE-FREQ-4</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                ACTIVE RELIEF
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CSS for Smooth 60fps Keyframe Animations */}
      <style>{`
        @keyframes shockwave {
          0% {
            width: 0px;
            height: 0px;
            opacity: 0.9;
          }
          100% {
            width: 140px;
            height: 140px;
            opacity: 0;
          }
        }
        .animate-shockwave {
          animation: shockwave 0.85s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }

        @keyframes spinFast {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-spin-fast {
          animation: spinFast 0.08s linear infinite;
        }

        @keyframes spinMedium {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-medium {
          animation: spinMedium 0.5s linear infinite;
        }

        @keyframes heliFly {
          0% {
            transform: translateX(-160px);
          }
          50% {
            transform: translateX(calc(50vw)) translateY(12px);
          }
          100% {
            transform: translateX(calc(100vw + 160px));
          }
        }
        .animate-helicopter-fly {
          animation: heliFly 26s linear infinite;
        }

        @keyframes heliReturn {
          0% {
            transform: translateX(calc(100vw + 160px)) scaleX(-1);
          }
          50% {
            transform: translateX(calc(50vw)) translateY(-8px) scaleX(-1);
          }
          100% {
            transform: translateX(-160px) scaleX(-1);
          }
        }
        .animate-helicopter-return {
          animation: heliReturn 32s linear infinite;
          animation-delay: 10s;
        }

        @keyframes ambulanceDrive {
          0% {
            transform: translateX(-160px);
          }
          100% {
            transform: translateX(calc(100vw + 160px));
          }
        }
        .animate-ambulance-drive {
          animation: ambulanceDrive 20s linear infinite;
          animation-delay: 3s;
        }

        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-pop-in {
          animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .clip-light {
          clip-path: polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%);
        }
      `}</style>
    </div>
  );
};
