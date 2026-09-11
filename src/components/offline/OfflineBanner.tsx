import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Inbox,
} from 'lucide-react';
import {
  getPendingOfflineCount,
  getOfflineQueue,
  flushOfflineQueue,
  initAutoSync,
} from '../../lib/offline-sync.ts';
import type { SyncBatchResult, OfflineQueuedReport } from '../../lib/offline-sync.ts';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncBatchResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [queue, setQueue] = useState<OfflineQueuedReport[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveOnline = isOnline && !simulatedOffline;

  // Network status listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync on reconnection
  useEffect(() => {
    const cleanup = initAutoSync((result) => {
      setLastSyncResult(result);
      setIsSyncing(false);
      refreshQueue();
      setShowNotification(true);
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
      notifTimerRef.current = setTimeout(() => setShowNotification(false), 8000);
    });

    return cleanup;
  }, []);

  // Poll pending count
  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshQueue = useCallback(() => {
    setPendingCount(getPendingOfflineCount());
    setQueue(getOfflineQueue());
  }, []);

  const handleManualSync = useCallback(async () => {
    if (isSyncing || !effectiveOnline) return;
    setIsSyncing(true);
    const result = await flushOfflineQueue();
    setLastSyncResult(result);
    setIsSyncing(false);
    refreshQueue();
    setShowNotification(true);
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => setShowNotification(false), 8000);
  }, [isSyncing, effectiveOnline, refreshQueue]);

  return (
    <>
      {/* Main Banner */}
      <div
        className={`relative overflow-hidden transition-all duration-500 border-b border-white/10 ${
          !effectiveOnline
            ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-orange-950 shadow-inner'
            : pendingCount > 0
            ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-950'
            : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950'
        }`}
      >
        {/* Animated shimmer */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            animation: isSyncing ? 'shimmer 1.5s ease-in-out infinite' : 'none',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 relative z-10 flex-wrap gap-2">
            {/* Left — Status */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  !effectiveOnline
                    ? 'bg-rose-800/80 shadow-md shadow-rose-950'
                    : pendingCount > 0
                    ? 'bg-amber-800/80 shadow-md shadow-amber-950'
                    : 'bg-emerald-950/80 border border-emerald-500/30'
                }`}
              >
                {!effectiveOnline ? (
                  <WifiOff className="w-4 h-4 text-rose-300 animate-pulse" />
                ) : isSyncing ? (
                  <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                ) : pendingCount > 0 ? (
                  <CloudOff className="w-4 h-4 text-amber-300" />
                ) : (
                  <Cloud className="w-4 h-4 text-emerald-400" />
                )}
              </div>

              <div>
                <div
                  className={`text-xs font-bold flex items-center gap-2 ${
                    !effectiveOnline ? 'text-rose-200' : pendingCount > 0 ? 'text-amber-200' : 'text-slate-200'
                  }`}
                >
                  {!effectiveOnline ? (
                    <>
                      <span>⚡ DISASTER BLACKOUT PROTOCOL ENGAGED</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-rose-500/30 text-rose-200 border border-rose-400/40">
                        OFFLINE QUEUE ACTIVE
                      </span>
                    </>
                  ) : isSyncing ? (
                    'Synchronizing field reports with central cloud...'
                  ) : pendingCount > 0 ? (
                    `${pendingCount} field report${pendingCount > 1 ? 's' : ''} queued in offline storage`
                  ) : (
                    <>
                      <span>🌐 Blackout Engine Active</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ONLINE & SYNC READY
                      </span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {!effectiveOnline
                    ? 'Network unavailable in disaster zone. Intake reports are safely encrypted and queued locally in browser.'
                    : pendingCount > 0
                    ? 'Reports ready to sync to central database.'
                    : 'Disaster response node connected. Offline resilience active.'}
                </div>
              </div>
            </div>

            {/* Right — Interactive Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSimulatedOffline((prev) => !prev)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition flex items-center gap-1.5 shadow-sm ${
                  simulatedOffline
                    ? 'bg-rose-900/60 border-rose-500 text-rose-200 hover:bg-rose-800/80'
                    : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title="Simulate network cutoff for hackathon judging demonstration"
              >
                {!effectiveOnline ? <Cloud className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
                {simulatedOffline ? 'Restore Connection' : 'Simulate Blackout'}
              </button>

              {effectiveOnline && (
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync Now
                </button>
              )}

              <button
                onClick={() => setShowDetails((prev) => !prev)}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition flex items-center gap-1"
              >
                <span>Queue ({pendingCount})</span>
                {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Expandable Queue Details */}
          {showDetails && (
            <div className="pb-3 relative z-10">
              <div className="bg-black/30 rounded-xl border border-white/10 p-3 max-h-48 overflow-auto">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Inbox className="w-3 h-3 text-blue-400" /> Offline Disaster Queue ({queue.length} items)
                </div>
                {queue.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    Queue is empty. Submit a report while in Blackout Mode to see it queued here!
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {queue.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-3 py-2 bg-slate-900/80 rounded-lg border border-slate-800"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              item.syncStatus === 'SYNCED'
                                ? 'bg-emerald-400'
                                : item.syncStatus === 'FAILED'
                                ? 'bg-rose-400'
                                : item.syncStatus === 'SYNCING'
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-slate-500'
                            }`}
                          />
                          <span className="text-[11px] text-slate-300 truncate">
                            {item.payload.p_case_type} — {item.payload.p_full_name || 'Unknown'} (
                            {item.payload.p_gender || '?'})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.syncStatus === 'SYNCED'
                                ? 'bg-emerald-900/40 text-emerald-300'
                                : item.syncStatus === 'FAILED'
                                ? 'bg-rose-900/40 text-rose-300'
                                : item.syncStatus === 'SYNCING'
                                ? 'bg-amber-900/40 text-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.syncStatus}
                          </span>
                          {item.serverCaseUid && (
                            <span className="text-[10px] text-emerald-400 font-mono">{item.serverCaseUid}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating notification toast for sync completion */}
      {showNotification && lastSyncResult && isOnline && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 max-w-sm ${
              lastSyncResult.failedCount > 0
                ? 'bg-amber-950 border-amber-800 text-amber-200'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200'
            }`}
          >
            {lastSyncResult.failedCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold">
                {lastSyncResult.syncedCount > 0
                  ? `${lastSyncResult.syncedCount} report${
                      lastSyncResult.syncedCount > 1 ? 's' : ''
                    } synced successfully`
                  : 'No reports to sync'}
              </div>
              {lastSyncResult.failedCount > 0 && (
                <div className="text-[10px] text-amber-400 mt-0.5">
                  {lastSyncResult.failedCount} failed — will retry on next sync
                </div>
              )}
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-slate-500 hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
