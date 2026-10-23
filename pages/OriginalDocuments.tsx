import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const STORAGE_KEY = '@lawai_user_documents';

// ── Generate demo document content for viewable demo docs ──────────────
const generateDemoContent = (docId: string): string => {
  switch (docId) {
    case 'demo-1':
      return `FIRST INFORMATION REPORT

Case No. 456/2026
Police Station: Connaught Place, Delhi
Date: 15 Oct 2026

Complainant: Rahul Sharma, S/o Shri Mohan Sharma, R/o Block A, Janpath, New Delhi
Age: 32 years, Occupation: Businessman

Offence: Theft of mobile phone and wallet
Place: Connaught Place, New Delhi
Time: Between 14:30-15:00 hours on 15 Oct 2026

Description:
The complainant alleges that while walking near the Metro Station exit at Connaught Place, unknown accused snatched his mobile phone (iPhone 14, Black) and leather wallet containing ₹15,000 in cash, debit cards, and ID proofs. The accused fled towards the inner circle direction. The complainant immediately raised an alarm and approached the police booth.

Prayer:
It is prayed that an FIR be registered under appropriate sections of BNS 2023 and investigation be initiated to apprehend the accused and recover the stolen property.

Signature: _________________
Complainant
Date: 15 Oct 2026`;

    case 'demo-2':
      return `AFFIDAVIT FOR BAIL

IN THE COURT OF SESSIONS JUDGE, SAKET COURTS, NEW DELHI

CASE: Bail Application in FIR No. 123/2026
POLICE STATION: Central District, Delhi

I, Amit Verma, S/o Shri Rajesh Verma, R/o Flat 402, Tower B, Rohini Sector 16, New Delhi, do hereby solemnly affirm and declare as follows:

1. That I am the accused in the above-referenced case FIR No. 123/2026 registered under sections 318(4) and 324 of BNS 2023.

2. That I am a law-abiding citizen with no criminal antecedents. I am a software engineer by profession, aged 28 years.

3. That I have deep roots in the society as my family resides at the above address for the last 25 years. I am not a flight risk and shall cooperate fully with the investigation.

4. That the allegations against me are false and motivated. I have been falsely implicated due to a property dispute with the complainant.

5. That I am ready to furnish any surety or bail bond as directed by this Hon'ble Court.

DEPONENT
VERIFICATION
Verified at New Delhi on this 20th day of October 2026 that the contents of this affidavit are true to my knowledge.

(Sd/-) Amit Verma
DEPONENT`;

    case 'demo-3':
      return `HIGH COURT OF DELHI AT NEW DELHI

WRIT PETITION (CRIMINAL) No. 881/2026

IN THE MATTER OF:
Shri Sunil Kumar ... Petitioner
Vs.
Union of India & Others ... Respondents

ORDER PASSED ON: 12 Oct 2026

NOTICE OF MOTION heard on 10 Oct 2026.

Facts:
The petitioner is the owner of property bearing No. A-45, Rajouri Garden, New Delhi. The respondent authorities issued a demolition notice dated 01 Sep 2026 alleging unauthorised construction. The petitioner contends that the construction is fully authorised as per approved building plan dated 15 Mar 2020.

Issue:
Whether the demolition notice is contrary to the principles of natural justice and whether the petitioner should be granted a stay pending final adjudication.

Held:
Issue notice to the respondents. Pending adjudication of the writ petition, operation of the demolition notice dated 01 Sep 2026 is hereby stayed. Respondents shall maintain status quo.

Let copies of this order be supplied to the parties.

(Sd/-) Hon'ble Justice XYZ
JUDGE, HIGH COURT OF DELHI`;

    case 'demo-4':
      return `RENT AGREEMENT

THIS RENT AGREEMENT is made on this 1st day of November 2026

BETWEEN

Shri Rajesh Gupta, S/o Shri Kedar Nath Gupta, R/o Flat 201, Saraswati Vihar, New Delhi-110092 (hereinafter called the "Landlord")

AND

Shri Priyansh Sharma, S/o Shri Ramesh Sharma, R/o Village & Post Office, District Meerut, Uttar Pradesh (hereinafter called the "Tenant")

1. The Landlord agrees to let and the Tenant agrees to take on rent the residential premises Flat No. 101, Building A, Sector 62, Noida, Uttar Pradesh (hereinafter called the "Demised Premises").

2. The term of this agreement shall be for a period of 11 (eleven) months commencing from 1st November 2026 and ending on 31st October 2027.

3. The monthly rent shall be ₹18,000 (Rupees Eighteen Thousand Only) payable on or before the 5th day of each month.

4. The Tenant shall pay a security deposit of ₹54,000 (Rupees Fifty-Four Thousand Only) at the time of signing this agreement, refundable without interest at the time of vacating the premises.

5. The Tenant shall use the premises for residential purposes only and shall not sublet without prior written consent of the Landlord.

IN WITNESS WHEREOF, the parties have executed this agreement on the date first above written.

Sd/- LANDLAND          Sd/- TENANT
Rajesh Gupta            Priyansh Sharma`;

    default:
      return 'Demo document content';
  }
};

// ── Demo seed: shown on first launch so the library isn't empty ──────────────
const DEMO_SEED: UserDocument[] = [
  {
    id: 'demo-1',
    name: 'FIR_Case_2026_Delhi_Police.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 214032,
    category: 'FIR',
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Case No. 456/2026 — Theft at Connaught Place',
  },
  {
    id: 'demo-2',
    name: 'Bail_Application_Affidavit.docx',
    uri: '',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 87440,
    category: 'Affidavit',
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Session Court, Saket — bail hearing 22 Oct 2026',
  },
  {
    id: 'demo-3',
    name: 'High_Court_Stay_Order_Oct2026.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 512000,
    category: 'Court Order',
    addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Delhi HC — W.P. (Crl.) 881/2026, stay on demolition',
  },
  {
    id: 'demo-4',
    name: 'Rent_Agreement_Noida_Nov2026.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 128000,
    category: 'Agreement',
    addedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Residential rent, ₹18,000/month, 11 months',
  },
];

type DocCategory = 'All' | 'FIR' | 'Affidavit' | 'Court Order' | 'Agreement' | 'Other';

interface UserDocument {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  size: number;
  category: DocCategory;
  addedAt: string;
  notes: string;
}

const CATEGORIES: DocCategory[] = ['All', 'FIR', 'Affidavit', 'Court Order', 'Agreement', 'Other'];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const OriginalDocuments: React.FC = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<UserDocument[]>([]);
  const [activeCategory, setActiveCategory] = useState<DocCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<UserDocument | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editCategory, setEditCategory] = useState<DocCategory>('Other');
  const [showTagModal, setShowTagModal] = useState(false);

  // Load saved documents from AsyncStorage on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Apply search + category filter whenever inputs change
  useEffect(() => {
    let results = documents;
    if (activeCategory !== 'All') {
      results = results.filter((d) => d.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.notes.toLowerCase().includes(q)
      );
    }
    setFilteredDocs(results);
  }, [documents, activeCategory, searchQuery]);

  const loadDocuments = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDocuments(JSON.parse(stored));
      } else {
        // First launch — seed with demo documents
        setDocuments(DEMO_SEED);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SEED));
      }
    } catch {
      setDocuments(DEMO_SEED);
    }
  };

  const persistDocuments = async (docs: UserDocument[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  };

  // ── Upload Handler ─────────────────────────────────────────────────────────
  const handlePickDocument = async () => {
    if (Platform.OS === 'web') {
      // Web: use native <input type="file"> picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        const newDoc: UserDocument = {
          id: Date.now().toString(),
          name: file.name,
          uri: URL.createObjectURL(file),
          mimeType: file.type,
          size: file.size,
          category: 'Other',
          addedAt: new Date().toISOString(),
          notes: '',
        };
        const updated = [newDoc, ...documents];
        setDocuments(updated);
        await persistDocuments(updated);
        Alert.alert('Document Added', `"${file.name}" has been added to your library.`);
      };
      input.click();
      return;
    }

    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];

      // Copy to permanent app storage directory (so it persists after cache clear)
      const destDir = `${FileSystem.documentDirectory}lawai_docs/`;
      const dirInfo = await FileSystem.getInfoAsync(destDir);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });

      const destUri = `${destDir}${Date.now()}_${asset.name}`;
      await FileSystem.copyAsync({ from: asset.uri, to: destUri });

      const newDoc: UserDocument = {
        id: Date.now().toString(),
        name: asset.name,
        uri: destUri,
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size ?? 0,
        category: 'Other',
        addedAt: new Date().toISOString(),
        notes: '',
      };

      const updated = [newDoc, ...documents];
      setDocuments(updated);
      await persistDocuments(updated);
      Alert.alert('Document Uploaded', `"${asset.name}" has been saved to your local library.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Share / Download ───────────────────────────────────────────────────────
  const handleShare = async (doc: UserDocument) => {
    // For demo docs without real URI, generate content on-the-fly
    if (!doc.uri || doc.uri === '') {
      const content = generateDemoContent(doc.id);
      
      if (Platform.OS === 'web') {
        // Web: create blob and open/download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Document Downloaded', `${doc.name} has been downloaded.`);
        return;
      } else {
        // Native: create temp file and share
        const tempUri = `${FileSystem.documentDirectory}${doc.name}`;
        await FileSystem.writeAsStringAsync(tempUri, content);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Share Document',
          });
        } else {
          Alert.alert('Sharing not available on this device.');
        }
        return;
      }
    }

    // For user-uploaded docs with real URI
    if (Platform.OS === 'web') {
      window.open(doc.uri, '_blank');
    } else if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(doc.uri);
    } else {
      Alert.alert('Sharing not available on this device.');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = (doc: UserDocument) => {
    Alert.alert(
      'Remove Document',
      `Are you sure you want to remove "${doc.name}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            // Delete local file (native only)
            if (Platform.OS !== 'web') {
              try { await FileSystem.deleteAsync(doc.uri, { idempotent: true }); } catch {}
            }
            const updated = documents.filter((d) => d.id !== doc.id);
            setDocuments(updated);
            await persistDocuments(updated);
          },
        },
      ]
    );
  };

  // ── Tag / Category Edit ────────────────────────────────────────────────────
  const openTagModal = (doc: UserDocument) => {
    setSelectedDoc(doc);
    setEditNotes(doc.notes);
    setEditCategory(doc.category);
    setShowTagModal(true);
  };

  const saveTags = async () => {
    if (!selectedDoc) return;
    const updated = documents.map((d) =>
      d.id === selectedDoc.id ? { ...d, category: editCategory, notes: editNotes } : d
    );
    setDocuments(updated);
    await persistDocuments(updated);
    setShowTagModal(false);
  };

  const getMimeIcon = (mimeType: string): any => {
    if (mimeType.includes('pdf')) return 'document-text';
    if (mimeType.includes('word') || mimeType.includes('docx')) return 'document';
    if (mimeType.includes('image')) return 'image';
    return 'attach';
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: theme.background }]}>
      <OfficialNavbar />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
              onPress={() => (navigation as any).navigate('Utilities')}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back-outline" size={18} color={isDark ? '#60A5FA' : COLORS.navyGov} />
              <Text style={[styles.backBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>Back to Tools</Text>
            </TouchableOpacity>

            <View style={[styles.badge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <Text style={styles.badgeText}>PERSONAL DOCUMENT VAULT</Text>
            </View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Legal Document Library</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Upload, organise, and access your personal legal documents — FIRs, affidavits, court orders, and agreements — stored securely on your device.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          {/* Upload Button */}
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={handlePickDocument}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={22} color={COLORS.white} />
            )}
            <Text style={styles.uploadBtnText}>
              {isLoading ? 'Uploading...' : 'Upload Legal Document'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.uploadHint, { color: theme.textMuted }]}>PDF, DOCX, TXT, JPG/PNG • Stored locally on your device</Text>

          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
            <Ionicons name="search-outline" size={17} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search documents by name or category..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={17} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  activeCategory === cat && styles.chipActive,
                ]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, activeCategory === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.resultsLabel, { color: theme.textMuted }]}>
            {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'}
          </Text>

          {/* Document List */}
          {filteredDocs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Documents Yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Tap "Upload Legal Document" to add your first file.
              </Text>
            </View>
          ) : (
            filteredDocs.map((doc) => (
              <View key={doc.id} style={[styles.docCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={styles.docRow}>
                  <View style={[styles.docIconBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <Ionicons name={getMimeIcon(doc.mimeType)} size={24} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                  </View>
                  <View style={styles.docMeta}>
                    <Text style={[styles.docName, { color: theme.textPrimary }]} numberOfLines={2}>{doc.name}</Text>
                    <View style={styles.docDetails}>
                      <View style={styles.categoryPill}>
                        <Text style={styles.categoryPillText}>{doc.category}</Text>
                      </View>
                      <Text style={[styles.docSize, { color: theme.textMuted }]}>{formatBytes(doc.size)}</Text>
                      <Text style={[styles.docTime, { color: theme.textMuted }]}>{timeAgo(doc.addedAt)}</Text>
                    </View>
                    {doc.notes ? (
                      <Text style={[styles.docNotes, { color: theme.textSecondary }]} numberOfLines={1}>{doc.notes}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.docActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                    onPress={() => handleShare(doc)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-outline" size={17} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                    <Text style={[styles.actionBtnText, isDark && { color: '#60A5FA' }]}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                    onPress={() => openTagModal(doc)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pricetag-outline" size={17} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                    <Text style={[styles.actionBtnText, isDark && { color: '#60A5FA' }]}>Tag</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDanger]}
                    onPress={() => handleDelete(doc)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={17} color={COLORS.statusAlert} />
                    <Text style={[styles.actionBtnText, { color: COLORS.statusAlert }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <Footer />
      </ScrollView>

      {/* Tag / Category Modal — uses proper Modal so it works on web + native */}
      <Modal
        visible={showTagModal && !!selectedDoc}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTagModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Edit Document Tags</Text>
            {selectedDoc && (
              <Text style={[styles.modalDocName, { color: theme.textMuted }]} numberOfLines={1}>
                {selectedDoc.name}
              </Text>
            )}

            <Text style={[styles.modalLabel, { color: theme.textMuted }]}>CATEGORY</Text>
            <View style={styles.modalChipsRow}>
              {(CATEGORIES.filter((c) => c !== 'All') as DocCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    editCategory === cat && styles.chipActive,
                  ]}
                  onPress={() => setEditCategory(cat)}
                >
                  <Text style={[styles.chipText, { color: theme.textSecondary }, editCategory === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: theme.textMuted }]}>NOTES</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="Add a short note (e.g. Case No. 12345/2026)"
              placeholderTextColor={theme.textMuted}
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancel, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                onPress={() => setShowTagModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveTags}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: COLORS.surfaceLight },
  container: { flex: 1 },
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: { maxWidth: 960, width: '100%' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backBtnText: { fontSize: 13, fontWeight: '600' },
  badge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: COLORS.accentGoldDark, letterSpacing: 0.6 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.navyDark, marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21 },
  contentWrapper: { maxWidth: 960, width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 24 },

  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    marginBottom: 6,
  },
  uploadBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  uploadHint: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    ...SHADOWS.subtle,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.navyDark, outlineStyle: 'none' } as any,
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.navyGov, borderColor: COLORS.navyMuted },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  resultsLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },

  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  docRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docMeta: { flex: 1 },
  docName: { fontSize: 15, fontWeight: '700', color: COLORS.navyDark, marginBottom: 6 },
  docDetails: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  categoryPill: {
    backgroundColor: COLORS.accentGoldLight,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryPillText: { fontSize: 11, fontWeight: '700', color: COLORS.accentGoldDark },
  docSize: { fontSize: 12, color: COLORS.textMuted },
  docTime: { fontSize: 12, color: COLORS.textMuted },
  docNotes: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, fontStyle: 'italic' },

  docActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnDanger: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.navyGov },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navyDark },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    borderRadius: RADIUS.lg,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    ...SHADOWS.elevated,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.navyDark, marginBottom: 4 },
  modalDocName: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.6, marginBottom: 8 },
  modalChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 14,
    color: COLORS.navyDark,
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  modalSave: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: RADIUS.md, backgroundColor: COLORS.navyGov },
  modalSaveText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

export default OriginalDocuments;
