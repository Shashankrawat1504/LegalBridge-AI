import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

const Download = () => {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  return (
    <View style={styles.container}>
      <OfficialNavbar />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>OFFICIAL CLIENT APPLICATIONS</Text>
            </View>
            <Text style={styles.title}>Download LegalBridge-AI Mobile & Desktop Client</Text>
            <Text style={styles.subtitle}>
              Install the verified LegalBridge-AI field application for law enforcement officers, investigators, and court liaison personnel.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.grid}>
            {/* Android */}
            <View style={[styles.card, isCompact ? styles.cardFull : styles.cardHalf]}>
              <View style={styles.platformIconBox}>
                <Ionicons name="phone-portrait-outline" size={32} color={COLORS.navyGov} />
              </View>
              <Text style={styles.platform}>Android Client APK</Text>
              <Text style={styles.cardDesc}>
                Official build for police handsets, field tablets, and precinct workstations.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  Linking.openURL(
                    'https://drive.google.com/uc?export=download&id=1lPszpovE10_TFEdpZn9Ufbg13sfMSxAz'
                  )
                }
                activeOpacity={0.85}
              >
                <Ionicons name="download-outline" size={17} color={COLORS.white} />
                <Text style={styles.buttonText}>Download Verified APK</Text>
              </TouchableOpacity>
            </View>

            {/* iOS */}
            <View style={[styles.card, styles.comingSoon, isCompact ? styles.cardFull : styles.cardHalf]}>
              <View style={styles.platformIconBox}>
                <Ionicons name="logo-apple" size={32} color={COLORS.navyGov} />
              </View>
              <Text style={styles.platform}>iOS Enterprise Client</Text>
              <Text style={styles.cardDesc}>
                Under departmental security audit for Apple App Store distribution.
              </Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Scheduled for Deployment</Text>
              </View>
            </View>

            {/* Windows Desktop */}
            <View style={[styles.card, styles.comingSoon, isCompact ? styles.cardFull : styles.cardHalf]}>
              <View style={styles.platformIconBox}>
                <Ionicons name="desktop-outline" size={32} color={COLORS.navyGov} />
              </View>
              <Text style={styles.platform}>Windows Police Station MIS</Text>
              <Text style={styles.cardDesc}>
                Dedicated workstation software for FIR recording and GD register synchronization.
              </Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>

            {/* Linux Desktop */}
            <View style={[styles.card, styles.comingSoon, isCompact ? styles.cardFull : styles.cardHalf]}>
              <View style={styles.platformIconBox}>
                <Ionicons name="terminal-outline" size={32} color={COLORS.navyGov} />
              </View>
              <Text style={styles.platform}>Linux Secured Client</Text>
              <Text style={styles.cardDesc}>
                Optimized for state NIC data centers and BOSS Linux installations.
              </Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
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
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    maxWidth: 820,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },
  badge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.navyGov,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.navyDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 620,
  },
  contentWrapper: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    textAlign: 'center',
    ...SHADOWS.subtle,
  },
  cardHalf: {
    width: '48.8%',
  },
  cardFull: {
    width: '100%',
  },
  comingSoon: {
    opacity: 0.8,
    backgroundColor: COLORS.surfaceMuted,
  },
  platformIconBox: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  platform: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.navyMuted,
    width: '100%',
  },
  buttonText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '700',
  },
  comingSoonBadge: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});

export default Download;
