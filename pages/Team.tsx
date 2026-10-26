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
    name: "Shashank Rawat",
    role: "ML & Legal NLP Engineer",
    description:
      "Responsible for developing statutory NLP models, semantic act cross-referencing, and optimizing legal question-answering pipelines.",
    image:
      "https://media.licdn.com/dms/image/v2/D4E03AQEoRZxKRClhOg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1728018350887?e=1738195200&v=beta&t=9pYtSPhRuABUkyR-VTgAboDui_l4lh5pYoldreKvJx0",
  }
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
              Technical developers, legal research analysts, and architects building the LegalBridge-AI citizen legal empowerment platform.
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
