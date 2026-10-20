/**
 * UpdateNarrativeModal.tsx
 *
 * Confirmation preview modal for "Update Narrative from Fields".
 * Displays precisely which clauses will be synchronized and offers a preview
 * before applying, safeguarding user edits with explicit confirmation and undo.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { ClauseUpdateItem } from './FIRBidirectionalSync';

interface UpdateNarrativeModalProps {
  visible: boolean;
  onClose: () => void;
  currentNarrative: string;
  proposedNarrative: string;
  changedClauses: ClauseUpdateItem[];
  onConfirmApply: (newNarrative: string) => void;
}

export const UpdateNarrativeModal: React.FC<UpdateNarrativeModalProps> = ({
  visible,
  onClose,
  currentNarrative,
  proposedNarrative,
  changedClauses,
  onConfirmApply,
}) => {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'preview' | 'diff'>('preview');

  const getCategoryColor = (cat: ClauseUpdateItem['category']) => {
    switch (cat) {
      case 'Complainant':
        return '#0284c7';
      case 'Locus':
        return '#d97706';
      case 'Accused':
        return '#dc2626';
      case 'Property':
        return '#16a34a';
      case 'Sections':
        return '#7c3aed';
      default:
        return '#4b5563';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
                <Ionicons name="sync" size={20} color={COLORS.navyGov} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  Sync Narrative from Structured Fields
                </Text>
                <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
                  {changedClauses.length} clause{changedClauses.length !== 1 ? 's' : ''} detected for synchronization
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Clauses Summary Chips */}
          <View style={[styles.chipsContainer, { backgroundColor: theme.surfaceMuted, borderBottomColor: theme.border }]}>
            <Text style={[styles.chipsHeader, { color: theme.textSecondary }]}>
              DETECTED CLAUSE UPDATES:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {changedClauses.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderColor: getCategoryColor(item.category),
                    },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: getCategoryColor(item.category) }]} />
                  <Text style={[styles.chipText, { color: theme.textPrimary }]}>{item.title}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Tab Selector */}
          <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'preview' && [styles.activeTabBtn, { borderBottomColor: COLORS.navyGov }],
              ]}
              onPress={() => setActiveTab('preview')}
            >
              <Ionicons
                name="document-text-outline"
                size={16}
                color={activeTab === 'preview' ? COLORS.navyGov : theme.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'preview' ? COLORS.navyGov : theme.textSecondary },
                ]}
              >
                Proposed Narrative Preview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'diff' && [styles.activeTabBtn, { borderBottomColor: COLORS.navyGov }],
              ]}
              onPress={() => setActiveTab('diff')}
            >
              <Ionicons
                name="git-compare-outline"
                size={16}
                color={activeTab === 'diff' ? COLORS.navyGov : theme.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'diff' ? COLORS.navyGov : theme.textSecondary },
                ]}
              >
                Clause Diff ({changedClauses.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'preview' ? (
              <View style={styles.previewBox}>
                <View style={[styles.narrativePaper, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                  <Text style={[styles.narrativeText, { color: theme.textPrimary }]}>
                    {proposedNarrative}
                  </Text>
                </View>
                <View style={styles.noteBox}>
                  <Ionicons name="information-circle-outline" size={16} color="#0284c7" />
                  <Text style={styles.noteText}>
                    Existing custom facts and Co-Pilot improvements outside of the updated factual clauses are preserved intact.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.diffList}>
                {changedClauses.map((clause, idx) => (
                  <View
                    key={idx}
                    style={[styles.diffCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  >
                    <View style={styles.diffCardHeader}>
                      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(clause.category) }]}>
                        <Text style={styles.categoryBadgeText}>{clause.category}</Text>
                      </View>
                      <Text style={[styles.diffClauseTitle, { color: theme.textPrimary }]}>
                        {clause.title}
                      </Text>
                    </View>

                    {clause.oldSnippet && (
                      <View style={styles.oldSnippetBox}>
                        <Text style={styles.diffLabelOld}>- Previous snippet in narrative:</Text>
                        <Text style={styles.diffTextOld}>{clause.oldSnippet}</Text>
                      </View>
                    )}

                    <View style={styles.newSnippetBox}>
                      <Text style={styles.diffLabelNew}>+ Synchronized from Form fields:</Text>
                      <Text style={styles.diffTextNew}>{clause.newSnippet}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Keep Existing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                onConfirmApply(proposedNarrative);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.applyBtnText}>Apply to Narrative</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '88%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  chipsHeader: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipsRow: {
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomWidth: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bodyScroll: {
    padding: 16,
    maxHeight: 380,
  },
  previewBox: {
    gap: 12,
  },
  narrativePaper: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    minHeight: 140,
  },
  narrativeText: {
    fontSize: 13,
    lineHeight: 20,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 6,
  },
  noteText: {
    fontSize: 11.5,
    color: '#0369a1',
    flex: 1,
  },
  diffList: {
    gap: 12,
  },
  diffCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  diffCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  diffClauseTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  oldSnippetBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  diffLabelOld: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: 2,
  },
  diffTextOld: {
    fontSize: 12,
    color: '#991b1b',
    textDecorationLine: 'line-through',
  },
  newSnippetBox: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
    padding: 8,
    borderRadius: 4,
  },
  diffLabelNew: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
    marginBottom: 2,
  },
  diffTextNew: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
