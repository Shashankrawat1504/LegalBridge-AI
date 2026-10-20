import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

type KeyFeaturesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Key Features'>;

interface FeatureItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  category: string;
  description: string;
  complianceTag: string;
}

const KeyFeatures = () => {
  const navigation = useNavigation<KeyFeaturesNavigationProp>();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const featuresList: FeatureItem[] = [
    {
      icon: 'document-text-outline',
      title: 'AI-Powered FIR Generation',
      category: 'DOCUMENTATION',
      description: 'Intelligent FIR document creation with statutory compliance, automated section mapping, and structured official formatting for police stations.',
      complianceTag: 'BNSS Section 173 Compliant',
    },
    {
      icon: 'library-outline',
      title: 'Comprehensive Legal Database',
      category: 'STATUTORY REPOSITORY',
      description: 'Instant lookup of active Indian penal codes, procedural laws, and judicial precedents searchable by section, legal topic, or keywords.',
      complianceTag: 'BNS 2023 & IPC Cross-Referenced',
    },
    {
      icon: 'chatbubbles-outline',
      title: 'AI Legal Assistant',
      category: 'INVESTIGATIVE INTELLIGENCE',
      description: 'Precision question-answering assistant for investigating officers to query statutory interpretations, legal definitions, and court directives.',
      complianceTag: 'Audited Legal NLP Engine',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Secure & Compliant Architecture',
      category: 'DATA GOVERNANCE',
      description: 'Government-grade data protection, role-based access control for authorized personnel, tamper-evident audit logs, and strict confidentiality.',
      complianceTag: 'IT Act & ISO 27001 Ready',
    },
    {
      icon: 'stats-chart-outline',
      title: 'Case Analytics & Reporting',
      category: 'OPERATIONAL OVERSIGHT',
      description: 'High-level monitoring dashboards tracking case progress, pending chargesheets, FIR registration timelines, and jurisdiction analytics.',
      complianceTag: 'Executive MIS Reports',
    },
    {
      icon: 'people-outline',
      title: 'Multi-Agency Collaboration',
      category: 'INTER-AGENCY SYNC',
      description: 'Secure data interchange between police precincts, prosecution branches, and judicial registries for unified case tracking without duplication.',
      complianceTag: 'CCTNS Protocol Compatible',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Key Features" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.heroInner}>
            <View style={[styles.tagBadge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <Text style={styles.tagBadgeText}>SYSTEM CAPABILITIES & ARCHITECTURE</Text>
            </View>
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
              Features Built for Law Enforcement & Judiciary
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              A specialized suite of intelligent legal tools designed to accelerate investigation,
              standardize official documentation, and uphold the rule of law across India.
            </Text>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresGrid}>
            {featuresList.map((feature, idx) => (
              <View
                key={idx}
                style={[
                  styles.featureCard,
                  isCompact ? styles.featureCardFull : styles.featureCardHalf,
                  { backgroundColor: theme.cardBackground, borderColor: theme.border },
                ]}
              >
                <View style={styles.cardTopRow}>
                  <View style={[styles.iconBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <Ionicons name={feature.icon} size={22} color={COLORS.navyGov} />
                  </View>
                  <View style={[styles.compliancePill, { backgroundColor: theme.badge, borderColor: theme.border }]}>
                    <Text style={[styles.complianceText, { color: theme.textSecondary }]}>{feature.complianceTag}</Text>
                  </View>
                </View>

                <Text style={styles.categoryLabel}>{feature.category}</Text>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{feature.title}</Text>
                <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Institutional Call-To-Action Banner */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaHeading}>Deploy LegalBridge-AI for Your Division or Unit</Text>
              <Text style={styles.ctaSubtext}>
                Empower your officers with vetted legal intelligence and verified statutory documentation tools.
              </Text>
            </View>
            <View style={[styles.ctaButtonRow, isCompact && styles.ctaButtonRowCompact]}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Utilities')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Access All Tools</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate('Contact')}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Liaison / Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Global Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
};

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
  heroSection: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroInner: {
    maxWidth: 860,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },
  tagBadge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 16,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.navyGov,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.navyDark,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 700,
  },
  featuresSection: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  featureCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 24,
    ...SHADOWS.subtle,
  },
  featureCardHalf: {
    width: '48.5%',
  },
  featureCardFull: {
    width: '100%',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compliancePill: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  complianceText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 10,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  ctaSection: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ctaCard: {
    backgroundColor: COLORS.navyDark,
    borderRadius: RADIUS.xl,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1E293B',
    ...SHADOWS.card,
  },
  ctaContent: {
    marginBottom: 20,
  },
  ctaHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  ctaSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
  },
  ctaButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButtonRowCompact: {
    flexDirection: 'column',
  },
  primaryBtn: {
    backgroundColor: COLORS.navyGov,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.navyMuted,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default KeyFeatures;
