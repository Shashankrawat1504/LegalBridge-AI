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

// ── DEMO_CASES: landmark Indian Supreme Court judgments ───────────────────────
const DEMO_CASES: CaseItem[] = [
  {
    id: 1,
    caseHeading: 'Kesavananda Bharati v. State of Kerala',
    query: 'Can Parliament amend the Basic Structure of the Constitution?',
    applicableArticle: 'Articles 13, 14, 19, 21, 32, 368 — Basic Structure Doctrine',
    description:
      'The Supreme Court held that Parliament can amend the Constitution but cannot alter its "basic structure" — which includes the supremacy of the Constitution, rule of law, judicial review, separation of powers, and fundamental rights. This 13-judge bench judgment (1973) remains the cornerstone of Indian constitutional law.',
    status: 'Decided',
    tags: 'Constitutional, Basic Structure, Fundamental Rights, Judicial Review',
  },
  {
    id: 2,
    caseHeading: 'Indira Nehru Gandhi v. Raj Narain',
    query: 'Can Parliament amend election laws retrospectively to protect a specific election?',
    applicableArticle: 'Articles 14, 19, 21, 329, 368 — Basic Structure',
    description:
      'The Supreme Court struck down the 39th Constitutional Amendment that sought to retrospectively validate the election of the Prime Minister. The Court held that judicial review is part of the basic structure and Parliament cannot amend the Constitution to exclude judicial review in election disputes.',
    status: 'Decided',
    tags: 'Constitutional, Basic Structure, Fundamental Rights, Judicial Review',
  },
  {
    id: 3,
    caseHeading: 'Minerva Mills v. Union of India',
    query: 'Can Parliament expand its amending power without judicial scrutiny?',
    applicableArticle: 'Articles 14, 19, 31C, 368 — Basic Structure',
    description:
      'The Supreme Court struck down clauses of the 42nd Amendment that gave Parliament unlimited power to amend and excluded judicial review. The Court held that balance between fundamental rights and directive principles is part of the basic structure, and judicial review cannot be excluded.',
    status: 'Decided',
    tags: 'Constitutional, Basic Structure, Fundamental Rights, Judicial Review',
  },
  {
    id: 4,
    caseHeading: 'Maneka Gandhi v. Union of India',
    query: 'Is personal liberty limited to mere protection from arbitrary arrest?',
    applicableArticle: 'Article 21, Articles 14, 19',
    description:
      'The Supreme Court expanded Article 21 ("right to life and personal liberty") to encompass all rights that make life meaningful. The procedure to deprive a person of life or liberty must be fair, just, and reasonable — not merely legally valid. Overruled the narrow A.K. Gopalan interpretation.',
    status: 'Decided',
    tags: 'Constitutional, Fundamental Rights, Article 21, Due Process',
  },
  {
    id: 5,
    caseHeading: 'Justice K.S. Puttaswamy v. Union of India',
    query: 'Is privacy a fundamental right under the Indian Constitution?',
    applicableArticle: 'Article 21, Article 14, Article 19',
    description:
      'A 9-judge bench unanimously held that the right to privacy is intrinsic to life and liberty under Article 21. The judgment covers informational privacy, bodily integrity, and individual autonomy. This ruling forms the basis for challenges to mass surveillance and Aadhaar data collection.',
    status: 'Decided',
    tags: 'Constitutional, Privacy, Fundamental Rights, Aadhaar',
  },
  {
    id: 6,
    caseHeading: 'Shreya Singhal v. Union of India',
    query: 'Are Section 66A of IT Act restrictions on free speech constitutional?',
    applicableArticle: 'Article 19(1)(a), Article 14, Article 21',
    description:
      'The Supreme Court struck down Section 66A of the IT Act as unconstitutional, holding it violated the right to free speech under Article 19(1)(a). The provision was vague, overbroad, and not saved by reasonable restrictions under Article 19(2). A landmark judgment for internet freedom.',
    status: 'Decided',
    tags: 'Constitutional, Fundamental Rights, Free Speech, IT Act',
  },
  {
    id: 7,
    caseHeading: 'Vishaka v. State of Rajasthan',
    query: 'What are the obligations of employers regarding sexual harassment at the workplace?',
    applicableArticle: 'Articles 14, 15, 21 — POSH Act 2013',
    description:
      'In the absence of enacted legislation, the Supreme Court laid down binding guidelines (the Vishaka Guidelines) against sexual harassment of women at the workplace, treating such harassment as a violation of fundamental rights. These guidelines were later codified in the POSH Act 2013.',
    status: 'Decided',
    tags: 'Women Rights, Workplace, Sexual Harassment, POSH',
  },
  {
    id: 8,
    caseHeading: 'Joseph Shine v. Union of India',
    query: 'Is the offence of adultery under Section 497 IPC constitutional?',
    applicableArticle: 'Article 14, Article 15, Article 21',
    description:
      'The Supreme Court struck down Section 497 IPC as unconstitutional, holding it treated women as property of their husbands and violated equality under Articles 14 and 15. The judgment decriminalised adultery and recognised the autonomy and dignity of women.',
    status: 'Decided',
    tags: 'Women Rights, Constitutional, Article 21, Equality',
  },
  {
    id: 9,
    caseHeading: 'Shayara Bano v. Union of India',
    query: 'Is the practice of triple talaq (talaq-e-biddat) constitutional?',
    applicableArticle: 'Article 14, Article 15, Article 21, Article 25',
    description:
      'The Supreme Court declared triple talaq unconstitutional by a 3:2 majority. The practice was held to violate the fundamental rights to equality and dignity under Articles 14, 15, and 21. The judgment led to the Muslim Women (Protection of Rights on Marriage) Act 2019.',
    status: 'Decided',
    tags: 'Women Rights, Constitutional, Article 21, Personal Law',
  },
  {
    id: 10,
    caseHeading: 'Navtej Singh Johar v. Union of India',
    query: 'Is Section 377 IPC unconstitutional to the extent it criminalises consensual same-sex relations?',
    applicableArticle: 'Section 377 IPC, Articles 14, 15, 19, 21',
    description:
      'A 5-judge Constitutional Bench read down Section 377 IPC, decriminalising consensual same-sex relations between adults. The Court held that sexual orientation is a protected characteristic under Articles 14, 15, and 21, and that criminalising consensual adult sexual conduct violated dignity and autonomy.',
    status: 'Decided',
    tags: 'Constitutional, LGBTQ, Article 21, Section 377 IPC',
  },
  {
    id: 11,
    caseHeading: 'Lalita Kumari v. Government of Uttar Pradesh',
    query: 'Is registration of FIR mandatory on receipt of information disclosing a cognisable offence?',
    applicableArticle: 'Section 154 CrPC, Section 41A BNSS',
    description:
      'A 5-judge bench held that registration of FIR under Section 154 CrPC is mandatory when information received discloses a cognisable offence. Police have no discretion to not register an FIR at this stage. The judgment also laid down categories of cases where preliminary inquiry may precede registration.',
    status: 'Decided',
    tags: 'Criminal, FIR, CrPC, Police, Procedure',
  },
  {
    id: 12,
    caseHeading: 'D.K. Basu v. State of West Bengal',
    query: 'What are the rights of an arrested person and obligations on police during arrest?',
    applicableArticle: 'Article 21, Article 22, Section 50 BNSS',
    description:
      'The Supreme Court issued binding guidelines to prevent custodial torture and deaths. Key requirements: police must identify themselves with name-tags during arrest, prepare a memo of arrest, inform relatives, allow medical examination, and produce the arrestee before a Magistrate within 24 hours.',
    status: 'Decided',
    tags: 'Criminal, Arrest, Custodial Rights, Article 21, Procedure',
  },
  {
    id: 13,
    caseHeading: 'State of Rajasthan v. Balchand @ Baliay',
    query: 'What is the guiding principle for grant of bail in criminal cases?',
    applicableArticle: 'Section 437, 439 CrPC, Section 482 BNSS',
    description:
      'The Supreme Court laid down that "bail is the rule and jail is the exception". Accused persons should ordinarily be released on bail unless there are specific grounds for detention. The personal liberty of the accused must be respected except where there is risk of flight, tampering of evidence, or danger to witnesses.',
    status: 'Decided',
    tags: 'Criminal, Bail, CrPC, Personal Liberty, Procedure',
  },
  {
    id: 14,
    caseHeading: 'M.C. Mehta v. Union of India (Oleum Gas Leak)',
    query: 'What is the principle of absolute liability for hazardous industries?',
    applicableArticle: 'Article 21, Article 32, Article 47',
    description:
      'The Supreme Court evolved the principle of "absolute liability" for industries engaged in hazardous activities. Unlike strict liability, there is no defence of "act of God" or "act of stranger". This judgment transformed environmental jurisprudence and corporate accountability in India.',
    status: 'Decided',
    tags: 'PIL, Environmental, Corporate, Article 21',
  },
  {
    id: 15,
    caseHeading: 'Hussainara Khatoon v. State of Bihar',
    query: 'What are the rights of undertrial prisoners regarding speedy trial?',
    applicableArticle: 'Article 21, Article 14, Article 22',
    description:
      'The Supreme Court held that speedy trial is a fundamental right under Article 21. The Court ordered release of undertrial prisoners who had been detained longer than the maximum sentence for their offences. This judgment established that right to speedy trial is part of right to life and liberty.',
    status: 'Decided',
    tags: 'PIL, Criminal, Article 21, Speedy Trial, Procedure',
  },
];

const FILTER_TAGS = [
  'All',
  'Constitutional',
  'Criminal',
  'Fundamental Rights',
  'Women Rights',
  'Civil',
  'Property',
  'Labour',
  'Corporate',
  'PIL',
  'Evidence',
  'Bail & Procedure',
];

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
      // Fall through to demo data
    }
    // Demo fallback with landmark judgments
    setCases(DEMO_CASES);
    setFilteredCases(DEMO_CASES);
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
