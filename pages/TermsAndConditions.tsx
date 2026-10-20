import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OfficialNavbar from "../components/OfficialNavbar";
import Footer from "../components/Footer";
import { COLORS, RADIUS, SHADOWS } from "../constants/theme";

const TermsAndConditions = () => {
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
              <Text style={styles.badgeText}>TERMS OF SERVICE</Text>
            </View>

            <Text style={styles.headerTitle}>Terms and Conditions of Use</Text>
            <Text style={styles.headerSubtitle}>
              Rules governing portal access, statutory information disclaimers, and authorized operational usage.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.documentCard}>
            <Section title="1. Terms of Use">
              <Text style={styles.paragraph}>
                Welcome to LegalBridge-AI Portal. By accessing or using this portal, you agree to comply with and be bound by these terms and conditions. You agree to use our portal only for lawful purposes in assisting law enforcement, legal research, and justice administration.
              </Text>
            </Section>

            <Section title="2. Intellectual Property & Official Gazette Rights">
              <Text style={styles.paragraph}>
                Statutory acts, legal sections, and government gazettes reproduced on this portal are public records. Platform code, AI models, interface layouts, and proprietary analysis tools are protected by applicable intellectual property and copyright laws.
              </Text>
            </Section>

            <Section title="3. User Responsibilities & Data Fidelity">
              <Text style={styles.paragraph}>
                Users generating FIR documents or querying case databases are responsible for verifying facts, case dates, and police station jurisdictions before submitting documents into judicial or police records.
              </Text>
            </Section>

            <Section title="4. Disclaimer of Legal Representation">
              <Text style={styles.paragraph}>
                LegalBridge-AI provides automated legal research and drafting assistance. Output generated does not constitute binding judicial pronouncements or replace independent legal counsel or magistrate review.
              </Text>
            </Section>

            <Section title="5. Security & IT Act Compliance">
              <Text style={styles.paragraph}>
                All sessions are monitored and logged. Any attempt to tamper with databases, bypass authentication, or corrupt case logs will be prosecuted under the Information Technology Act, 2000.
              </Text>
            </Section>

            <Section title="6. Modifications to Terms">
              <Text style={styles.paragraph}>
                The administration reserves the right to update these terms to maintain alignment with updated statutory enactments and ministry directives. Continued use constitutes acceptance.
              </Text>
            </Section>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

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
    alignItems: "center",
  },
  headerContent: {
    maxWidth: 820,
    width: "100%",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navyGov,
  },
  badge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
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
    width: "100%",
    alignSelf: "center",
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
    fontWeight: "700",
    color: COLORS.navyDark,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
});

export default TermsAndConditions;
