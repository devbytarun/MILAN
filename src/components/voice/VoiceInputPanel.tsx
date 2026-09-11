import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Wand2,
} from 'lucide-react';
import { parseDisasterVoiceTranscript } from '../../lib/voice-parser.ts';
import type { ParsedVoiceReport } from '../../lib/voice-parser.ts';

// Sample transcripts for demo purposes
const SAMPLE_TRANSCRIPTS = [
  {
    label: 'NDRF Radio — Rescued Child',
    text: `Control, this is NDRF Battalion 4 boat team reporting. We just pulled a young male child, approximately 9 years old, from a rooftop near Alaknanda Riverside Market. The child is in shock and unable to speak. He is wearing a soiled red collared polo shirt with dark shorts. Has a visible scar on his left forearm and a black thread on his right wrist with a metallic charm. Slim build, short black hair. Blood group B+. Currently being transported to Camp Relief Zone 2 for intake. Condition stable, non-verbal due to trauma shock. Over.`,
  },
  {
    label: 'Hospital Radio — Unconscious Adult',
    text: `Emergency department, Central Trauma Hospital. We have an unknown adult male, approximately 40 years old, admitted via Army ambulance from Sector 9 bridge collapse. He is unconscious on arrival. Athletic build. Has an old appendectomy scar and an Om tattoo on his inner right wrist. He was wearing a torn grey athletic hoodie and black track pants. Silver ring on left ring finger. Found with a waterlogged Casio digital watch. Blood group A+. Currently receiving IV fluids. Moderate head concussion.`,
  },
  {
    label: 'Family Report — Missing Grandmother',
    text: `My grandmother named Meera Sen, also called Dida, has been missing since the bridge colony evacuation. She is about 64 years old, female. Fair complexion, medium build. She has gray and white curly hair usually tied in a bun. She wears bifocal spectacles with golden metal frame and a gold chain with a rudraksha bead. She was wearing a green cotton saree with maroon border. She carries a canvas shoulder bag with her blood pressure prescription inside. Blood group O+. Please help us find her.`,
  },
  {
    label: 'NGO Field Report — Found Elderly Woman',
    text: `Disaster Relief Alliance field team reporting from Camp near Bhimtal bypass. Found an elderly woman, about 65 years old, at the community hall. She is able to speak but confused. She said her name is Dida. Fair skinned, medium build, wearing a partially torn green saree. She has gray curly hair and wears thick glasses. There is a chain around her neck with what appears to be a rudraksha bead. Condition stable but she needs medication.`,
  },
];

interface VoiceInputPanelProps {
  onParseComplete: (result: ParsedVoiceReport) => void;
}

export const VoiceInputPanel: React.FC<VoiceInputPanelProps> = ({ onParseComplete }) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedVoiceReport | null>(null);
  const [micSupported, setMicSupported] = useState(true);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
    }
  }, []);

  // Pulse animation during recording
  useEffect(() => {
    if (isListening) {
      let phase = 0;
      const animate = () => {
        phase += 0.05;
        setPulseIntensity(Math.abs(Math.sin(phase)) * 100);
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setPulseIntensity(0);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript((prev) => {
        const base = prev ? prev + ' ' : '';
        return (base + finalTranscript).trim() + (interimTranscript ? ' ' + interimTranscript : '');
      });
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const handleParse = useCallback(() => {
    if (!transcript.trim()) return;
    setIsParsing(true);

    // Simulate a small processing delay for UX smoothness
    setTimeout(() => {
      const result = parseDisasterVoiceTranscript(transcript);
      setParseResult(result);
      setIsParsing(false);
      onParseComplete(result);
    }, 800);
  }, [transcript, onParseComplete]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTranscript((prev) => (prev ? prev + ' ' + text : text));
    } catch {
      // Clipboard API not available
    }
  }, []);

  const loadSample = useCallback((text: string) => {
    setTranscript(text);
    setParseResult(null);
    setShowSamples(false);
  }, []);

  const confidenceTier = parseResult
    ? parseResult.confidence >= 80
      ? 'HIGH'
      : parseResult.confidence >= 40
      ? 'MEDIUM'
      : 'LOW'
    : null;

  const confidenceColor = confidenceTier
    ? confidenceTier === 'HIGH'
      ? 'text-emerald-400'
      : confidenceTier === 'MEDIUM'
      ? 'text-amber-400'
      : 'text-rose-400'
    : '';

  const confidenceBg = confidenceTier
    ? confidenceTier === 'HIGH'
      ? 'bg-emerald-500/10 border-emerald-500/30'
      : confidenceTier === 'MEDIUM'
      ? 'bg-amber-500/10 border-amber-500/30'
      : 'bg-rose-500/10 border-rose-500/30'
    : '';

  const ConfIcon = confidenceTier
    ? confidenceTier === 'HIGH'
      ? CheckCircle2
      : confidenceTier === 'MEDIUM'
      ? AlertTriangle
      : XCircle
    : null;

  return (
    <div className="space-y-6">
      {/* Microphone Section */}
      <div className="relative">
        <div className="flex items-center justify-center mb-6">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!micSupported}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-rose-600 shadow-lg shadow-rose-500/40 scale-110'
                : micSupported
                ? 'bg-slate-800 hover:bg-slate-700 shadow-md hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105'
                : 'bg-slate-800/50 cursor-not-allowed opacity-50'
            }`}
            title={isListening ? 'Stop Recording' : micSupported ? 'Start Recording' : 'Microphone not supported'}
          >
            {/* Pulse rings */}
            {isListening && (
              <>
                <span
                  className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping"
                  style={{ animationDuration: '1.5s' }}
                />
                <span
                  className="absolute rounded-full bg-rose-500/10"
                  style={{
                    inset: `-${pulseIntensity * 0.15}px`,
                    transition: 'inset 100ms ease',
                  }}
                />
              </>
            )}
            {isListening ? (
              <MicOff className="w-10 h-10 text-white relative z-10" />
            ) : (
              <Mic className="w-10 h-10 text-slate-300 relative z-10" />
            )}
          </button>
        </div>

        <div className="text-center mb-4">
          {isListening ? (
            <p className="text-sm text-rose-400 font-semibold animate-pulse flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              Recording — Speak the field report clearly
            </p>
          ) : !micSupported ? (
            <p className="text-xs text-slate-500">
              Browser microphone not supported. Use text input or paste a transcript below.
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Tap the microphone to dictate a field report, or type/paste a transcript below.
            </p>
          )}
        </div>
      </div>

      {/* Text Input Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            setParseResult(null);
          }}
          placeholder="Paste or type a radio transcript, field report, or voice memo here...&#10;&#10;Example: &quot;NDRF Battalion 4 reporting. Rescued a young male child, approximately 9 years old, from rooftop near Sector 4. Wearing red polo shirt, slim build, black hair...&quot;"
          rows={6}
          className="w-full px-4 py-3 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none transition font-mono"
        />

        {/* Action buttons below textarea */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 rounded-lg transition"
            >
              <Clipboard className="w-3.5 h-3.5" /> Paste
            </button>

            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 rounded-lg transition"
            >
              <Radio className="w-3.5 h-3.5" /> Demo Transcripts
              {showSamples ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {transcript && (
              <button
                onClick={() => {
                  setTranscript('');
                  setParseResult(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleParse}
              disabled={!transcript.trim() || isParsing}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition shadow-sm ${
                transcript.trim() && !isParsing
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Parsing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" /> Extract Fields
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sample Transcripts Dropdown */}
      {showSamples && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2 backdrop-blur-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Load a Demo Transcript
          </div>
          {SAMPLE_TRANSCRIPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(sample.text)}
              className="w-full text-left p-3 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 hover:border-blue-500/30 rounded-lg transition group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  {sample.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {sample.text.slice(0, 150)}...
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Parse Result Preview */}
      {parseResult && (
        <div className={`border rounded-xl p-5 space-y-4 transition-all duration-500 ${confidenceBg}`}>
          {/* Confidence Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {ConfIcon && <ConfIcon className={`w-6 h-6 ${confidenceColor}`} />}
              <div>
                <div className={`text-lg font-bold ${confidenceColor}`}>
                  {parseResult.confidence}% Extraction Confidence
                </div>
                <div className="text-[11px] text-slate-400">
                  {confidenceTier} CONFIDENCE — {parseResult.extractedEntities.length} entities extracted
                </div>
              </div>
            </div>
            <Sparkles className={`w-5 h-5 ${confidenceColor} opacity-60`} />
          </div>

          {/* Extracted Entities Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {parseResult.extractedEntities.map((entity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/40 rounded-lg border border-slate-700/50"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 uppercase">{entity.field}: </span>
                  <span className="text-[11px] text-slate-300">{String(entity.value)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Extracted Data Preview */}
          <details className="group">
            <summary className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer transition">
              <FileText className="w-3.5 h-3.5" />
              View Extracted Data Object
              <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
            </summary>
            <pre className="mt-2 p-3 bg-slate-900/60 rounded-lg text-[11px] text-slate-400 overflow-auto max-h-64 font-mono border border-slate-700/40">
              {JSON.stringify(parseResult.attributes, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};
