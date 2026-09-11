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
  Volume2,
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

/**
 * Clean and deduplicate words and phrases caused by speech recognition engine loopbacks.
 * Example: "my my name is my name is Veer" -> "My name is Veer."
 */
function cleanSpeechStatement(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText.replace(/\s+/g, ' ').trim();

  // 1. Remove consecutive identical duplicate words: "my my" -> "my", "is is" -> "is"
  cleaned = cleaned.replace(/\b([a-zA-Z0-9_\u0900-\u097F]+)(\s+\1\b)+/gi, '$1');

  // 2. Remove immediate repeated 2-word phrases: "name is name is" -> "name is"
  cleaned = cleaned.replace(/\b([a-zA-Z0-9_\u0900-\u097F]+\s+[a-zA-Z0-9_\u0900-\u097F]+)(\s+\1\b)+/gi, '$1');

  // 3. Remove immediate repeated 3-word phrases: "my name is my name is" -> "my name is"
  cleaned = cleaned.replace(/\b([a-zA-Z0-9_\u0900-\u097F]+\s+[a-zA-Z0-9_\u0900-\u097F]+\s+[a-zA-Z0-9_\u0900-\u097F]+)(\s+\1\b)+/gi, '$1');

  // 4. Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // 5. Add period if ends like a statement and doesn't already have punctuation
  if (cleaned.length > 3 && !/[.?!,;]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}

export const VoiceInputPanel: React.FC<VoiceInputPanelProps> = ({ onParseComplete }) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [listeningState, setListeningState] = useState<'idle' | 'listening' | 'recognizing' | 'committed'>('idle');
  const [liveInterim, setLiveInterim] = useState('');
  const [lastCommittedPhrase, setLastCommittedPhrase] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedVoiceReport | null>(null);
  const [micSupported, setMicSupported] = useState(true);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uncommittedBufferRef = useRef<string>('');
  const lastCommittedTextRef = useRef<string>('');

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
        phase += 0.06;
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

  // Commit speech buffer cleanly to the main transcript
  const commitSpeechBuffer = useCallback((rawPhrase: string) => {
    const cleanPhrase = cleanSpeechStatement(rawPhrase);
    if (!cleanPhrase || cleanPhrase === lastCommittedTextRef.current) {
      setLiveInterim('');
      uncommittedBufferRef.current = '';
      return;
    }

    setListeningState('recognizing');

    setTimeout(() => {
      setTranscript((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) {
          return cleanPhrase;
        }
        // Don't append if already contains this exact phrase at the end
        if (trimmed.endsWith(cleanPhrase)) {
          return trimmed;
        }
        return `${trimmed} ${cleanPhrase}`;
      });

      lastCommittedTextRef.current = cleanPhrase;
      setLastCommittedPhrase(cleanPhrase);
      setLiveInterim('');
      uncommittedBufferRef.current = '';
      setListeningState('committed');

      // Return to listening status after brief indicator
      setTimeout(() => {
        setListeningState((current) => (current === 'committed' ? 'listening' : current));
      }, 700);
    }, 150);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

    uncommittedBufferRef.current = '';
    setLiveInterim('');
    setListeningState('listening');

    recognition.onresult = (event: any) => {
      let currentResultText = '';
      let isFinalResult = false;

      // Extract only the latest segment from the event results to prevent historical accumulation
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        currentResultText += result[0].transcript;
        if (result.isFinal) {
          isFinalResult = true;
        }
      }

      currentResultText = currentResultText.trim();
      if (!currentResultText) return;

      uncommittedBufferRef.current = currentResultText;
      setLiveInterim(currentResultText);
      setListeningState('listening');

      // Clear any pending pause debounce timer
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }

      // If marked as final by engine, commit promptly
      if (isFinalResult) {
        commitSpeechBuffer(currentResultText);
        return;
      }

      // Google-mic style pause detection:
      // Wait 800ms of silence after speaking before locking in the individual statement
      pauseTimerRef.current = setTimeout(() => {
        if (uncommittedBufferRef.current) {
          commitSpeechBuffer(uncommittedBufferRef.current);
        }
      }, 800);
    };

    recognition.onerror = (event: any) => {
      // Ignore normal abort / no-speech silence
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition warning:', event.error);
      }
      if (event.error === 'not-allowed') {
        setIsListening(false);
        setListeningState('idle');
      }
    };

    recognition.onend = () => {
      // Flush any remaining buffered speech when stopped
      if (uncommittedBufferRef.current) {
        commitSpeechBuffer(uncommittedBufferRef.current);
      }
      setIsListening(false);
      setListeningState('idle');
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
    }
  }, [commitSpeechBuffer]);

  const stopListening = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    if (uncommittedBufferRef.current) {
      commitSpeechBuffer(uncommittedBufferRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setListeningState('idle');
    setLiveInterim('');
  }, [commitSpeechBuffer]);

  const handleParse = useCallback(() => {
    if (!transcript.trim()) return;
    setIsParsing(true);

    setTimeout(() => {
      const result = parseDisasterVoiceTranscript(transcript);
      setParseResult(result);
      setIsParsing(false);
      onParseComplete(result);
    }, 600);
  }, [transcript, onParseComplete]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTranscript((prev) => (prev ? prev + ' ' + text : text));
    } catch {}
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
      {/* Microphone Section with Google-Style Visual Listener */}
      <div className="relative">
        <div className="flex flex-col items-center justify-center mb-4">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!micSupported}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 to-red-500 shadow-rose-500/50 scale-110'
                : micSupported
                ? 'bg-slate-800 hover:bg-slate-700 shadow-blue-500/10 hover:shadow-cyan-500/20 hover:scale-105 border border-slate-700'
                : 'bg-slate-800/50 cursor-not-allowed opacity-50'
            }`}
            title={isListening ? 'Tap to Stop Listening' : micSupported ? 'Tap to Start Speaking' : 'Microphone not supported'}
          >
            {/* Pulsing Ripple Wave for Active Speech */}
            {isListening && (
              <>
                <span
                  className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping"
                  style={{ animationDuration: '1.4s' }}
                />
                <span
                  className="absolute rounded-full bg-rose-500/15"
                  style={{
                    inset: `-${pulseIntensity * 0.18}px`,
                    transition: 'inset 80ms ease-out',
                  }}
                />
              </>
            )}
            {isListening ? (
              <MicOff className="w-10 h-10 text-white relative z-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10 text-cyan-400 relative z-10" />
            )}
          </button>

          {/* Real-Time Google-Mic Status Indicator */}
          <div className="mt-4 text-center">
            {isListening ? (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  {listeningState === 'recognizing'
                    ? 'Processing Speech Statement...'
                    : listeningState === 'committed'
                    ? 'Statement Recognized!'
                    : 'Listening... Speak naturally, then pause'}
                </div>

                {/* Live Real-Time Speech Chip (Google Mic Floating Text Preview) */}
                {liveInterim && (
                  <div className="max-w-md mx-auto px-4 py-2 bg-slate-900/90 border border-cyan-500/40 rounded-xl shadow-lg backdrop-blur-sm animate-fade-in">
                    <div className="flex items-center gap-2 text-cyan-300 text-xs">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse shrink-0 text-cyan-400" />
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">Hearing:</span>
                      <span className="font-medium truncate italic text-white">"{liveInterim}"</span>
                    </div>
                  </div>
                )}

                {/* Just Committed Confirmation */}
                {listeningState === 'committed' && lastCommittedPhrase && (
                  <div className="max-w-md mx-auto px-3 py-1.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-[11px] font-medium flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Added: "{lastCommittedPhrase}"</span>
                  </div>
                )}
              </div>
            ) : !micSupported ? (
              <p className="text-xs text-slate-500">
                Browser microphone not supported. Use text input or paste a transcript below.
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-300">
                  Tap microphone to dictate in English or Hindi / Hinglish.
                </p>
                <p className="text-[11px] text-slate-500">
                  Speaks $\rightarrow$ Pauses a few milliseconds $\rightarrow$ Automatically locks in clear individual statements without repeats.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Input Area */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Field Transcript Buffer
          </label>
          {transcript && (
            <span className="text-[10px] text-slate-500 font-mono">
              {transcript.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            setParseResult(null);
          }}
          placeholder="Clean field transcript will automatically appear here as you speak...&#10;&#10;Or paste radio notes, e.g.:&#10;&quot;NDRF team reporting. Rescued Veer Kumar, male, approximately 28 years old, near bridge collapse. Wearing blue denim jacket. Has scar on left eyebrow. Blood group B+...&quot;"
          rows={6}
          className="w-full px-4 py-3 text-sm bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none transition font-sans leading-relaxed"
        />

        {/* Action buttons below textarea */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 rounded-lg transition"
            >
              <Clipboard className="w-3.5 h-3.5 text-slate-400" /> Paste
            </button>

            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 rounded-lg transition"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" /> Demo Transcripts
              {showSamples ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {transcript && (
              <button
                onClick={() => {
                  setTranscript('');
                  setParseResult(null);
                  lastCommittedTextRef.current = '';
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-400 transition"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleParse}
              disabled={!transcript.trim() || isParsing}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition shadow-sm ${
                transcript.trim() && !isParsing
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Parsing Entities...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-cyan-200" /> Extract Disaster Fields
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sample Transcripts Dropdown */}
      {showSamples && (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-400" /> Pre-Configured Emergency Radio Transcripts
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_TRANSCRIPTS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => loadSample(s.text)}
                className="text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 transition group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                  {s.label}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.text}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Parse Results Preview Card */}
      {parseResult && (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-200 text-sm">NLP Extracted Entities</h3>
              <span className="text-[10px] text-slate-400 font-mono">({parseResult.extractedEntities.length} fields)</span>
            </div>

            {confidenceTier && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${confidenceBg} ${confidenceColor}`}
              >
                {ConfIcon && <ConfIcon className="w-3.5 h-3.5" />}
                <span>{parseResult.confidence}% {confidenceTier} CONFIDENCE</span>
              </div>
            )}
          </div>

          {/* Extracted Fields Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {parseResult.attributes.p_full_name && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Name</span>
                <span className="text-xs font-bold text-slate-200 truncate block">
                  {parseResult.attributes.p_full_name}
                </span>
              </div>
            )}
            {parseResult.attributes.p_gender && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Gender</span>
                <span className="text-xs font-bold text-slate-200">{parseResult.attributes.p_gender}</span>
              </div>
            )}
            {parseResult.attributes.p_approximate_age && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Approx Age</span>
                <span className="text-xs font-bold text-slate-200">{parseResult.attributes.p_approximate_age} yrs</span>
              </div>
            )}
            {parseResult.attributes.p_blood_group && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Blood Group</span>
                <span className="text-xs font-bold text-rose-400">{parseResult.attributes.p_blood_group}</span>
              </div>
            )}
            {parseResult.attributes.p_comm_status && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Communication</span>
                <span className="text-xs font-bold text-slate-200">{parseResult.attributes.p_comm_status}</span>
              </div>
            )}
            {parseResult.attributes.p_clothing && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Clothing</span>
                <span className="text-xs font-bold text-slate-200 truncate block">
                  {parseResult.attributes.p_clothing}
                </span>
              </div>
            )}
            {(parseResult.attributes.p_scars || parseResult.attributes.p_birthmarks) && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Marks & Scars</span>
                <span className="text-xs font-bold text-amber-300 truncate block">
                  {parseResult.attributes.p_scars || parseResult.attributes.p_birthmarks}
                </span>
              </div>
            )}
            {parseResult.attributes.p_found_location && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Found Location</span>
                <span className="text-xs font-bold text-slate-200 truncate block">
                  {parseResult.attributes.p_found_location}
                </span>
              </div>
            )}
            {(parseResult.attributes.p_condition_status || parseResult.attributes.p_report_notes) && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Condition / Notes</span>
                <span className="text-xs font-bold text-cyan-300 truncate block">
                  {parseResult.attributes.p_condition_status || parseResult.attributes.p_report_notes}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
