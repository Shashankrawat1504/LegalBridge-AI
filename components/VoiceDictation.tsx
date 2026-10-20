/**
 * VoiceDictation.tsx  (v2 – hardened)
 *
 * Cross-platform voice dictation for LegalBridge-AI.
 *
 * Hardening changes in v2:
 *  - isMountedRef guards all async setState calls after unmount
 *  - stoppedRef prevents web-speech onend double-firing on manual stop
 *  - stopListening stored in ref so cleanup effect always calls latest version
 *  - handleLanguageToggle passes explicit next-lang to startListening to avoid stale closure
 *  - detectCapability wrapped in try/catch for SSR safety
 *  - NativeVoice singleton reset on destroy to allow clean re-init
 *  - Error code 7 (no-match) handled gracefully on native
 *  - Full permission-denied Alert on native
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

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

type RecordingState = 'idle' | 'requesting' | 'listening' | 'processing' | 'error';

// ── Platform capability ────────────────────────────────────────────────────────

type Capability = 'web-speech' | 'native' | 'none';

function detectCapability(): Capability {
  try {
    if (Platform.OS === 'web') {
      const w = window as any;
      return (w.SpeechRecognition || w.webkitSpeechRecognition) ? 'web-speech' : 'none';
    }
    return 'native';
  } catch {
    return 'none';
  }
}

// ── Web Speech API wrapper ─────────────────────────────────────────────────────

class WebSpeechEngine {
  private recognition: any = null;
  private manualStop = false;

  constructor(
    private lang: string,
    private onPartial: (t: string) => void,
    private onFinal: (t: string) => void,
    private onEnd: () => void,
    private onErr: (msg: string) => void,
  ) {}

  start() {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { this.onErr('Speech recognition not supported in this browser.'); return; }

    this.manualStop = false;
    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.lang;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t;
        else interim += t;
      }
      if (interim) this.onPartial(interim);
      if (finalText) this.onFinal(finalText);
    };

    this.recognition.onerror = (e: any) => {
      if (this.manualStop) return; // Suppress errors from deliberate stop
      const code: string = e.error || '';
      if (code === 'no-speech') { this.onEnd(); return; } // Treat as natural end
      const msg = code === 'not-allowed'
        ? 'Microphone access denied. Please allow microphone in browser settings.'
        : `Speech recognition error: ${code || 'unknown'}`;
      this.onErr(msg);
    };

    this.recognition.onend = () => {
      if (!this.manualStop) this.onEnd();
    };

    this.recognition.start();
  }

  stop() {
    this.manualStop = true;
    try { this.recognition?.stop(); } catch {}
    this.recognition = null;
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
  const [partialText, setPartialText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const webEngineRef = useRef<WebSpeechEngine | null>(null);
  const isMountedRef = useRef(true);

  // Stable ref to stop so the cleanup effect never goes stale
  const stopListeningRef = useRef<() => Promise<void>>(async () => {});

  // ── Pulse animation ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (recordingState === 'listening') {
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
      stopListeningRef.current();
    };
  }, []);

  // ── Safe setState helpers (no-op after unmount) ───────────────────────────────

  const safeSetState = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (val: T | ((p: T) => T)) => { if (isMountedRef.current) setter(val as any); };

  const safeSetRecording = safeSetState(setRecordingState);
  const safeSetPartial   = safeSetState(setPartialText);
  const safeSetError     = safeSetState(setErrorMsg);

  // ── Native listener wiring ────────────────────────────────────────────────────

  const setupNativeListeners = useCallback((Voice: any) => {
    Voice.onSpeechPartialResults = (e: any) => {
      const partial = (e?.value ?? [])[0] ?? '';
      safeSetPartial(partial);
      onTranscript(partial, false);
    };
    Voice.onSpeechResults = (e: any) => {
      const result = (e?.value ?? [])[0] ?? '';
      safeSetPartial('');
      if (result) onTranscript(result, true);
    };
    Voice.onSpeechEnd = () => {
      safeSetRecording('processing');
      setTimeout(() => safeSetRecording('idle'), 700);
    };
    Voice.onSpeechError = (e: any) => {
      const raw: string = String(e?.error?.message || e?.error || '');
      // Error code 7 = no-match — treat as clean end, not a crash
      if (raw.includes('7') || raw.toLowerCase().includes('no match') || raw.toLowerCase().includes('nomatch')) {
        safeSetRecording('idle');
        safeSetPartial('');
        return;
      }
      safeSetError(raw || 'Recognition failed');
      safeSetRecording('error');
    };
  }, [onTranscript]);

  // ── Start Listening ───────────────────────────────────────────────────────────

  const startListening = useCallback(async (langOverride?: DictationLanguage) => {
    const lang = langOverride ?? currentLang;
    safeSetError(null);
    safeSetPartial('');
    safeSetRecording('requesting');

    // ─ Web Speech API ─────────────────────────────────────────────────────────
    if (capability === 'web-speech') {
      const engine = new WebSpeechEngine(
        lang,
        (p) => { safeSetPartial(p); onTranscript(p, false); },
        (f) => { safeSetPartial(''); onTranscript(f, true); },
        ()  => { safeSetRecording('idle'); safeSetPartial(''); },
        (e) => { safeSetError(e); safeSetRecording('error'); }
      );
      webEngineRef.current = engine;
      engine.start();
      safeSetRecording('listening');
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
        await Voice.start(lang);
        safeSetRecording('listening');
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
        resetNativeVoiceCache(); // Force re-init on next attempt
      }
      return;
    }

    safeSetError('Speech recognition is not available on this device or browser.');
    safeSetRecording('error');
  }, [capability, currentLang, onTranscript, setupNativeListeners]);

  // ── Stop Listening ────────────────────────────────────────────────────────────

  const stopListening = useCallback(async () => {
    if (capability === 'web-speech') {
      webEngineRef.current?.stop();
      webEngineRef.current = null;
      safeSetRecording('idle');
      safeSetPartial('');
      return;
    }
    if (capability === 'native') {
      const Voice = await getNativeVoice();
      try {
        await Voice?.stop();
        await Voice?.destroy();
      } catch {}
      Voice?.removeAllListeners?.();
      resetNativeVoiceCache(); // Allow fresh re-init on next start
      safeSetRecording('processing');
      setTimeout(() => safeSetRecording('idle'), 500);
    }
  }, [capability]);

  // Keep ref in sync
  useEffect(() => { stopListeningRef.current = stopListening; }, [stopListening]);

  // ── Toggle handlers ───────────────────────────────────────────────────────────

  const handleMicPress = useCallback(() => {
    if (recordingState === 'listening') {
      stopListening();
    } else if (recordingState === 'idle' || recordingState === 'error') {
      startListening();
    }
  }, [recordingState, startListening, stopListening]);

  const handleLanguageToggle = useCallback(async () => {
    const next: DictationLanguage = currentLang === 'en-IN' ? 'hi-IN' : 'en-IN';
    setCurrentLang(next);
    onLanguageChange?.(next);
    if (recordingState === 'listening') {
      await stopListening();
      // Pass next lang explicitly so startListening doesn't use stale closure
      setTimeout(() => startListening(next), 300);
    }
  }, [currentLang, recordingState, startListening, stopListening, onLanguageChange]);

  if (disabled) return null;

  // ── Derived display values ────────────────────────────────────────────────────

  const isListening  = recordingState === 'listening';
  const isProcessing = recordingState === 'processing' || recordingState === 'requesting';

  const micIconColor = isListening
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
              backgroundColor: isListening ? micBgActive : micBgIdle,
              borderColor:     isListening ? micBorderActive : micBorderIdle,
            },
          ]}
          onPress={handleMicPress}
          activeOpacity={0.75}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons
              name={isListening ? 'mic' : 'mic-outline'}
              size={13}
              color={micIconColor}
            />
          </Animated.View>
          <Text style={[styles.compactLabel, { color: micIconColor }]}>
            {isListening ? 'Stop' : isProcessing ? '…' : 'Dictate'}
          </Text>
        </TouchableOpacity>

        {isListening && partialText ? (
          <Text style={[styles.compactPartial, { color: theme.textMuted }]} numberOfLines={1}>
            "{partialText}"
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
          borderColor:     isListening ? (isDark ? '#3B82F6' : COLORS.navyGov) : 'transparent',
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
              backgroundColor: isListening ? micBgActive : micBgIdle,
              borderColor:     isListening ? micBorderActive : micBorderIdle,
            },
          ]}
          onPress={handleMicPress}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons
              name={isListening ? 'mic' : isProcessing ? 'hourglass-outline' : 'mic-outline'}
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
                color: isListening
                  ? '#DC2626'
                  : isProcessing
                  ? '#B45309'
                  : recordingState === 'error'
                  ? '#DC2626'
                  : theme.textSecondary,
              },
            ]}
          >
            {isListening
              ? '● Listening…'
              : isProcessing
              ? '⏳ Processing…'
              : recordingState === 'error'
              ? '⚠ Mic unavailable — tap to retry'
              : 'Tap mic to dictate narrative'}
          </Text>

          {!isListening && !isProcessing && recordingState !== 'error' && (
            <Text style={[styles.statusHint, { color: theme.textMuted }]}>
              Co‑Pilot activates automatically after speech · EN / हिंदी
            </Text>
          )}

          {partialText ? (
            <Text style={[styles.partialText, { color: theme.textSecondary }]} numberOfLines={2}>
              "{partialText}"
            </Text>
          ) : null}

          {errorMsg ? (
            <Text style={styles.errorText} numberOfLines={2}>
              {errorMsg}
            </Text>
          ) : null}
        </View>

        {/* Language toggle */}
        <TouchableOpacity
          style={[styles.langBtn, { backgroundColor: micBgIdle, borderColor: micBorderIdle }]}
          onPress={handleLanguageToggle}
          activeOpacity={0.75}
        >
          <Text style={[styles.langBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>
            {currentLang === 'en-IN' ? 'EN' : 'हि'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Animated waveform bars while listening */}
      {isListening && (
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
      const stagger = index * 60; // stagger each bar slightly
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
  partialText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
    marginTop: 2,
  },
  errorText: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
    color: '#DC2626',
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
