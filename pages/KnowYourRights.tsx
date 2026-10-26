import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const KnowYourRights: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const [activeTab, setActiveTab] = useState<'situation' | 'laws' | 'glossary'>('situation');

  const tabs = [
    { id: 'situation' as const, label: 'By Situation', icon: 'shield-checkmark' },
    { id: 'laws' as const, label: 'Key Laws', icon: 'library' },
    { id: 'glossary' as const, label: 'Glossary', icon: 'book' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="KnowYourRights" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.navyGov} />
              <Text style={styles.backBtnText}>Back to Tools</Text>
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Know Your Rights</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Understand Indian laws, legal terms, and your rights in simple words
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={[styles.tabsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && { backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF', borderColor: isDark ? '#60A5FA' : '#BFDBFE' },
                  { borderColor: theme.border }
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={activeTab === tab.id ? (isDark ? '#60A5FA' : COLORS.navyGov) : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab.id ? (isDark ? '#60A5FA' : COLORS.navyGov) : theme.textSecondary }
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={[styles.tabContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            {activeTab === 'situation' && (
              <View style={styles.contentSection}>
                <Text style={[styles.contentTitle, { color: theme.textPrimary }]}>Rights by Situation</Text>
                <Text style={[styles.contentText, { color: theme.textSecondary }]}>
                  Explore your rights in everyday situations like renting, working, shopping, and interacting with authorities.
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.navyGov }]}
                  onPress={() => navigation.navigate('RightsBySituation')}
                >
                  <Text style={styles.actionBtnText}>Browse Rights by Situation</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'laws' && (
              <View style={styles.contentSection}>
                <Text style={[styles.contentTitle, { color: theme.textPrimary }]}>Key Indian Laws</Text>
                <Text style={[styles.contentText, { color: theme.textSecondary }]}>
                  Understand important Indian laws like BNS, IPC, CrPC, and others explained in simple language.
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.navyGov }]}
                  onPress={() => navigation.navigate('Bare Acts')}
                >
                  <Text style={styles.actionBtnText}>Browse Key Laws</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'glossary' && (
              <View style={styles.contentSection}>
                <Text style={[styles.contentTitle, { color: theme.textPrimary }]}>Legal Glossary</Text>
                <Text style={[styles.contentText, { color: theme.textSecondary }]}>
                  Short, simple meanings of legal terms like FIR, notice, affidavit, bail, and more.
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.navyGov }]}
                  onPress={() => navigation.navigate('Glossary')}
                >
                  <Text style={styles.actionBtnText}>Browse Glossary</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Disclaimer */}
          <View style={[styles.disclaimer, { backgroundColor: isDark ? '#1E3A5F22' : '#FFF3CD', borderColor: isDark ? '#1E40AF' : '#FFC107' }]}>
            <Ionicons name="information-circle" size={20} color={isDark ? '#60A5FA' : '#856404'} />
            <Text style={[styles.disclaimerText, { color: isDark ? '#BFDBFE' : '#856404' }]}>
              This is for educational purposes only. For serious legal matters, always consult a qualified lawyer.
            </Text>
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
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navyGov,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 32,
    marginBottom: 24,
    ...SHADOWS.subtle,
  },
  contentSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 500,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});

export default KnowYourRights;
