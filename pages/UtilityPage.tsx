import React from 'react';
import { View, StyleSheet, ScrollView, Text, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import UtilityHeader from '../components/UtilityPage/UtilityHeader';
import UtilityCard from '../components/UtilityPage/UtilityCard';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

interface UtilityPageProps {
  isLoggedIn?: boolean;
}

const UtilityPage: React.FC<UtilityPageProps> = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const menuItems = [
    {
      name: 'AI Legal Intelligence',
      icon: 'chatbubbles',
      description: 'Ask precise legal queries regarding active Indian statutes, penal provisions, and case law.',
      screen: 'Query',
      category: 'INVESTIGATIVE ASSISTANT',
      badge: 'BNS 2023 Enabled',
    },
    {
      name: 'Bare Acts Repository',
      icon: 'library',
      description: 'Access complete official text of Bharatiya Nyaya Sanhita (BNS), BNSS, and related legislation.',
      screen: 'Bare Acts',
      category: 'STATUTORY CODES',
      badge: 'Official Gazette',
    },
    {
      name: 'Original Documents & PDFs',
      icon: 'document-text',
      description: 'Review and download authentic gazetted legal acts, forms, and regulatory notifications.',
      screen: 'Original Documents',
      category: 'DOCUMENT REPOSITORY',
      badge: 'Verified Archive',
    },
    {
      name: 'Judicial Precedents Database',
      icon: 'server',
      description: 'Search categorized case precedents, High Court rulings, and statutory interpretations.',
      screen: 'Database',
      category: 'CASE LAW DATABASE',
      badge: 'Indexed Records',
    },
    {
      name: 'Official FIR Builder',
      icon: 'create',
      description: 'Draft and generate compliant First Information Reports (FIR) adhering to police procedures.',
      screen: 'FIR Download',
      category: 'POLICE PROCEDURE',
      badge: 'BNSS Sec 173',
    },
    {
      name: 'Portal Settings & Security',
      icon: 'settings',
      description: 'Configure officer authentication preferences, session management, and system display.',
      screen: 'Settings',
      category: 'ADMINISTRATION',
      badge: 'Officer Controls',
    },
    {
      name: 'Document Analyser & Redlining',
      icon: 'scan',
      description: 'Upload contracts or legal documents and get AI-powered risk scores, clause redlining, and bilingual safer-wording suggestions.',
      screen: 'Document Analyzer',
      category: 'AI CONTRACT REVIEW',
      badge: 'Redlining Engine',
    },
    {
      name: 'Case Tracker & KPI Dashboard',
      icon: 'bar-chart',
      description: 'Track active cases, investigations, and court hearings. Monitor resolution rates and priority KPIs at a glance.',
      screen: 'Case Tracker',
      category: 'CASE MANAGEMENT',
      badge: 'Live Dashboard',
    },
    {
      name: 'Evidence Timeline Builder',
      icon: 'git-network',
      description: 'Upload multi-file evidence (photos, PDFs, notes). AI extracts every datable event and builds a chronological forensic timeline with entity tagging.',
      screen: 'Evidence Timeline',
      category: 'FORENSIC ANALYSIS',
      badge: 'AI Timeline',
    },
    {
      name: 'Predictive Case Risk Assessment',
      icon: 'shield-checkmark',
      description: 'Simulate legal outcomes, calculate overall risk scores and success probability, identify vulnerabilities, and generate optimal litigation strategies.',
      screen: 'Case Risk Assessment',
      category: 'CASE STRATEGY',
      badge: 'Risk Engine',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Utilities" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <UtilityHeader />

        <View style={styles.contentWrapper}>
          <View style={[styles.infoBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.infoBannerTitle, { color: theme.textPrimary }]}>
              Official Law Enforcement Notice
            </Text>
            <Text style={[styles.infoBannerText, { color: theme.textSecondary }]}>
              All tools on this portal generate documents adhering strictly to official Indian criminal procedure standards. Please verify all case numbers and officer badge IDs before submitting reports.
            </Text>
          </View>

          <View style={styles.grid}>
            {menuItems.map((item, index) => (
              <View
                key={index}
                style={isCompact ? styles.gridItemFull : styles.gridItemHalf}
              >
                <UtilityCard
                  name={item.name}
                  icon={item.icon}
                  description={item.description}
                  category={item.category}
                  badge={item.badge}
                  onPress={() => navigation.navigate(item.screen)}
                />
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
  contentWrapper: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  infoBanner: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.navyGov,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 24,
    ...SHADOWS.subtle,
  },
  infoBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navyDark,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItemHalf: {
    width: '48.8%',
  },
  gridItemFull: {
    width: '100%',
  },
});

export default UtilityPage;
