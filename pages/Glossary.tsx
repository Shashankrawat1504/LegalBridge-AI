import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

export interface GlossaryTerm {
  term: string;
  category: 'Police & FIR' | 'Courts & Disputes' | 'Agreements & Contracts' | 'Consumer & Housing';
  plainMeaning: string;
  whyYouMightSeeThis: string;
}

export const DEMO_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'FIR (First Information Report)',
    category: 'Police & FIR',
    plainMeaning: 'The official document police write when someone reports a serious (cognizable) crime. It starts the official police investigation.',
    whyYouMightSeeThis: 'When filing a theft, fraud, or physical assault complaint at a police station.',
  },
  {
    term: 'Complaint',
    category: 'Police & FIR',
    plainMeaning: 'A written or spoken statement alleging that someone broke a rule or committed a crime, given to police, an employer, a consumer forum, or a magistrate.',
    whyYouMightSeeThis: 'Any time you write to an authority or company asking them to fix a problem or look into an incident.',
  },
  {
    term: 'Cognizable Offence',
    category: 'Police & FIR',
    plainMeaning: 'A serious crime (like theft, robbery, or severe injury) where police have the legal power to register an FIR and arrest without needing a magistrate’s prior permission.',
    whyYouMightSeeThis: 'When police explain why they can register an immediate FIR instead of just an NCR.',
  },
  {
    term: 'Non-Cognizable Offence',
    category: 'Police & FIR',
    plainMeaning: 'A less serious or private offence (like minor scuffles or simple verbal abuse) where police cannot arrest or formally investigate without an order from a magistrate.',
    whyYouMightSeeThis: 'When police record your complaint in a Daily Diary / NCR (Non-Cognizable Report) instead of an FIR.',
  },
  {
    term: 'Charge Sheet',
    category: 'Police & FIR',
    plainMeaning: 'The final report prepared by police after investigating an FIR, presenting their evidence to the court against the accused persons.',
    whyYouMightSeeThis: 'When following up on whether police completed investigation and submitted case papers to court.',
  },
  {
    term: 'Bail',
    category: 'Courts & Disputes',
    plainMeaning: 'Temporary release from police or judicial custody while a case is being tried, usually by submitting a personal bond or security guaranteeing court attendance.',
    whyYouMightSeeThis: 'In news, court hearings, or when someone has been taken into custody.',
  },
  {
    term: 'Anticipatory Bail',
    category: 'Courts & Disputes',
    plainMeaning: 'A court order protecting an innocent person from being arrested in advance if they have reason to believe someone might file a false or malicious criminal case against them.',
    whyYouMightSeeThis: 'Before arrest occurs, when a person expects a baseless complaint from an opponent.',
  },
  {
    term: 'Summons',
    category: 'Courts & Disputes',
    plainMeaning: 'An official written order issued by a judge or court requiring a specific person or witness to appear before the court on a designated date.',
    whyYouMightSeeThis: 'If you receive an official court notice asking you to attend as a witness or defendant.',
  },
  {
    term: 'Warrant',
    category: 'Courts & Disputes',
    plainMeaning: 'A written order signed by a magistrate commanding police to arrest a person or search a specific premise.',
    whyYouMightSeeThis: 'When an accused repeatedly ignores summons or in serious criminal situations.',
  },
  {
    term: 'Notice / Legal Notice',
    category: 'Courts & Disputes',
    plainMeaning: 'A formal written warning—usually sent by an advocate or party—demanding compliance or dues before starting a court lawsuit.',
    whyYouMightSeeThis: 'In tenancy deposit disputes, cheque bounces, or workplace termination notices.',
  },
  {
    term: 'Affidavit',
    category: 'Courts & Disputes',
    plainMeaning: 'A written statement of facts made voluntarily and confirmed by the oath or affirmation of the person making it, signed before an authorised notary or oath commissioner.',
    whyYouMightSeeThis: 'For rental proofs, name changes, passport verification, or court document filings.',
  },
  {
    term: 'Complainant / Plaintiff',
    category: 'Courts & Disputes',
    plainMeaning: 'The person who brings a complaint to the police or files a civil suit in court asking for legal relief or justice.',
    whyYouMightSeeThis: 'At the top of case documents indicating your legal role as the person seeking remedy.',
  },
  {
    term: 'Respondent / Accused',
    category: 'Courts & Disputes',
    plainMeaning: 'The person, landlord, or company against whom a complaint or court case has been filed.',
    whyYouMightSeeThis: 'The defending party named in consumer grievances, rent claims, or criminal complaints.',
  },
  {
    term: 'Jurisdiction',
    category: 'Courts & Disputes',
    plainMeaning: 'The official boundary—geographic area, subject matter, or monetary limit—within which a specific court or police station has the legal authority to act.',
    whyYouMightSeeThis: 'When deciding which police station or District Consumer Commission has authority to take your case.',
  },
  {
    term: 'Limitation Period',
    category: 'Courts & Disputes',
    plainMeaning: 'The legally set time deadline within which you must file your claim or lawsuit; after this window closes, courts will usually not entertain the dispute.',
    whyYouMightSeeThis: 'Consumer complaints typically must be filed within 2 years of the dispute arising.',
  },
  {
    term: 'Vakalatnama',
    category: 'Courts & Disputes',
    plainMeaning: 'A written authorization document signed by a citizen granting permission to an advocate to represent them and speak on their behalf in court.',
    whyYouMightSeeThis: 'The first document you sign when you appoint a lawyer to contest or file a court matter.',
  },
  {
    term: 'Consumer Commission',
    category: 'Consumer & Housing',
    plainMeaning: 'A specialised quasi-judicial court (District, State, or National) set up under the Consumer Protection Act to decide complaints about defective goods and bad service.',
    whyYouMightSeeThis: 'When filing a grievance against a shop, brand, airline, hospital, or e-commerce website on e-Jagriti.',
  },
  {
    term: 'Legal Aid',
    category: 'Courts & Disputes',
    plainMeaning: 'Free legal advice and free lawyer representation provided by the government (NALSA / SLSA) to eligible citizens who cannot afford private advocates.',
    whyYouMightSeeThis: 'Available for women, children, workers, SC/ST, and lower-income families under the Legal Services Authorities Act.',
  },
  {
    term: 'Arbitration',
    category: 'Agreements & Contracts',
    plainMeaning: 'A private out-of-court dispute resolution method where an independent third person (the arbitrator) hears both sides and gives a binding decision.',
    whyYouMightSeeThis: 'Commonly included as a dispute resolution clause in loan agreements, app terms, and employment contracts.',
  },
  {
    term: 'Contract / Agreement',
    category: 'Agreements & Contracts',
    plainMeaning: 'A legally binding mutual promise between two or more parties that is enforceable by law (e.g., rent agreement, job offer letter).',
    whyYouMightSeeThis: 'Whenever you rent an apartment, take a job, hire a contractor, or purchase high-value services.',
  },
  {
    term: 'Security Deposit',
    category: 'Consumer & Housing',
    plainMeaning: 'A refundable sum of money given by a tenant or customer to guarantee that property will not be damaged and dues will be paid.',
    whyYouMightSeeThis: 'In rent agreements; must be returned to the tenant after deducting only valid, agreed-upon expenses.',
  },
  {
    term: 'Indemnity',
    category: 'Agreements & Contracts',
    plainMeaning: 'A contractual promise by one party to pay for or compensate any financial losses, damage, or legal liability incurred by the other party.',
    whyYouMightSeeThis: 'In freelance contracts or vendor agreements; can sometimes create unexpected liability if drafted too broadly.',
  },
  {
    term: 'Non-Compete Clause',
    category: 'Agreements & Contracts',
    plainMeaning: 'A contract rule that restricts an employee or vendor from working for a competing business or starting a similar business for a certain duration.',
    whyYouMightSeeThis: 'In employment letters; in India, post-employment non-compete restrictions are generally void under Section 27 of the Indian Contract Act.',
  },
];

const CATEGORIES = [
  'All',
  'Police & FIR',
  'Courts & Disputes',
  'Agreements & Contracts',
  'Consumer & Housing',
] as const;

export default function Glossary() {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTerms = DEMO_GLOSSARY.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCat;
    return (
      matchesCat &&
      (item.term.toLowerCase().includes(query) ||
        item.plainMeaning.toLowerCase().includes(query) ||
        item.whyYouMightSeeThis.toLowerCase().includes(query))
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Utilities" />

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
                <Text style={styles.tagBadgeText}>PLAIN-LANGUAGE DICTIONARY</Text>
              </View>
            </View>

            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Legal Glossary (Simple)
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Demystifying complex legal words. Plain-language meanings of terms like FIR, bail, summons, affidavit, and indemnity for everyday life.
            </Text>
          </View>
        </View>

        <View style={styles.contentBody}>
          {/* Educational Disclaimer Banner */}
          <View style={[styles.disclaimerBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="information-circle-outline" size={20} color={isDark ? '#60A5FA' : COLORS.navyGov} />
            <View style={styles.disclaimerTextGroup}>
              <Text style={[styles.disclaimerTitle, { color: theme.textPrimary }]}>
                Simplified Citizen Explanations
              </Text>
              <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                These definitions are plain-language educational summaries to help ordinary citizens understand standard legal documents. They are not formal statutory definitions or substitute legal advice.
              </Text>
            </View>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search legal terms (e.g. FIR, bail, affidavit, deposit, indemnity)..."
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

          {/* Terms Grid */}
          <View style={styles.cardsGrid}>
            {filteredTerms.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="search" size={36} color={theme.textMuted} />
                <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>No Legal Terms Found</Text>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  Try a different search word or switch category filters.
                </Text>
              </View>
            ) : (
              filteredTerms.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.card,
                    isCompact ? styles.cardFull : styles.cardHalf,
                    { backgroundColor: theme.cardBackground, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.termBadge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
                      <Text style={styles.termBadgeText}>{item.category.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={[styles.termTitle, { color: theme.textPrimary }]}>{item.term}</Text>

                  <View style={styles.meaningBox}>
                    <Text style={styles.meaningLabel}>PLAIN MEANING:</Text>
                    <Text style={[styles.meaningText, { color: theme.textSecondary }]}>
                      {item.plainMeaning}
                    </Text>
                  </View>

                  <View style={[styles.whyBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <Ionicons name="eye-outline" size={14} color={COLORS.accentGoldDark} style={styles.whyIcon} />
                    <View style={styles.whyContent}>
                      <Text style={styles.whyLabel}>WHERE YOU WILL SEE THIS:</Text>
                      <Text style={[styles.whyText, { color: theme.textMuted }]}>
                        {item.whyYouMightSeeThis}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
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
    maxWidth: 760,
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
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOWS.subtle,
  },
  cardFull: {
    width: '100%',
  },
  cardHalf: {
    width: '48.9%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  termBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  termBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.5,
  },
  termTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 10,
    lineHeight: 22,
  },
  meaningBox: {
    marginBottom: 12,
  },
  meaningLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.navyGov,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  meaningText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
  whyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  whyIcon: {
    marginTop: 2,
  },
  whyContent: {
    flex: 1,
  },
  whyLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  whyText: {
    fontSize: 12,
    lineHeight: 17,
  },
  emptyState: {
    width: '100%',
    padding: 32,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginTop: 10,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
