/**
 * FIRDraftsModal.tsx
 *
 * Offline FIR Drafts Management & Version History Modal for LegalBridge-AI.
 *
 * Allows police officers to view, resume, duplicate, rename, delete, and rollback
 * between historical versions of partially completed FIRs.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import {
  FIRDraftRecord,
  FIRDraftVersion,
  deleteDraftRecord,
  duplicateDraftRecord,
  renameDraftRecord,
} from './FIRDraftManager';

interface FIRDraftsModalProps {
  visible: boolean;
  onClose: () => void;
  drafts: FIRDraftRecord[];
  currentDraftId: string;
  onResumeDraft: (draft: FIRDraftRecord) => void;
  onRollbackVersion: (draft: FIRDraftRecord, version: FIRDraftVersion) => void;
  onStartNewDraft: () => void;
  onRefreshDrafts: () => void;
}

export const FIRDraftsModal: React.FC<FIRDraftsModalProps> = ({
  visible,
  onClose,
  drafts,
  currentDraftId,
  onResumeDraft,
  onRollbackVersion,
  onStartNewDraft,
  onRefreshDrafts,
}) => {
  const { theme, isDark } = useTheme();

  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null);
  const [renamingDraft, setRenamingDraft] = useState<FIRDraftRecord | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Handle delete
  const handleDelete = (draft: FIRDraftRecord) => {
    Alert.alert(
      'Delete FIR Draft',
      `Are you sure you want to permanently delete "${draft.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDraftRecord(draft.id);
            onRefreshDrafts();
          },
        },
      ]
    );
  };

  // Handle duplicate
  const handleDuplicate = async (draft: FIRDraftRecord) => {
    const cloned = await duplicateDraftRecord(draft.id);
    if (cloned) {
      onRefreshDrafts();
      Alert.alert('Draft Duplicated', `Created "${cloned.title}"`);
    }
  };

  // Handle rename
  const handleSaveRename = async () => {
    if (!renamingDraft) return;
    await renameDraftRecord(renamingDraft.id, newTitle);
    setRenamingDraft(null);
    onRefreshDrafts();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
                <Ionicons name="folder-open" size={20} color={COLORS.navyGov} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  My Offline FIR Drafts
                </Text>
                <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
                  {drafts.length} draft{drafts.length !== 1 ? 's' : ''} saved locally on device
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Top Actions */}
          <View style={[styles.topActionsBar, { backgroundColor: theme.surfaceMuted, borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={styles.newDraftBtn}
              onPress={() => {
                onClose();
                onStartNewDraft();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
              <Text style={styles.newDraftBtnText}>Start New FIR Draft</Text>
            </TouchableOpacity>

            <View style={styles.storageNote}>
              <Ionicons name="cloud-offline-outline" size={13} color="#16a34a" />
              <Text style={styles.storageNoteText}>100% Offline Vault</Text>
            </View>
          </View>

          {/* Drafts List */}
          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            {drafts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Saved Drafts Yet</Text>
                <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                  Partially completed FIRs are automatically backed up here so work is never lost.
                </Text>
              </View>
            ) : (
              <View style={styles.cardsList}>
                {drafts.map((draft) => {
                  const isActive = draft.id === currentDraftId;
                  const isExpanded = expandedDraftId === draft.id;
                  const versions = draft.versions || [];

                  return (
                    <View
                      key={draft.id}
                      style={[
                        styles.draftCard,
                        { backgroundColor: theme.surfaceMuted, borderColor: isActive ? COLORS.navyGov : theme.border },
                        isActive && styles.activeDraftCard,
                      ]}
                    >
                      {/* Card Top Row */}
                      <View style={styles.draftCardTop}>
                        <View style={styles.draftTitleWrap}>
                          <Text style={[styles.draftTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                            {draft.title}
                          </Text>
                          {isActive && (
                            <View style={styles.activePill}>
                              <Text style={styles.activePillText}>Currently Open</Text>
                            </View>
                          )}
                        </View>

                        <Text style={[styles.updatedTime, { color: theme.textMuted }]}>
                          {draft.formattedUpdatedAt || draft.updatedAt.slice(0, 10)}
                        </Text>
                      </View>

                      {/* Particulars Tags */}
                      <View style={styles.tagsRow}>
                        {draft.complainantName ? (
                          <View style={[styles.tag, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                            <Ionicons name="person-outline" size={11} color="#0284c7" />
                            <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                              {draft.complainantName}
                            </Text>
                          </View>
                        ) : null}

                        {draft.policeStation ? (
                          <View style={[styles.tag, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                            <Ionicons name="shield-outline" size={11} color="#475569" />
                            <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                              PS {draft.policeStation}
                            </Text>
                          </View>
                        ) : null}

                        <View style={[styles.tag, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                          <Ionicons name="attach-outline" size={11} color="#16a34a" />
                          <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                            {draft.exhibitsCount || 0} Exhibit{(draft.exhibitsCount || 0) !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>

                      {/* Narrative Preview */}
                      {draft.narrativePreview ? (
                        <Text style={[styles.narrativeSnippet, { color: theme.textSecondary }]} numberOfLines={2}>
                          {draft.narrativePreview}
                        </Text>
                      ) : null}

                      {/* Action Buttons */}
                      <View style={styles.draftActionsRow}>
                        {!isActive ? (
                          <TouchableOpacity
                            style={styles.resumeBtn}
                            onPress={() => {
                              onResumeDraft(draft);
                              onClose();
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="arrow-redo" size={13} color="#ffffff" />
                            <Text style={styles.resumeBtnText}>Resume Draft</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.loadedNotice}>
                            <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                            <Text style={styles.loadedNoticeText}>Active in Editor</Text>
                          </View>
                        )}

                        <View style={styles.actionIconsRow}>
                          {versions.length > 1 && (
                            <TouchableOpacity
                              style={[styles.smallActionBtn, { borderColor: theme.border }]}
                              onPress={() => setExpandedDraftId(isExpanded ? null : draft.id)}
                            >
                              <Ionicons name="time-outline" size={13} color={COLORS.navyGov} />
                              <Text style={[styles.smallActionBtnText, { color: COLORS.navyGov }]}>
                                {versions.length} Versions
                              </Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            style={[styles.smallIconBtn, { borderColor: theme.border }]}
                            onPress={() => handleDuplicate(draft)}
                          >
                            <Ionicons name="copy-outline" size={13} color={theme.textSecondary} />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.smallIconBtn, { borderColor: theme.border }]}
                            onPress={() => {
                              setRenamingDraft(draft);
                              setNewTitle(draft.title);
                            }}
                          >
                            <Ionicons name="pencil-outline" size={13} color={theme.textSecondary} />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.smallIconBtn, { borderColor: theme.border }]}
                            onPress={() => handleDelete(draft)}
                          >
                            <Ionicons name="trash-outline" size={13} color="#dc2626" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Expanded Version History */}
                      {isExpanded && versions.length > 0 && (
                        <View style={[styles.versionHistoryBox, { borderTopColor: theme.border }]}>
                          <Text style={[styles.versionHistoryTitle, { color: theme.textSecondary }]}>
                            VERSION HISTORY (ROLLBACK CHECKPOINTS):
                          </Text>

                          {versions.map((ver, vIdx) => (
                            <View key={ver.versionId} style={styles.versionRow}>
                              <View style={styles.versionMeta}>
                                <Text style={[styles.versionLabel, { color: theme.textPrimary }]}>
                                  {vIdx === 0 ? '● Latest' : `#${vIdx + 1}`} • {ver.label}
                                </Text>
                                <Text style={[styles.versionTime, { color: theme.textMuted }]}>
                                  {ver.formattedTime}
                                </Text>
                              </View>

                              {vIdx > 0 && (
                                <TouchableOpacity
                                  style={styles.rollbackBtn}
                                  onPress={() => {
                                    Alert.alert(
                                      'Rollback to Version',
                                      `Revert draft to snapshot "${ver.label}" (${ver.formattedTime})?`,
                                      [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                          text: 'Rollback',
                                          onPress: () => {
                                            onRollbackVersion(draft, ver);
                                            onClose();
                                          },
                                        },
                                      ]
                                    );
                                  }}
                                >
                                  <Ionicons name="arrow-undo" size={11} color="#d97706" />
                                  <Text style={styles.rollbackBtnText}>Rollback</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={[styles.closeFooterBtnText, { color: theme.textPrimary }]}>Close</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* Rename Modal */}
      <Modal visible={renamingDraft !== null} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.renameDialog, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.renameTitle, { color: theme.textPrimary }]}>Rename FIR Draft</Text>
            <TextInput
              style={[styles.renameInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Enter draft title"
              placeholderTextColor={theme.textMuted}
            />
            <View style={styles.renameActionsRow}>
              <TouchableOpacity style={styles.renameCancelBtn} onPress={() => setRenamingDraft(null)}>
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.renameSaveBtn} onPress={handleSaveRename}>
                <Text style={{ color: '#ffffff', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    maxHeight: '90%',
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
  topActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  newDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
  },
  newDraftBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  storageNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storageNoteText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  listScroll: {
    padding: 16,
    maxHeight: 460,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  cardsList: {
    gap: 12,
  },
  draftCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  activeDraftCard: {
    borderWidth: 1.5,
  },
  draftCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  draftTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  draftTitle: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  activePill: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '700',
  },
  updatedTime: {
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  narrativeSnippet: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  draftActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
  },
  resumeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  loadedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  loadedNoticeText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '700',
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  smallActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  smallIconBtn: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 5,
  },
  versionHistoryBox: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 8,
    gap: 6,
  },
  versionHistoryTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  versionMeta: {
    flex: 1,
  },
  versionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  versionTime: {
    fontSize: 10,
  },
  rollbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  rollbackBtnText: {
    color: '#92400e',
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  closeFooterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  closeFooterBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  renameDialog: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  renameTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  renameInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 14,
  },
  renameActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  renameCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  renameSaveBtn: {
    backgroundColor: COLORS.navyGov,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
});
