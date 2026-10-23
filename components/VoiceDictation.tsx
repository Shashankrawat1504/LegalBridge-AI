/**
 * VoiceDictation.tsx  (v3 – Gemini-powered)
 *
 * Cross-platform voice dictation for LegalBridge-AI.
 *
 * v3 changes:
 *  - Primary: MediaRecorder + Gemini API transcription (works in Chrome/Edge web)
 *  - Fallback: Web Speech API if Gemini fails or not configured
 *  - Native: react-native-voice for mobile (unchanged)
 *  - States: idle | requesting | recording | processing | error
 *  - Better error messages for API key, permissions, empty recordings
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { transcribeAudio, blobToBase64, checkMicrophoneAvailability } from '../services/geminiTranscribe';

// ── Types ──────────────────────────────────────────────────────────────────────

export type DictationLanguage = 'en-IN' | 'hi-IN';

export interface VoiceDictationProps {
  /** Called with each recognition result. isFinal=false → interim; isFinal=true → committed */
  onTranscript: (text: string, isFinal: boolean) => void;
  language?: DictationLanguage;
  onLanguageChange?: (lang: DictationLanguage) => void;
  disabled?: boolean;
  /** Compact pill variant for use inside Co-Pilot header */
  compact?: boolean;
}

type RecordingState = 'idle' | 'requesting' | 'recording' | 'processing' | 'error';

// ── Platform capability ────────────────────────────────────────────────────────

type Capability = 'media-recorder' | 'native' | 'none';

function detectCapability(): Capability {
  try {
    if (Platform.OS === 'web') {
      const w = window as any;
      // Only MediaRecorder + Gemini for web
      return (w.MediaRecorder && w.navigator?.mediaDevices?.getUserMedia) ? 'media-recorder' : 'none';
    }
    return 'native';
  } catch {
    return 'none';
  }
}

// ── MediaRecorder + Gemini Engine ─────────────────────────────────────────────

class MediaRecorderEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private selectedMimeType: string = '';

  constructor(
    private onTranscribe: (audioBase64: string, mimeType: string) => Promise<void>,
    private onError: (msg: string) => void,
  ) {}

  async start() {
    try {
      this.audioChunks = [];
      this.startTime = Date.now();

      console.log('[MediaRecorder] Requesting microphone access...');
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[MediaRecorder] Microphone access granted');

      // Check supported MIME types - save selection before creating recorder
      const types = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav',
      ];

      let selectedType = '';
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedType = type;
          break;
        }
      }

      if (!selectedType) {
        throw new Error('No supported audio format found');
      }

      this.selectedMimeType = selectedType;
      console.log('[MediaRecorder] Using MIME type:', this.selectedMimeType);
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.selectedMimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect chunks every 100ms
      console.log('[MediaRecorder] Recording started');
    } catch (error: any) {
      console.error('[MediaRecorder] Start error:', error);
      this.onError(error.message || 'Failed to start recording');
      this.cleanup();
    }
  }

  async stop(): Promise<void> {
    if (!this.mediaRecorder) return;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        const duration = Date.now() - this.startTime;
        console.log('[MediaRecorder] Recording stopped, duration:', duration, 'ms, chunks:', this.audioChunks.length);

        if (this.audioChunks.length === 0) {
          console.log('[MediaRecorder] No audio chunks recorded');
          this.cleanup();
          this.onError('No audio data recorded. Please try again.');
          resolve();
          return;
        }

        // Use stored mimeType instead of reading from recorder (which may be null)
        const blob = new Blob(this.audioChunks, { type: this.selectedMimeType });
        console.log('[MediaRecorder] Blob created, size:', blob.size, 'bytes, type:', blob.type);

        // Check if recording is too short (< 2KB or < 800ms)
        if (blob.size < 2000 || duration < 800) {
          console.log('[MediaRecorder] Recording too short:', blob.size, 'bytes, duration:', duration, 'ms');
          this.cleanup();
          this.onError('Recording too short. Please speak for at least 1 second.');
          resolve();
          return;
        }

        const base64 = await blobToBase64(blob);
        console.log('[MediaRecorder] Base64 converted, length:', base64.length, 'chars');

        this.cleanup();

        // Call the transcription callback with the audio data
        this.onTranscribe(base64, this.selectedMimeType)
          .then(() => {
            resolve();
          })
          .catch((error: any) => {
            console.error('[MediaRecorder] Transcription callback error:', error);
            this.onError(error.message || 'Transcription failed');
            resolve();
          });
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.selectedMimeType = '';
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// ── Native Voice (lazy import avoids web crash) ────────────────────────────────

let cachedNativeVoice: any = null;

async function getNativeVoice(): Promise<any> {
  if (cachedNativeVoice) return cachedNativeVoice;
  try {
    const mod = await import('react-native-voice');
    cachedNativeVoice = (mod as any).default || mod;
    return cachedNativeVoice;
  } catch { return null; }
}

function resetNativeVoiceCache() {
  cachedNativeVoice = null;
}

// ── Component ──────────────────────────────────────────────────────────────────

const VoiceDictation: React.FC<VoiceDictationProps> = ({
  onTranscript,
  language = 'en-IN',
  onLanguageChange,
  disabled = false,
  compact = false,
}) => {
  const { theme, isDark } = useTheme();

  const [capability] = useState<Capability>(detectCapability);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [currentLang, setCurrentLang] = useState<DictationLanguage>(language);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const mediaRecorderRef = useRef<MediaRecorderEngine | null>(null);
  const isMountedRef = useRef(true);

  // ── Pulse animation ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (recordingState === 'recording') {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.35, duration: 550, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 550, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => pulseLoopRef.current?.stop();
  }, [recordingState]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      mediaRecorderRef.current = null;
    };
  }, []);

  // ── Safe setState helpers (no-op after unmount) ───────────────────────────────

  const safeSetState = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (val: T | ((p: T) => T)) => { if (isMountedRef.current) setter(val as any); };

  const safeSetRecording = safeSetState(setRecordingState);
  const safeSetError     = safeSetState(setErrorMsg);

  // ── Native listener wiring ────────────────────────────────────────────────────

  const setupNativeListeners = useCallback((Voice: any) => {
    Voice.onSpeechResults = (e: any) => {
      const result = (e?.value ?? [])[0] ?? '';
      if (result) onTranscript(result, true);
      safeSetRecording('idle');
    };
    Voice.onSpeechError = (e: any) => {
      const raw: string = String(e?.error?.message || e?.error || '');
      if (raw.includes('7') || raw.toLowerCase().includes('no match') || raw.toLowerCase().includes('nomatch')) {
        safeSetRecording('idle');
        return;
      }
      safeSetError(raw || 'Recognition failed');
      safeSetRecording('error');
    };
  }, [onTranscript]);

  // ── Start Recording/Listening ─────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    safeSetError(null);
    safeSetRecording('requesting');

    // ─ MediaRecorder + Gemini (primary for web) ───────────────────────────────
    if (capability === 'media-recorder') {
      const handleTranscribe = async (audioBase64: string, mimeType: string) => {
        safeSetRecording('processing');
        setDebugInfo(`Processing... (${(audioBase64.length / 1024).toFixed(1)}KB)`);

        const result = await transcribeAudio({
          base64Audio: audioBase64,
          mimeType,
        });

        if (result.success && result.transcript) {
          console.log('[VoiceDictation] Transcription success, transcript length:', result.transcript.length, 'chars');
          console.log('[VoiceDictation] Calling onTranscript with', result.transcript.length, 'chars');
          setDebugInfo(`Success: "${result.transcript.substring(0, 30)}..."`);
          onTranscript(result.transcript, true);
          safeSetRecording('idle');
          setTimeout(() => setDebugInfo(''), 3000);
        } else {
          console.error('[VoiceDictation] Transcription failed:', result.error);
          setDebugInfo(`Error: ${result.error?.substring(0, 50)}...`);
          safeSetError(result.error || 'Transcription failed');
          safeSetRecording('error');
        }
      };

      const handleError = (msg: string) => {
        safeSetError(msg);
        safeSetRecording('error');
      };

      mediaRecorderRef.current = new MediaRecorderEngine(handleTranscribe, handleError);
      await mediaRecorderRef.current.start();
      safeSetRecording('recording');
      return;
    }



    // ─ Native Voice ───────────────────────────────────────────────────────────
    if (capability === 'native') {
      const Voice = await getNativeVoice();
      if (!Voice) {
        safeSetError('Speech recognition module unavailable on this device.');
        safeSetRecording('error');
        return;
      }
      setupNativeListeners(Voice);
      try {
        await Voice.start(currentLang);
        safeSetRecording('recording');
      } catch (err: any) {
        const msg: string = err?.message || 'Failed to start speech recognition.';
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
          Alert.alert(
            'Microphone Permission Required',
            'LegalBridge-AI needs microphone access to transcribe your FIR narrative.\nPlease grant permission via Settings → App → LegalBridge-AI → Permissions.',
            [{ text: 'OK' }]
          );
        }
        safeSetError(msg);
        safeSetRecording('error');
        resetNativeVoiceCache();
      }
      return;
    }

    safeSetError('Speech recognition is not available on this device or browser.');
    safeSetRecording('error');
  }, [capability, currentLang, onTranscript, setupNativeListeners]);

  // ── Stop Recording/Listening ─────────────────────────────────────────────────

  const stopRecording = useCallback(async () => {
    if (capability === 'media-recorder') {
      // MediaRecorderEngine handles validation and transcription internally
      // Just stop recording - errors will be reported via handleError callback
      await mediaRecorderRef.current?.stop();
      // Set processing state while transcription happens
      safeSetRecording('processing');
      return;
    }

    if (capability === 'native') {
      const Voice = await getNativeVoice();
      try {
        await Voice?.stop();
        await Voice?.destroy();
      } catch {}
      Voice?.removeAllListeners?.();
      resetNativeVoiceCache();
      safeSetRecording('processing');
      setTimeout(() => safeSetRecording('idle'), 500);
    }
  }, [capability]);

  // ── Toggle handlers ───────────────────────────────────────────────────────────

  const handleMicPress = useCallback(() => {
    if (recordingState === 'recording') {
      stopRecording();
    } else if (recordingState === 'idle' || recordingState === 'error') {
      startRecording();
    }
  }, [recordingState, startRecording, stopRecording]);

  const handleLanguageToggle = useCallback(async () => {
    const next: DictationLanguage = currentLang === 'en-IN' ? 'hi-IN' : 'en-IN';
    setCurrentLang(next);
    onLanguageChange?.(next);
    if (recordingState === 'recording') {
      await stopRecording();
      setTimeout(() => startRecording(), 300);
    }
  }, [currentLang, recordingState, startRecording, stopRecording, onLanguageChange]);

  if (disabled) return null;

  // ── Derived display values ────────────────────────────────────────────────────

  const isRecording = recordingState === 'recording';
  const isProcessing = recordingState === 'processing' || recordingState === 'requesting';

  const micIconColor = isRecording
    ? (isDark ? '#F87171' : '#DC2626')
    : isProcessing
    ? (isDark ? '#FBBF24' : '#B45309')
    : (isDark ? '#60A5FA' : COLORS.navyGov);

  const micBgIdle   = isDark ? theme.surfaceMuted : '#F8FAFC';
  const micBgActive = isDark ? '#450A0A' : '#FEE2E2';
  const micBorderIdle   = theme.border;
  const micBorderActive = '#DC2626';

  // ── Compact variant ───────────────────────────────────────────────────────────

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <TouchableOpacity
          style={[
            styles.compactMicBtn,
            {
              backgroundColor: isRecording ? micBgActive : micBgIdle,
              borderColor:     isRecording ? micBorderActive : micBorderIdle,
            },
          ]}
          onPress={handleMicPress}
          activeOpacity={0.75}
          disabled={isProcessing}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons
              name={isRecording ? 'mic' : 'mic-outline'}
              size={13}
              color={micIconColor}
            />
          </Animated.View>
          <Text style={[styles.compactLabel, { color: micIconColor }]}>
            {isRecording ? 'Stop' : isProcessing ? '…' : 'Dictate'}
          </Text>
        </TouchableOpacity>

        {isRecording ? (
          <Text style={[styles.compactPartial, { color: theme.textMuted }]}>
            Recording… tap to stop
          </Text>
        ) : isProcessing ? (
          <Text style={[styles.compactPartial, { color: theme.textMuted }]}>
            Processing…
          </Text>
        ) : null}
      </View>
    );
  }

  // ── Full inline variant ───────────────────────────────────────────────────────

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderColor:     isRecording ? (isDark ? '#3B82F6' : COLORS.navyGov) : 'transparent',
          backgroundColor: isDark ? '#0F172A' : '#EEF4FF',
        },
      ]}
    >
      <View style={styles.mainRow}>
        {/* Mic button */}
        <TouchableOpacity
          style={[
            styles.micBtn,
            {
              backgroundColor: isRecording ? micBgActive : micBgIdle,
              borderColor:     isRecording ? micBorderActive : micBorderIdle,
            },
          ]}
          onPress={handleMicPress}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons
              name={isRecording ? 'mic' : isProcessing ? 'hourglass-outline' : 'mic-outline'}
              size={20}
              color={micIconColor}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Status block */}
        <View style={styles.statusWrap}>
          <Text
            style={[
              styles.statusLabel,
              {
                color: isRecording
                  ? '#DC2626'
                  : isProcessing
                  ? '#B45309'
                  : recordingState === 'error'
                  ? '#DC2626'
                  : capability === 'none'
                  ? '#DC2626'
                  : theme.textSecondary,
              },
            ]}
          >
            {isRecording
              ? '● Recording… tap to stop'
              : isProcessing
              ? '⏳ Processing audio…'
              : recordingState === 'error'
              ? '⚠ Error — tap to retry'
              : capability === 'none'
              ? '⚠ Speech-to-text not available in this browser'
              : 'Tap mic to dictate (EN/हिंदी)'}
          </Text>

          {!isRecording && !isProcessing && recordingState !== 'error' && (
            <Text style={[styles.statusHint, { color: theme.textMuted }]}>
              Powered by Gemini AI · EN / हिंदी
            </Text>
          )}

          {errorMsg ? (
            <Text style={styles.errorText} numberOfLines={2}>
              {errorMsg}
            </Text>
          ) : null}

          {debugInfo ? (
            <Text style={styles.debugText} numberOfLines={2}>
              🔍 {debugInfo}
            </Text>
          ) : null}
        </View>

        {/* Language toggle */}
        <TouchableOpacity
          style={[styles.langBtn, { backgroundColor: micBgIdle, borderColor: micBorderIdle }]}
          onPress={handleLanguageToggle}
          activeOpacity={0.75}
          disabled={isProcessing}
        >
          <Text style={[styles.langBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>
            {currentLang === 'en-IN' ? 'EN' : 'हि'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Animated waveform bars while recording */}
      {isRecording && (
        <View style={styles.waveRow}>
          {[0.35, 0.65, 1, 0.55, 0.85, 0.45, 0.95, 0.7, 0.4, 0.8].map((h, i) => (
            <WaveBar key={i} heightRatio={h} isDark={isDark} index={i} />
          ))}
        </View>
      )}
    </View>
  );
};

// ── Animated WaveBar ───────────────────────────────────────────────────────────

const WaveBar: React.FC<{ heightRatio: number; isDark: boolean; index: number }> = memo(
  ({ heightRatio, isDark, index }) => {
    const anim = useRef(new Animated.Value(heightRatio)).current;

    useEffect(() => {
      const stagger = index * 60;
      let loop: Animated.CompositeAnimation;
      const timer = setTimeout(() => {
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.55 + 0.45,
              duration: 160 + Math.random() * 240,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: heightRatio,
              duration: 160 + Math.random() * 240,
              useNativeDriver: false,
            }),
          ])
        );
        loop.start();
      }, stagger);
      return () => { clearTimeout(timer); loop?.stop(); };
    }, []);

    return (
      <Animated.View
        style={[
          styles.waveBar,
          {
            height: anim.interpolate({ inputRange: [0, 1], outputRange: [2, 18] }),
            backgroundColor: isDark ? '#60A5FA' : COLORS.navyGov,
            opacity: 0.8,
          },
        ]}
      />
    );
  }
);

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusWrap: {
    flex: 1,
    gap: 2,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusHint: {
    fontSize: 11,
    lineHeight: 15,
  },
  errorText: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
    color: '#DC2626',
  },
  debugText: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
    color: '#6B7280',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    minWidth: 34,
    alignItems: 'center',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 8,
    height: 22,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  // Compact
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactMicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  compactLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  compactPartial: {
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
  },
});

export default VoiceDictation;
