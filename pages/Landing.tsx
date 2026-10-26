import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

import { useTheme } from '../context/ThemeContext';

type LandingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const Landing = () => {
  const navigation = useNavigation<LandingNavigationProp>();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Home" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Authoritative Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.heroInner}>
            {/* Government Authority Badge */}
            <View style={[styles.authorityPill, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <View style={styles.authorityDot} />
              <Text style={[styles.authorityPillText, isDark && { color: '#60A5FA' }]}>
                LEGAL HELP FOR EVERYONE • KNOW YOUR RIGHTS
              </Text>
            </View>

            {/* Main Headline */}
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
              Understand Your Rights in Simple Language
            </Text>

            {/* Subtitle / Core Brief */}
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              Get everyday legal help without the complexity. Ask questions, understand laws, save your documents, and know your rights as a citizen.
            </Text>

            {/* Call-to-Action Buttons */}
            <View style={[styles.heroActionsRow, isCompact && styles.heroActionsRowCompact]}>
              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={() => navigation.navigate('Utilities')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryCtaText}>Get Started</Text>
                <Ionicons name="arrow-forward-outline" size={16} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryCtaBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => navigation.navigate('Key Features')}
                activeOpacity={0.85}
              >
                <Text style={[styles.secondaryCtaText, { color: theme.textPrimary }]}>View Features</Text>
              </TouchableOpacity>
            </View>

            {/* Trust Highlights */}
            <View style={[styles.trustPillarsRow, isCompact && styles.trustPillarsRowCompact, { borderTopColor: theme.border }]}>
              <View style={styles.trustItem}>
                <Ionicons name="shield-checkmark-outline" size={16} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                <Text style={[styles.trustText, { color: theme.textMuted }]}>Plain Language</Text>
              </View>
              <View style={[styles.trustDivider, { backgroundColor: theme.border }]} />
              <View style={styles.trustItem}>
                <Ionicons name="document-text-outline" size={16} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                <Text style={[styles.trustText, { color: theme.textMuted }]}>Based on Indian Law</Text>
              </View>
              <View style={[styles.trustDivider, { backgroundColor: theme.border }]} />
              <View style={styles.trustItem}>
                <Ionicons name="lock-closed-outline" size={16} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                <Text style={[styles.trustText, { color: theme.textMuted }]}>Your Data Stays On Device</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Institutional Mission & Image Section */}
        <View style={styles.institutionalSection}>
          <View style={[styles.institutionalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.imageWrapper}>
              <Image
                source={require('../assets/Landing.jpg')}
                style={styles.landingImage}
                resizeMode="cover"
              />
              <View style={styles.imageCaptionOverlay}>
                <Text style={styles.imageCaptionText}>
                  An initiative representing trust and authority abiding by the constitution.
                </Text>
              </View>
            </View>

            <View style={styles.institutionalContent}>
              <Text style={[styles.institutionalHeading, { color: theme.textPrimary }]}>Legal Help Made Simple</Text>
              <Text style={[styles.institutionalDescription, { color: theme.textSecondary }]}>
                This app is designed to help everyday citizens understand their rights, ask legal questions in plain language, and organize important documents. Educational aid — not a substitute for professional legal advice.
              </Text>

              {/* Quick portal links for citizens */}
              <View style={styles.quickAccessGrid}>
                <TouchableOpacity
                  style={[styles.quickAccessTile, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('Query')}
                >
                  <Text style={[styles.quickAccessTitle, { color: theme.textPrimary }]}>Legal Help Assistant</Text>
                  <Text style={[styles.quickAccessSub, { color: theme.textMuted }]}>Ask everyday legal questions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAccessTile, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('Bare Acts')}
                >
                  <Text style={[styles.quickAccessTitle, { color: theme.textPrimary }]}>Know the Law (Simple)</Text>
                  <Text style={[styles.quickAccessSub, { color: theme.textMuted }]}>Understand laws in plain words</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAccessTile, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('Original Documents')}
                >
                  <Text style={[styles.quickAccessTitle, { color: theme.textPrimary }]}>My Legal Document Library</Text>
                  <Text style={[styles.quickAccessSub, { color: theme.textMuted }]}>Save your legal documents</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAccessTile, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('Guides')}
                >
                  <Text style={[styles.quickAccessTitle, { color: theme.textPrimary }]}>Citizen Guides</Text>
                  <Text style={[styles.quickAccessSub, { color: theme.textMuted }]}>Step-by-step action plans</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAccessTile, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('LetterTemplates')}
                >
                  <Text style={[styles.quickAccessTitle, { color: theme.textPrimary }]}>Letter Templates</Text>
                  <Text style={[styles.quickAccessSub, { color: theme.textMuted }]}>Fill & copy ready-made letters</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAccessTile, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('Helplines')}
                >
                  <Text style={[styles.quickAccessTitle, { color: theme.textPrimary }]}>Find Help (Helplines)</Text>
                  <Text style={[styles.quickAccessSub, { color: theme.textMuted }]}>Verified numbers & legal aid</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAccessTile, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('RightsBySituation')}
                >
                  <Text style={[styles.quickAccessTitle, { color: theme.textPrimary }]}>Rights by Situation</Text>
                  <Text style={[styles.quickAccessSub, { color: theme.textMuted }]}>Tenant, worker, consumer rights</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAccessTile, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('ComplaintNotes')}
                >
                  <Text style={[styles.quickAccessTitle, { color: theme.textPrimary }]}>My Complaint Notes</Text>
                  <Text style={[styles.quickAccessSub, { color: theme.textMuted }]}>Private on-device log</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAccessTile, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('Glossary')}
                >
                  <Text style={[styles.quickAccessTitle, { color: theme.textPrimary }]}>Legal Glossary (Simple)</Text>
                  <Text style={[styles.quickAccessSub, { color: theme.textMuted }]}>Plain meanings of legal terms</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Global Government Footer */}
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
    paddingVertical: 54,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroInner: {
    maxWidth: 900,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },
  authorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  authorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentGold,
  },
  authorityPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.navyGov,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.navyDark,
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 720,
    marginBottom: 32,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 40,
    width: '100%',
  },
  heroActionsRowCompact: {
    flexDirection: 'column',
    width: '100%',
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: RADIUS.md,
    minWidth: 180,
    borderWidth: 1,
    borderColor: COLORS.navyMuted,
    ...SHADOWS.subtle,
  },
  primaryCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  secondaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: RADIUS.md,
    minWidth: 160,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  secondaryCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navyDark,
  },
  trustPillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    width: '100%',
  },
  trustPillarsRowCompact: {
    flexDirection: 'column',
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  trustDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
  },
  institutionalSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  institutionalCard: {
    maxWidth: 1040,
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 280,
    backgroundColor: COLORS.navyDark,
  },
  landingImage: {
    width: '100%',
    height: '100%',
    opacity: 0.88,
  },
  imageCaptionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageCaptionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  institutionalContent: {
    padding: 32,
  },
  institutionalHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 8,
  },
  institutionalDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: 28,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  quickAccessTile: {
    flex: 1,
    minWidth: 220,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 16,
  },
  quickAccessTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 4,
  },
  quickAccessSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
});

export default Landing;
