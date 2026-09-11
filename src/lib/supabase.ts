// ============================================================
// MILAN — Supabase Client Singleton
// Fully typed with Database schema
// Reference: implementation_plan.md Section 20 & 26
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types.ts';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  (typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.env?.VITE_SUPABASE_URL) ||
  'https://tqslfitamrihdqpwvjhj.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_-F_fGszZvtEYqN2T2u2jUA_tzCIHrin';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

