import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export interface ExtractedFieldItem {
  key: string;
  label: string;
  category: 'Complainant' | 'Occurrence Locus' | 'Accused' | 'Property & Loss' | 'Statutory Sections' | 'Investigation';
  value: string;
  confidence: number; // 0-100
  selected: boolean;
  currentValue?: string;
  willOverwrite: boolean;
}

// ── Sanitization of AI Placeholders ──────────────────────────────────────────
export const HALLUCINATED_PLACEHOLDERS = new Set([
  '...',
  'n/a',
  'na',
  'none',
  'unknown',
  'not specified',
  'not mentioned',
  'null',
  'undefined',
  'nil',
  'unspecified',
]);

export function isValidExtractedValue(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  const clean = val.trim().toLowerCase();
  return clean.length > 1 && !HALLUCINATED_PLACEHOLDERS.has(clean);
}

// ── Heuristic Extractor ────────────────────────────────────────────────────────
export function extractFIRFieldsFromNarrative(
  text: string,
  currentFormData: Record<string, string>,
  suggestion?: any
): ExtractedFieldItem[] {
  const items: ExtractedFieldItem[] = [];

  const addField = (
    key: string,
    label: string,
    category: ExtractedFieldItem['category'],
    extractedValue: string,
    confidence: number
  ) => {
    const cleanVal = extractedValue.trim().replace(/^[:,\s-]+|[:,\s-]+$/g, '');
    if (!cleanVal || !isValidExtractedValue(cleanVal)) return;

    const current = (currentFormData[key] || '').trim();
    const willOverwrite = Boolean(current && current.toLowerCase() !== cleanVal.toLowerCase());

    // New fields default selected if confidence >= 70; fields that will overwrite require explicit user selection
    const selected = !willOverwrite && confidence >= 70;

    items.push({
      key,
      label,
      category,
      value: cleanVal,
      confidence,
      selected,
      currentValue: current || undefined,
      willOverwrite,
    });
  };

  // 1. Date of Occurrence
  const dateMatch =
    text.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/) ||
    text.match(/\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{2,4})\b/i);
  if (dateMatch) {
    addField('offenceDate', 'Date of Occurrence', 'Occurrence Locus', dateMatch[1], 95);
  }

  // 2. Time of Occurrence
  const timeMatch =
    text.match(/(?:at approximately|at about|around|time:?)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|hrs|hours)?)/i) ||
    text.match(/\b(\d{1,2}:\d{2}\s*(?:am|pm|hrs)?)\b/i);
  if (timeMatch) {
    addField('offenceTime', 'Time of Occurrence', 'Occurrence Locus', timeMatch[1], 90);
  }

  // 3. Complainant Name
  const compMatch =
    text.match(/(?:complainant|informant|victim)\s*(?:is|named|:)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i) ||
    text.match(/I,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/);
  if (compMatch) {
    const name = compMatch[1];
    if (!['The Complainant', 'This Incident', 'Police Station', 'Dear Sir'].includes(name)) {
      addField('complainantName', 'Complainant Full Name', 'Complainant', name, 94);
    }
  }

  // 4. Father's / Husband's Name
  const fatherMatch = text.match(/(?:s\/o|d\/o|w\/o|son of|daughter of|wife of)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i);
  if (fatherMatch) {
    addField('fatherName', "Father's / Husband's Name", 'Complainant', fatherMatch[1], 92);
  }

  // 5. Complainant Address / Residence
  const resMatch = text.match(/(?:resident of|residing at|r\/o)\s*([^,.\n]+(?:,\s*[^,.\n]+){1,2})/i);
  if (resMatch) {
    addField('complainantAddress', 'Complainant Address', 'Complainant', resMatch[1], 88);
  }

  // 6. Place of Occurrence (Address)
  const locusMatch =
    text.match(/(?:place of occurrence|locus|incident took place at|happened at|near|opposite)\s*[:]?\s*([^,.\n]+(?:,\s*[^,.\n]+){1,3})/i) ||
    text.match(/(?:walking near|intercepted near|intercepted at)\s*([^,.\n]+(?:,\s*[^,.\n]+){0,2})/i);
  if (locusMatch) {
    addField('address', 'Place of Occurrence', 'Occurrence Locus', locusMatch[1], 89);
  }

  // 7. Police Station & District
  const psMatch = text.match(/(?:police station|ps)\s*[:]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (psMatch) {
    addField('policeStation', 'Police Station', 'Investigation', psMatch[1], 90);
  }
  const distMatch = text.match(/(?:district)\s*[:]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (distMatch) {
    addField('district', 'District Jurisdiction', 'Investigation', distMatch[1], 88);
  }

  // 8. Accused Particulars
  const accusedMatch =
    text.match(/(?:accused|suspects?|culprits?|assailants?)\s*(?:were|are|described as|:)?\s*([^.\n]{15,140})/i) ||
    text.match(/(?:two|three|four|\d+)\s*(?:unidentified|unknown)?\s*(?:persons?|men|males|assailants?)[^.\n]{10,120}/i);
  if (accusedMatch) {
    addField('accusedDetails', 'Accused & Modus Operandi', 'Accused', accusedMatch[0], 89);
  }

  // 9. Stolen Properties & Articles
  const propMatch =
    text.match(/(?:stolen|snatched|dispossessed|taken away|looted|misappropriated)\s*(?:items|property|articles)?\s*[:]?\s*([^.\n]{12,140})/i) ||
    text.match(/(?:containing|carrying|briefcase containing|wallet containing)\s*([^.\n]{10,100})/i);
  if (propMatch) {
    addField('stolenProperties', 'Stolen Articles / Property', 'Property & Loss', propMatch[0], 92);
  }

  // 10. Monetary Value / Amount
  const valMatch =
    text.match(/(?:rs\.?|inr|worth|sum of|amounting to)\s*[:]?\s*([\d,]+(?:\s*(?:lakh[s]?|crore[s]?|thousand))?)/i);
  if (valMatch) {
    const prefix = /rs|inr/i.test(valMatch[0]) ? '' : 'Rs. ';
    addField('stolenValue', 'Estimated Stolen Value / Loss', 'Property & Loss', `${prefix}${valMatch[1]}`, 94);
  }

  // 11. MLC / Inquest Reference
  const mlcMatch = text.match(/(?:mlc\s*(?:no\.?|number)?\s*[:]?\s*[\w\/-]+|hospital\s*[:]?\s*[^,.\n]+)/i);
  if (mlcMatch) {
    addField('inquestReportNo', 'MLC / Hospital Medical Ref', 'Investigation', mlcMatch[0], 85);
  }

  // 12. Statutory Sections (from suggestion or narrative)
  if (suggestion?.detailedSections && suggestion.detailedSections.length > 0) {
    const secCodes = suggestion.detailedSections.map((s: any) => s.section).join(', ');
    addField('act1', 'Primary Statutory Act', 'Statutory Sections', 'Bharatiya Nyaya Sanhita, 2023 / Special Acts', 98);
    addField('sections1', 'Penal Sections Attracted', 'Statutory Sections', secCodes, 96);
  } else if (suggestion?.relevantSections && suggestion.relevantSections.length > 0) {
    addField('act1', 'Primary Statutory Act', 'Statutory Sections', 'Bharatiya Nyaya Sanhita, 2023', 95);
    addField('sections1', 'Penal Sections Attracted', 'Statutory Sections', suggestion.relevantSections.join(', '), 92);
  }

  return items;
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface FIRAutoFillPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  narrativeText: string;
  currentFormData: Record<string, string>;
  suggestion?: any;
  onApplyFields: (selectedFields: Record<string, string>) => void;
}

export const FIRAutoFillPreviewModal: React.FC<FIRAutoFillPreviewModalProps> = ({
  visible,
  onClose,
  narrativeText,
  currentFormData,
  suggestion,
  onApplyFields,
}) => {
  const { theme, isDark } = useTheme();

  const [fieldItems, setFieldItems] = useState<ExtractedFieldItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (visible && narrativeText) {
      runExtraction();
    }
  }, [visible, narrativeText]);

  const runExtraction = async () => {
    setIsExtracting(true);

    try {
      // 1. Try online extraction first
      const prompt =
        `You are an AI Forensic Data Extractor for Indian First Information Reports (FIR). ` +
        `Extract structured FIR fields from the narrative text below. ` +
        `Respond ONLY with a valid JSON object matching this schema (no markdown, no extra text):\n` +
        `{\n` +
        `  "complainantName": "...",\n` +
        `  "fatherName": "...",\n` +
        `  "complainantAddress": "...",\n` +
        `  "offenceDate": "DD/MM/YYYY",\n` +
        `  "offenceTime": "HH:MM",\n` +
        `  "address": "Place of Occurrence",\n` +
        `  "district": "...",\n` +
        `  "policeStation": "...",\n` +
        `  "accusedDetails": "...",\n` +
        `  "stolenProperties": "...",\n` +
        `  "stolenValue": "...",\n` +
        `  "inquestReportNo": "...",\n` +
        `  "act1": "...",\n` +
        `  "sections1": "..."\n` +
        `}\n\nNARRATIVE TEXT:\n"""\n${narrativeText.slice(0, 3000)}\n"""`;

      const res = await fetch('https://sih-backend-881i.onrender.com/encode/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt }),
      });

      const data = await res.json();
      const rawText: string = typeof data?.description === 'string' ? data.description : '';
      const match = rawText.match(/\{[\s\S]*\}/);

      if (match) {
        const json = JSON.parse(match[0]);
        const onlineItems: ExtractedFieldItem[] = [];

        const labels: Record<string, { label: string; category: ExtractedFieldItem['category'] }> = {
          complainantName: { label: 'Complainant Full Name', category: 'Complainant' },
          fatherName: { label: "Father's / Husband's Name", category: 'Complainant' },
          complainantAddress: { label: 'Complainant Address', category: 'Complainant' },
          offenceDate: { label: 'Date of Occurrence', category: 'Occurrence Locus' },
          offenceTime: { label: 'Time of Occurrence', category: 'Occurrence Locus' },
          address: { label: 'Place of Occurrence', category: 'Occurrence Locus' },
          district: { label: 'District Jurisdiction', category: 'Investigation' },
          policeStation: { label: 'Police Station', category: 'Investigation' },
          accusedDetails: { label: 'Accused Particulars', category: 'Accused' },
          stolenProperties: { label: 'Stolen Property', category: 'Property & Loss' },
          stolenValue: { label: 'Estimated Loss / Value', category: 'Property & Loss' },
          inquestReportNo: { label: 'MLC / Hospital Ref', category: 'Investigation' },
          act1: { label: 'Primary Statutory Act', category: 'Statutory Sections' },
          sections1: { label: 'Penal Sections Attracted', category: 'Statutory Sections' },
        };

        for (const [k, meta] of Object.entries(labels)) {
          const val = (json[k] || '').trim();
          if (isValidExtractedValue(val)) {
            const current = (currentFormData[k] || '').trim();
            const willOverwrite = Boolean(current && current.toLowerCase() !== val.toLowerCase());
            onlineItems.push({
              key: k,
              label: meta.label,
              category: meta.category,
              value: val,
              confidence: 94,
              selected: !willOverwrite,
              currentValue: current || undefined,
              willOverwrite,
            });
          }
        }

        if (onlineItems.length > 0) {
          setFieldItems(onlineItems);
          setIsExtracting(false);
          return;
        }
      }
    } catch {
      // Fallback on network delay
    }

    // Heuristic extraction
    const fallbackItems = extractFIRFieldsFromNarrative(narrativeText, currentFormData, suggestion);
    setFieldItems(fallbackItems);
    setIsExtracting(false);
  };

  const toggleSelect = (key: string) => {
    setFieldItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectOnlyHighConf = () => {
    setFieldItems((prev) =>
      prev.map((item) => ({ ...item, selected: item.confidence >= 80 }))
    );
  };

  const selectAll = () => {
    setFieldItems((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  const handleApply = () => {
    const toApply: Record<string, string> = {};
    for (const item of fieldItems) {
      if (item.selected && isValidExtractedValue(item.value)) {
        toApply[item.key] = item.value;
      }
    }
    onApplyFields(toApply);
    onClose();
  };

  const selectedCount = fieldItems.filter((f) => f.selected).length;
  const highConfCount = fieldItems.filter((f) => f.confidence >= 85).length;
  const overwriteCount = fieldItems.filter((f) => f.selected && f.willOverwrite).length;

  const accentColor = isDark ? '#60A5FA' : COLORS.navyGov;
  const accentBg = isDark ? '#1E293B' : '#EFF6FF';
  const accentBorder = isDark ? '#3B82F6' : '#BFDBFE';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerTitleWrap}>
              <View style={[styles.headerIconBox, { backgroundColor: accentBg }]}>
                <Ionicons name="sparkles" size={18} color={accentColor} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  AI FIR Auto-Population Review
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Extracted {fieldItems.length} structured fields from your narrative.
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Quick Selection Toolbar */}
          <View style={[styles.toolbar, { backgroundColor: theme.surfaceMuted, borderBottomColor: theme.border }]}>
            <View style={[styles.statPill, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
              <Ionicons name="shield-checkmark" size={12} color={isDark ? '#34D399' : '#166534'} />
              <Text style={[styles.statPillText, { color: isDark ? '#34D399' : '#166534' }]}>
                {highConfCount} High-Confidence
              </Text>
            </View>

            {overwriteCount > 0 && (
              <View style={[styles.statPill, { backgroundColor: isDark ? '#451A03' : '#FEF3C7' }]}>
                <Ionicons name="alert-circle" size={12} color={isDark ? '#FBBF24' : '#B45309'} />
                <Text style={[styles.statPillText, { color: isDark ? '#FBBF24' : '#B45309' }]}>
                  {overwriteCount} Overwrites
                </Text>
              </View>
            )}

            <View style={styles.toolbarSpacer} />

            <TouchableOpacity onPress={selectOnlyHighConf} style={styles.toolBtn}>
              <Text style={[styles.toolBtnText, { color: accentColor }]}>≥80% Only</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={selectAll} style={styles.toolBtn}>
              <Text style={[styles.toolBtnText, { color: accentColor }]}>Select All</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable List */}
          {isExtracting ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={accentColor} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Extracting structured particulars from narrative…
              </Text>
            </View>
          ) : fieldItems.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={42} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Structured Fields Detected</Text>
              <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                Ensure your narrative includes dates, locations, stolen articles, or suspect descriptions.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
              {fieldItems.map((item) => {
                const isHigh = item.confidence >= 85;
                const confColor = isHigh
                  ? (isDark ? '#34D399' : '#166534')
                  : (isDark ? '#FBBF24' : '#B45309');
                const confBg = isHigh
                  ? (isDark ? '#064E3B' : '#DCFCE7')
                  : (isDark ? '#451A03' : '#FEF3C7');

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.fieldCard,
                      {
                        backgroundColor: item.selected ? theme.surface : theme.surfaceMuted,
                        borderColor: item.selected ? accentColor : theme.border,
                      },
                    ]}
                    onPress={() => toggleSelect(item.key)}
                    activeOpacity={0.8}
                  >
                    {/* Checkbox + Label */}
                    <View style={styles.fieldTopRow}>
                      <View style={styles.checkWrap}>
                        <View
                          style={[
                            styles.checkbox,
                            {
                              borderColor: item.selected ? accentColor : theme.border,
                              backgroundColor: item.selected ? accentColor : 'transparent',
                            },
                          ]}
                        >
                          {item.selected && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                        </View>
                        <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                      </View>

                      <View style={[styles.confBadge, { backgroundColor: confBg }]}>
                        <Text style={[styles.confBadgeText, { color: confColor }]}>
                          {item.confidence}% Match
                        </Text>
                      </View>
                    </View>

                    {/* Extracted Value */}
                    <View style={[styles.valBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                      <Text style={[styles.valText, { color: theme.textPrimary }]}>{item.value}</Text>
                    </View>

                    {/* Overwrite or New Tag */}
                    {item.willOverwrite ? (
                      <View style={[styles.overwriteTag, { backgroundColor: isDark ? '#450A0A' : '#FEE2E2' }]}>
                        <Ionicons name="warning-outline" size={13} color={COLORS.statusAlert} />
                        <Text style={[styles.overwriteText, { color: COLORS.statusAlert }]} numberOfLines={1}>
                          Will replace current: "{item.currentValue}"
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.newTag}>
                        <Ionicons name="add-circle-outline" size={13} color={isDark ? '#34D399' : '#166534'} />
                        <Text style={[styles.newTagText, { color: isDark ? '#34D399' : '#166534' }]}>
                          Fills previously empty field
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.applyBtn,
                { backgroundColor: accentColor },
                selectedCount === 0 && styles.applyBtnDisabled,
              ]}
              onPress={handleApply}
              disabled={selectedCount === 0}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-done" size={16} color={COLORS.white} />
              <Text style={styles.applyBtnText}>
                Apply Selected Fields ({selectedCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '85%',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  toolbarSpacer: {
    flex: 1,
  },
  toolBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  toolBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollList: {
    padding: 16,
  },
  loadingBox: {
    padding: 50,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  fieldCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  fieldTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  confBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  confBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  valBox: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    padding: 9,
  },
  valText: {
    fontSize: 13,
    lineHeight: 18,
  },
  overwriteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  overwriteText: {
    fontSize: 11,
    fontWeight: '600',
  },
  newTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default FIRAutoFillPreviewModal;
