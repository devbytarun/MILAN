// ============================================================
// MILAN — Disaster Blackout Offline Sync Engine
// HackX 4.0 Innovation 3: Resilient Offline-First Sync
// Queues disaster reports during cellular blackouts and
// safely batch-synchronizes with Supabase upon reconnection.
// ============================================================

import type { CreateCaseWithReportInput } from '../types/index.ts';
import { supabase } from './supabase.ts';

export interface OfflineQueuedReport {
  id: string; // client-generated temporary ID
  queuedAt: string;
  payload: CreateCaseWithReportInput;
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  error?: string;
  serverCaseUid?: string;
}

const STORAGE_KEY = 'milan_offline_queue_v1';

/**
 * Storage adapter that works in both browser localStorage and memory (for Node/tests).
 */
class OfflineStorageAdapter {
  private memStore: Map<string, string> = new Map();

  getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return this.memStore.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      this.memStore.set(key, value);
    }
  }

  clear(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      this.memStore.clear();
    }
  }
}

export const offlineStorage = new OfflineStorageAdapter();

/**
 * Adds an intake report to the offline queue when internet is unavailable.
 */
export function enqueueOfflineReport(report: CreateCaseWithReportInput): OfflineQueuedReport {
  const queued: OfflineQueuedReport = {
    id: `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    queuedAt: new Date().toISOString(),
    payload: report,
    syncStatus: 'PENDING',
  };

  const current = getOfflineQueue();
  current.push(queued);
  offlineStorage.setItem(STORAGE_KEY, JSON.stringify(current));

  return queued;
}

/**
 * Retrieves all currently queued offline reports.
 */
export function getOfflineQueue(): OfflineQueuedReport[] {
  const raw = offlineStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OfflineQueuedReport[];
  } catch {
    return [];
  }
}

/**
 * Returns count of pending offline reports awaiting synchronization.
 */
export function getPendingOfflineCount(): number {
  return getOfflineQueue().filter(q => q.syncStatus === 'PENDING' || q.syncStatus === 'FAILED').length;
}

export interface SyncBatchResult {
  totalProcessed: number;
  syncedCount: number;
  failedCount: number;
  syncedReports: { offlineId: string; serverCaseUid: string }[];
  errors: { offlineId: string; error: string }[];
}

/**
 * Synchronizes all pending offline reports with the live Supabase database.
 * Calls create_case_with_report() for each item and updates local status.
 */
export async function flushOfflineQueue(): Promise<SyncBatchResult> {
  const queue = getOfflineQueue();
  const pending = queue.filter(item => item.syncStatus === 'PENDING' || item.syncStatus === 'FAILED');

  const result: SyncBatchResult = {
    totalProcessed: pending.length,
    syncedCount: 0,
    failedCount: 0,
    syncedReports: [],
    errors: [],
  };

  if (pending.length === 0) return result;

  for (const item of pending) {
    item.syncStatus = 'SYNCING';
    try {
      // Call Supabase RPC
      const { data, error } = await supabase.rpc('create_case_with_report', {
        p_case_type: item.payload.p_case_type,
        p_source_type: item.payload.p_source_type,
        p_comm_status: item.payload.p_comm_status,
        p_report_notes: item.payload.p_report_notes,
        p_found_location: item.payload.p_found_location,
        p_found_at: item.payload.p_found_at,
        p_referral_info: item.payload.p_referral_info,
        p_full_name: item.payload.p_full_name,
        p_alternative_names: item.payload.p_alternative_names,
        p_age: item.payload.p_age,
        p_approximate_age: item.payload.p_approximate_age,
        p_gender: item.payload.p_gender,
        p_date_of_birth: item.payload.p_date_of_birth,
        p_blood_group: item.payload.p_blood_group,
        p_height_cm: item.payload.p_height_cm,
        p_weight_kg: item.payload.p_weight_kg,
        p_build: item.payload.p_build,
        p_hair_description: item.payload.p_hair_description,
        p_hair_colour: item.payload.p_hair_colour,
        p_eye_colour: item.payload.p_eye_colour,
        p_skin_description: item.payload.p_skin_description,
        p_birthmarks: item.payload.p_birthmarks,
        p_scars: item.payload.p_scars,
        p_tattoos: item.payload.p_tattoos,
        p_anatomical_features: item.payload.p_anatomical_features,
        p_clothing: item.payload.p_clothing,
        p_footwear: item.payload.p_footwear,
        p_accessories: item.payload.p_accessories,
        p_belongings: item.payload.p_belongings,
        p_identifying_clue: item.payload.p_identifying_clue,
        p_condition_status: item.payload.p_condition_status,
      });

      if (error) {
        throw new Error(error.message);
      }

      const caseUid = (data as Record<string, string>)?.case_uid || 'MILAN-ASSIGNED';
      item.syncStatus = 'SYNCED';
      item.serverCaseUid = caseUid;
      result.syncedCount++;
      result.syncedReports.push({ offlineId: item.id, serverCaseUid: caseUid });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      item.syncStatus = 'FAILED';
      item.error = msg;
      result.failedCount++;
      result.errors.push({ offlineId: item.id, error: msg });
    }
  }

  // Update storage
  offlineStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return result;
}

/**
 * Initializes automatic background sync on browser reconnection.
 */
export function initAutoSync(onSyncComplete?: (result: SyncBatchResult) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = async () => {
    if (getPendingOfflineCount() > 0) {
      const result = await flushOfflineQueue();
      if (onSyncComplete) onSyncComplete(result);
    }
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}
