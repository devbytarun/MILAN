// ============================================================
// MILAN — Supabase Client Singleton
// Fully typed with Database schema
// Reference: implementation_plan.md Section 20 & 26
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-milan.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
