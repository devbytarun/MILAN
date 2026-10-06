// ============================================================
// MILAN — FacePhotoUpload Component
// Used in FamilyReportPage (missing person) and FoundReportPage (found person).
// Handles photo upload, face detection, and embedding generation.
// ============================================================

import React, { useCallback, useRef, useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, Loader2, Upload, X, ScanFace } from 'lucide-react';
import { extractFaceDescriptorFromFile } from '../../lib/faceRecognition.ts';

export interface FaceUploadResult {
  file: File;
  previewUrl: string;
  descriptor: number[] | null;
  error: string | null;
}

interface FacePhotoUploadProps {
  label?: string;
  helperText?: string;
  accentColor?: 'emerald' | 'blue' | 'orange';
  onResult: (result: FaceUploadResult | null) => void;
  disabled?: boolean;
}

export const FacePhotoUpload: React.FC<FacePhotoUploadProps> = ({
  label = 'Upload Photograph',
  helperText = 'Upload a clear, front-facing photograph for face analysis.',
  accentColor: _accentColor = 'emerald',
  onResult,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<
    | { status: 'idle' }
    | { status: 'analyzing'; previewUrl: string }
    | { status: 'success'; previewUrl: string; descriptor: number[] }
    | { status: 'no_face'; previewUrl: string; error: string }
    | { status: 'error'; error: string }
  >({ status: 'idle' });

  const handleFile = useCallback(
    async (file: File) => {
      // Validate type
      if (!file.type.startsWith('image/')) {
        setState({ status: 'error', error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' });
        onResult(null);
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setState({ status: 'analyzing', previewUrl });

      // Extract face descriptor
      const result = await extractFaceDescriptorFromFile(file);

      if (result.success) {
        setState({ status: 'success', previewUrl, descriptor: result.descriptor });
        onResult({ file, previewUrl, descriptor: result.descriptor, error: null });
      } else {
        setState({ status: 'no_face', previewUrl, error: result.error });
        onResult({ file, previewUrl, descriptor: null, error: result.error });
      }
    },
    [onResult]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && !disabled) handleFile(file);
  };

  const handleClear = () => {
    setState({ status: 'idle' });
    onResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasPreview =
    state.status === 'analyzing' ||
    state.status === 'success' ||
    state.status === 'no_face';

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">
        {label}
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative border-2 border-dashed rounded-xl transition-all ${
          disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-slate-400'
        } ${
          state.status === 'success'
            ? 'border-emerald-400 bg-emerald-50/30'
            : state.status === 'no_face'
            ? 'border-amber-400 bg-amber-50/30'
            : state.status === 'error'
            ? 'border-rose-400 bg-rose-50/30'
            : 'border-slate-300 bg-slate-50/50'
        }`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {/* Preview Image */}
        {hasPreview && (state as { previewUrl?: string }).previewUrl && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <img
              src={(state as { previewUrl: string }).previewUrl}
              alt="Preview"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
        )}

        <div className="relative z-10 p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[140px]">
          {state.status === 'idle' && (
            <>
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                <Camera className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  <span className="text-orange-600 font-semibold">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <Upload className="w-3 h-3" />
                JPEG · PNG · WebP · Max 10MB
              </div>
            </>
          )}

          {state.status === 'analyzing' && (
            <>
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Analyzing face...</p>
                <p className="text-xs text-slate-500">Detecting facial landmarks and generating profile</p>
              </div>
            </>
          )}

          {state.status === 'success' && (
            <>
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <ScanFace className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Face Profile Generated</p>
                <p className="text-xs text-emerald-700">
                  ✓ Face detected &nbsp;·&nbsp; ✓ 128-point landmark mapped &nbsp;·&nbsp; ✓ Ready for matching
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="absolute top-2 right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-600 hover:border-rose-300 shadow-sm transition-colors z-20"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}

          {state.status === 'no_face' && (
            <>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shadow-sm border border-amber-300">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Face Not Detected</p>
                <p className="text-xs text-amber-700 max-w-xs leading-relaxed">
                  {state.error}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="absolute top-2 right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-600 shadow-sm transition-colors z-20"
              >
                <X className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); fileInputRef.current?.click(); }}
                className="text-xs font-semibold text-amber-700 underline hover:text-amber-900"
              >
                Try a different photo
              </button>
            </>
          )}

          {state.status === 'error' && (
            <>
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center border border-rose-300">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-rose-700">{state.error}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="text-xs font-semibold text-rose-700 underline"
              >
                Clear and retry
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Badge below upload */}
      {state.status === 'success' && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Face profile generated. This case will be available for face-based matching.
        </div>
      )}
      {state.status === 'no_face' && (
        <div className="flex items-center gap-2 text-xs text-amber-700">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Face could not be extracted. You can continue, but this case will <strong>not</strong> be available for face matching.
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  );
};
