import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';
import { CitizenGuidance, FIXED_DISCLAIMER } from './fallbackGuidance';
import { CitizenGuidanceHi, FIXED_DISCLAIMER_HI } from './hindiGuidance';

const LANG_KEY = '@legalbridge_assistant_lang';

interface QueryResponseProps {
  guidance: CitizenGuidance | null;
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
  onClear?: () => void;
}

const QueryResponse: React.FC<QueryResponseProps> = ({
  guidance,
  isLoading,
  error,
  onRetry,
  onClear,
}) => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [toastMsg, setToastMsg] = useState('');

  // Load persisted language preference
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY)
      .then((v) => { if (v === 'hi' || v === 'en') setLang(v as 'en' | 'hi'); })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const switchLang = async (next: 'en' | 'hi') => {
    if (next === 'hi' && !guidance?.guidanceHi) {
      showToast('Hindi available for common topics offline; full Hindi may need network');
    }
    setLang(next);
    try { await AsyncStorage.setItem(LANG_KEY, next); } catch {}
  };

  // Resolve displayed content based on lang
  const hi: CitizenGuidanceHi | undefined = guidance?.guidanceHi;
  const showHi = lang === 'hi' && !!hi;

  const displayedSummary = showHi ? hi!.summary : guidance?.summary ?? '';
  const displayedIssues = showHi ? hi!.possibleIssues : guidance?.possibleIssues ?? [];
  const displayedRights = showHi ? hi!.yourRights : guidance?.yourRights ?? [];
  const displayedSteps = showHi ? hi!.nextSteps : guidance?.nextSteps ?? [];
  const displayedDocs = showHi ? hi!.documentsToKeep : guidance?.documentsToKeep ?? [];
  const displayedWhenLawyer = showHi ? hi!.whenToSeeLawyer : guidance?.whenToSeeLawyer ?? '';
  const displayedDisclaimer = showHi ? FIXED_DISCLAIMER_HI : (guidance?.disclaimer ?? FIXED_DISCLAIMER);

  const handleCopy = async () => {
    if (!guidance) return;
    const fullText = `LEGAL HELP GUIDANCE
============================
${displayedSummary}

WHAT THIS SITUATION INVOLVES:
${displayedIssues.map((p, i) => `${i + 1}. ${p}`).join('\n')}

YOUR RIGHTS IN PLAIN LANGUAGE:
${displayedRights.map((r) => `• ${r}`).join('\n')}

RECOMMENDED NEXT STEPS:
${displayedSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

DOCUMENTS & PROOF TO KEEP:
${displayedDocs.map((d) => `• ${d}`).join('\n')}

WHEN TO SEEK A LAWYER:
${displayedWhenLawyer}

---
${displayedDisclaimer}
`;

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ActivityIndicator size="large" color={isDark ? '#60A5FA' : COLORS.navyGov} />
        <Text style={[styles.loadingTitle, { color: theme.textPrimary }]}>
          Analyzing Your Legal Situation...
        </Text>
        <Text style={[styles.loadingSub, { color: theme.textSecondary }]}>
          Reviewing applicable citizen protections, practical steps, and evidence checklists.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorBox, { backgroundColor: theme.surface, borderColor: '#EF4444' }]}>
        <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>Could Not Connect</Text>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>{error}</Text>
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retry Analysis</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!guidance) {
    return (
      <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.emptyIconWrap, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
          <Ionicons name="chatbubbles-outline" size={28} color={isDark ? '#60A5FA' : COLORS.navyGov} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
          Ask Any Everyday Legal Question
        </Text>
        <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
          Tap any of the example chips above or type your question below. Get clear, plain-language guidance, next steps, and evidence checklists.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>

      {/* Toast notification */}
      {toastMsg.length > 0 && (
        <View style={styles.inlineToast}>
          <Ionicons name="information-circle-outline" size={14} color="#FFFFFF" />
          <Text style={styles.inlineToastText}>{toastMsg}</Text>
        </View>
      )}

      {/* Language Toggle */}
      <View style={styles.langToggleRow}>
        <Ionicons name="language-outline" size={14} color={theme.textMuted} />
        <Text style={[styles.langToggleLabel, { color: theme.textMuted }]}>Language:</Text>
        <TouchableOpacity
          style={[
            styles.langBtn,
            lang === 'en'
              ? { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }
              : { backgroundColor: theme.surfaceMuted, borderColor: theme.border, borderWidth: 1 },
          ]}
          onPress={() => switchLang('en')}
          activeOpacity={0.8}
        >
          <Text style={[styles.langBtnText, { color: lang === 'en' ? '#FFFFFF' : theme.textSecondary }]}>
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.langBtn,
            lang === 'hi'
              ? { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }
              : { backgroundColor: theme.surfaceMuted, borderColor: theme.border, borderWidth: 1 },
          ]}
          onPress={() => switchLang('hi')}
          activeOpacity={0.8}
        >
          <Text style={[styles.langBtnText, { color: lang === 'hi' ? '#FFFFFF' : theme.textSecondary }]}>
            हिंदी
          </Text>
        </TouchableOpacity>
      </View>

      {/* Top Banner / Summary */}
      <View style={[styles.summaryCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
        <View style={styles.summaryHeader}>
          <Ionicons name="shield-checkmark" size={18} color={isDark ? '#60A5FA' : COLORS.navyGov} />
          <Text style={[styles.summaryBadge, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>
            {showHi ? 'नागरिक कानूनी मार्गदर्शन' : 'CITIZEN LEGAL GUIDANCE'}
          </Text>
        </View>
        <Text style={[styles.summaryText, { color: theme.textPrimary }]}>
          {displayedSummary}
        </Text>
      </View>

      {/* Section 1: What this situation involves */}
      {displayedIssues.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.accentGoldDark} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {showHi ? 'यह स्थिति क्या है' : 'What This Situation Involves'}
            </Text>
          </View>
          <View style={styles.issuesList}>
            {displayedIssues.map((issue, idx) => (
              <View key={idx} style={[styles.issueItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.issueBullet, { color: COLORS.accentGoldDark }]}>•</Text>
                <Text style={[styles.issueText, { color: theme.textSecondary }]}>{issue}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Section 2: Your Rights in Plain Language */}
      {displayedRights.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {showHi ? 'आपके अधिकार (सरल भाषा में)' : 'Your Rights in Plain Language'}
            </Text>
          </View>
          <View style={styles.rightsList}>
            {displayedRights.map((right, idx) => (
              <View key={idx} style={styles.rightRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" style={styles.rightIcon} />
                <Text style={[styles.rightText, { color: theme.textPrimary }]}>{right}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Section 3: Recommended Next Steps */}
      {displayedSteps.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="list-outline" size={16} color={isDark ? '#60A5FA' : COLORS.navyGov} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {showHi ? 'व्यावहारिक अगले कदम' : 'Practical Next Steps'}
            </Text>
          </View>
          <View style={styles.stepsList}>
            {displayedSteps.map((step, idx) => (
              <View key={idx} style={[styles.stepCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                <View style={[styles.stepNumBadge, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}>
                  <Text style={styles.stepNumText}>{idx + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Section 4: Proof & Documents to Keep */}
      {displayedDocs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="folder-outline" size={16} color={COLORS.accentGoldDark} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {showHi ? 'रखने के लिए दस्तावेज़ और प्रमाण' : 'Documents & Proof to Keep'}
            </Text>
          </View>
          <View style={styles.docsList}>
            {displayedDocs.map((doc, idx) => (
              <View key={idx} style={styles.docRow}>
                <Ionicons name="document-text-outline" size={15} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                <Text style={[styles.docText, { color: theme.textSecondary }]}>{doc}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Section 5: When to See a Lawyer */}
      {displayedWhenLawyer.length > 0 && (
        <View style={[styles.cautionCard, { backgroundColor: 'rgba(217, 119, 6, 0.08)', borderColor: COLORS.accentGold }]}>
          <View style={styles.cautionHeader}>
            <Ionicons name="help-buoy-outline" size={18} color={COLORS.accentGoldDark} />
            <Text style={styles.cautionTitle}>
              {showHi ? 'वकील से कब मिलें' : 'When to Seek a Lawyer'}
            </Text>
          </View>
          <Text style={[styles.cautionText, { color: theme.textPrimary }]}>
            {displayedWhenLawyer}
          </Text>
        </View>
      )}

      {/* Section 6: Related Tools */}
      {guidance.relatedTools && guidance.relatedTools.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="apps-outline" size={16} color={theme.textMuted} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {showHi ? 'LegalBridge-AI के अनुशंसित उपकरण' : 'Recommended Tools in LegalBridge-AI'}
            </Text>
          </View>
          <View style={styles.toolsRow}>
            {guidance.relatedTools.map((t, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.toolBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                onPress={() => navigation.navigate(t.route as any)}
                activeOpacity={0.8}
              >
                <Ionicons name={t.icon} size={15} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                <Text style={[styles.toolBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>
                  {t.label}
                </Text>
                <Ionicons name="arrow-forward" size={12} color={isDark ? '#60A5FA' : COLORS.navyGov} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Actions: Copy guidance + Clear */}
      <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.copyBtn,
            copied
              ? { backgroundColor: '#10B981' }
              : { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov },
          ]}
          onPress={handleCopy}
          activeOpacity={0.85}
        >
          <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={16} color="#FFFFFF" />
          <Text style={styles.copyBtnText}>
            {copied
              ? (showHi ? 'कॉपी हो गया!' : 'Guidance Copied!')
              : (showHi ? 'पूरी जानकारी कॉपी करें' : 'Copy Full Guidance')}
          </Text>
        </TouchableOpacity>

        {onClear && (
          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
            onPress={onClear}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={15} color={theme.textSecondary} />
            <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>
              {showHi ? 'नया प्रश्न पूछें' : 'Ask Another Question'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Educational Disclaimer Banner */}
      <View style={[styles.disclaimerCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
        <Ionicons name="information-circle-outline" size={15} color={theme.textMuted} />
        <Text style={[styles.disclaimerText, { color: theme.textMuted }]}>
          {displayedDisclaimer}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 20,
    ...SHADOWS.subtle,
  },
  loadingBox: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOWS.subtle,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  loadingSub: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 18,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOWS.subtle,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 460,
    lineHeight: 19,
  },
  inlineToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E40AF',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  inlineToastText: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  langToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  langToggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryCard: {
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  summaryBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  issuesList: {
    gap: 6,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  issueBullet: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  issueText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  rightsList: {
    gap: 8,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  rightIcon: {
    marginTop: 2,
  },
  rightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  stepsList: {
    gap: 8,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  stepNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  docsList: {
    gap: 6,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  cautionCard: {
    padding: 12,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    marginBottom: 16,
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cautionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.5,
  },
  cautionText: {
    fontSize: 13,
    lineHeight: 19,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  toolBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    marginBottom: 12,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});

export default QueryResponse;