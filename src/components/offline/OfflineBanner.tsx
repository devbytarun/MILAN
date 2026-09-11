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
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncBatchResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [queue, setQueue] = useState<OfflineQueuedReport[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    const result = await flushOfflineQueue();
    setLastSyncResult(result);
    setIsSyncing(false);
    refreshQueue();
    setShowNotification(true);
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => setShowNotification(false), 8000);
  }, [isSyncing, isOnline, refreshQueue]);

  // Don't render if everything is online and no pending items and no recent notification
  if (isOnline && pendingCount === 0 && !showNotification) return null;

  return (
    <>
      {/* Main Banner */}
      <div
        className={`relative overflow-hidden transition-all duration-500 ${
          !isOnline
            ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-orange-950'
            : pendingCount > 0
            ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-950'
            : 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950'
        }`}
      >
        {/* Animated shimmer */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            animation: isSyncing ? 'shimmer 1.5s ease-in-out infinite' : 'none',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 relative z-10">
            {/* Left — Status */}
            <div className="flex items-center gap-3">
              {/* Status Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                !isOnline ? 'bg-rose-800/60' : pendingCount > 0 ? 'bg-amber-800/60' : 'bg-emerald-800/60'
              }`}>
                {!isOnline ? (
                  <WifiOff className="w-4 h-4 text-rose-300" />
                ) : isSyncing ? (
                  <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                ) : pendingCount > 0 ? (
                  <CloudOff className="w-4 h-4 text-amber-300" />
                ) : (
                  <Cloud className="w-4 h-4 text-emerald-300" />
                )}
              </div>

              {/* Status Text */}
              <div>
                <div className={`text-xs font-bold ${
                  !isOnline ? 'text-rose-200' : pendingCount > 0 ? 'text-amber-200' : 'text-emerald-200'
                }`}>
                  {!isOnline
                    ? '⚡ Disaster Blackout Mode — Offline'
                    : isSyncing
                    ? 'Synchronizing queued reports...'
                    : pendingCount > 0
                    ? `${pendingCount} report${pendingCount > 1 ? 's' : ''} queued for sync`
                    : 'All reports synchronized'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {!isOnline
                    ? 'Reports are being saved locally and will auto-sync when connectivity returns.'
                    : pendingCount > 0
                    ? 'Click sync to push pending reports to the server now.'
                    : lastSyncResult
                    ? `Last sync: ${lastSyncResult.syncedCount} synced, ${lastSyncResult.failedCount} failed`
                    : 'Offline queue is empty. All data is live.'}
                </div>
              </div>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  !isOnline ? 'bg-rose-800/60 text-rose-200' : 'bg-amber-800/60 text-amber-200'
                }`}>
                  {pendingCount}
                </span>
              )}

              {pendingCount > 0 && isOnline && (
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition ${
                    isSyncing
                      ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              )}

              {queue.length > 0 && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 px-2 py-1.5 text-[11px] text-slate-400 hover:text-white transition"
                >
                  {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>

          {/* Expandable Queue Details */}
          {showDetails && queue.length > 0 && (
            <div className="pb-3 relative z-10">
              <div className="bg-black/20 rounded-xl border border-white/5 p-3 max-h-48 overflow-auto">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Inbox className="w-3 h-3" /> Offline Queue ({queue.length} items)
                </div>
                <div className="space-y-1.5">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800/50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          item.syncStatus === 'SYNCED' ? 'bg-emerald-400' :
                          item.syncStatus === 'FAILED' ? 'bg-rose-400' :
                          item.syncStatus === 'SYNCING' ? 'bg-amber-400 animate-pulse' :
                          'bg-slate-500'
                        }`} />
                        <span className="text-[11px] text-slate-400 truncate">
                          {item.payload.p_case_type} — {item.payload.p_full_name || 'Unknown'} ({item.payload.p_gender || '?'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.syncStatus === 'SYNCED' ? 'bg-emerald-900/40 text-emerald-300' :
                          item.syncStatus === 'FAILED' ? 'bg-rose-900/40 text-rose-300' :
                          item.syncStatus === 'SYNCING' ? 'bg-amber-900/40 text-amber-300' :
                          'bg-slate-800 text-slate-500'
                        }`}>
                          {item.syncStatus}
                        </span>
                        {item.serverCaseUid && (
                          <span className="text-[10px] text-emerald-400 font-mono">{item.serverCaseUid}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating notification toast for sync completion */}
      {showNotification && lastSyncResult && isOnline && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 max-w-sm ${
            lastSyncResult.failedCount > 0
              ? 'bg-amber-950 border-amber-800 text-amber-200'
              : 'bg-emerald-950 border-emerald-800 text-emerald-200'
          }`}>
            {lastSyncResult.failedCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold">
                {lastSyncResult.syncedCount > 0
                  ? `${lastSyncResult.syncedCount} report${lastSyncResult.syncedCount > 1 ? 's' : ''} synced successfully`
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
