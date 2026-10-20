import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import OfficialNavbar from "../components/OfficialNavbar";
import Footer from "../components/Footer";
import { COLORS, RADIUS, SHADOWS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

interface RiskyClause {
  clause: string;
  risk: string;
  suggestionEN: string;
  suggestionHI: string;
}

interface AnalysisResult {
  riskScore: number;
  summary: string;
  riskyClauses: RiskyClause[];
  missingTerms: string[];
  overallAdvice: string;
}

function riskColor(score: number) {
  if (score <= 30) return "#166534";
  if (score <= 60) return "#B45309";
  return "#991B1B";
}

function riskLabel(score: number) {
  if (score <= 30) return "LOW RISK";
  if (score <= 60) return "MODERATE RISK";
  return "HIGH RISK";
}

function buildPrompt(text: string): string {
  return (
    "You are a senior Indian legal advisor specialising in contract law, civil procedure, and the Bharatiya Nyaya Sanhita (BNS 2023). " +
    "Analyse the following legal document text and respond ONLY with a valid JSON object matching this exact schema:\n" +
    '{"riskScore":<integer 0-100>,"summary":"<2-3 sentence plain-English overview>","riskyClauses":[{"clause":"<extract>","risk":"<why risky>","suggestionEN":"<safer EN wording>","suggestionHI":"<safer HI wording>"}],"missingTerms":["<missing term>"],"overallAdvice":"<3-5 sentence actionable advice>"}\n' +
    "Do not include any text outside the JSON object. Document text:\n" +
    '"""\n' +
    text.slice(0, 8000) +
    '\n"""'
  );
}

const DocumentAnalyzer: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [fileName, setFileName] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [pasteText, setPasteText] = useState<string>("");
  const [usePaste, setUsePaste] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");
  const [expandedClause, setExpandedClause] = useState<number | null>(null);

  const pickDocument = async () => {
    setError("");
    setResult(null);
    setFileName("");
    setExtractedText("");

    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png";
      input.onchange = async (e: any) => {
        const file: File = e.target?.files?.[0];
        if (!file) return;
        setFileName(file.name);
        if (file.type === "text/plain") {
          const reader = new FileReader();
          reader.onload = (ev) => setExtractedText((ev.target?.result as string) || "");
          reader.readAsText(file);
        } else {
          setError("Binary format (PDF/DOCX/Image). Please use Paste Text mode to enter document content.");
        }
      };
      input.click();
      return;
    }

    try {
      setIsLoading(true);
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["text/plain", "application/pdf", "application/msword",
               "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
               "image/*"],
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.[0]) return;
      const asset = picked.assets[0];
      setFileName(asset.name);
      if (asset.mimeType === "text/plain" && asset.uri) {
        const content = await FileSystem.readAsStringAsync(asset.uri);
        setExtractedText(content);
      } else {
        setError("Binary format detected. Please use Paste Text mode for PDFs and images.");
      }
    } catch {
      setError("Failed to open file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyse = async () => {
    const inputText = usePaste ? pasteText : extractedText;
    if (!inputText.trim()) {
      Alert.alert("No Text", "Please upload a .txt file or paste document text before analysing.");
      return;
    }
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("https://sih-backend-881i.onrender.com/encode/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: buildPrompt(inputText) }),
      });
      const data = await res.json();
      const rawText: string = typeof data?.description === "string"
        ? data.description
        : data?.acts ? JSON.stringify(data) : "";
      if (data.error || !rawText) {
        setError("The AI analysis engine is currently offline. Please try again later.");
        return;
      }
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        setError("The AI returned an unexpected response format. Please try again.");
        return;
      }
      const parsed: AnalysisResult = JSON.parse(jsonMatch[0]);
      setResult(parsed);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError("Could not parse AI response. Please try again.");
      } else {
        setError("Network error — unable to reach the AI legal server. Please check your internet connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasText = usePaste ? pasteText.trim().length > 0 : extractedText.trim().length > 0;

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.background }]}>
      <OfficialNavbar />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <View style={[styles.badge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <Text style={styles.badgeText}>AI-POWERED CONTRACT REVIEW</Text>
            </View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Document Analyser & Redlining
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Upload any legal document and get an instant AI risk score, clause-by-clause redlining,
              and suggested safer wording in English and Hindi.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          {/* Step 1 */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardLabel, { color: theme.textMuted }]}>STEP 1 — PROVIDE DOCUMENT</Text>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, !usePaste && styles.toggleBtnActive]}
                onPress={() => setUsePaste(false)}
              >
                <Ionicons name="cloud-upload-outline" size={15} color={!usePaste ? COLORS.white : (isDark ? "#94A3B8" : COLORS.textMuted)} />
                <Text style={[styles.toggleBtnText, !usePaste && styles.toggleBtnTextActive]}>Upload File</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, usePaste && styles.toggleBtnActive]}
                onPress={() => setUsePaste(true)}
              >
                <Ionicons name="create-outline" size={15} color={usePaste ? COLORS.white : (isDark ? "#94A3B8" : COLORS.textMuted)} />
                <Text style={[styles.toggleBtnText, usePaste && styles.toggleBtnTextActive]}>Paste Text</Text>
              </TouchableOpacity>
            </View>

            {!usePaste ? (
              <View>
                <TouchableOpacity
                  style={[styles.uploadZone, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
                  onPress={pickDocument}
                  activeOpacity={0.7}
                >
                  <Ionicons name="document-attach-outline" size={36} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                  <Text style={[styles.uploadZoneTitle, { color: theme.textPrimary }]}>
                    {fileName ? fileName : "Tap to Select Document"}
                  </Text>
                  <Text style={[styles.uploadZoneSub, { color: theme.textMuted }]}>
                    PDF, DOCX, TXT, JPG, PNG — for binary files use Paste Text mode
                  </Text>
                </TouchableOpacity>
                {extractedText.length > 0 && (
                  <View style={[styles.extractedBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.statusSuccess} />
                    <Text style={[styles.extractedLabel, { color: theme.textSecondary }]}>
                      {extractedText.length.toLocaleString()} characters extracted from "{fileName}"
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <TextInput
                style={[styles.pasteInput, {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                }]}
                placeholder="Paste full contract / document text here..."
                placeholderTextColor={theme.textMuted}
                value={pasteText}
                onChangeText={setPasteText}
                multiline
                textAlignVertical="top"
              />
            )}
          </View>

          {error.length > 0 && (
            <View style={[styles.errorBox, { backgroundColor: isDark ? "#450A0A" : COLORS.statusAlertBg }]}>
              <Ionicons name="warning-outline" size={18} color={COLORS.statusAlert} />
              <Text style={[styles.errorText, { color: COLORS.statusAlert }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.analyseBtn, (!hasText || isLoading) && styles.analyseBtnDisabled]}
            onPress={handleAnalyse}
            disabled={!hasText || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Ionicons name="scan-outline" size={20} color={COLORS.white} />
            )}
            <Text style={styles.analyseBtnText}>
              {isLoading ? "Analysing..." : "Analyse Document"}
            </Text>
          </TouchableOpacity>

          {result && (
            <View>
              {/* Risk Score */}
              <View style={[styles.riskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.cardLabel, { color: theme.textMuted }]}>STEP 2 — ANALYSIS RESULTS</Text>
                <View style={styles.riskRow}>
                  <View style={[styles.riskScoreCircle, { borderColor: riskColor(result.riskScore) }]}>
                    <Text style={[styles.riskScoreNumber, { color: riskColor(result.riskScore) }]}>{result.riskScore}</Text>
                    <Text style={[styles.riskScoreMax, { color: theme.textMuted }]}>/100</Text>
                  </View>
                  <View style={styles.riskMeta}>
                    <View style={[styles.riskBadge, { backgroundColor: riskColor(result.riskScore) + "22" }]}>
                      <View style={[styles.riskDot, { backgroundColor: riskColor(result.riskScore) }]} />
                      <Text style={[styles.riskBadgeText, { color: riskColor(result.riskScore) }]}>
                        {riskLabel(result.riskScore)}
                      </Text>
                    </View>
                    <Text style={[styles.riskSummary, { color: theme.textSecondary }]}>{result.summary}</Text>
                  </View>
                </View>
              </View>

              {/* Overall Advice */}
              <View style={[styles.adviceCard, { backgroundColor: isDark ? "#0C1A2E" : "#EFF6FF", borderColor: isDark ? "#1E40AF" : "#BFDBFE" }]}>
                <View style={styles.adviceHeader}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={isDark ? "#60A5FA" : "#1E40AF"} />
                  <Text style={[styles.adviceTitle, { color: isDark ? "#60A5FA" : "#1E40AF" }]}>Overall Legal Advice</Text>
                </View>
                <Text style={[styles.adviceText, { color: isDark ? "#BFDBFE" : "#1E3A8A" }]}>{result.overallAdvice}</Text>
              </View>

              {/* Missing Terms */}
              {result.missingTerms && result.missingTerms.length > 0 && (
                <View style={[styles.missingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>MISSING CLAUSES / TERMS</Text>
                  {result.missingTerms.map((term, i) => (
                    <View key={i} style={styles.missingRow}>
                      <Ionicons name="alert-circle-outline" size={15} color={COLORS.accentGold} />
                      <Text style={[styles.missingText, { color: theme.textSecondary }]}>{term}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Risky Clauses Accordion */}
              {result.riskyClauses && result.riskyClauses.length > 0 && (
                <View>
                  <Text style={[styles.sectionLabel, { color: theme.textMuted, marginBottom: 10 }]}>
                    REDLINED CLAUSES ({result.riskyClauses.length})
                  </Text>
                  {result.riskyClauses.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.clauseCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => setExpandedClause(expandedClause === i ? null : i)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.clauseHeader}>
                        <View style={styles.clauseIndex}>
                          <Text style={styles.clauseIndexText}>{i + 1}</Text>
                        </View>
                        <View style={styles.clauseMeta}>
                          <Text
                            style={[styles.clauseText, { color: theme.textPrimary }]}
                            numberOfLines={expandedClause === i ? undefined : 2}
                          >
                            "{item.clause}"
                          </Text>
                          <Text style={[styles.clauseRisk, { color: COLORS.statusAlert }]}>{item.risk}</Text>
                        </View>
                        <Ionicons
                          name={expandedClause === i ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={theme.textMuted}
                        />
                      </View>
                      {expandedClause === i && (
                        <View style={[styles.clauseSuggestions, { borderTopColor: theme.border }]}>
                          <Text style={[styles.suggestionLabel, { color: theme.textMuted }]}>SAFER WORDING (EN)</Text>
                          <Text style={[styles.suggestionText, { color: theme.textSecondary }]}>{item.suggestionEN}</Text>
                          <Text style={[styles.suggestionLabel, { color: theme.textMuted }]}>सुरक्षित शब्दावली (HI)</Text>
                          <Text style={[styles.suggestionText, { color: theme.textSecondary }]}>{item.suggestionHI}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1 },
  header: { borderBottomWidth: 1, paddingVertical: 28, paddingHorizontal: 20, alignItems: "center" },
  headerContent: { maxWidth: 960, width: "100%" },
  badge: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: COLORS.accentGoldDark, letterSpacing: 0.6 },
  headerTitle: { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  headerSubtitle: { fontSize: 14, lineHeight: 21 },
  contentWrapper: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  card: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 20, gap: 14, ...SHADOWS.subtle },
  cardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceMuted,
  },
  toggleBtnActive: { backgroundColor: COLORS.navyGov, borderColor: COLORS.navyMuted },
  toggleBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },
  toggleBtnTextActive: { color: COLORS.white },
  uploadZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: RADIUS.lg,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
  },
  uploadZoneTitle: { fontSize: 16, fontWeight: "700" },
  uploadZoneSub: { fontSize: 12, textAlign: "center" },
  extractedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  extractedLabel: { fontSize: 13, flex: 1 },
  pasteInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: 14,
    minHeight: 160,
    outlineStyle: "none",
  } as any,
  errorBox: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { flex: 1, fontSize: 13, lineHeight: 19 },
  analyseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    ...SHADOWS.card,
  },
  analyseBtnDisabled: { opacity: 0.45 },
  analyseBtnText: { fontSize: 16, fontWeight: "700", color: COLORS.white },
  riskCard: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 20, gap: 14, ...SHADOWS.subtle },
  riskRow: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  riskScoreCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    flexShrink: 0,
  },
  riskScoreNumber: { fontSize: 28, fontWeight: "900", lineHeight: 32 },
  riskScoreMax: { fontSize: 11, fontWeight: "600" },
  riskMeta: { flex: 1, gap: 8 },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  riskDot: { width: 7, height: 7, borderRadius: 99 },
  riskBadgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  riskSummary: { fontSize: 14, lineHeight: 21 },
  adviceCard: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 18, gap: 8, marginTop: 12 },
  adviceHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  adviceTitle: { fontSize: 14, fontWeight: "700" },
  adviceText: { fontSize: 13, lineHeight: 20 },
  missingCard: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 18, gap: 10, ...SHADOWS.subtle, marginTop: 12 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 4 },
  missingRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  missingText: { flex: 1, fontSize: 13, lineHeight: 19 },
  clauseCard: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, ...SHADOWS.subtle },
  clauseHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  clauseIndex: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: COLORS.statusAlertBg,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  clauseIndexText: { fontSize: 13, fontWeight: "800", color: COLORS.statusAlert },
  clauseMeta: { flex: 1 },
  clauseText: { fontSize: 13, fontStyle: "italic", lineHeight: 19, marginBottom: 4 },
  clauseRisk: { fontSize: 12, fontWeight: "600" },
  clauseSuggestions: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, gap: 6 },
  suggestionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  suggestionText: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
});

export default DocumentAnalyzer;
