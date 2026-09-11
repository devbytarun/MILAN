import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  FileText,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Wand2,
  Volume2,
  Zap,
  Activity,
} from 'lucide-react';
import { parseDisasterVoiceTranscript } from '../../lib/voice-parser.ts';
import type { ParsedVoiceReport } from '../../lib/voice-parser.ts';

// Sample transcripts for demo purposes
const SAMPLE_TRANSCRIPTS = [
  {
    badge: 'NDRF RESCUE',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    label: 'NDRF Boat Team — Rescued 9yo Child',
    text: `Control, this is NDRF Battalion 4 boat team reporting. We just pulled a young male child, approximately 9 years old, from a rooftop near Alaknanda Riverside Market. The child is in shock and unable to speak. He is wearing a soiled red collared polo shirt with dark shorts. Has a visible scar on his left forearm and a black thread on his right wrist with a metallic charm. Slim build, short black hair. Blood group B+. Currently being transported to Camp Relief Zone 2 for intake. Condition stable, non-verbal due to trauma shock. Over.`,
  },
  {
    badge: 'TRAUMA HOSPITAL',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    label: 'ER Hospital — Unconscious Male Adult',
    text: `Emergency department, Central Trauma Hospital. We have an unknown adult male, approximately 40 years old, admitted via Army ambulance from Sector 9 bridge collapse. He is unconscious on arrival. Athletic build. Has an old appendectomy scar and an Om tattoo on his inner right wrist. He was wearing a torn grey athletic hoodie and black track pants. Silver ring on left ring finger. Found with a waterlogged Casio digital watch. Blood group A+. Currently receiving IV fluids. Moderate head concussion.`,
  },
  {
    badge: 'FAMILY DISPATCH',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    label: 'Family Report — Missing Grandmother',
    text: `My grandmother named Meera Sen, also called Dida, has been missing since the bridge colony evacuation. She is about 64 years old, female. Fair complexion, medium build. She has gray and white curly hair usually tied in a bun. She wears bifocal spectacles with golden metal frame and a gold chain with a rudraksha bead. She was wearing a green cotton saree with maroon border. She carries a canvas shoulder bag with her blood pressure prescription inside. Blood group O+. Please help us find her.`,
  },
  {
    badge: 'HINGLISH RADIO',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    label: 'Relief Camp — Hinglish Radio Intake',
    text: `Ek ladka mila Bhimtal relief camp ke paas. Umar lagbhag 28 saal. Blue denim jacket pehni hai. Right eyebrow ke upar scar hai. Blood group B+ bataya. Name is Bir Kumar. Condition stable hai.`,
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

  // Smooth wave animation during recording
  useEffect(() => {
    if (isListening) {
      let phase = 0;
      const animate = () => {
        phase += 0.08;
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

      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }

      if (isFinalResult) {
        commitSpeechBuffer(currentResultText);
        return;
      }

      // 800ms silence detection debounce
      pauseTimerRef.current = setTimeout(() => {
        if (uncommittedBufferRef.current) {
          commitSpeechBuffer(uncommittedBufferRef.current);
        }
      }, 800);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition warning:', event.error);
      }
      if (event.error === 'not-allowed') {
        setIsListening(false);
        setListeningState('idle');
      }
    };

    recognition.onend = () => {
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
      setIsParsing(false);
      onParseComplete(result);
    }, 500);
  }, [transcript, onParseComplete]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTranscript((prev) => (prev ? prev + ' ' + text : text));
    } catch {}
  }, []);

  const loadSample = useCallback((text: string) => {
    setTranscript(text);
    setShowSamples(false);
  }, []);

  return (
    <div className="space-y-8">
      {/* Interactive Glowing Mic Visualizer */}
      <div className="relative py-4 flex flex-col items-center justify-center">
        {/* Ambient Gradient Backdrop Glow */}
        <div
          className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isListening ? 'bg-rose-500/25 scale-125' : 'bg-cyan-500/15'
          }`}
        />

        {/* The Microphone Interactive Orb */}
        <div className="relative mb-6">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!micSupported}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-2xl shadow-rose-500/60 scale-105 ring-4 ring-rose-400/40'
                : micSupported
                ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 hover:from-slate-700 hover:to-slate-900 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/30 hover:scale-105 border-2 border-slate-700 hover:border-cyan-400'
                : 'bg-slate-800/50 cursor-not-allowed opacity-50'
            }`}
            title={isListening ? 'Tap to Stop Listening' : micSupported ? 'Tap to Start Dictating' : 'Microphone Not Supported'}
          >
            {/* Concentric Audio Aura Rings when listening */}
            {isListening && (
              <>
                <span
                  className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping pointer-events-none"
                  style={{ animationDuration: '1.6s' }}
                />
                <span
                  className="absolute rounded-full border border-rose-400/30 pointer-events-none"
                  style={{
                    inset: `-${pulseIntensity * 0.25}px`,
                    transition: 'inset 80ms ease-out',
                  }}
                />
                <span
                  className="absolute rounded-full border border-amber-400/20 pointer-events-none"
                  style={{
                    inset: `-${pulseIntensity * 0.45}px`,
                    transition: 'inset 120ms ease-out',
                  }}
                />
              </>
            )}

            {isListening ? (
              <MicOff className="w-12 h-12 text-white drop-shadow-md animate-pulse" />
            ) : (
              <Mic className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
            )}
          </button>

          {/* Equalizer Frequency Bars when Listening */}
          {isListening && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 bg-slate-950/90 border border-rose-500/40 rounded-full shadow-lg">
              <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-6 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
              <span className="w-1 h-4 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          )}
        </div>

        {/* State Status & Google Mic Live Preview */}
        <div className="text-center space-y-3 max-w-lg z-10">
          {isListening ? (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                {listeningState === 'recognizing'
                  ? 'Debouncing & Locking Phrase...'
                  : listeningState === 'committed'
                  ? 'Statement Recognized!'
                  : 'Mic Active — Speak naturally and pause'}
              </div>

              {/* Floating Real-Time Speech Chip */}
              {liveInterim && (
                <div className="p-3 bg-slate-950/90 border border-cyan-500/50 rounded-2xl shadow-xl backdrop-blur-md animate-fade-in">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs justify-center">
                    <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                    <span className="font-mono text-slate-400">Hearing:</span>
                    <span className="font-semibold text-white truncate max-w-xs">"{liveInterim}"</span>
                  </div>
                </div>
              )}

              {/* Just-Committed Feedback */}
              {listeningState === 'committed' && lastCommittedPhrase && (
                <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="truncate">Captured: "{lastCommittedPhrase}"</span>
                </div>
              )}
            </div>
          ) : !micSupported ? (
            <p className="text-xs text-rose-400 font-medium">
              Microphone not supported in this browser. Use keyboard or paste below.
            </p>
          ) : (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Institutional Speech-to-Entity Engine
              </div>
              <p className="text-xs text-slate-400 pt-1">
                Tap microphone to dictate field rescue logs in English or Hindi. Pause ~800ms to lock each clean statement.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transcript Textarea Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              Radio / Dictation Buffer
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700">
              Live Buffer
            </span>
          </div>
          {transcript && (
            <span className="text-xs text-slate-400 font-mono">
              {transcript.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          )}
        </div>

        <div className="relative rounded-2xl p-1 bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border border-slate-700/80 shadow-2xl focus-within:border-cyan-400/80 focus-within:ring-4 focus-within:ring-cyan-500/20 transition-all">
          <textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
            }}
            placeholder="Clean dictated statement will appear here as you speak...&#10;&#10;Or paste dispatch notes, e.g.:&#10;&quot;Control, this is NDRF boat team. Rescued Veer Kumar, male, approximately 28 years old, near bridge. Wearing blue denim jacket. Has scar on left eyebrow. Blood group B+...&quot;"
            rows={6}
            className="w-full px-4 py-3.5 text-sm bg-slate-950/80 rounded-xl text-slate-100 placeholder-slate-500 outline-none resize-none transition font-sans leading-relaxed border-none"
          />

          {/* Action Row Inside Card */}
          <div className="flex items-center justify-between p-2 pt-1 border-t border-slate-800/80 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePaste}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition shadow-sm"
              >
                <Clipboard className="w-3.5 h-3.5 text-slate-400" /> Paste Notes
              </button>

              <button
                onClick={() => setShowSamples(!showSamples)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-white rounded-lg transition shadow-sm"
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400" /> Demo Transcripts
                {showSamples ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {transcript && (
                <button
                  onClick={() => {
                    setTranscript('');
                    lastCommittedTextRef.current = '';
                  }}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition"
                >
                  Clear Buffer
                </button>
              )}

              <button
                onClick={handleParse}
                disabled={!transcript.trim() || isParsing}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition shadow-lg ${
                  transcript.trim() && !isParsing
                    ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/25 hover:scale-[1.02]'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Extracting Entities...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-cyan-200" />
                    <span>Extract Fields & Review →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Transcripts Cards */}
      {showSamples && (
        <div className="bg-slate-900/95 rounded-2xl border border-slate-700/80 p-5 space-y-3 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" /> Click Any Realistic Emergency Dispatch to Test
            </span>
            <span className="text-[11px] text-slate-500">1-Click Evaluation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAMPLE_TRANSCRIPTS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => loadSample(s.text)}
                className="text-left p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-400/50 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${s.badgeColor}`}>
                      {s.badge}
                    </span>
                    <span className="text-[10px] text-cyan-400 group-hover:translate-x-0.5 transition font-semibold">
                      Load →
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition">
                    {s.label}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{s.text}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
