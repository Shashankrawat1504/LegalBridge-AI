import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  useWindowDimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import DatabaseHeader from '../components/Database/DatabaseHeader';
import CaseCard from '../components/Database/CaseCard';
import CaseModal from '../components/Database/CaseModal';
import ScrollToTopButton from '../components/Database/ScrollToTopButton';
import EmptyState from '../components/Database/EmptyState';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface CaseItem {
  id: number;
  caseHeading: string;
  query: string;
  applicableArticle?: string;
  description: string;
  status: string;
  tags?: string;
}

// ── Offline fallback: landmark Indian Supreme Court judgments ────────────────
const OFFLINE_CASES: CaseItem[] = [
  {
    id: 1,
    caseHeading: 'Kesavananda Bharati v. State of Kerala',
    query: 'Can Parliament amend the Basic Structure of the Constitution?',
    applicableArticle: 'Article 368',
    description:
      'The Supreme Court held that Parliament can amend the Constitution but cannot alter its "basic structure" — which includes the supremacy of the Constitution, rule of law, judicial review, separation of powers, and fundamental rights. This 13-judge bench judgment (1973) remains the cornerstone of Indian constitutional law.',
    status: 'Decided',
    tags: 'Constitutional, Basic Structure, Fundamental Rights',
  },
  {
    id: 2,
    caseHeading: 'Maneka Gandhi v. Union of India',
    query: 'Is personal liberty limited to mere protection from arbitrary arrest?',
    applicableArticle: 'Article 21',
    description:
      'The Supreme Court expanded Article 21 ("right to life and personal liberty") to encompass all rights that make life meaningful. The procedure to deprive a person of life or liberty must be fair, just, and reasonable — not merely legally valid. Overruled the narrow A.K. Gopalan interpretation.',
    status: 'Decided',
    tags: 'Constitutional, Fundamental Rights, Article 21',
  },
  {
    id: 3,
    caseHeading: 'Justice K.S. Puttaswamy v. Union of India',
    query: 'Is privacy a fundamental right under the Indian Constitution?',
    applicableArticle: 'Article 21, Article 14, Article 19',
    description:
      'A 9-judge bench unanimously held that the right to privacy is intrinsic to life and liberty under Article 21. The judgment covers informational privacy, bodily integrity, and individual autonomy. This ruling forms the basis for challenges to mass surveillance and Aadhaar data collection.',
    status: 'Decided',
    tags: 'Constitutional, Privacy, Fundamental Rights, Aadhaar',
  },
  {
    id: 4,
    caseHeading: 'Vishaka v. State of Rajasthan',
    query: 'What are the obligations of employers regarding sexual harassment at the workplace?',
    applicableArticle: 'Article 14, 19, 21 — POSH Act 2013',
    description:
      'In the absence of enacted legislation, the Supreme Court laid down binding guidelines (the Vishaka Guidelines) against sexual harassment of women at the workplace, treating such harassment as a violation of fundamental rights. These guidelines were later codified in the POSH Act 2013.',
    status: 'Decided',
    tags: 'Women Rights, Workplace, Sexual Harassment, POSH',
  },
  {
    id: 5,
    caseHeading: 'Navtej Singh Johar v. Union of India',
    query: 'Is Section 377 IPC unconstitutional to the extent it criminalises consensual same-sex relations?',
    applicableArticle: 'Section 377 IPC, Article 14, 15, 19, 21',
    description:
      'A 5-judge Constitutional Bench read down Section 377 IPC, decriminalising consensual same-sex relations between adults. The Court held that sexual orientation is a protected characteristic under Articles 14, 15, and 21, and that criminalising consensual adult sexual conduct violated dignity and autonomy.',
    status: 'Decided',
    tags: 'Constitutional, LGBTQ, Article 21, Section 377 IPC',
  },
  {
    id: 6,
    caseHeading: 'Lalita Kumari v. Government of Uttar Pradesh',
    query: 'Is registration of FIR mandatory on receipt of information disclosing a cognisable offence?',
    applicableArticle: 'Section 154 CrPC',
    description:
      'A 5-judge bench held that registration of FIR under Section 154 CrPC is mandatory when information received discloses a cognisable offence. Police have no discretion to not register an FIR at this stage. The judgment also laid down categories of cases where preliminary inquiry may precede registration.',
    status: 'Decided',
    tags: 'Criminal, FIR, CrPC, Police',
  },
  {
    id: 7,
    caseHeading: 'D.K. Basu v. State of West Bengal',
    query: 'What are the rights of an arrested person and obligations on police during arrest?',
    applicableArticle: 'Article 21, Article 22',
    description:
      'The Supreme Court issued binding guidelines to prevent custodial torture and deaths. Key requirements: police must identify themselves with name-tags during arrest, prepare a memo of arrest, inform relatives, allow medical examination, and produce the arrestee before a Magistrate within 24 hours.',
    status: 'Decided',
    tags: 'Criminal, Arrest, Custodial Rights, Article 21',
  },
  {
    id: 8,
    caseHeading: 'State of Rajasthan v. Balchand @ Baliay',
    query: 'What is the guiding principle for grant of bail in criminal cases?',
    applicableArticle: 'Section 437, 439 CrPC',
    description:
      'The Supreme Court laid down that "bail is the rule and jail is the exception". Accused persons should ordinarily be released on bail unless there are specific grounds for detention. The personal liberty of the accused must be respected except where there is risk of flight, tampering of evidence, or danger to witnesses.',
    status: 'Decided',
    tags: 'Criminal, Bail, CrPC, Personal Liberty',
  },
];

const FILTER_TAGS = ['All', 'Constitutional', 'Criminal', 'Fundamental Rights', 'Women Rights'];

const Database = () => {
  const { theme, isDark } = useTheme();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseItem[]>([]);
  const [activeCase, setActiveCase] = useState<CaseItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaseData, setEditedCaseData] = useState<Partial<CaseItem>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setIsMobile(width < 768);
  }, [width]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://sih-backend-881i.onrender.com/case_list/');
      const data = await response.json();
      if (data.cases && data.cases.length > 0) {
        setCases(data.cases);
        setFilteredCases(data.cases);
        return;
      }
    } catch {
      // Fall through to offline data
    }
    // Offline fallback with landmark judgments
    setCases(OFFLINE_CASES);
    setFilteredCases(OFFLINE_CASES);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Search & Filter logic ───────────────────────────────────────────────────
  useEffect(() => {
    let results = cases;

    if (activeFilter !== 'All') {
      results = results.filter(
        (c) => c.tags?.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.caseHeading.toLowerCase().includes(q) ||
          c.query.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.tags || '').toLowerCase().includes(q) ||
          (c.applicableArticle || '').toLowerCase().includes(q)
      );
    }

    setFilteredCases(results);
  }, [searchQuery, activeFilter, cases]);

  const openCaseDetailsModal = (id: number) => {
    const caseItem = cases.find((c) => c.id === id);
    if (caseItem) {
      setActiveCase(caseItem);
      setEditedCaseData(caseItem);
      setIsEditing(false);
    }
  };

  const closeCaseDetailsModal = () => {
    setActiveCase(null);
    setIsEditing(false);
  };

  const handleSaveChanges = () => {
    if (!activeCase) return;
    const updatedCases = cases.map((c) =>
      c.id === activeCase.id
        ? {
            ...c,
            caseHeading: editedCaseData.caseHeading || c.caseHeading,
            query: editedCaseData.query || c.query,
            applicableArticle: editedCaseData.applicableArticle || c.applicableArticle,
            description: editedCaseData.description || c.description,
            status: editedCaseData.status || c.status,
            tags: editedCaseData.tags || c.tags,
          }
        : c
    );
    setCases(updatedCases);
    setActiveCase(null);
    setIsEditing(false);
  };

  const handleRemoveTag = (tagIndex: number) => {
    if (activeCase?.tags) {
      const tagsArray = activeCase.tags
        .replace(/[\[\]']+/g, '')
        .split(',')
        .map((t) => t.trim());
      tagsArray.splice(tagIndex, 1);
      setEditedCaseData((prev) => ({ ...prev, tags: tagsArray.join(', ') }));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={(e) => setShowScrollBtn(e.nativeEvent.contentOffset.y > 200)}
        scrollEventThrottle={16}
      >
        <DatabaseHeader />

        {/* Search + Filter Controls */}
        <View style={styles.controlsWrapper}>
          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search by case name, article, keyword..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
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
            {FILTER_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  activeFilter === tag && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(tag)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, { color: theme.textSecondary }, activeFilter === tag && styles.filterChipTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.resultsLabel, { color: theme.textMuted }]}>
            {filteredCases.length} {filteredCases.length === 1 ? 'case' : 'cases'} found
          </Text>
        </View>

        {filteredCases.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={filteredCases}
            renderItem={({ item }) => (
              <CaseCard
                caseItem={item}
                onShowDetails={(id) => openCaseDetailsModal(id)}
                onEdit={(id) => { openCaseDetailsModal(id); setIsEditing(true); }}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
        <Footer />
      </ScrollView>

      <ScrollToTopButton
        visible={showScrollBtn}
        onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
      />

      <CaseModal
        visible={!!activeCase}
        caseItem={activeCase}
        isEditing={isEditing}
        editedData={editedCaseData}
        onClose={closeCaseDetailsModal}
        onEditToggle={() => setIsEditing((p) => !p)}
        onSave={handleSaveChanges}
        onInputChange={(name, value) => setEditedCaseData((p) => ({ ...p, [name]: value }))}
        onRemoveTag={handleRemoveTag}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceLight },
  scrollView: { flex: 1 },
  controlsWrapper: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.navyDark,
    outlineStyle: 'none',
  } as any,
  filterScroll: { marginBottom: 12 },
  filterContainer: { gap: 8, flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full ?? 99,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.navyGov,
    borderColor: COLORS.navyMuted,
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: COLORS.white },
  resultsLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  listContainer: { padding: 20 },
});

export default Database;
