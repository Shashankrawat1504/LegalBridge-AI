import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import OfficialNavbar from "../components/OfficialNavbar";
import Footer from "../components/Footer";
import { COLORS, RADIUS, SHADOWS } from "../constants/theme";

const teamMembers = [
  {
    name: "Ayush Agarwal",
    role: "ML & Legal NLP Engineer",
    description:
      "Responsible for developing statutory NLP models, semantic act cross-referencing, and optimizing legal question-answering pipelines.",
    image:
      "https://media.licdn.com/dms/image/v2/D4E03AQEoRZxKRClhOg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1728018350887?e=1738195200&v=beta&t=9pYtSPhRuABUkyR-VTgAboDui_l4lh5pYoldreKvJx0",
  },
  {
    name: "Debojit Roy",
    role: "Backend Architecture Lead",
    description:
      "Architects secure server infrastructure, judicial case database indexing, and encrypted API integrations conforming to government standards.",
    image:
      "https://media.licdn.com/dms/image/v2/D5603AQGPRSfGjGir9Q/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1718236956013?e=1738195200&v=beta&t=pscvdlRST4EJhg3Suf5bI6z23YP-LaR_NaCSB2vuQJU",
  },
  {
    name: "Anubhab Das",
    role: "UI/UX & Accessibility Specialist",
    description:
      "Designs intuitive, accessible, and high-contrast user interfaces tailored for investigating officers and judicial administrators.",
    image:
      "https://media.licdn.com/dms/image/v2/D5603AQF5tXgTG8Qp4g/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1710860974456?e=1738195200&v=beta&t=6L3G6xbr5ZqwI_vNx0mwH2ujatNnFyHHyAZ2fIzB_b0",
  },
  {
    name: "Anish Seth",
    role: "Frontend Systems Engineer",
    description:
      "Implements cross-platform portal interfaces, responsive government layouts, and smooth form-generation pipelines.",
    image:
      "https://media.licdn.com/dms/image/v2/D5603AQEcOwOyX562Dg/profile-displayphoto-shrink_400_400/B56ZNu3TrUGgAg-/0/1732731813490?e=1738195200&v=beta&t=Y-SnPMfKVIN8-7tnNxNyjfme3bQdyrGW45fUTAyyZxI",
  },
  {
    name: "Anushka Adak",
    role: "Legal Research Analyst",
    description:
      "Conducts empirical research on Indian criminal statutes, procedural delays, and user requirements for police precinct deployments.",
    image:
      "https://media.licdn.com/dms/image/v2/D5603AQHou2gK1ISDvA/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1694421566208?e=1738195200&v=beta&t=WVinWjnia99PD9IrEEPjI6wG1rkvVRAqpfdBFVDoYTs",
  },
  {
    name: "Tanisha Gupta",
    role: "Product & Strategy Manager",
    description:
      "Provides strategic guidance and operational oversight, aligning technical deliverables with legal compliance standards.",
    image:
      "https://media.licdn.com/dms/image/v2/D4E03AQF0TX_e-_A-kA/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1693753607824?e=1738195200&v=beta&t=LyZwC4tPpARgbD_dId2bqLRR6M-b59PYw_XyPXuJuFM",
  },
];

const Team = () => {
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
              <Text style={styles.badgeText}>ENGINEERING & RESEARCH DIVISION</Text>
            </View>
            <Text style={styles.title}>Project Engineering Team</Text>
            <Text style={styles.subtitle}>
              Technical developers, legal research analysts, and architects building the LegalBridge-AI national intelligence platform.
            </Text>
          </View>
        </View>

        <View style={styles.membersSection}>
          <View style={styles.grid}>
            {teamMembers.map((member, index) => (
              <View
                key={index}
                style={[styles.memberCard, isCompact ? styles.cardFull : styles.cardHalf]}
              >
                <Image source={{ uri: member.image }} style={styles.image} />
                <View style={styles.memberInfo}>
                  <Text style={styles.name}>{member.name}</Text>
                  <Text style={styles.role}>{member.role}</Text>
                  <Text style={styles.description}>{member.description}</Text>
                </View>
              </View>
            ))}
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
    alignItems: "center",
  },
  headerContent: {
    maxWidth: 820,
    width: "100%",
    alignItems: "center",
    textAlign: "center",
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
    fontWeight: "700",
    color: COLORS.navyGov,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.navyDark,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 620,
  },
  membersSection: {
    maxWidth: 1040,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  memberCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    ...SHADOWS.subtle,
  },
  cardHalf: {
    width: "48.8%",
  },
  cardFull: {
    width: "100%",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  memberInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navyDark,
    marginBottom: 2,
  },
  role: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.accentGoldDark,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default Team;
