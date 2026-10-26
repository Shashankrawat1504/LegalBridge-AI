import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

interface HelplineItem {
  id: string;
  name: string;
  category: 'Emergency & Safety' | 'Consumer Rights' | 'Cyber Fraud' | 'Legal Aid' | 'Citizen Support';
  number?: string;
  url?: string;
  urlLabel?: string;
  timing: string;
  whenToUse: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const HELPLINE_DATA: HelplineItem[] = [
  // Emergency & Safety
  {
    id: 'h1',
    name: 'National Emergency Response (ERSS)',
    category: 'Emergency & Safety',
    number: '112',
    url: 'https://erss.in',
    urlLabel: 'erss.in (112)',
    timing: '24x7 toll-free',
    whenToUse: 'Any immediate police, medical, fire, or safety emergency anywhere in India.',
    description: 'Single unified emergency helpline that routes your call to police, ambulance, or fire services in your local area.',
    icon: 'shield-outline',
  },
  {
    id: 'h2',
    name: 'Women Helpline (Domestic & Harassment)',
    category: 'Emergency & Safety',
    number: '181',
    url: 'https://wcd.gov.in',
    urlLabel: 'wcd.gov.in',
    timing: '24x7 toll-free',
    whenToUse: 'Women facing domestic violence, harassment, dowry harassment, stalking, or distress.',
    description: 'Provides emergency response, counselling, shelter coordination, and police assistance for women in distress.',
    icon: 'heart-outline',
  },
  {
    id: 'h3',
    name: 'Childline (Children in Distress)',
    category: 'Emergency & Safety',
    number: '1098',
    url: 'https://wcd.gov.in',
    urlLabel: 'wcd.gov.in (MWCD)',
    timing: '24x7 toll-free',
    whenToUse: 'Children needing care, protection, shelter, or facing abuse, child labour, or abandonment.',
    description: 'National 24-hour free emergency phone and outreach service for children in need of care and protection (managed under Ministry of Women & Child Development).',
    icon: 'happy-outline',
  },

  // Cyber Fraud
  {
    id: 'h4',
    name: 'National Cyber Crime Helpline',
    category: 'Cyber Fraud',
    number: '1930',
    url: 'https://cybercrime.gov.in',
    urlLabel: 'cybercrime.gov.in',
    timing: '24x7 helpline',
    whenToUse: 'Immediate reporting of UPI fraud, phishing, unauthorised debit card transfers, or cyber financial scams.',
    description: 'Calling 1930 within the golden hours of financial cyber theft helps law enforcement freeze stolen funds in transit before withdrawal.',
    icon: 'card-outline',
  },
  {
    id: 'h5',
    name: 'National Cyber Crime Reporting Portal',
    category: 'Cyber Fraud',
    url: 'https://cybercrime.gov.in',
    urlLabel: 'cybercrime.gov.in',
    timing: 'Online portal (24x7)',
    whenToUse: 'Lodge formal complaints for cyber fraud, identity theft, sextortion, or abusive online content.',
    description: 'Official Ministry of Home Affairs portal to register and track cyber crime complaints across all states in India.',
    icon: 'globe-outline',
  },

  // Consumer Rights
  {
    id: 'h6',
    name: 'National Consumer Helpline (NCH)',
    category: 'Consumer Rights',
    number: '1915',
    url: 'https://consumerhelpline.gov.in',
    urlLabel: 'consumerhelpline.gov.in',
    timing: 'Mon–Sat: 8:00 AM – 8:00 PM',
    whenToUse: 'Defective products, refusal of warranty or refunds, misleading ads, airline/train cancellations, or e-commerce disputes.',
    description: 'Government consumer grievance platform that registers complaints and mediates directly with registered companies.',
    icon: 'cart-outline',
  },
  {
    id: 'h7',
    name: 'e-Jagriti (e-Daakhil) Consumer Court Portal',
    category: 'Consumer Rights',
    url: 'https://e-jagriti.gov.in',
    urlLabel: 'e-jagriti.gov.in',
    timing: 'Online portal (24x7)',
    whenToUse: 'Online filing of formal consumer cases before District, State, and National Consumer Dispute Redressal Commissions.',
    description: 'Enables citizens to file consumer complaints digitally via the Ministry of Consumer Affairs upgraded e-Jagriti system without visiting court physically.',
    icon: 'document-text-outline',
  },

  // Legal Aid
  {
    id: 'h8',
    name: 'NALSA National Legal Aid Helpline',
    category: 'Legal Aid',
    number: '15100',
    url: 'https://nalsa.gov.in',
    urlLabel: 'nalsa.gov.in',
    timing: 'Toll-free (9:30 AM – 5:30 PM working days)',
    whenToUse: 'Requesting free legal representation, free legal advice, or lok adalat dispute resolution.',
    description: 'National Legal Services Authority provides free, competent legal services to eligible citizens (women, children, workers, SC/ST, and low-income persons under Section 12 of LSA Act).',
    icon: 'library-outline',
  },
  {
    id: 'h9',
    name: 'Tele-Law (Department of Justice)',
    category: 'Legal Aid',
    url: 'https://tele-law.in',
    urlLabel: 'tele-law.in',
    timing: 'Common Service Centres (CSC) / Online app',
    whenToUse: 'Connect with a panel lawyer via video call or telephone from your local village or town.',
    description: 'Ministry of Law initiative that brings legal consultations to ordinary citizens through Common Service Centres (CSCs).',
    icon: 'videocam-outline',
  },

  // Citizen Support
  {
    id: 'h10',
    name: 'Elderline (National Helpline for Senior Citizens)',
    category: 'Citizen Support',
    number: '14567',
    url: 'https://socialjustice.gov.in',
    urlLabel: 'socialjustice.gov.in',
    timing: 'Daily: 8:00 AM – 8:00 PM',
    whenToUse: 'Senior citizens facing neglect, emotional distress, harassment by relatives, or needing welfare information.',
    description: 'Provides information on elder rights, maintenance act claims, elder abuse rescue, and counselling for senior citizens.',
    icon: 'people-outline',
  },
  {
    id: 'h11',
    name: 'Tele-MANAS (Mental Health Helpline)',
    category: 'Citizen Support',
    number: '14416',
    url: 'https://telemanas.mohfw.gov.in',
    urlLabel: 'telemanas.mohfw.gov.in',
    timing: '24x7 toll-free',
    whenToUse: 'Mental distress, extreme anxiety, academic stress, crisis counselling, or emotional support in regional languages.',
    description: 'Government comprehensive mental health service offering confidential, multi-lingual counselling across India.',
    icon: 'fitness-outline',
  },
];

const CATEGORIES = [
  'All',
  'Emergency & Safety',
  'Cyber Fraud',
  'Consumer Rights',
  'Legal Aid',
  'Citizen Support',
] as const;

export default function Helplines() {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCall = (num?: string) => {
    if (!num) return;
    const cleanNum = num.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanNum}`).catch(() => {
      // In web browser or desktop where tel: is unhandled
    });
  };

  const handleCopyNumber = (num: string) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(num);
    }
    showToast(`Copied ${num} to clipboard`);
  };

  const handleOpenUrl = (url?: string) => {
    if (!url) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.assign(url);
        }
      } catch {
        Linking.openURL(url).catch(() => {});
      }
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  const filteredHelplines = HELPLINE_DATA.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCat;
    const matchesQuery =
      item.name.toLowerCase().includes(query) ||
      item.whenToUse.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.number && item.number.includes(query));
    return matchesCat && matchesQuery;
  });

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

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <View style={[styles.tagBadge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
                  <Text style={styles.tagBadgeText}>VERIFIED PUBLIC DIRECTORY</Text>
                </View>
                <View style={[styles.demoNoteBadge, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                  <Ionicons name="time-outline" size={12} color={theme.textMuted} />
                  <Text style={[styles.demoNoteText, { color: theme.textMuted }]}>Last reviewed for demo: Oct 2026</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Find Help (Helplines & Legal Aid)
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Official public helplines, emergency assistance, cyber crime response, and free legal aid services available to citizens across India.
            </Text>
          </View>
        </View>

        <View style={styles.contentBody}>
          {/* Educational Disclaimer Banner */}
          <View style={[styles.disclaimerBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="information-circle-outline" size={20} color={isDark ? '#60A5FA' : COLORS.navyGov} />
            <View style={styles.disclaimerTextGroup}>
              <Text style={[styles.disclaimerTitle, { color: theme.textPrimary }]}>
                Important Citizen Notice
              </Text>
              <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                Numbers and portals can change over time. Verify on official government sites. LegalBridge-AI is an independent citizen educational aid and is not affiliated with any government department or emergency authority.
              </Text>
            </View>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search helpline name, topic (e.g. cyber, rent, consumer, 112)..."
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

          {/* Helplines List */}
          <View style={styles.cardsGrid}>
            {filteredHelplines.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="alert-circle-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>No Matches Found</Text>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  No matches — try another keyword or category.
                </Text>
              </View>
            ) : (
              filteredHelplines.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    isCompact ? styles.cardFull : styles.cardHalf,
                    { backgroundColor: theme.cardBackground, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                      <Ionicons name={item.icon} size={22} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                    </View>
                    <View style={styles.headerInfo}>
                      <View style={styles.categoryBadgeRow}>
                        <Text style={styles.cardCategory}>{item.category.toUpperCase()}</Text>
                        <Text style={[styles.cardTiming, { color: theme.textMuted }]}>• {item.timing}</Text>
                      </View>
                      <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.name}</Text>
                    </View>
                  </View>

                  <View style={styles.whenToUseBox}>
                    <Text style={styles.whenToUseLabel}>WHEN TO USE:</Text>
                    <Text style={[styles.whenToUseText, { color: theme.textSecondary }]}>{item.whenToUse}</Text>
                  </View>

                  <Text style={[styles.cardDesc, { color: theme.textMuted }]}>{item.description}</Text>

                  {/* Action Buttons */}
                  <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
                    {item.number && (
                      <TouchableOpacity
                        style={[styles.callBtn, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}
                        onPress={() => handleCall(item.number)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="call" size={15} color="#FFFFFF" />
                        <Text style={styles.callBtnText}>Call {item.number}</Text>
                      </TouchableOpacity>
                    )}

                    {item.number && (
                      <TouchableOpacity
                        style={[styles.copyNumBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                        onPress={() => handleCopyNumber(item.number!)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="copy-outline" size={14} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                        <Text style={[styles.copyNumBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>Copy</Text>
                      </TouchableOpacity>
                    )}

                    {item.url && (
                      <TouchableOpacity
                        style={[styles.portalBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                        onPress={() => handleOpenUrl(item.url)}
                        // @ts-ignore - React Native Web supports href and target on elements
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        accessibilityRole="link"
                        activeOpacity={0.8}
                      >
                        <Ionicons name="open-outline" size={15} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                        <Text style={[styles.portalBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>
                          {item.urlLabel || 'Visit Portal'}
                        </Text>
                      </TouchableOpacity>
                    )}
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
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  cardTiming: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navyDark,
    lineHeight: 20,
  },
  whenToUseBox: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accentGold,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  whenToUseLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  whenToUseText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    lineHeight: 17,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  portalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
  },
  portalBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navyGov,
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
  demoNoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  demoNoteText: {
    fontSize: 10,
    fontWeight: '600',
  },
  copyNumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  copyNumBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
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
});
