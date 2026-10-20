import React from "react";
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OfficialNavbar from "../components/OfficialNavbar";
import Footer from "../components/Footer";
import { COLORS, RADIUS, SHADOWS } from "../constants/theme";

const PrivacyPolicy = () => {
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
              <Text style={styles.badgeText}>LEGAL & COMPLIANCE STATUTE</Text>
            </View>
            <Text style={styles.headerTitle}>Portal Privacy Policy</Text>
            <Text style={styles.headerSubtitle}>
              Data protection, lawful processing, and citizen confidentiality safeguards under Indian IT Act & DPDP Act guidelines.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.documentCard}>
            <Section title="1. Introduction">
              <Text style={styles.paragraph}>
                At LegalBridge-AI, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal data when you visit our website and use our services.
              </Text>
            </Section>

            <Section title="2. Information We Collect">
              <Text style={styles.paragraph}>We collect the following types of information:</Text>
              <BulletPoint>
                <Text>
                  <Text style={styles.bold}>Personal Information: </Text>
                  This includes your name, email address, and other details that you provide when you register on our website or contact us.
                </Text>
              </BulletPoint>
              <BulletPoint>
                <Text>
                  <Text style={styles.bold}>Usage Data: </Text>
                  We collect data on how you interact with our website, including IP address, browser type, pages visited, etc.
                </Text>
              </BulletPoint>
              <BulletPoint>
                <Text>
                  <Text style={styles.bold}>Cookies: </Text>
                  We use cookies to enhance your experience and gather data about website usage.
                </Text>
              </BulletPoint>
            </Section>

            <Section title="3. How We Use Your Information">
              <Text style={styles.paragraph}>We use your information for the following purposes:</Text>
              <BulletPoint>To improve our website and services</BulletPoint>
              <BulletPoint>To respond to your inquiries and provide customer support</BulletPoint>
              <BulletPoint>To send you updates, promotions, or other marketing materials (if you opt-in)</BulletPoint>
              <BulletPoint>To monitor and analyze usage patterns to improve user experience</BulletPoint>
            </Section>

            <Section title="4. Data Protection">
              <Text style={styles.paragraph}>
                We take the security of your data seriously. We implement technical and organizational measures to protect your personal information from unauthorized access, alteration, and deletion.
              </Text>
            </Section>

            <Section title="5. Your Rights">
              <Text style={styles.paragraph}>
                You have the right to access, correct, and delete your personal information. You can also opt out of receiving marketing emails by following the unsubscribe link in the email or by contacting us directly.
              </Text>
            </Section>

            <Section title="6. Changes to This Policy">
              <Text style={styles.paragraph}>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we will notify you of any significant updates.
              </Text>
            </Section>

            <Section title="7. Contact Us">
              <Text style={styles.paragraph}>
                If you have any questions or concerns about this Privacy Policy, please contact us at{" "}
                <Text
                  style={styles.link}
                  onPress={() => Linking.openURL("mailto:code.a.cola.01@gmail.com")}
                >
                  code.a.cola.01@gmail.com
                </Text>
                .
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

const BulletPoint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.bulletPoint}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
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
  bold: {
    fontWeight: "700",
    color: COLORS.navyDark,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingLeft: 6,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
    color: COLORS.navyGov,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    flex: 1,
  },
  link: {
    color: COLORS.navyGov,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default PrivacyPolicy;
