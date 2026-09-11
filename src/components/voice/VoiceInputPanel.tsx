import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  VolumeX,
  Zap,
  Activity,
  User,
  Heart,
  Calendar,
  Ruler,
  Tag,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { parseDisasterVoiceTranscript } from '../../lib/voice-parser.ts';
import type { ParsedVoiceReport } from '../../lib/voice-parser.ts';

// Web Audio API zero-dependency chime synthesizer
function playAssistantChime(type: 'start' | 'lock') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'lock') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(987.77, now + 0.08); // B5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {}
}

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
    badge: 'CONVERSATIONAL RESCUE',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    label: 'Direct First-Person Survivor Dictation',
    text: `My name is Veer and I am at NGO field and I can communicate my full name is Viranshu Singhania my age is 21 and gender is male my blood group is O positive and I am athletic type build my hair description is long black hair and my height is 184 CM.`,
  },
];

interface VoiceInputPanelProps {
  onParseComplete: (result: ParsedVoiceReport) => void;
  theme?: 'dark' | 'light' | 'cyber';
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

export const VoiceInputPanel: React.FC<VoiceInputPanelProps> = ({ onParseComplete, theme = 'dark' }) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [listeningState, setListeningState] = useState<'idle' | 'listening' | 'recognizing' | 'committed'>('idle');
  const [liveInterim, setLiveInterim] = useState('');
  const [lastCommittedPhrase, setLastCommittedPhrase] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uncommittedBufferRef = useRef<string>('');
  const lastCommittedTextRef = useRef<string>('');

  // Real-time entity radar: parse live transcript as words arrive
  const liveParsed = useMemo(() => {
    const combined = `${transcript} ${liveInterim}`.trim();
    if (!combined) return null;
    return parseDisasterVoiceTranscript(combined);
  }, [transcript, liveInterim]);

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
  const commitSpeechBuffer = useCallback(
    (rawPhrase: string) => {
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

        if (soundEnabled) {
          playAssistantChime('lock');
        }

        setTimeout(() => {
          setListeningState((current) => (current === 'committed' && isListeningRef.current ? 'listening' : current));
        }, 550);
      }, 100);
    },
    [soundEnabled]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    // Instant synchronous UI state activation
    isListeningRef.current = true;
    setIsListening(true);
    setListeningState('listening');
    uncommittedBufferRef.current = '';
    setLiveInterim('');

    if (soundEnabled) {
      playAssistantChime('start');
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

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

      // Snappy 480ms silence commit
      pauseTimerRef.current = setTimeout(() => {
        if (uncommittedBufferRef.current) {
          commitSpeechBuffer(uncommittedBufferRef.current);
        }
      }, 480);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition status:', event.error);
      }
      if (event.error === 'not-allowed') {
        isListeningRef.current = false;
        setIsListening(false);
        setListeningState('idle');
      }
    };

    recognition.onend = () => {
      if (uncommittedBufferRef.current) {
        commitSpeechBuffer(uncommittedBufferRef.current);
      }
      // If user still intends to listen, seamlessly maintain session
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          isListeningRef.current = false;
          setIsListening(false);
          setListeningState('idle');
        }
      } else {
        setIsListening(false);
        setListeningState('idle');
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition immediate activation note:', err);
    }
  }, [commitSpeechBuffer, soundEnabled]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setListeningState('idle');
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    if (uncommittedBufferRef.current) {
      commitSpeechBuffer(uncommittedBufferRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setLiveInterim('');
  }, [commitSpeechBuffer]);

  const handleParse = useCallback(() => {
    if (!transcript.trim()) return;
    setIsParsing(true);

    setTimeout(() => {
      const result = parseDisasterVoiceTranscript(transcript);
      setIsParsing(false);
      onParseComplete(result);
    }, 450);
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

  // Theme-specific CSS classes
  const isLight = theme === 'light';
  const isCyber = theme === 'cyber';

  return (
    <div className="space-y-8 transition-colors duration-500">
      {/* Interactive Glowing Mic Visualizer */}
      <div className="relative py-4 flex flex-col items-center justify-center">
        {/* Ambient Gradient Backdrop Glow */}
        <div
          className={`absolute w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isListening
              ? 'bg-rose-500/30 scale-125'
              : isCyber
              ? 'bg-purple-500/20'
              : isLight
              ? 'bg-blue-400/15'
              : 'bg-cyan-500/15'
          }`}
        />

        {/* Sound toggle & Assistant Badge */}
        <div className="flex items-center gap-3 mb-6 z-10">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-colors ${
              isCyber
                ? 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                : isLight
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Milan AI Voice Assistant</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono border transition ${
              soundEnabled
                ? isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                : isLight
                ? 'bg-slate-100 border-slate-300 text-slate-500'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Audio Feedback Chimes"
          >
            {soundEnabled ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3" />}
            <span>{soundEnabled ? 'Chimes: ON' : 'Chimes: OFF'}</span>
          </button>
        </div>

        {/* The Microphone Interactive Orb */}
        <div className="relative mb-6">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!micSupported}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-2xl shadow-rose-500/60 scale-105 ring-4 ring-rose-400/40'
                : isCyber
                ? 'bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 hover:from-purple-800 hover:to-indigo-900 shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 border-2 border-purple-500/40 hover:border-cyan-400'
                : isLight
                ? 'bg-gradient-to-br from-white via-slate-100 to-blue-50 hover:from-blue-50 hover:to-indigo-50 shadow-xl shadow-blue-500/15 hover:shadow-blue-500/30 hover:scale-105 border-2 border-blue-200 hover:border-blue-500'
                : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 hover:from-slate-700 hover:to-slate-900 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/30 hover:scale-105 border-2 border-slate-700 hover:border-cyan-400'
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
                  className="absolute rounded-full border border-rose-400/40 pointer-events-none"
                  style={{
                    inset: `-${pulseIntensity * 0.28}px`,
                    transition: 'inset 80ms ease-out',
                  }}
                />
                <span
                  className="absolute rounded-full border border-amber-400/20 pointer-events-none"
                  style={{
                    inset: `-${pulseIntensity * 0.5}px`,
                    transition: 'inset 120ms ease-out',
                  }}
                />
              </>
            )}

            {isListening ? (
              <MicOff className="w-14 h-14 text-white drop-shadow-md animate-pulse" />
            ) : (
              <Mic
                className={`w-14 h-14 transition-colors ${
                  isCyber
                    ? 'text-cyan-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : isLight
                    ? 'text-blue-600 drop-shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                    : 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                }`}
              />
            )}
          </button>

          {/* Equalizer Frequency Bars when Listening */}
          {isListening && (
            <div
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 rounded-full shadow-lg border ${
                isLight ? 'bg-white border-rose-300' : 'bg-slate-950/90 border-rose-500/40'
              }`}
            >
              <span className="w-1 h-3.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-6 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
              <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          )}
        </div>

        {/* State Status & Google Mic Live Preview */}
        <div className="text-center space-y-3 max-w-lg z-10">
          {isListening ? (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                {listeningState === 'recognizing'
                  ? 'Debouncing & Locking Statement...'
                  : listeningState === 'committed'
                  ? 'Statement Recognized!'
                  : 'Listening... Speak details naturally'}
              </div>

              {/* Floating Real-Time Speech Chip */}
              {liveInterim && (
                <div
                  className={`p-3 rounded-2xl shadow-xl backdrop-blur-md animate-fade-in border ${
                    isLight ? 'bg-white/95 border-blue-300 text-blue-900' : 'bg-slate-950/90 border-cyan-500/50 text-cyan-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs justify-center">
                    <Volume2 className="w-4 h-4 animate-pulse shrink-0 text-cyan-400" />
                    <span className="font-mono text-slate-400">Hearing:</span>
                    <span className={`font-semibold truncate max-w-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      "{liveInterim}"
                    </span>
                  </div>
                </div>
              )}

              {/* Just-Committed Feedback */}
              {listeningState === 'committed' && lastCommittedPhrase && (
                <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-fade-in">
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
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Speak all details in one go: name, age, communication status, blood group, height, build, clothing, or location.
            </p>
          )}
        </div>

        {/* Live Entity Radar: Real-Time Extraction Badges */}
        {liveParsed && liveParsed.extractedEntities.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 max-w-xl mx-auto w-full z-10 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 font-mono">
                <Activity className="w-3 h-3 text-cyan-400" /> Live AI Entity Radar ({liveParsed.extractedEntities.length} attributes detected)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {liveParsed.confidence}% confidence
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {liveParsed.attributes.p_full_name && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-scale-in">
                  <User className="w-3 h-3" /> {liveParsed.attributes.p_full_name}
                </span>
              )}
              {liveParsed.attributes.p_age && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                  <Calendar className="w-3 h-3" /> Age: {liveParsed.attributes.p_age}
                </span>
              )}
              {liveParsed.attributes.p_gender && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                  {liveParsed.attributes.p_gender}
                </span>
              )}
              {liveParsed.attributes.p_blood_group && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40">
                  <Heart className="w-3 h-3" /> {liveParsed.attributes.p_blood_group}
                </span>
              )}
              {liveParsed.attributes.p_comm_status && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  💬 {liveParsed.attributes.p_comm_status === 'CAN_COMMUNICATE' ? 'Can Communicate' : 'Non-Verbal'}
                </span>
              )}
              {liveParsed.attributes.p_height_cm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40">
                  <Ruler className="w-3 h-3" /> {liveParsed.attributes.p_height_cm} cm
                </span>
              )}
              {liveParsed.attributes.p_build && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  Build: {liveParsed.attributes.p_build}
                </span>
              )}
              {liveParsed.attributes.p_found_location && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/40">
                  <MapPin className="w-3 h-3" /> {liveParsed.attributes.p_found_location}
                </span>
              )}
              {liveParsed.attributes.p_scars && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-400/40">
                  🩹 Scar: {liveParsed.attributes.p_scars}
                </span>
              )}
              {liveParsed.attributes.p_birthmarks && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-400/40">
                  <Sparkles className="w-3 h-3" /> Mark: {liveParsed.attributes.p_birthmarks}
                </span>
              )}
              {liveParsed.attributes.p_hair_description && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">
                  Hair: {liveParsed.attributes.p_hair_description}
                </span>
              )}
              {liveParsed.attributes.p_condition_status && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 border border-red-400/40">
                  Status: {liveParsed.attributes.p_condition_status}
                </span>
              )}
              {liveParsed.attributes.p_clothing && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 truncate max-w-xs">
                  <Tag className="w-3 h-3" /> {liveParsed.attributes.p_clothing}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transcript Textarea Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              Radio / Dictation Buffer
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Live Buffer
            </span>
          </div>
          {transcript && (
            <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {transcript.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          )}
        </div>

        <div
          className={`relative rounded-2xl p-1 shadow-2xl transition-all border ${
            isCyber
              ? 'bg-gradient-to-b from-purple-950 via-[#100726] to-[#0d0520] border-purple-800/80 focus-within:border-cyan-400'
              : isLight
              ? 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-300 focus-within:border-blue-500'
              : 'bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border-slate-700/80 focus-within:border-cyan-400/80'
          }`}
        >
          <textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
            }}
            placeholder="Clean dictated statement will appear here as you speak...&#10;&#10;Or paste dispatch notes, e.g.:&#10;&quot;Control, this is NDRF boat team. Rescued Veer Kumar, male, approximately 28 years old, near bridge. Wearing blue denim jacket. Has scar on left eyebrow. Blood group B+...&quot;"
            rows={6}
            className={`w-full px-4 py-3.5 text-sm rounded-xl outline-none resize-none transition font-sans leading-relaxed border-none ${
              isLight
                ? 'bg-white text-slate-900 placeholder-slate-400'
                : 'bg-slate-950/80 text-slate-100 placeholder-slate-500'
            }`}
          />

          {/* Action Row Inside Card */}
          <div
            className={`flex items-center justify-between p-2 pt-1 border-t flex-wrap gap-2 ${
              isLight ? 'border-slate-200' : 'border-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={handlePaste}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition shadow-sm border ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Clipboard className="w-3.5 h-3.5" /> Paste Notes
              </button>

              <button
                onClick={() => setShowSamples(!showSamples)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition shadow-sm border ${
                  isLight
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-cyan-300 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" /> Demo Transcripts
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
                    ? isCyber
                      ? 'bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-500 text-white shadow-purple-500/30 hover:scale-[1.02]'
                      : isLight
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20 hover:scale-[1.02]'
                      : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/25 hover:scale-[1.02]'
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
                    <Wand2 className="w-4 h-4" />
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
        <div
          className={`rounded-2xl border p-5 space-y-3 shadow-2xl animate-fade-in ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-700/80'
          }`}
        >
          <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <span
              className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isLight ? 'text-slate-800' : 'text-slate-300'
              }`}
            >
              <Radio className="w-4 h-4 text-cyan-400" /> Click Any Realistic Emergency Dispatch to Test
            </span>
            <span className="text-[11px] text-slate-500">1-Click Evaluation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAMPLE_TRANSCRIPTS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => loadSample(s.text)}
                className={`text-left p-3.5 rounded-xl border transition-all group flex flex-col justify-between ${
                  isLight
                    ? 'bg-slate-50 hover:bg-blue-50/50 border-slate-200 hover:border-blue-400/50'
                    : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/60 hover:border-cyan-400/50'
                }`}
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
                  <div
                    className={`text-xs font-bold transition ${
                      isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-slate-100 group-hover:text-cyan-300'
                    }`}
                  >
                    {s.label}
                  </div>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {s.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
