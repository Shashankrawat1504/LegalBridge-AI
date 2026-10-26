import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

export interface ComplaintNote {
  id: string;
  title: string;
  category: string;
  date: string;
  channel: string;
  notes: string;
  status: 'Open' | 'Waiting' | 'Closed';
  createdAt: string;
}

const STORAGE_KEY = '@legalbridge_complaint_notes_v1';

const CATEGORIES = ['All', 'Tenant', 'Consumer', 'Work', 'Fraud', 'Other'] as const;
const STATUS_OPTIONS: Array<ComplaintNote['status']> = ['Open', 'Waiting', 'Closed'];
const CHANNEL_OPTIONS = ['Email', 'WhatsApp', 'Helpline', 'In person', 'Letter / Speed Post', 'Other'];

export default function ComplaintNotes() {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const [notes, setNotes] = useState<ComplaintNote[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Tenant');
  const [formDate, setFormDate] = useState('');
  const [formChannel, setFormChannel] = useState<string>('Email');
  const [formStatus, setFormStatus] = useState<ComplaintNote['status']>('Open');
  const [formNotes, setFormNotes] = useState('');

  // Load from AsyncStorage
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          return;
        }
      }
      // Seed 2 initial realistic citizen example notes only if storage is empty
      const seedNotes: ComplaintNote[] = [
        {
          id: 'note_seed_1',
          title: 'Deposit refund email sent to landlord',
          category: 'Tenant',
          date: '20 Oct 2026',
          channel: 'Email',
          status: 'Waiting',
          notes: 'Sent formal request with 7-day deadline asking for refund of ₹45,000 security deposit with bank IFSC details attached.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'note_seed_2',
          title: 'Called consumer helpline 1915',
          category: 'Consumer',
          date: '18 Oct 2026',
          channel: 'Helpline',
          status: 'Open',
          notes: 'Reported defective appliance with warranty claim ignored by manufacturer. Docket #NCH-88219 recorded.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setNotes(seedNotes);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedNotes));
    } catch {
      // Handle gracefully
    }
  };

  const saveNotes = async (updated: ComplaintNote[]) => {
    try {
      setNotes(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Handle gracefully
    }
  };

  const handleOpenAdd = () => {
    setEditingNoteId(null);
    setFormTitle('');
    setFormCategory('Tenant');
    setFormDate(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    setFormChannel('Email');
    setFormStatus('Open');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: ComplaintNote) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title);
    setFormCategory(note.category);
    setFormDate(note.date);
    setFormChannel(note.channel);
    setFormStatus(note.status);
    setFormNotes(note.notes);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Required', 'Please enter a title for your note.');
      return;
    }

    if (editingNoteId) {
      // Edit
      const updated = notes.map((n) =>
        n.id === editingNoteId
          ? {
              ...n,
              title: formTitle.trim(),
              category: formCategory,
              date: formDate.trim() || n.date,
              channel: formChannel,
              status: formStatus,
              notes: formNotes.trim(),
            }
          : n
      );
      await saveNotes(updated);
      showToast('Note updated successfully');
    } else {
      // Add new
      const newNote: ComplaintNote = {
        id: `note_${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        date: formDate.trim() || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        channel: formChannel,
        status: formStatus,
        notes: formNotes.trim(),
        createdAt: new Date().toISOString(),
      };
      await saveNotes([newNote, ...notes]);
      showToast('New note saved to device');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (noteId: string) => {
    const doDelete = async () => {
      const updated = notes.filter((n) => n.id !== noteId);
      await saveNotes(updated);
      showToast('Note deleted');
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Are you sure you want to delete this action note? This cannot be undone.')) {
        doDelete();
      }
      return;
    }

    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this action note? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: doDelete,
        },
      ]
    );
  };

  const sortedNotes = [...notes].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.date).getTime() || 0;
    const timeB = new Date(b.createdAt || b.date).getTime() || 0;
    return timeB - timeA;
  });

  const filteredNotes = sortedNotes.filter((n) => {
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || n.status === selectedStatus;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCat && matchesStatus;
    const matchesQuery =
      n.title.toLowerCase().includes(query) ||
      n.notes.toLowerCase().includes(query) ||
      n.channel.toLowerCase().includes(query);
    return matchesCat && matchesStatus && matchesQuery;
  });

  const getStatusColor = (status: ComplaintNote['status']) => {
    switch (status) {
      case 'Open':
        return '#3B82F6';
      case 'Waiting':
        return '#D97706';
      case 'Closed':
        return '#10B981';
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Utilities" />

      {/* Floating Toast Notification */}
      {toastMessage.length > 0 && (
        <View style={styles.toastContainer}>
          <View style={styles.toastPill}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Section */}
        <View style={[styles.headerHero, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerInner}>
            <View style={styles.topNavRow}>
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                onPress={() => navigation.navigate('Utilities')}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back-outline" size={18} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                <Text style={[styles.backBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>Back to Tools</Text>
              </TouchableOpacity>

              <View style={[styles.tagBadge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
                <Text style={styles.tagBadgeText}>ON-DEVICE ACTION LOG</Text>
              </View>
            </View>

            <View style={styles.titleActionRow}>
              <View style={styles.titleGroup}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                  My Complaint Notes
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  Privately log and track when you sent letters, called helplines, or spoke with landlords or companies. Stored strictly on your device.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.addNoteBtn, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}
                onPress={handleOpenAdd}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addNoteBtnText}>Add Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentBody}>
          {/* Privacy & Educational Notice Banner */}
          <View style={[styles.disclaimerBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={isDark ? '#60A5FA' : COLORS.navyGov} />
            <View style={styles.disclaimerTextGroup}>
              <Text style={[styles.disclaimerTitle, { color: theme.textPrimary }]}>
                Stored Only on This Device
              </Text>
              <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                Stored only on this device. Not sent to any government or police system.
              </Text>
            </View>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search your notes (e.g. deposit, refund, Speed Post, ticket)..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    active
                      ? [styles.chipActive, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov, borderColor: isDark ? '#3B82F6' : COLORS.navyGov }]
                      : [styles.chipInactive, { backgroundColor: theme.surface, borderColor: theme.border }],
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active ? styles.chipTextActive : [styles.chipTextInactive, { color: theme.textSecondary }],
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Notes List */}
          <View style={styles.notesContainer}>
            {filteredNotes.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="clipboard-outline" size={42} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Notes Found</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  {notes.length === 0
                    ? 'Remember what you already did and keep a clear timeline of events.'
                    : 'No notes match your current search or category filter.'}
                </Text>
                {notes.length === 0 && (
                  <TouchableOpacity
                    style={[styles.emptyAddBtn, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}
                    onPress={handleOpenAdd}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.emptyAddBtnText}>Add Your First Note</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredNotes.map((note) => (
                <View
                  key={note.id}
                  style={[styles.noteCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                >
                  <View style={styles.noteTopRow}>
                    <View style={styles.noteMetaGroup}>
                      <View style={[styles.categoryBadge, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                        <Text style={styles.categoryBadgeText}>{note.category.toUpperCase()}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(note.status)}15`, borderColor: getStatusColor(note.status) }]}>
                        <Text style={[styles.statusBadgeText, { color: getStatusColor(note.status) }]}>
                          {note.status}
                        </Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={[styles.actionIconBtn, { backgroundColor: theme.surfaceMuted }]}
                        onPress={() => handleOpenEdit(note)}
                      >
                        <Ionicons name="pencil-outline" size={15} color={theme.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionIconBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                        onPress={() => handleDelete(note.id)}
                      >
                        <Ionicons name="trash-outline" size={15} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.noteTitle, { color: theme.textPrimary }]}>{note.title}</Text>

                  <View style={styles.channelDateRow}>
                    <View style={styles.channelDateItem}>
                      <Ionicons name="calendar-outline" size={13} color={theme.textMuted} />
                      <Text style={[styles.channelDateText, { color: theme.textMuted }]}>{note.date}</Text>
                    </View>
                    <View style={styles.channelDateItem}>
                      <Ionicons name="paper-plane-outline" size={13} color={theme.textMuted} />
                      <Text style={[styles.channelDateText, { color: theme.textMuted }]}>{note.channel}</Text>
                    </View>
                  </View>

                  {note.notes.length > 0 && (
                    <Text style={[styles.noteBody, { color: theme.textSecondary }]}>
                      {note.notes}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        <Footer />
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              isCompact ? styles.modalCardCompact : styles.modalCardRegular,
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {editingNoteId ? 'Edit Complaint Note' : 'Add New Complaint Note'}
              </Text>
              <TouchableOpacity
                style={[styles.closeModalBtn, { backgroundColor: theme.surfaceMuted }]}
                onPress={() => setIsModalOpen(false)}
              >
                <Ionicons name="close" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
              {/* Title */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textPrimary }]}>Title / Subject *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.surfaceMuted, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. Sent deposit refund demand to landlord"
                  placeholderTextColor={theme.textMuted}
                  value={formTitle}
                  onChangeText={setFormTitle}
                />
              </View>

              {/* Category */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textPrimary }]}>Category</Text>
                <View style={styles.optionPillsRow}>
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.optionPill,
                        formCategory === c
                          ? [styles.optionPillActive, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]
                          : [styles.optionPillInactive, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }],
                      ]}
                      onPress={() => setFormCategory(c)}
                    >
                      <Text style={[styles.optionPillText, formCategory === c && styles.optionPillTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date & Channel */}
              <View style={[styles.formRow, isCompact && styles.formRowStacked]}>
                <View style={[styles.formGroup, styles.formCol]}>
                  <Text style={[styles.formLabel, { color: theme.textPrimary }]}>Action Date</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: theme.surfaceMuted, borderColor: theme.border, color: theme.textPrimary }]}
                    placeholder="e.g. 24 Oct 2024"
                    placeholderTextColor={theme.textMuted}
                    value={formDate}
                    onChangeText={setFormDate}
                  />
                </View>

                <View style={[styles.formGroup, styles.formCol]}>
                  <Text style={[styles.formLabel, { color: theme.textPrimary }]}>Channel / Medium</Text>
                  <View style={styles.channelScroll}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {CHANNEL_OPTIONS.map((ch) => (
                          <TouchableOpacity
                            key={ch}
                            style={[
                              styles.miniPill,
                              formChannel === ch
                                ? [styles.optionPillActive, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]
                                : [styles.optionPillInactive, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }],
                            ]}
                            onPress={() => setFormChannel(ch)}
                          >
                            <Text style={[styles.miniPillText, formChannel === ch && styles.optionPillTextActive]}>
                              {ch}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </View>

              {/* Status */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textPrimary }]}>Status</Text>
                <View style={styles.optionPillsRow}>
                  {STATUS_OPTIONS.map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.optionPill,
                        formStatus === st
                          ? [styles.optionPillActive, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]
                          : [styles.optionPillInactive, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }],
                      ]}
                      onPress={() => setFormStatus(st)}
                    >
                      <Text style={[styles.optionPillText, formStatus === st && styles.optionPillTextActive]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Free Text Notes */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textPrimary }]}>Notes / What Happened</Text>
                <TextInput
                  style={[
                    styles.formTextarea,
                    { backgroundColor: theme.surfaceMuted, borderColor: theme.border, color: theme.textPrimary },
                  ]}
                  placeholder="Record tracking numbers, response given, names of people spoken with..."
                  placeholderTextColor={theme.textMuted}
                  value={formNotes}
                  onChangeText={setFormNotes}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: theme.surfaceMuted }]}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172AEE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#334155',
    ...SHADOWS.card,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerHero: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerInner: {
    maxWidth: 960,
    width: '100%',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navyGov,
  },
  tagBadge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  titleActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  titleGroup: {
    flex: 1,
    minWidth: 260,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 6,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    maxWidth: 700,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: RADIUS.sm,
  },
  addNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  contentBody: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 18,
    ...SHADOWS.subtle,
  },
  disclaimerTextGroup: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
    ...SHADOWS.subtle,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    outlineStyle: 'none',
  } as any,
  clearBtn: {
    padding: 4,
  },
  filterScroll: {
    marginBottom: 18,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: COLORS.navyGov,
    borderColor: COLORS.navyGov,
  },
  chipInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: COLORS.textSecondary,
  },
  notesContainer: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOWS.subtle,
  },
  noteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteMetaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 6,
    lineHeight: 20,
  },
  channelDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  channelDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  channelDateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  noteBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  emptyState: {
    padding: 36,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.sm,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '90%',
    width: '100%',
    ...SHADOWS.subtle,
    overflow: 'hidden',
  },
  modalCardCompact: {
    maxWidth: '100%',
  },
  modalCardRegular: {
    maxWidth: 560,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    outlineStyle: 'none',
  } as any,
  formTextarea: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as any,
  optionPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  optionPillActive: {
    backgroundColor: COLORS.navyGov,
    borderColor: COLORS.navyGov,
  },
  optionPillInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optionPillTextActive: {
    color: '#FFFFFF',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formRowStacked: {
    flexDirection: 'column',
  },
  formCol: {
    flex: 1,
  },
  channelScroll: {
    height: 36,
  },
  miniPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  miniPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
