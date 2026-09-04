import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ai, AI_COSTS, hasDevAiKey } from '../services/geminiService';
import { canAfford, spendPoints } from '../services/gamificationService';
import { LiveServerMessage, Modality } from '@google/genai';
import { Mic, X, Radio, Loader2, AlertCircle } from './Icons';
import toast from 'react-hot-toast';

interface LiveVoiceTutorProps {
  onClose: () => void;
}

// --- AUDIO HELPERS ---

const uint8ToBase64 = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToUint8 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const createPcmBlob = (data: Float32Array) => {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: uint8ToBase64(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
};

const LiveVoiceTutor: React.FC<LiveVoiceTutorProps> = ({ onClose }) => {
  interface LiveVoiceState {
    status: 'connecting' | 'connected' | 'error' | 'closed';
    errorMessage: string;
    volume: number;
  }
  const [state, setState] = useState<LiveVoiceState>({
    status: 'connecting',
    errorMessage: '',
    volume: 0,
  });

  // Audio Context Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Playback Queue
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Connection
  const sessionPromiseRef = useRef<Promise<unknown> | null>(null);

  useEffect(() => {
    // Initial Check
    const init = async () => {
      if (!hasDevAiKey()) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage:
            'Live voice is only available in local development (set VITE_GEMINI_DEV_KEY). No points were charged.',
        }));
        return;
      }

      const affordable = await canAfford(AI_COSTS.LIVE_SESSION);
      if (!affordable) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: `Not enough points. Need ${AI_COSTS.LIVE_SESSION} points to start.`,
        }));
        return;
      }

      // Deduct Entry Fee
      const success = await spendPoints(AI_COSTS.LIVE_SESSION, 'Started Live Tutor Session');
      if (!success) {
        setState((prev) => ({ ...prev, status: 'error', errorMessage: 'Payment failed.' }));
        return;
      }

      toast.success(`Started Session! -${AI_COSTS.LIVE_SESSION} Points`);
      startSession();
    };

    init();

    return () => {
      cleanup();
    };
    // Mount-only: referencing cleanup/startSession in the deps array reads
    // them before their const declarations below (temporal dead zone) and
    // crashed the component on open. They are stable useCallbacks, so an
    // empty deps array is equivalent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    inputContextRef.current?.close();
    outputContextRef.current?.close();
    sessionPromiseRef.current?.then((s: unknown) => (s as { close: () => void }).close());
  }, []);

  const playAudioChunk = useCallback(async (base64: string, ctx: AudioContext) => {
    const bytes = base64ToUint8(base64);
    const dataInt16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(dataInt16.length);
    for (let i = 0; i < dataInt16.length; i++) {
      float32[i] = dataInt16[i] / 32768.0;
    }

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startTime = Math.max(now, nextStartTimeRef.current);
    source.start(startTime);

    nextStartTimeRef.current = startTime + buffer.duration;

    sourcesRef.current.add(source);
    source.onended = () => sourcesRef.current.delete(source);
  }, []);

  const startSession = useCallback(async () => {
    try {
      // 1. Audio Setup
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      inputContextRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )({
        sampleRate: 16000,
      });
      outputContextRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )({
        sampleRate: 24000,
      });

      const inputCtx = inputContextRef.current;
      const outputCtx = outputContextRef.current;

      // 2. Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setState((prev) => ({ ...prev, status: 'connected' }));
            console.log('Gemini Live Connected');

            // Start Mic Streaming
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);

              // Simple volume meter
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              setState((prev) => ({ ...prev, volume: Math.sqrt(sum / inputData.length) }));

              // Create Blob and Send
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);

            sourceNodeRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputCtx) {
              playAudioChunk(audioData, outputCtx);
            }

            const interrupted = msg.serverContent?.interrupted;
            if (interrupted) {
              sourcesRef.current.forEach((s) => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setState((prev) => ({ ...prev, status: 'closed' }));
          },
          onerror: (e) => {
            console.error('Live Error', e);
            setState((prev) => ({
              ...prev,
              status: 'error',
              errorMessage: 'Connection failed. Please try again.',
            }));
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: {
            parts: [
              {
                text: 'You are Sophea Tonsay (The Wise Rabbit), a helpful and friendly English tutor for Cambodian students. Speak clearly and slowly. Correct grammar mistakes gently. Keep responses concise.',
              },
            ],
          },
        },
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (e: unknown) {
      console.error('Setup Failed', e);
      const msg = e instanceof Error ? e.message : 'Failed to initialize microphone or connection.';
      setState((prev) => ({ ...prev, status: 'error', errorMessage: msg }));
    }
  }, [playAudioChunk]);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 dark:bg-surface-3 flex flex-col items-center justify-center text-white p-6 animate-in fade-in zoom-in duration-300">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 p-2 bg-surface/10 hover:bg-surface/20 rounded-full transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="flex flex-col items-center gap-8">
        {/* Visualizer Ring */}
        <div className="relative">
          <div
            className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-100 ${
              state.status === 'connected'
                ? 'border-green-400 shadow-[0_0_50px_rgba(74,222,128,0.3)]'
                : state.status === 'error'
                  ? 'border-red-500'
                  : 'border-gray-600 dark:border-line-strong'
            }`}
            style={{ transform: `scale(${1 + state.volume * 2})` }}
          >
            {state.status === 'error' ? (
              <AlertCircle className="h-12 w-12 text-red-500" />
            ) : (
              <Mic
                className={`h-12 w-12 ${state.status === 'connected' ? 'text-white' : 'text-content-muted'}`}
              />
            )}
          </div>

          {/* Ripples */}
          {state.status === 'connected' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border border-green-500/20 animate-ping delay-300"></div>
            </>
          )}
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">សុភាទន្សាយ Live</h2>
          <p
            className={`text-sm font-medium ${
              state.status === 'connected'
                ? 'text-green-400'
                : state.status === 'error'
                  ? 'text-red-400'
                  : 'text-content-faint'
            }`}
          >
            {state.status === 'connecting' && (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Connecting...
              </span>
            )}
            {state.status === 'connected' && 'Listening... Speak now'}
            {state.status === 'error' && state.errorMessage}
          </p>
          {state.status === 'connecting' && (
            <p className="text-xs text-content-muted">Entry Cost: {AI_COSTS.LIVE_SESSION} Points</p>
          )}
        </div>

        {state.status === 'connected' && (
          <div className="bg-surface/10 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
            <p className="text-xs text-content-faint text-center max-w-xs">
              Practice your English conversation. <br /> Try saying:{' '}
              <span className="text-white font-bold">
                "Hello Sophea Tonsay, help me prepare for an interview."
              </span>
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-8 bg-red-500/20 text-red-400 border border-red-500/50 px-8 py-3 rounded-full font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center"
        >
          <Radio className="h-4 w-4 mr-2" /> End Session
        </button>
      </div>
    </div>
  );
};

export default LiveVoiceTutor;
