import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, ShieldAlert } from 'lucide-react';

export type OperationalNetworkState = 'LIVE' | 'SYNCING' | 'OFFLINE' | 'LOCAL_CACHE';

interface LiveStatusBeaconProps {
  showTransparencyNotice?: boolean;
  className?: string;
}

export const LiveStatusBeacon: React.FC<LiveStatusBeaconProps> = ({
  showTransparencyNotice = false,
  className = '',
}) => {
  const [networkState, setNetworkState] = useState<OperationalNetworkState>('LIVE');
  const [lastSync, setLastSync] = useState<string>('Just now');

  useEffect(() => {
    const handleOnline = () => {
      setNetworkState('SYNCING');
      setTimeout(() => {
        setNetworkState('LIVE');
        setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }, 1500);
    };

    const handleOffline = () => {
      setNetworkState('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setNetworkState('OFFLINE');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const stateConfig = {
    LIVE: {
      color: 'bg-emerald-500',
      pingColor: 'bg-emerald-400',
      text: 'Relief Grid Live',
      badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <Wifi className="w-3.5 h-3.5 text-emerald-600" />,
    },
    SYNCING: {
      color: 'bg-blue-500',
      pingColor: 'bg-blue-400',
      text: 'Synchronizing Nodes...',
      badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />,
    },
    OFFLINE: {
      color: 'bg-amber-500',
      pingColor: 'bg-amber-400',
      text: 'Offline Mode',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <WifiOff className="w-3.5 h-3.5 text-amber-600" />,
    },
    LOCAL_CACHE: {
      color: 'bg-slate-500',
      pingColor: 'bg-slate-400',
      text: 'Local Storage Fallback',
      badgeBg: 'bg-slate-100 border-slate-300 text-slate-700',
      icon: <Wifi className="w-3.5 h-3.5 text-slate-600" />,
    },
  };

  const current = stateConfig[networkState];

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      {/* Live Pulsing Beacon Pill */}
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-pill border text-xs font-semibold select-none transition-colors ${current.badgeBg}`}
        title={`Network state: ${networkState}. Last verified: ${lastSync}`}
      >
        <span className="relative flex h-2 w-2">
          {networkState === 'LIVE' && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.pingColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${current.color}`} />
        </span>
        <span className="flex items-center gap-1">
          {current.icon}
          <span>{current.text}</span>
        </span>
      </div>

      {/* Evaluation / Demo Sandbox Transparency Tag */}
      {showTransparencyNotice && (
        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-slate-100 border border-slate-200 text-[10px] font-mono font-medium text-slate-600"
          title="Data is simulated for disaster drill demonstration. No real victim records are published."
        >
          <ShieldAlert className="w-3 h-3 text-slate-500" />
          <span>SIMULATED DRILL DATA</span>
        </div>
      )}
    </div>
  );
};
