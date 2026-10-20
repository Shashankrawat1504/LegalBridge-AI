import React, { useState, useCallback } from "react";
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
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import OfficialNavbar from "../components/OfficialNavbar";
import Footer from "../components/Footer";
import { COLORS, RADIUS, SHADOWS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface EvidenceFile {
  id: string;
  name: string;
  mimeType: string;
  text: string;
  status: "pending" | "processing" | "done" | "error";
  errorMsg?: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  entities: string[];
  sourceFile: string;
  confidence: number;
}

type SortOrder = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mimeIcon(mimeType: string): any {
  if (mimeType.startsWith("image/")) return "image-outline";
  if (mimeType.includes("pdf")) return "document-text-outline";
  if (mimeType.includes("word")) return "document-outline";
  if (mimeType === "text/plain") return "reader-outline";
  return "attach-outline";
}

function confidenceColor(c: number, isDark: boolean): string {
  if (c >= 0.75) return isDark ? "#4ADE80" : "#166534";
  if (c >= 0.45) return isDark ? "#FCD34D" : "#B45309";
  return isDark ? "#F87171" : "#991B1B";
}

function buildPrompt(text: string, filename: string): string {
  const schema =
    '{"events":[{"date":"YYYY-MM-DD or approximate phrase",' +
    '"title":"short event title (max 8 words)",' +
    '"description":"what happened in 1-3 sentences",' +
    '"entities":["person/place/org names found"],' +
    '"sourceFile":"' + filename + '",' +
    '"confidence":0.0}]}';

  return (
    "You are a forensic legal analyst for the Indian judiciary. " +
    "Read the following document carefully and extract ALL datable events or facts mentioned. " +
    "Respond ONLY with a valid JSON object exactly matching this schema (no markdown fences, no extra text):\n" +
    schema + "\n\n" +
    "Rules:\n" +
    "- date: most specific extractable date; use an approximate phrase if exact date is unknown.\n" +
    "- confidence: float 0.0-1.0 reflecting certainty of the date attribution.\n" +
    "- entities: all named people, places, organisations, and legal references for that event.\n" +
    "- Return at least 1 event even if document is vague.\n" +
    "- DO NOT wrap in markdown code fences.\n\n" +
    "Document filename: " + filename + "\n" +
    '"""\n' + text.slice(0, 7000) + '\n"""'
  );
}

function sortEvents(events: TimelineEvent[], order: SortOrder): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const aIso = /^\d{4}/.test(a.date);
    const bIso = /^\d{4}/.test(b.date);
    if (aIso && bIso) {
      return order === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    }
    if (aIso) return order === "asc" ? -1 : 1;
    if (bIso) return order === "asc" ? 1 : -1;
    return 0;
  });
}

function extractFallbackEvents(text: string, filename: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const datePatterns = [
    /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/,
    /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{2,4})\b/i,
    /\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4})\b/i,
    /\b(\d{4}-\d{2}-\d{2})\b/,
  ];

  for (const line of lines) {
    for (const pat of datePatterns) {
      const match = line.match(pat);
      if (match) {
        const dateStr = match[1];
        const entityMatches = line.match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*\b/g) || [];
        const entities = Array.from(
          new Set(
            entityMatches.filter(
              (e) =>
                !["The", "This", "That", "There", "Then", "When", "Where", "After", "Before", "During", "Under", "Section"].includes(e)
            )
          )
        ).slice(0, 4);

        events.push({
          date: dateStr,
          title: line.length > 50 ? line.slice(0, 47) + "…" : line,
          description: line,
          entities,
          sourceFile: filename,
          confidence: 0.85,
        });
        break;
      }
    }
  }

  if (events.length === 0 && text.trim().length > 0) {
    events.push({
      date: "Undated / Case Record",
      title: filename.replace(/\.[^/.]+$/, "") + " (Forensic Document)",
      description: text.slice(0, 200) + (text.length > 200 ? "…" : ""),
      entities: [filename],
      sourceFile: filename,
      confidence: 0.65,
    });
  }

  return events;
}

// ─── Component ────────────────────────────────────────────────────────────────
const EvidenceTimeline: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filterQuery, setFilterQuery] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  // ── File Picking ────────────────────────────────────────────────────────────
  const pickFiles = useCallback(async () => {
    setGlobalError("");

    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";
      input.onchange = async (e: any) => {
        const picked: File[] = Array.from(e.target?.files || []);
        if (!picked.length) return;

        const populated: EvidenceFile[] = await Promise.all(
          picked.map(async (rawFile) => {
            const id = Date.now().toString() + Math.random().toString(36).slice(2);
            let text = "";
            if (rawFile.type === "text/plain") {
              try {
                text = await new Promise<string>((res, rej) => {
                  const reader = new FileReader();
                  reader.onload = (ev) => res((ev.target?.result as string) || "");
                  reader.onerror = rej;
                  reader.readAsText(rawFile);
                });
              } catch {}
            }
            return {
              id,
              name: rawFile.name,
              mimeType: rawFile.type || "application/octet-stream",
              text,
              status: "pending" as const,
            };
          })
        );

        setFiles((prev) => {
          const existing = new Set(prev.map((f) => f.name));
          return [...prev, ...populated.filter((f) => !existing.has(f.name))];
        });
      };
      input.click();
      return;
    }

    // Native
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/plain",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/*",
        ],
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;

      const newFiles: EvidenceFile[] = await Promise.all(
        result.assets.map(async (asset) => {
          let text = "";
          if (asset.mimeType === "text/plain" && asset.uri) {
            try { text = await FileSystem.readAsStringAsync(asset.uri); } catch {}
          }
          return {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            name: asset.name,
            mimeType: asset.mimeType || "application/octet-stream",
            text,
            status: "pending" as const,
          };
        })
      );

      setFiles((prev) => {
        const existing = new Set(prev.map((f) => f.name));
        return [...prev, ...newFiles.filter((f) => !existing.has(f.name))];
      });
    } catch {
      setGlobalError("Failed to pick files. Please try again.");
    }
  }, []);

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const updateFileText = (id: string, text: string) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, text } : f)));

  const clearAll = () => {
    Alert.alert("Clear All", "Remove all files and timeline events?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setFiles([]);
          setEvents([]);
          setGlobalError("");
          setExpandedEvent(null);
        },
      },
    ]);
  };

  const loadSampleEvidence = () => {
    const samples: EvidenceFile[] = [
      {
        id: "sample-1",
        name: "FIR_No_104_2023.txt",
        mimeType: "text/plain",
        text: `FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)\nPolice Station: Connaught Place, New Delhi\nDate of Occurrence: 12/08/2023 at approximately 21:30 hrs.\nComplainant: Rajesh Verma, resident of Sector 14, Rohini.\nIncident Details: Complainant was walking near Barakhamba Road when two unidentified persons on a black motorcycle intercepted him. The pillion rider brandished a firearm and forcibly snatched his briefcase containing Rs. 2,50,000 in cash and registered property deeds.\nOn 13/08/2023 at 09:00 hrs, Sub-Inspector Sharma conducted spot inspection and recorded witness statements.`,
        status: "pending",
      },
      {
        id: "sample-2",
        name: "CCTV_Forensic_Report.txt",
        mimeType: "text/plain",
        text: `FORENSIC EXAMINATION OF SURVEILLANCE FOOTAGE\nAgency: Central Forensic Science Laboratory (CFSL)\nDate of Report: 15/08/2023\nSummary: Surveillance camera footage from Metro Pillar 42 timestamped 12/08/2023 21:28:14 hrs confirms motorcycle registration DL-04-AB-9821 approaching the intersection.\nOn 14/08/2023 16:00 hrs, vehicle registered to suspect Vikram Malhotra was impounded in Karol Bagh.\nOn 16/08/2023, CFSL facial recognition analysis matched suspect with Delhi Police criminal database with 94% confidence.`,
        status: "pending",
      },
      {
        id: "sample-3",
        name: "Call_Detail_Record_Analysis.txt",
        mimeType: "text/plain",
        text: `TELECOM CDR FORENSIC ANALYSIS\nTarget MSISDN: +91 98110XXXXX (Vikram Malhotra)\nKey Call Logs & Tower Triangulation:\n- 12/08/2023 21:15 hrs: Call received from accomplice Suresh Kumar, tower location Connaught Place Outer Circle.\n- 12/08/2023 21:42 hrs: Outgoing call to Suresh Kumar, moving tower towards Karol Bagh.\n- 17/08/2023 06:30 hrs: Raid conducted at suspect hideout in Paharganj; stolen cash Rs. 1,80,000 recovered.`,
        status: "pending",
      },
    ];
    setFiles(samples);
    setEvents([]);
    setGlobalError("");
    setExpandedEvent(null);
  };

  // ── AI Analysis ─────────────────────────────────────────────────────────────
  const analyseAll = async () => {
    const toProcess = files.filter((f) => f.text.trim().length > 0);
    if (!toProcess.length) {
      Alert.alert(
        "No Text Available",
        "Please paste document text for at least one file before building the timeline."
      );
      return;
    }

    setIsAnalysing(true);
    setGlobalError("");
    setEvents([]);
    setExpandedEvent(null);

    const collected: TimelineEvent[] = [];

    for (const file of toProcess) {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
      );

      let fileEvents: TimelineEvent[] = [];

      try {
        const res = await fetch("https://sih-backend-881i.onrender.com/encode/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: buildPrompt(file.text, file.name) }),
        });
        const data = await res.json();

        const rawText: string =
          typeof data?.description === "string"
            ? data.description
            : data?.acts
            ? JSON.stringify(data)
            : "";

        const jsonMatch = rawText ? rawText.match(/\{[\s\S]*\}/) : null;
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed.events) && parsed.events.length > 0) {
            fileEvents = parsed.events.map((ev: any) => ({
              date: ev.date || "Unknown date",
              title: ev.title || "Untitled event",
              description: ev.description || "",
              entities: Array.isArray(ev.entities) ? ev.entities : [],
              sourceFile: file.name,
              confidence: typeof ev.confidence === "number" ? ev.confidence : 0.8,
            }));
          }
        }
      } catch {
        // Network / timeout
      }

      // Robust fallback extraction if backend fails or returns no events
      if (!fileEvents.length) {
        fileEvents = extractFallbackEvents(file.text, file.name);
      }

      if (fileEvents.length > 0) {
        collected.push(...fileEvents);
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "done" } : f))
        );
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: "error", errorMsg: "No datable events identified." }
              : f
          )
        );
      }
    }

    if (!collected.length) {
      setGlobalError(
        "No events could be extracted. Please verify that the documents contain readable text and dates."
      );
    } else {
      setEvents(sortEvents(collected, sortOrder));
    }

    setIsAnalysing(false);
  };

  // ── Filtered + sorted events ────────────────────────────────────────────────
  const displayedEvents = sortEvents(
    filterQuery.trim()
      ? events.filter((ev) => {
          const q = filterQuery.toLowerCase();
          return (
            ev.title.toLowerCase().includes(q) ||
            ev.description.toLowerCase().includes(q) ||
            ev.date.toLowerCase().includes(q) ||
            ev.entities.some((e) => e.toLowerCase().includes(q)) ||
            ev.sourceFile.toLowerCase().includes(q)
          );
        })
      : events,
    sortOrder
  );

  const readyCount = files.filter((f) => f.text.trim().length > 0).length;
  const accentBlue = isDark ? "#60A5FA" : COLORS.navyGov;
  const accentBlueBg = isDark ? "#0C1A2E" : "#EFF6FF";
  const accentBlueBorder = isDark ? "#1E40AF" : "#BFDBFE";

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.wrapper, { backgroundColor: theme.background }]}>
      <OfficialNavbar />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <View style={[styles.badge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <Text style={styles.badgeText}>AI FORENSIC ANALYSIS</Text>
            </View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Multimodal Evidence Timeline Builder
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Add photos, scanned PDFs, handwritten notes, or screenshots from any case file.
              The AI reads each document, extracts every datable event, and builds a
              chronological forensic timeline — complete with named entities and confidence scores.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>

          {/* ─ Step 1: Add Files ─────────────────────────────────────────── */}
          <View style={[styles.stepCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.stepLabelRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <Text style={[styles.stepLabel, { color: theme.textMuted }]}>ADD EVIDENCE FILES</Text>
            </View>

            <TouchableOpacity
              style={[styles.uploadZone, { borderColor: isDark ? "#334155" : COLORS.border, backgroundColor: theme.surfaceMuted }]}
              onPress={pickFiles}
              activeOpacity={0.75}
            >
              <Ionicons name="cloud-upload-outline" size={38} color={accentBlue} />
              <Text style={[styles.uploadTitle, { color: theme.textPrimary }]}>
                Tap to Add Evidence Files
              </Text>
              <Text style={[styles.uploadSub, { color: theme.textMuted }]}>
                Photos  ·  PDF  ·  DOCX  ·  TXT  ·  Screenshots — multiple files at once
              </Text>
              <View style={[styles.uploadHintPill, { backgroundColor: accentBlueBg, borderColor: accentBlueBorder }]}>
                <Ionicons name="information-circle-outline" size={13} color={accentBlue} />
                <Text style={[styles.uploadHintText, { color: accentBlue }]}>
                  TXT files auto-extract  ·  For PDFs / images, paste text below each file
                </Text>
              </View>
            </TouchableOpacity>

            {files.length === 0 && (
              <TouchableOpacity
                style={[styles.sampleBtn, { backgroundColor: accentBlueBg, borderColor: accentBlueBorder }]}
                onPress={loadSampleEvidence}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={16} color={accentBlue} />
                <Text style={[styles.sampleBtnText, { color: accentBlue }]}>
                  Load Sample Investigation Case (3 files)
                </Text>
              </TouchableOpacity>
            )}

            {/* File List */}
            {files.length > 0 && (
              <View style={styles.fileList}>
                <View style={styles.fileListHeader}>
                  <Text style={[styles.fileListMeta, { color: theme.textMuted }]}>
                    {files.length} file{files.length !== 1 ? "s" : ""} added
                    {readyCount > 0 ? "  ·  " + readyCount + " ready" : "  ·  paste text to proceed"}
                  </Text>
                  <TouchableOpacity onPress={clearAll}>
                    <Text style={[styles.clearAllText, { color: COLORS.statusAlert }]}>Clear all</Text>
                  </TouchableOpacity>
                </View>

                {files.map((f) => (
                  <View
                    key={f.id}
                    style={[
                      styles.fileCard,
                      { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                      f.status === "done" && { borderColor: isDark ? "#22C55E" : COLORS.statusSuccess },
                      f.status === "error" && { borderColor: COLORS.statusAlert },
                      f.status === "processing" && { borderColor: accentBlue },
                    ]}
                  >
                    <View style={styles.fileCardHeader}>
                      <View style={[styles.fileIconBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Ionicons name={mimeIcon(f.mimeType)} size={20} color={accentBlue} />
                      </View>
                      <View style={styles.fileMeta}>
                        <Text style={[styles.fileName, { color: theme.textPrimary }]} numberOfLines={1}>
                          {f.name}
                        </Text>
                        <View style={styles.fileStatusRow}>
                          {f.status === "processing" && (
                            <>
                              <ActivityIndicator size="small" color={accentBlue} />
                              <Text style={[styles.fileStatusText, { color: accentBlue }]}>Analysing…</Text>
                            </>
                          )}
                          {f.status === "done" && (
                            <>
                              <Ionicons name="checkmark-circle" size={14} color={isDark ? "#4ADE80" : COLORS.statusSuccess} />
                              <Text style={[styles.fileStatusText, { color: isDark ? "#4ADE80" : COLORS.statusSuccess }]}>
                                Events extracted
                              </Text>
                            </>
                          )}
                          {f.status === "error" && (
                            <>
                              <Ionicons name="warning-outline" size={14} color={COLORS.statusAlert} />
                              <Text style={[styles.fileStatusText, { color: COLORS.statusAlert }]}>
                                {f.errorMsg || "Error"}
                              </Text>
                            </>
                          )}
                          {f.status === "pending" && f.text.trim().length > 0 && (
                            <>
                              <Ionicons name="document-text" size={14} color={isDark ? "#A78BFA" : "#7C3AED"} />
                              <Text style={[styles.fileStatusText, { color: isDark ? "#A78BFA" : "#7C3AED" }]}>
                                {f.text.length.toLocaleString()} chars · ready
                              </Text>
                            </>
                          )}
                          {f.status === "pending" && f.text.trim().length === 0 && (
                            <>
                              <Ionicons name="create-outline" size={14} color={theme.textMuted} />
                              <Text style={[styles.fileStatusText, { color: theme.textMuted }]}>
                                Paste document text below
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => removeFile(f.id)} style={styles.removeBtn}>
                        <Ionicons name="close-circle-outline" size={20} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>

                    {/* Paste area for binary files */}
                    {f.text.trim().length === 0 && f.status !== "processing" && (
                      <TextInput
                        style={[
                          styles.pasteBox,
                          {
                            backgroundColor: theme.inputBackground,
                            borderColor: theme.inputBorder,
                            color: theme.textPrimary,
                          },
                        ]}
                        placeholder={"Paste text from \"" + f.name + "\" here…"}
                        placeholderTextColor={theme.textMuted}
                        value={f.text}
                        onChangeText={(v) => updateFileText(f.id, v)}
                        multiline
                        textAlignVertical="top"
                      />
                    )}

                    {/* Edit loaded text */}
                    {f.text.trim().length > 0 && f.status === "pending" && (
                      <TouchableOpacity
                        style={[styles.editTextRow, { borderTopColor: theme.border }]}
                        onPress={() => updateFileText(f.id, "")}
                      >
                        <Ionicons name="pencil-outline" size={13} color={theme.textMuted} />
                        <Text style={[styles.editTextLabel, { color: theme.textMuted }]}>
                          Tap to edit / replace text
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Global error */}
          {globalError.length > 0 && (
            <View style={[styles.errorBox, { backgroundColor: isDark ? "#450A0A" : COLORS.statusAlertBg, borderColor: "#FECACA" }]}>
              <Ionicons name="warning-outline" size={18} color={COLORS.statusAlert} />
              <Text style={[styles.errorText, { color: COLORS.statusAlert }]}>{globalError}</Text>
            </View>
          )}

          {/* ─ Step 2: Build Timeline ──────────────────────────────────────── */}
          {files.length > 0 && (
            <TouchableOpacity
              style={[styles.buildBtn, (isAnalysing || readyCount === 0) && styles.buildBtnDisabled]}
              onPress={analyseAll}
              disabled={isAnalysing || readyCount === 0}
              activeOpacity={0.85}
            >
              {isAnalysing ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Ionicons name="analytics-outline" size={22} color={COLORS.white} />
              )}
              <View>
                <Text style={styles.buildBtnTitle}>
                  {isAnalysing ? "Building Timeline…" : "Build Evidence Timeline"}
                </Text>
                {!isAnalysing && readyCount > 0 && (
                  <Text style={styles.buildBtnSub}>
                    Processing {readyCount} file{readyCount !== 1 ? "s" : ""}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* ─ Step 3: Timeline ────────────────────────────────────────────── */}
          {events.length > 0 && (
            <View>
              {/* Toolbar */}
              <View style={styles.timelineToolbar}>
                <View style={[styles.countBadge, { backgroundColor: accentBlueBg, borderColor: accentBlueBorder }]}>
                  <Ionicons name="git-branch-outline" size={14} color={accentBlue} />
                  <Text style={[styles.countBadgeText, { color: accentBlue }]}>
                    {displayedEvents.length} event{displayedEvents.length !== 1 ? "s" : ""}
                  </Text>
                </View>

                <View style={styles.timelineControls}>
                  <View style={[styles.searchMini, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                    <Ionicons name="search-outline" size={13} color={theme.textMuted} />
                    <TextInput
                      style={[styles.searchMiniInput, { color: theme.textPrimary }]}
                      placeholder="Filter events…"
                      placeholderTextColor={theme.textMuted}
                      value={filterQuery}
                      onChangeText={setFilterQuery}
                    />
                    {filterQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setFilterQuery("")}>
                        <Ionicons name="close-circle" size={13} color={theme.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.sortBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => {
                      const next: SortOrder = sortOrder === "asc" ? "desc" : "asc";
                      setSortOrder(next);
                      setEvents((e) => sortEvents(e, next));
                    }}
                  >
                    <Ionicons
                      name={sortOrder === "asc" ? "arrow-up-outline" : "arrow-down-outline"}
                      size={14}
                      color={accentBlue}
                    />
                    <Text style={[styles.sortBtnText, { color: accentBlue }]}>
                      {sortOrder === "asc" ? "Oldest first" : "Newest first"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Vertical timeline */}
              <View>
                {displayedEvents.map((ev, i) => {
                  const isLast = i === displayedEvents.length - 1;
                  const isExpanded = expandedEvent === i;
                  const confColor = confidenceColor(ev.confidence, isDark);

                  return (
                    <View key={i} style={styles.timelineRow}>
                      {/* Spine */}
                      <View style={styles.spine}>
                        <View style={[styles.dot, { backgroundColor: accentBlue, borderColor: theme.background }]} />
                        {!isLast && (
                          <View style={[styles.line, { backgroundColor: isDark ? "#334155" : COLORS.border }]} />
                        )}
                      </View>

                      {/* Card */}
                      <TouchableOpacity
                        style={[styles.eventCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => setExpandedEvent(isExpanded ? null : i)}
                        activeOpacity={0.85}
                      >
                        {/* Date + Confidence */}
                        <View style={styles.eventTopRow}>
                          <View style={[styles.datePill, {
                            backgroundColor: isDark ? "#1E293B" : COLORS.accentGoldLight,
                            borderColor: isDark ? "#334155" : COLORS.accentGoldBorder,
                          }]}>
                            <Ionicons name="calendar-outline" size={12} color={isDark ? "#FCD34D" : COLORS.accentGoldDark} />
                            <Text style={[styles.datePillText, { color: isDark ? "#FCD34D" : COLORS.accentGoldDark }]}>
                              {ev.date}
                            </Text>
                          </View>
                          <View style={styles.confRow}>
                            <View style={[styles.confBar, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                              <View
                                style={[
                                  styles.confFill,
                                  // eslint-disable-next-line react-native/no-inline-styles
                                  { width: (Math.round(ev.confidence * 100) + "%") as any, backgroundColor: confColor },
                                ]}
                              />
                            </View>
                            <Text style={[styles.confText, { color: confColor }]}>
                              {Math.round(ev.confidence * 100)}%
                            </Text>
                          </View>
                        </View>

                        {/* Title */}
                        <Text style={[styles.eventTitle, { color: theme.textPrimary }]}>{ev.title}</Text>

                        {/* Description */}
                        <Text
                          style={[styles.eventDesc, { color: theme.textSecondary }]}
                          numberOfLines={isExpanded ? undefined : 2}
                        >
                          {ev.description}
                        </Text>

                        {/* Expanded section */}
                        {isExpanded && (
                          <View style={[styles.expandSection, { borderTopColor: theme.border }]}>
                            <View style={styles.sourceRow}>
                              <Ionicons name="document-attach-outline" size={13} color={theme.textMuted} />
                              <Text style={[styles.sourceText, { color: theme.textMuted }]}>
                                Source: {ev.sourceFile}
                              </Text>
                            </View>

                            {ev.entities.length > 0 && (
                              <View>
                                <Text style={[styles.entitiesLabel, { color: theme.textMuted }]}>
                                  NAMED ENTITIES
                                </Text>
                                <View style={styles.entitiesRow}>
                                  {ev.entities.map((ent, ei) => (
                                    <View
                                      key={ei}
                                      style={[styles.entityPill, { backgroundColor: accentBlueBg, borderColor: accentBlueBorder }]}
                                    >
                                      <Text style={[styles.entityPillText, { color: isDark ? "#93C5FD" : "#1E40AF" }]}>
                                        {ent}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            )}
                          </View>
                        )}

                        {/* Expand toggle */}
                        <View style={styles.expandToggle}>
                          <Ionicons
                            name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                            size={15}
                            color={theme.textMuted}
                          />
                          <Text style={[styles.expandToggleText, { color: theme.textMuted }]}>
                            {isExpanded ? "Show less" : "Show details & entities"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Empty state */}
          {events.length === 0 && !isAnalysing && files.length === 0 && (
            <View style={[styles.emptyState, { borderColor: theme.border }]}>
              <View style={[styles.emptyIconBox, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                <Ionicons name="git-network-outline" size={48} color={accentBlue} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Evidence Added Yet</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Add evidence files above. The AI will extract all datable events from each document
                and build a chronological forensic timeline — complete with named entities and
                confidence scores.
              </Text>
            </View>
          )}

        </View>
        <Footer />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1 },

  header: {
    borderBottomWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
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
  headerSubtitle: { fontSize: 14, lineHeight: 22 },

  contentWrapper: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },

  stepCard: {
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: 20,
    gap: 16,
    ...SHADOWS.subtle,
  },
  stepLabelRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 99,
    backgroundColor: COLORS.navyGov,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 13, fontWeight: "800", color: COLORS.white },
  stepLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },

  uploadZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: RADIUS.xl,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 10,
  },
  uploadTitle: { fontSize: 16, fontWeight: "700" },
  uploadSub: { fontSize: 13, textAlign: "center" },
  uploadHintPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 4,
  },
  uploadHintText: { fontSize: 12, fontWeight: "500" },
  sampleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sampleBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },

  fileList: { gap: 10 },
  fileListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fileListMeta: { fontSize: 12, fontWeight: "600" },
  clearAllText: { fontSize: 12, fontWeight: "700" },

  fileCard: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 12,
    gap: 10,
  },
  fileCardHeader: { flexDirection: "row", gap: 10, alignItems: "center" },
  fileIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fileMeta: { flex: 1 },
  fileName: { fontSize: 13, fontWeight: "700", marginBottom: 3 },
  fileStatusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  fileStatusText: { fontSize: 12, fontWeight: "500" },
  removeBtn: { padding: 2 },

  pasteBox: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 10,
    fontSize: 13,
    minHeight: 80,
    outlineStyle: "none",
  } as any,

  editTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  editTextLabel: { fontSize: 12 },

  errorBox: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
  },
  errorText: { flex: 1, fontSize: 13, lineHeight: 19 },

  buildBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 18,
    borderRadius: RADIUS.xl,
    ...SHADOWS.elevated,
  },
  buildBtnDisabled: { opacity: 0.4 },
  buildBtnTitle: { fontSize: 17, fontWeight: "800", color: COLORS.white },
  buildBtnSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 1 },

  timelineToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  countBadgeText: { fontSize: 12, fontWeight: "700" },
  timelineControls: { flexDirection: "row", alignItems: "center", gap: 8 },

  searchMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 140,
  },
  searchMiniInput: { fontSize: 12, flex: 1, outlineStyle: "none" } as any,

  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sortBtnText: { fontSize: 12, fontWeight: "600" },

  // Timeline
  timelineRow: { flexDirection: "row", gap: 14, marginBottom: 4 },
  spine: { alignItems: "center", width: 18, paddingTop: 14 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 99,
    borderWidth: 2.5,
    zIndex: 1,
  },
  line: { flex: 1, width: 2, marginTop: 3, borderRadius: 1 },

  eventCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 14,
    gap: 8,
    marginBottom: 12,
    ...SHADOWS.subtle,
  },
  eventTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  datePillText: { fontSize: 11, fontWeight: "700" },

  confRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  confBar: { width: 56, height: 5, borderRadius: 99, overflow: "hidden" },
  confFill: { height: "100%", borderRadius: 99 },
  confText: { fontSize: 10, fontWeight: "800" },

  eventTitle: { fontSize: 15, fontWeight: "700", lineHeight: 21 },
  eventDesc: { fontSize: 13, lineHeight: 20 },

  expandSection: { borderTopWidth: 1, paddingTop: 10, gap: 10 },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sourceText: { fontSize: 12 },
  entitiesLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6 },
  entitiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  entityPill: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  entityPillText: { fontSize: 12, fontWeight: "600" },

  expandToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-end",
  },
  expandToggleText: { fontSize: 12 },

  emptyState: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: RADIUS.xl,
    padding: 40,
    alignItems: "center",
    gap: 14,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 360,
  },
});

export default EvidenceTimeline;
