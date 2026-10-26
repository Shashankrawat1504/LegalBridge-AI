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

interface MenuItem {
  name: string;
  icon: string;
  description: string;
  screen: string;
  category: string;
  badge?: string;
}

const UtilityPage: React.FC<UtilityPageProps> = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const menuItems: MenuItem[] = [
    {
      name: 'Legal Help Assistant',
      icon: 'chatbubbles',
      description: 'Ask everyday legal questions in plain language: rent, salary, consumer fraud, neighbour disputes, notices, and more.',
      screen: 'Query',
      category: ''
    },
    {
      name: 'Know Your Rights',
      icon: 'library',
      description: 'Understand Indian laws, legal terms, and your rights in simple words. Browse by situation, key laws, or glossary.',
      screen: 'KnowYourRights',
      category: ''
    },
    {
      name: 'Guides & Templates',
      icon: 'book',
      description: 'Step-by-step guides and ready-to-use letter templates. Handle common legal situations with confidence.',
      screen: 'GuidesAndTemplates',
      category: ''
    },
    {
      name: 'Find Help (Helplines)',
      icon: 'call',
      description: 'Verified national helplines and legal aid contacts. Quick access to emergency and consumer support.',
      screen: 'Helplines',
      category: ''
    },
    {
      name: 'My Legal Records',
      icon: 'document-text',
      description: 'Save personal legal documents and keep complaint notes. Organize agreements, notices, and incident timelines privately.',
      screen: 'MyLegalRecords',
      category: ''
    },
    {
      name: 'Check My Document',
      icon: 'scan',
      description: 'Upload agreements or notices for plain-language risk analysis. Get red flags, safer wording, and questions to ask before signing.',
      screen: 'Document Analyzer',
      category: ''
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
              Legal Help for Everyone
            </Text>
            <Text style={[styles.infoBannerText, { color: theme.textSecondary }]}>
              Understand your rights, ask legal questions, and manage your documents. This is an educational aid—always consult a qualified lawyer for serious legal matters.
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
