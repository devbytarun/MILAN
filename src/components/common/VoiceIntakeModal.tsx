import React, { useState } from 'react';
import { parseDisasterVoiceTranscript, ParsedVoiceReport } from '../../lib/voice-parser.ts';
import { Mic, MicOff, Radio, Sparkles, Check, X, Volume2 } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';

interface VoiceIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (parsed: ParsedVoiceReport) => void;
}

const SAMPLE_TRANSCRIPTS = [
  {
    title: '⚡ Demo: Aarav Sharma (Child, 6)',
    text: 'Control, this is NDRF Battalion 8 Boat 3 reporting. Pulled 6-year-old male child from riverbank near Alaknanda market. Non-verbal from shock. Blue Batman superhero t-shirt, dark denim shorts, curved scar above right eyebrow, brown mole on left shoulder, black sacred thread on right wrist with red whistle lanyard. Blood group B+, short black hair. Location Camp Relief Zone 4.',
  },
  {
    title: 'NDRF Radio Call (Child / Haldwani)',
    text: 'Rescue Boat 3 to base: Found female child, around 4 years old, unconscious and cannot speak. Wearing pink floral top. Heart-shaped birthmark on right shoulder. Location Haldwani bypass relief post.',
  },
  {
    title: 'Camp Radio Log (Adult Male / Hinglish)',
    text: 'NDRF Camp 2 entry: Male subject, approx 28 saal, self reported name Bir Kumar. Blood group B+, blue denim jacket hai, right eyebrow pe cut mark/scar hai. Found near Bridge Colony.',
  },
];

export const VoiceIntakeModal: React.FC<VoiceIntakeModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
}) => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedVoiceReport | null>(null);

  if (!isOpen) return null;

  const handleParse = (textToParse?: string) => {
    const text = textToParse !== undefined ? textToParse : transcript;
    if (!text.trim()) return;
    const result = parseDisasterVoiceTranscript(text);
    setParsedResult(result);
  };

  const handleApplyPreset = (text: string) => {
    setTranscript(text);
    handleParse(text);
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate speech recognition in outdoor field condition
      setTimeout(() => {
        const sample = SAMPLE_TRANSCRIPTS[0].text;
        setTranscript(sample);
        setIsRecording(false);
        handleParse(sample);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleApply = () => {
    if (parsedResult) {
      onApplyParsedData(parsedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-modal bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Disaster Radio & Voice Intake Parser
              </h2>
              <p className="text-xs text-slate-400">
                Extract physical clues, clothing, and communication status from speech
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Audio Visualizer & Mic Button */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm'
                }`}
                title={isRecording ? 'Click to stop' : 'Click to speak'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {isRecording ? 'Listening to field audio stream...' : 'Field Microphone / Voice Input'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isRecording ? 'Speak clearly into device microphone' : 'Tap to speak, paste radio transcripts, or test samples'}
                </div>
              </div>
            </div>

            {isRecording && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                <span className="w-1.5 h-8 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              </div>
            )}
          </div>

          {/* Quick Preset Radios */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Quick Test Scenarios (Relief Radio Dispatches)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_TRANSCRIPTS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(s.text)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-orange-50/40 hover:border-orange-200 text-left transition text-xs space-y-1 group"
                >
                  <div className="font-bold text-slate-800 flex items-center gap-1 group-hover:text-orange-600">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{s.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {s.text}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Transcript Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              Radio Log or Speech Transcript
            </label>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder="e.g. Female child, age around 4, pink clothing, heart birthmark on right shoulder..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50/50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
            />
          </div>

          {/* Live Extraction Results */}
          {parsedResult && (
            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-slate-900">Extracted Attributes</span>
                </div>
                <Badge
                  variant={parsedResult.confidence >= 70 ? 'verified' : 'pending'}
                  size="sm"
                >
                  {parsedResult.confidence}% Parse Confidence
                </Badge>
              </div>

              {parsedResult.extractedEntities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {parsedResult.extractedEntities.map((ent, i) => (
                    <div
                      key={i}
                      className="p-2 bg-white rounded-lg border border-slate-200 text-xs space-y-0.5"
                    >
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        {ent.field.replace(/_/g, ' ')}
                      </div>
                      <div className="font-bold text-slate-800 truncate">{String(ent.value)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  No attributes recognized yet. Type or speak descriptive characteristics.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="brand"
            size="sm"
            disabled={!parsedResult || parsedResult.extractedEntities.length === 0}
            onClick={handleApply}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Populate Report Form
          </Button>
        </div>
      </div>
    </div>
  );
};
