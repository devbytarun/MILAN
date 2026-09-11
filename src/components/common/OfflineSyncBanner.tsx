import React, { useState, useEffect } from 'react';
import { getOfflineQueue, flushOfflineQueue, OfflineQueuedReport } from '../../lib/offline-sync.ts';
import { Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';

export const OfflineSyncBanner: React.FC = () => {
  const [queue, setQueue] = useState<OfflineQueuedReport[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const refreshQueue = () => {
    try {
      const items = getOfflineQueue();
      setQueue(items.filter((i) => i.syncStatus !== 'SYNCED'));
    } catch {
      setQueue([]);
    }
  };

  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  if (queue.length === 0 && !syncResult) {
    return null;
  }

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const results = await flushOfflineQueue();
      setSyncResult(`Successfully synchronized ${results.syncedCount} of ${results.totalProcessed} disaster reports to shelter grid.`);
      refreshQueue();
    } catch {
      setSyncResult('Sync encountered transient network interruption. Preserved in local storage.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-amber-700 shrink-0" />
          <div>
            <span className="font-bold text-amber-950">Disaster Blackout Queue:</span>{' '}
            <span>
              {queue.length} report{queue.length === 1 ? '' : 's'} recorded offline during network disruption.
            </span>
          </div>
          <Badge variant="pending" size="sm">
            Local Safe Storage
          </Badge>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {syncResult ? (
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{syncResult}</span>
              <button
                type="button"
                onClick={() => setSyncResult(null)}
                className="text-slate-400 hover:text-slate-600 ml-1 text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              isLoading={syncing}
              onClick={handleSyncAll}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs"
            >
              Sync All to Server
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
