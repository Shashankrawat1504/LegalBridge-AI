import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OfficialNavbar from "../components/OfficialNavbar";
import Footer from "../components/Footer";
import { COLORS, RADIUS, SHADOWS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

// ── Types ─────────────────────────────────────────────────────────────────────
type CaseStatus = "Open" | "Under Investigation" | "Chargesheet Filed" | "Closed" | "Acquitted";
type CasePriority = "High" | "Medium" | "Low";

interface CaseEntry {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  section: string;
  court: string;
  nextHearing: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "@lawai_case_tracker";

const STATUS_OPTIONS: CaseStatus[] = [
  "Open",
  "Under Investigation",
  "Chargesheet Filed",
  "Closed",
  "Acquitted",
];

const PRIORITY_OPTIONS: CasePriority[] = ["High", "Medium", "Low"];

function statusColor(status: CaseStatus): { bg: string; text: string; dot: string } {
  switch (status) {
    case "Open": return { bg: "#FEF3C7", text: "#B45309", dot: "#D97706" };
    case "Under Investigation": return { bg: "#EFF6FF", text: "#1E40AF", dot: "#3B82F6" };
    case "Chargesheet Filed": return { bg: "#F3E8FF", text: "#7E22CE", dot: "#9333EA" };
    case "Closed": return { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" };
    case "Acquitted": return { bg: "#F1F5F9", text: "#334155", dot: "#64748B" };
    default: return { bg: "#F1F5F9", text: "#334155", dot: "#64748B" };
  }
}

function priorityColor(priority: CasePriority): string {
  switch (priority) {
    case "High": return "#991B1B";
    case "Medium": return "#B45309";
    case "Low": return "#166534";
  }
}

function timeAgo(dateString: string): string {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  return Math.floor(hours / 24) + "d ago";
}

const EMPTY_FORM: Omit<CaseEntry, "id" | "createdAt" | "updatedAt"> = {
  caseNumber: "",
  title: "",
  description: "",
  status: "Open",
  priority: "Medium",
  section: "",
  court: "",
  nextHearing: "",
};

// ── Component ─────────────────────────────────────────────────────────────────
const CaseTracker: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const [cases, setCases] = useState<CaseEntry[]>([]);
  const [filter, setFilter] = useState<CaseStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setCases(JSON.parse(stored));
    }).catch(() => {});
  }, []);

  const persist = async (updated: CaseEntry[]) => {
    setCases(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (c: CaseEntry) => {
    setEditId(c.id);
    setForm({
      caseNumber: c.caseNumber,
      title: c.title,
      description: c.description,
      status: c.status,
      priority: c.priority,
      section: c.section,
      court: c.court,
      nextHearing: c.nextHearing,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert("Validation", "Case title is required.");
      return;
    }
    const now = new Date().toISOString();
    if (editId) {
      const updated = cases.map((c) =>
        c.id === editId ? { ...c, ...form, updatedAt: now } : c
      );
      await persist(updated);
    } else {
      const newCase: CaseEntry = {
        ...form,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      await persist([newCase, ...cases]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Case", "Are you sure you want to remove this case?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await persist(cases.filter((c) => c.id !== id));
        },
      },
    ]);
  };

  const filtered = cases.filter((c) => {
    const matchStatus = filter === "All" || c.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.caseNumber.toLowerCase().includes(q) ||
      c.section.toLowerCase().includes(q) ||
      c.court.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── KPI stats ───────────────────────────────────────────────────────────────
  const total = cases.length;
  const open = cases.filter((c) => c.status === "Open").length;
  const highPriority = cases.filter((c) => c.priority === "High").length;
  const closed = cases.filter((c) => c.status === "Closed" || c.status === "Acquitted").length;
  const pctClosed = total > 0 ? Math.round((closed / total) * 100) : 0;

  const kpis = [
    { label: "Total Cases", value: total, icon: "folder-open-outline", color: isDark ? "#60A5FA" : COLORS.navyGov },
    { label: "Open / Active", value: open, icon: "time-outline", color: "#D97706" },
    { label: "High Priority", value: highPriority, icon: "flame-outline", color: "#DC2626" },
    { label: "Resolution Rate", value: pctClosed + "%", icon: "checkmark-done-circle-outline", color: "#16A34A" },
  ];

  const setField = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.wrapper, { backgroundColor: theme.background }]}>
      <OfficialNavbar />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <View style={[styles.badge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <Text style={styles.badgeText}>CASE MANAGEMENT SYSTEM</Text>
            </View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Case Tracker & KPI Dashboard</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Track active investigations, court hearings, and case statuses. Monitor resolution KPIs at a glance.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          {/* KPI Cards */}
          <View style={[styles.kpiGrid, isCompact && styles.kpiGridCompact]}>
            {kpis.map((kpi, i) => (
              <View
                key={i}
                style={[
                  styles.kpiCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  isCompact && styles.kpiCardCompact,
                ]}
              >
                <View style={[styles.kpiIcon, { backgroundColor: kpi.color + "18" }]}>
                  <Ionicons name={kpi.icon as any} size={22} color={kpi.color} />
                </View>
                <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>{kpi.label}</Text>
              </View>
            ))}
          </View>

          {/* Search + Add */}
          <View style={styles.toolbarRow}>
            <View style={[styles.searchBox, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Ionicons name="search-outline" size={16} color={theme.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholder="Search cases..."
                placeholderTextColor={theme.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.8}>
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.addBtnText}>New Case</Text>
            </TouchableOpacity>
          </View>

          {/* Status filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {(["All", ...STATUS_OPTIONS] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  filter === s && styles.chipActive,
                ]}
                onPress={() => setFilter(s as any)}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, filter === s && styles.chipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Case Cards */}
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={52} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Cases Found</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                {cases.length === 0
                  ? 'Tap "New Case" to add your first case.'
                  : "No cases match your current filter."}
              </Text>
            </View>
          ) : (
            filtered.map((c) => {
              const sc = statusColor(c.status);
              return (
                <View key={c.id} style={[styles.caseCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.caseTop}>
                    <View style={styles.caseTopLeft}>
                      <Text style={[styles.caseMeta, { color: theme.textMuted }]}>
                        {c.caseNumber ? "#" + c.caseNumber + "  •  " : ""}
                        {timeAgo(c.updatedAt)}
                      </Text>
                      <Text style={[styles.caseTitle, { color: theme.textPrimary }]}>{c.title}</Text>
                    </View>
                    <View style={styles.caseBadges}>
                      <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
                        <Text style={[styles.statusPillText, { color: sc.text }]}>{c.status}</Text>
                      </View>
                      <View style={[styles.priorityPill, { borderColor: priorityColor(c.priority) }]}>
                        <Text style={[styles.priorityPillText, { color: priorityColor(c.priority) }]}>
                          {c.priority}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {c.description ? (
                    <Text style={[styles.caseDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                      {c.description}
                    </Text>
                  ) : null}

                  <View style={styles.caseDetails}>
                    {c.section ? (
                      <View style={styles.detailRow}>
                        <Ionicons name="book-outline" size={13} color={theme.textMuted} />
                        <Text style={[styles.detailText, { color: theme.textMuted }]}>{c.section}</Text>
                      </View>
                    ) : null}
                    {c.court ? (
                      <View style={styles.detailRow}>
                        <Ionicons name="business-outline" size={13} color={theme.textMuted} />
                        <Text style={[styles.detailText, { color: theme.textMuted }]}>{c.court}</Text>
                      </View>
                    ) : null}
                    {c.nextHearing ? (
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={13} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                        <Text style={[styles.detailText, { color: isDark ? "#60A5FA" : COLORS.navyGov, fontWeight: "600" }]}>
                          Next hearing: {c.nextHearing}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.caseActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                      onPress={() => openEdit(c)}
                    >
                      <Ionicons name="pencil-outline" size={15} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                      <Text style={[styles.actionBtnText, isDark && { color: "#60A5FA" }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnDanger]}
                      onPress={() => handleDelete(c.id)}
                    >
                      <Ionicons name="trash-outline" size={15} color={COLORS.statusAlert} />
                      <Text style={[styles.actionBtnText, { color: COLORS.statusAlert }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <Footer />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.cardBackground }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  {editId ? "Edit Case" : "New Case"}
                </Text>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Ionicons name="close-outline" size={24} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {[
                { key: "caseNumber", label: "Case Number", placeholder: "e.g. FIR/001/2026" },
                { key: "title", label: "Case Title *", placeholder: "Brief title of the case" },
                { key: "section", label: "Applicable Section / Act", placeholder: "e.g. BNS Section 103" },
                { key: "court", label: "Court / Station", placeholder: "e.g. Sessions Court, Delhi" },
                { key: "nextHearing", label: "Next Hearing Date", placeholder: "e.g. 2026-11-15" },
              ].map(({ key, label, placeholder }) => (
                <View key={key} style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{label}</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textMuted}
                    value={(form as any)[key]}
                    onChangeText={(v) => setField(key, v)}
                  />
                </View>
              ))}

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Description</Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldInputMulti, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  placeholder="Brief description of the case..."
                  placeholderTextColor={theme.textMuted}
                  value={form.description}
                  onChangeText={(v) => setField("description", v)}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Status</Text>
                <View style={styles.pillRow}>
                  {STATUS_OPTIONS.map((s) => {
                    const sc = statusColor(s);
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.selectPill,
                          { backgroundColor: theme.surface, borderColor: theme.border },
                          form.status === s && { backgroundColor: sc.bg, borderColor: sc.dot },
                        ]}
                        onPress={() => setField("status", s)}
                      >
                        <Text style={[styles.selectPillText, { color: theme.textSecondary }, form.status === s && { color: sc.text, fontWeight: "700" }]}>
                          {s}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Priority</Text>
                <View style={styles.pillRow}>
                  {PRIORITY_OPTIONS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.selectPill,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                        form.priority === p && { backgroundColor: priorityColor(p) + "18", borderColor: priorityColor(p) },
                      ]}
                      onPress={() => setField("priority", p)}
                    >
                      <Text style={[styles.selectPillText, { color: theme.textSecondary }, form.priority === p && { color: priorityColor(p), fontWeight: "700" }]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>{editId ? "Update Case" : "Add Case"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1 },
  header: { borderBottomWidth: 1, paddingVertical: 28, paddingHorizontal: 20, alignItems: "center" },
  headerContent: { maxWidth: 1040, width: "100%" },
  badge: { borderWidth: 1, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 8 },
  badgeText: { fontSize: 11, fontWeight: "700", color: COLORS.accentGoldDark, letterSpacing: 0.6 },
  headerTitle: { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  headerSubtitle: { fontSize: 14, lineHeight: 21 },
  contentWrapper: { maxWidth: 1040, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingVertical: 24 },
  kpiGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  kpiGridCompact: { flexWrap: "wrap" },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: "center",
    gap: 6,
    ...SHADOWS.subtle,
    minWidth: 130,
  },
  kpiCardCompact: { flex: undefined, width: "47%" },
  kpiIcon: { width: 40, height: 40, borderRadius: 99, alignItems: "center", justifyContent: "center" },
  kpiValue: { fontSize: 26, fontWeight: "900" },
  kpiLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  toolbarRow: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "center" },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    ...SHADOWS.subtle,
  },
  searchInput: { flex: 1, fontSize: 14, outlineStyle: "none" } as any,
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.navyGov,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    ...SHADOWS.card,
  },
  addBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.white },
  chipsRow: { flexDirection: "row", gap: 8, paddingBottom: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, borderWidth: 1 },
  chipActive: { backgroundColor: COLORS.navyGov, borderColor: COLORS.navyMuted },
  chipText: { fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: COLORS.white },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  caseCard: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 16, marginBottom: 12, ...SHADOWS.subtle },
  caseTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  caseTopLeft: { flex: 1 },
  caseMeta: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3, marginBottom: 3 },
  caseTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  caseBadges: { gap: 5, alignItems: "flex-end" },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
  statusDot: { width: 6, height: 6, borderRadius: 99 },
  statusPillText: { fontSize: 11, fontWeight: "700" },
  priorityPill: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  priorityPillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  caseDesc: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  caseDetails: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  detailText: { fontSize: 12 },
  caseActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  actionBtnDanger: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  actionBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.navyGov },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalBox: { borderRadius: RADIUS.xl, padding: 24, width: "100%", maxWidth: 540, maxHeight: "85%", ...SHADOWS.elevated },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, outlineStyle: "none" } as any,
  fieldInputMulti: { minHeight: 80, textAlignVertical: "top" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1 },
  selectPillText: { fontSize: 12, fontWeight: "600" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1 },
  cancelBtnText: { fontSize: 14, fontWeight: "600" },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: COLORS.navyGov },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.white },
});

export default CaseTracker;
