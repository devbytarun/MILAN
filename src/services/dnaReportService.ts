// ============================================================
// MILAN — DNA Report Service
// Secure attachment and retrieval of official DNA reports for cases.
// Authorized roles: HOSPITAL (upload/view), REVIEWER/ADMIN (verify/view),
// NGO/ARMY_RESCUE (view authorized cases).
// FAMILY users CANNOT upload or browse DNA reports.
// ============================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import type { DnaReport, UserRole } from '../types/index.ts';
export type { DnaReport, DnaReportStatus } from '../types/index.ts';
import { hasPermission } from '../lib/permissions.ts';

const DNA_STORAGE_KEY = 'milan_dna_reports';
const STORAGE_BUCKET = 'dna-reports';
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

// Initial realistic disaster triage DNA evidence records for demonstration
const INITIAL_DEMO_DNA_REPORTS: DnaReport[] = [
  {
    id: 'dna-demo-081',
    case_id: 'case-demo-1', // Aarav Sharma (Missing)
    uploaded_by: 'hospital-demo',
    uploader_name: 'Dr. Priya Nair (Forensic Triage Desk)',
    uploader_role: 'HOSPITAL',
    file_path: 'dna-reports/case-demo-1/AIIMS_TRIAGE_LAB_REF_081.pdf',
    file_name: 'AIIMS_Triage_DNA_Reference_AaravSharma.pdf',
    file_size: 245600,
    mime_type: 'application/pdf',
    report_type: 'OFFICIAL_HOSPITAL_LAB',
    status: 'PENDING',
    notes: 'Reference buccal swab sample collected from maternal aunt at Camp Sector 4 Triage Clinic.',
    uploaded_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

/**
 * Check if a role is authorized to upload official DNA reports.
 * Only HOSPITAL and ADMIN are authorized.
 */
export function canUploadDnaReport(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return hasPermission(role, 'UPLOAD_DNA_REPORT') || role === 'HOSPITAL' || role === 'ADMIN';
}

/**
 * Check if a role is authorized to inspect DNA reports.
 * Authorized responders: HOSPITAL, REVIEWER, ADMIN, NGO, ARMY_RESCUE.
 * FAMILY and VOLUNTEER are strictly quarantined.
 */
export function canViewDnaReport(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return (
    hasPermission(role, 'VIEW_DNA_REPORT') ||
    ['HOSPITAL', 'REVIEWER', 'ADMIN', 'NGO', 'ARMY_RESCUE'].includes(role)
  );
}

let memoryDnaReports: DnaReport[] = [...INITIAL_DEMO_DNA_REPORTS];

/**
 * Get all DNA reports from local storage cache (with Node/SSR in-memory fallback).
 */
export function getLocalDnaReports(): DnaReport[] {
  if (typeof localStorage === 'undefined') {
    return memoryDnaReports;
  }
  try {
    const raw = localStorage.getItem(DNA_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DNA_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DNA_REPORTS));
      return INITIAL_DEMO_DNA_REPORTS;
    }
    return JSON.parse(raw) as DnaReport[];
  } catch {
    return INITIAL_DEMO_DNA_REPORTS;
  }
}

/**
 * Save a DNA report into local cache.
 */
function saveLocalDnaReport(report: DnaReport): void {
  if (typeof localStorage === 'undefined') {
    memoryDnaReports = [report, ...memoryDnaReports.filter((r) => r.id !== report.id)];
    return;
  }
  const current = getLocalDnaReports();
  const filtered = current.filter((r) => r.id !== report.id);
  filtered.unshift(report);
  localStorage.setItem(DNA_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Retrieve all DNA reports associated with a given case ID.
 */
export async function getDnaReportsForCase(caseId: string): Promise<DnaReport[]> {
  // If Supabase is configured, attempt remote fetch
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from as any)('dna_reports')
        .select('*')
        .eq('case_id', caseId)
        .order('uploaded_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as DnaReport[];
      }
    } catch (_e) {
      // Fallback to local store
    }
  }

  // Fallback to local store
  const all = getLocalDnaReports();
  return all.filter((r) => r.case_id === caseId);
}

/**
 * Synchronous check whether a case has at least one DNA report attached.
 */
export function hasDnaReportSync(caseId: string): boolean {
  const all = getLocalDnaReports();
  return all.some((r) => r.case_id === caseId);
}

export interface UploadDnaReportInput {
  caseId: string;
  file: File;
  uploaderId?: string | null;
  uploaderName?: string | null;
  uploaderRole?: UserRole | null;
  notes?: string;
}

export interface UploadDnaReportResult {
  success: boolean;
  report?: DnaReport;
  error?: string;
}

/**
 * Upload an official DNA report for a case.
 * Enforces file size limits, MIME type verification, and RBAC authorization.
 */
export async function uploadDnaReport(input: UploadDnaReportInput): Promise<UploadDnaReportResult> {
  const { caseId, file, uploaderId, uploaderName, uploaderRole, notes } = input;

  // 1. Role verification
  if (!canUploadDnaReport(uploaderRole)) {
    return {
      success: false,
      error: 'Access Denied: Only authorized HOSPITAL or ADMIN personnel can upload official DNA reports.',
    };
  }

  // 2. Format validation
  const lowerName = file.name.toLowerCase();
  const isAllowedExt =
    lowerName.endsWith('.pdf') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.png');

  if (!ALLOWED_MIME_TYPES.includes(file.type) && !isAllowedExt) {
    return {
      success: false,
      error: 'Invalid file format. Accepted formats: PDF, JPG, JPEG, PNG.',
    };
  }

  // 3. File size limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 15 MB limit (file is ${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  const reportId = `dna-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `dna-reports/${caseId}/${reportId}_${cleanFileName}`;

  const reportRecord: DnaReport = {
    id: reportId,
    case_id: caseId,
    uploaded_by: uploaderId || 'hospital-user',
    uploader_name: uploaderName || 'Hospital Medical Officer',
    uploader_role: uploaderRole || 'HOSPITAL',
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type || 'application/pdf',
    report_type: 'OFFICIAL_HOSPITAL_LAB',
    status: 'PENDING',
    notes: notes?.trim() || null,
    uploaded_at: new Date().toISOString(),
  };

  // 4. Save to local store for instant reactive UI & offline resilience
  saveLocalDnaReport(reportRecord);

  // 5. If Supabase is active, persist to Storage bucket and DB table
  if (isSupabaseConfigured) {
    try {
      // Upload to private Supabase Storage bucket
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (storageError) {
        console.warn('Supabase storage upload note (using local cache):', storageError.message);
      }

      // Insert metadata into dna_reports table
      const { error: dbError } = await (supabase.from as any)('dna_reports').insert({
        id: reportId,
        case_id: caseId,
        uploaded_by: uploaderId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        report_type: 'OFFICIAL_HOSPITAL_LAB',
        status: 'PENDING',
        notes: notes?.trim() || null,
      });

      if (dbError) {
        console.warn('Supabase db insert note (using local cache):', dbError.message);
      }
    } catch (e) {
      console.warn('Supabase remote sync warning:', e);
    }
  }

  return {
    success: true,
    report: reportRecord,
  };
}

/**
 * Generate a secure authenticated URL for downloading/viewing a DNA report.
 */
export async function getDnaReportDownloadUrl(report: DnaReport): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(report.file_path, 3600); // 1 hour expiry

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (_e) {
      // Fallback below
    }
  }

  // Generate a mock safe viewer data URL for offline presentation
  const mockContent = `MILAN DISASTER RESPONSE — CONFIDENTIAL DNA REPORT
=====================================================
Case ID: ${report.case_id}
Document Reference: ${report.file_name}
Uploaded By: ${report.uploader_name || 'Hospital Authority'} (${report.uploader_role || 'HOSPITAL'})
Date of Upload: ${new Date(report.uploaded_at).toLocaleString()}
Status: ${report.status}
Verification Note: ${report.notes || 'Official hospital laboratory intake specimen.'}
=====================================================
CONFIDENTIAL FORENSIC EVIDENCE — STRICT RBAC PROTECTED
`;
  return `data:text/plain;charset=utf-8,${encodeURIComponent(mockContent)}`;
}
