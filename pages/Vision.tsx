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

type VisionNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Vision'>;

interface PillarItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  category: string;
  description: string;
}

const Vision = () => {
  const navigation = useNavigation<VisionNavigationProp>();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const pillars: PillarItem[] = [
    {
      icon: 'shield-checkmark-outline',
      title: 'Constitutional Accuracy',
      category: 'LEGAL FIDELITY',
      description: 'Every answer, summary, and document reference is grounded in the Constitution of India and updated statutory codes (BNS, BNSS, BSA), so citizens can trust what they read.',
    },
    {
      icon: 'people-outline',
      title: 'Citizen Empowerment',
      category: 'EVERYDAY ACCESS',
      description: 'Helping tenants, workers, students, and consumers understand their rights without needing expensive legal consultations for basic information.',
    },
    {
      icon: 'ribbon-outline',
      title: 'Equitable Access to Justice',
      category: 'PUBLIC SERVICE',
      description: 'Bridging the gap between complex legal language and everyday understanding so that every citizen, regardless of background, can know and assert their rights.',
    },
    {
      icon: 'lock-closed-outline',
      title: 'Privacy by Design',
      category: 'DATA PROTECTION',
      description: 'All your documents and data stay on your device. Nothing is uploaded without your knowledge. Your privacy matters and is protected from the ground up.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Vision" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.heroInner}>
            <View style={[styles.tagBadge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <Text style={styles.tagBadgeText}>
                OUR MISSION • LEGAL HELP FOR EVERYONE
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
              Making Legal Rights Accessible to Every Citizen
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              Fostering transparency, plain-language understanding, and trustworthy AI tools to help
              every Indian citizen know and exercise their legal rights.
            </Text>
          </View>
        </View>

        {/* Mission Statement Banner */}
        <View style={styles.missionSection}>
          <View style={[styles.missionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.missionTagRow}>
              <View style={styles.saffronIndicator} />
              <Text style={styles.missionTag}>OUR COMMITMENT</Text>
            </View>
            <Text style={[styles.missionTitle, { color: theme.textPrimary }]}>Our Mission</Text>
            <Text style={[styles.missionText, { color: theme.textSecondary }]}>
              To make Indian legal rights accessible to everyone: helping citizens understand the laws
              that protect them, ask questions in plain language, and make informed decisions about
              their rights, documents, and legal situations — without requiring a law degree.
            </Text>
          </View>
        </View>

        {/* Vision Pillars Grid */}
        <View style={styles.pillarsSection}>
          <View style={styles.sectionHeaderGroup}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Pillars of LegalBridge-AI</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              Four principles that guide how we build for citizens.
            </Text>
          </View>

          <View style={styles.pillarsGrid}>
            {pillars.map((pillar, idx) => (
              <View
                key={idx}
                style={[
                  styles.pillarCard,
                  isCompact ? styles.pillarCardFull : styles.pillarCardHalf,
                  { backgroundColor: theme.cardBackground, borderColor: theme.border },
                ]}
              >
                <View style={[styles.pillarIconBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                  <Ionicons name={pillar.icon} size={22} color={COLORS.navyGov} />
                </View>
                <Text style={styles.pillarCategory}>{pillar.category}</Text>
                <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>{pillar.title}</Text>
                <Text style={[styles.pillarDescription, { color: theme.textSecondary }]}>{pillar.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaHeading}>Ready to Know Your Rights?</Text>
            <Text style={styles.ctaSubtext}>
              Start with the Legal Help Assistant, explore citizen guides, or check a document you received — it's free and your data stays on your device.
            </Text>
            <View style={[styles.ctaButtonRow, isCompact && styles.ctaButtonRowCompact]}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Key Features')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Explore System Features</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate('Contact')}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Contact Us</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
    marginBottom: 14,
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
  missionSection: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  missionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.navyGov,
    ...SHADOWS.subtle,
  },
  missionTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  saffronIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.govSaffron,
  },
  missionTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 10,
  },
  missionText: {
    fontSize: 14,
    lineHeight: 23,
    color: COLORS.textSecondary,
  },
  pillarsSection: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  sectionHeaderGroup: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  pillarCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 22,
    ...SHADOWS.subtle,
  },
  pillarCardHalf: {
    width: '48.8%',
  },
  pillarCardFull: {
    width: '100%',
  },
  pillarIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  pillarCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 8,
    lineHeight: 22,
  },
  pillarDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  ctaSection: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  ctaCard: {
    backgroundColor: COLORS.navyDark,
    borderRadius: RADIUS.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1E293B',
    ...SHADOWS.card,
  },
  ctaHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
  },
  ctaSubtext: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 20,
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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

export default Vision;
