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
      icon: 'chatbubbles-outline',
      title: 'Legal Help Assistant',
      category: 'ASK A QUESTION',
      description: 'Ask everyday legal questions in plain language — rent deposit, salary delay, consumer fraud, neighbour disputes, and more. Get clear, actionable answers instantly.',
      complianceTag: 'Plain Language Answers',
    },
    {
      icon: 'library-outline',
      title: 'Know the Law (Simple)',
      category: 'LEGAL EDUCATION',
      description: 'Understand Indian laws in simple words. Browse key sections of BNS, IPC, and other acts — explained clearly for everyday life, not just lawyers.',
      complianceTag: 'BNS 2023 & IPC Covered',
    },
    {
      icon: 'document-text-outline',
      title: 'My Legal Document Library',
      category: 'SECURE STORAGE',
      description: 'Save and organise your personal legal documents on-device: rent agreements, notices, court papers, complaint copies, and ID documents. Your data stays on your phone.',
      complianceTag: 'On-Device Storage',
    },
    {
      icon: 'book-outline',
      title: 'Citizen Action Guides',
      category: 'STEP-BY-STEP HELP',
      description: 'Step-by-step guidance for common legal situations: filing complaints, security deposit recovery, salary delays, consumer refunds, and cyber fraud reporting.',
      complianceTag: '5 Practical Guides',
    },
    {
      icon: 'mail-outline',
      title: 'Ready-Made Letter Templates',
      category: 'FILL & COPY',
      description: 'Pre-drafted, polite formal letters with interactive placeholders: deposit refund notices, salary reminders, consumer defect complaints, and receiving receipts.',
      complianceTag: 'Interactive Live Preview',
    },
    {
      icon: 'call-outline',
      title: 'Find Help (Helplines)',
      category: 'PUBLIC DIRECTORY',
      description: 'Direct telephone and portal links to verified public emergency numbers (112, 181, 1930, 1915), NALSA free legal aid, and citizen support helplines.',
      complianceTag: 'Verified Public Contacts',
    },
    {
      icon: 'scan-outline',
      title: 'Check My Document',
      category: 'DOCUMENT REVIEW',
      description: 'Upload rent agreements, service contracts, or notices and get plain-language risk scores, highlighted risky clauses, and questions to ask before you sign.',
      complianceTag: 'AI-Assisted Analysis',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Private & Educational',
      category: 'PRIVACY FIRST',
      description: 'All data stays on your device. No personal details are uploaded. This is an educational aid to help you understand your rights — always consult a lawyer for serious matters.',
      complianceTag: 'Educational Aid Only',
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
              <Text style={styles.tagBadgeText}>CITIZEN TOOLS & CAPABILITIES</Text>
            </View>
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
              Legal Help Designed for Everyday Citizens
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              Simple tools to understand your rights, ask legal questions in plain language,
              review your documents, and know what famous court cases mean for you.
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
              <Text style={styles.ctaHeading}>Start Using Your Legal Tools</Text>
              <Text style={styles.ctaSubtext}>
                Access legal help, understand your rights, review documents, and use ready-made letters — all in simple language, all on your device.
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
