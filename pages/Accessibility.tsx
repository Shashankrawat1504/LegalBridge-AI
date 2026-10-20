import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

const Accessibility = () => {
  const navigation = useNavigation();

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
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back-outline" size={18} color={COLORS.navyGov} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>GIGW & WCAG 2.1 COMPLIANCE</Text>
            </View>

            <Text style={styles.headerTitle}>Accessibility Statement</Text>
            <Text style={styles.headerSubtitle}>
              Guidelines for Indian Government Websites (GIGW) adherence, digital inclusivity, and assistive technology support.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.documentCard}>
            <View style={styles.section}>
              <Text style={styles.paragraph}>
                The LegalBridge-AI Portal is committed to making its digital platform accessible and inclusive to all
                users, including officers and citizens with visual, auditory, motor, or cognitive disabilities.
                We aim to ensure that our digital content can be accessed easily across all devices and screen readers.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Accessibility Features Implemented</Text>
              <View style={styles.list}>
                <Text style={styles.listItem}>
                  • Text alternatives and semantic labels for non-text content, diagrams, and emblems.
                </Text>
                <Text style={styles.listItem}>
                  • Full keyboard navigability enabling complete access without requiring mouse input.
                </Text>
                <Text style={styles.listItem}>
                  • Screen-reader friendly DOM hierarchies and accessible ARIA attributes.
                </Text>
                <Text style={styles.listItem}>
                  • High-contrast neutral typography and scalable font metrics exceeding standard WCAG requirements.
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Standards & Compliance Benchmarks</Text>
              <Text style={styles.paragraph}>
                We adhere to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA and the Guidelines for Indian Government Websites (GIGW). Key compliance parameters include:
              </Text>
              <View style={styles.list}>
                <Text style={styles.listItem}>
                  • Ensuring all interactive buttons and inputs have clear focus rings and descriptive names.
                </Text>
                <Text style={styles.listItem}>
                  • High color contrast ratio (minimum 4.5:1 for body copy against light backgrounds).
                </Text>
                <Text style={styles.listItem}>
                  • Predictable navigation layouts across desktop, tablet, and mobile views.
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Accessibility Feedback Desk</Text>
              <Text style={styles.paragraph}>
                If you encounter any accessibility barrier or have difficulty reading statutory materials on this portal, please submit feedback via the Contact Desk or email code.a.cola.01@gmail.com.
              </Text>
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
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    maxWidth: 820,
    width: '100%',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navyGov,
  },
  badge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 6,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  contentWrapper: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  documentCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  list: {
    gap: 8,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
});

export default Accessibility;
