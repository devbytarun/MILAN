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
  Activity,
  User,
  Heart,
  Calendar,
  Tag,
  MapPin,
} from 'lucide-react';
import { parseDisasterVoiceTranscript } from '../../lib/voice-parser.ts';
import type { ParsedVoiceReport } from '../../lib/voice-parser.ts';
import { Button } from '../ui/Button.tsx';

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

// Sample transcripts for field demonstration
const SAMPLE_TRANSCRIPTS = [
  {
    badge: 'NDRF RESCUE',
    label: 'NDRF Boat Team — Rescued 9yo Child',
    text: `Control, this is NDRF Battalion 4 boat team reporting. We just pulled a young male child, approximately 9 years old, from a rooftop near Alaknanda Riverside Market. The child is in shock and unable to speak. He is wearing a soiled red collared polo shirt with dark shorts. Has a visible scar on his left forearm and a black thread on his right wrist with a metallic charm. Slim build, short black hair. Blood group B+. Currently being transported to Camp Relief Zone 2 for intake. Condition stable, non-verbal due to trauma shock. Over.`,
  },
  {
    badge: 'TRAUMA HOSPITAL',
    label: 'ER Hospital — Unconscious Male Adult',
    text: `Emergency department, Central Trauma Hospital. We have an unknown adult male, approximately 40 years old, admitted via Army ambulance from Sector 9 bridge collapse. He is unconscious on arrival. Athletic build. Has an old appendectomy scar and an Om tattoo on his inner right wrist. He was wearing a torn grey athletic hoodie and black track pants. Silver ring on left ring finger. Found with a waterlogged Casio digital watch. Blood group A+. Currently receiving IV fluids. Moderate head concussion.`,
  },
  {
    badge: 'FAMILY DISPATCH',
    label: 'Family Report — Missing Grandmother',
    text: `My grandmother named Meera Sen, also called Dida, has been missing since the bridge colony evacuation. She is about 64 years old, female. Fair complexion, medium build. She has gray and white curly hair usually tied in a bun. She wears bifocal spectacles with golden metal frame and a gold chain with a rudraksha bead. She was wearing a green cotton saree with maroon border. She carries a canvas shoulder bag with her blood pressure prescription inside. Blood group O+. Please help us find her.`,
  },
  {
    badge: 'CONVERSATIONAL RESCUE',
    label: 'Direct First-Person Survivor Dictation',
    text: `My name is Veer and I am at NGO field and I can communicate my full name is Viranshu Singhania my age is 21 and gender is male my blood group is O positive and I am athletic type build my hair description is long black hair and my height is 184 CM.`,
  },
];

interface VoiceInputPanelProps {
  onParseComplete: (result: ParsedVoiceReport) => void;
}

/**
 * Clean and deduplicate words and phrases caused by speech recognition loopbacks.
 */
function cleanSpeechStatement(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText.replace(/\s+/g, ' ').trim();

  // Remove consecutive identical duplicate words
  cleaned = cleaned.replace(/\b([a-zA-Z0-9_\u0900-\u097F]+)(\s+\1\b)+/gi, '$1');
  // Remove immediate repeated 2-word phrases
  cleaned = cleaned.replace(/\b([a-zA-Z0-9_\u0900-\u097F]+\s+[a-zA-Z0-9_\u0900-\u097F]+)(\s+\1\b)+/gi, '$1');
  // Remove immediate repeated 3-word phrases
  cleaned = cleaned.replace(/\b([a-zA-Z0-9_\u0900-\u097F]+\s+[a-zA-Z0-9_\u0900-\u097F]+\s+[a-zA-Z0-9_\u0900-\u097F]+)(\s+\1\b)+/gi, '$1');

  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

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
  const [soundEnabled, setSoundEnabled] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uncommittedBufferRef = useRef<string>('');
  const lastCommittedTextRef = useRef<string>('');

  // Real-time entity radar: parse live transcript as words arrive
  const liveParsed = useMemo(() => {
    const combined = `${transcript} ${liveInterim}`.trim();
    if (!combined) return null;
    return parseDisasterVoiceTranscript(combined);
  }, [transcript, liveInterim]);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
    }
  }, []);

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

  return (
    <div className="space-y-6 text-[#333840] font-body">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#dddddd] gap-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#181d26]" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#181d26]">
            VOICE & AUDIO DISPATCH PARSER
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-[#dddddd] bg-[#f8fafc] hover:bg-white text-[#41454d] font-medium transition-colors"
            title="Toggle Audio Feedback Chimes"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#006400]" /> : <VolumeX className="w-3.5 h-3.5 text-[#9297a0]" />}
            <span>{soundEnabled ? 'Chimes: ON' : 'Chimes: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Center Dictation Visualizer */}
      <div className="p-6 sm:p-8 bg-[#f8fafc] border border-[#dddddd] rounded-xl flex flex-col items-center justify-center text-center space-y-4">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={!micSupported}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 select-none shadow-elevation-2 active:scale-95 ${
            isListening
              ? 'bg-[#aa2d00] text-white animate-pulse'
              : 'bg-[#181d26] text-white hover:bg-[#2c333f]'
          }`}
          title={isListening ? 'Click to Stop Listening' : micSupported ? 'Click to Start Voice Recording' : 'Microphone Not Supported'}
        >
          {isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>

        <div className="space-y-1 max-w-md">
          <div className="text-sm font-semibold text-[#181d26]">
            {isListening
              ? listeningState === 'recognizing'
                ? 'Processing Spoken Input...'
                : listeningState === 'committed'
                ? 'Phrase Captured!'
                : 'Listening... Speak Details Naturally'
              : 'Click to Start Speech-to-Text Dictation'}
          </div>
          <p className="text-xs text-[#41454d]">
            {isListening
              ? 'Speak continuous details: name, age, clothes, scars, location, blood group, condition.'
              : 'Or paste raw VHF radio logs or field dispatch text directly in the box below.'}
          </p>
        </div>

        {/* Live Interim Feedback */}
        {liveInterim && (
          <div className="px-3 py-1.5 bg-white border border-[#dddddd] rounded-lg text-xs font-medium text-[#181d26] shadow-sm max-w-md truncate">
            <span className="text-[#9297a0] font-mono text-[10px] uppercase mr-1.5">Hearing:</span>
            "{liveInterim}"
          </div>
        )}

        {listeningState === 'committed' && lastCommittedPhrase && (
          <div className="px-3 py-1 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg text-xs font-semibold text-[#0a2e0e] flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006400]" />
            <span className="truncate">Captured: "{lastCommittedPhrase}"</span>
          </div>
        )}
      </div>

      {/* Live Entity Radar: Attributes detected in real time */}
      {liveParsed && liveParsed.extractedEntities.length > 0 && (
        <div className="p-4 bg-white border border-[#dddddd] rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[#181d26] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#181d26]" /> Real-Time Extracted Evidence ({liveParsed.extractedEntities.length} fields detected)
            </span>
            <span className="font-mono text-xs font-bold text-[#006400]">
              {liveParsed.confidence}% confidence
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {liveParsed.attributes.p_full_name && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                <User className="w-3 h-3 text-[#9297a0]" /> Name: <strong>{liveParsed.attributes.p_full_name}</strong>
              </span>
            )}
            {liveParsed.attributes.p_age && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                <Calendar className="w-3 h-3 text-[#9297a0]" /> Age: <strong>{liveParsed.attributes.p_age}</strong>
              </span>
            )}
            {liveParsed.attributes.p_gender && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                Gender: <strong>{liveParsed.attributes.p_gender}</strong>
              </span>
            )}
            {liveParsed.attributes.p_blood_group && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                <Heart className="w-3 h-3 text-[#aa2d00]" /> Blood: <strong>{liveParsed.attributes.p_blood_group}</strong>
              </span>
            )}
            {liveParsed.attributes.p_comm_status && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                Comm: <strong>{liveParsed.attributes.p_comm_status === 'CAN_COMMUNICATE' ? 'Verbal' : 'Non-Verbal'}</strong>
              </span>
            )}
            {liveParsed.attributes.p_found_location && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                <MapPin className="w-3 h-3 text-[#9297a0]" /> Location: <strong>{liveParsed.attributes.p_found_location}</strong>
              </span>
            )}
            {liveParsed.attributes.p_clothing && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f8fafc] text-[#181d26] border border-[#dddddd] truncate max-w-xs">
                <Tag className="w-3 h-3 text-[#9297a0]" /> Clothes: <strong>{liveParsed.attributes.p_clothing}</strong>
              </span>
            )}
            {liveParsed.attributes.p_scars && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                Scar: <strong>{liveParsed.attributes.p_scars}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Transcript Textarea Card */}
      <div className="bg-white border border-[#dddddd] rounded-xl p-5 shadow-elevation-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#181d26]" />
            <label htmlFor="transcript-area" className="text-xs font-mono font-bold uppercase tracking-wider text-[#181d26]">
              Dispatch Transcript Buffer
            </label>
          </div>
          {transcript && (
            <span className="text-xs font-mono text-[#9297a0]">
              {transcript.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          )}
        </div>

        <textarea
          id="transcript-area"
          ref={textareaRef}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Spoken statements will stream here automatically...&#10;&#10;Or paste dispatch notes, e.g.:&#10;&quot;Control, this is NDRF boat team. Rescued Veer Kumar, male, approximately 28 years old, near bridge. Wearing blue denim jacket. Has scar on left eyebrow. Blood group B+...&quot;"
          rows={5}
          className="w-full px-3.5 py-3 text-sm rounded-lg border border-[#dddddd] bg-[#f8fafc] focus:bg-white text-[#181d26] placeholder-[#9297a0] outline-none focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] transition leading-relaxed resize-none"
        />

        {/* Action Controls Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-[#dddddd] gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePaste}
              leftIcon={<Clipboard className="w-3.5 h-3.5" />}
            >
              Paste Notes
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSamples(!showSamples)}
              leftIcon={<Radio className="w-3.5 h-3.5" />}
            >
              Demo Transcripts {showSamples ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </Button>
            {transcript && (
              <button
                type="button"
                onClick={() => {
                  setTranscript('');
                  lastCommittedTextRef.current = '';
                }}
                className="text-xs text-[#9297a0] hover:text-[#aa2d00] font-medium ml-1 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleParse}
            disabled={!transcript.trim() || isParsing}
            leftIcon={isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {isParsing ? 'Parsing Spoken Evidence...' : 'Extract Fields & Review →'}
          </Button>
        </div>
      </div>

      {/* Demo Transcripts Expandable Grid */}
      {showSamples && (
        <div className="bg-[#f8fafc] border border-[#dddddd] rounded-xl p-5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#dddddd]">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#181d26]">
              Select Preloaded Crisis Dispatches:
            </span>
            <span className="text-[11px] text-[#9297a0] font-mono">
              Click any card to load transcript
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_TRANSCRIPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSample(item.text)}
                className="p-3.5 bg-white border border-[#dddddd] hover:border-[#181d26] rounded-lg text-left transition-colors space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f8fafc] border border-[#dddddd] text-[#181d26]">
                    {item.badge}
                  </span>
                  <span className="text-[11px] font-medium text-[#1b61c9] group-hover:underline">
                    Load →
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#181d26]">{item.label}</div>
                <p className="text-[11px] text-[#41454d] line-clamp-2 leading-relaxed">
                  {item.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
