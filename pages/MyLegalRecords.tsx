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

const MyLegalRecords: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const [activeTab, setActiveTab] = useState<'notes' | 'documents'>('notes');

  const tabs = [
    { id: 'notes' as const, label: 'My Notes', icon: 'create' },
    { id: 'documents' as const, label: 'My Documents', icon: 'document-text' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="MyLegalRecords" />

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
              <Text style={[styles.title, { color: theme.textPrimary }]}>My Legal Records</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Save personal legal documents and keep complaint notes privately on this device
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
            {activeTab === 'notes' && (
              <View style={styles.contentSection}>
                <Text style={[styles.contentTitle, { color: theme.textPrimary }]}>My Complaint Notes</Text>
                <Text style={[styles.contentText, { color: theme.textSecondary }]}>
                  Privately note when you complained or sent a letter. Record dates, people you spoke to, and follow-ups. Stored only on this device.
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.navyGov }]}
                  onPress={() => navigation.navigate('ComplaintNotes')}
                >
                  <Text style={styles.actionBtnText}>Open My Notes</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'documents' && (
              <View style={styles.contentSection}>
                <Text style={[styles.contentTitle, { color: theme.textPrimary }]}>My Document Library</Text>
                <Text style={[styles.contentText, { color: theme.textSecondary }]}>
                  Save and organize your personal legal documents: rent agreements, notices, court papers, complaint copies, and ID documents. All stored privately on this device.
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.navyGov }]}
                  onPress={() => navigation.navigate('Original Documents')}
                >
                  <Text style={styles.actionBtnText}>Open My Documents</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Privacy Notice */}
          <View style={[styles.privacyNotice, { backgroundColor: isDark ? '#1E3A5F22' : '#D1E7DD', borderColor: isDark ? '#60A5FA' : '#0F5132' }]}>
            <Ionicons name="lock-closed" size={20} color={isDark ? '#60A5FA' : '#0F5132'} />
            <Text style={[styles.privacyText, { color: isDark ? '#BFDBFE' : '#0F5132' }]}>
              All your notes and documents are stored locally on this device. Nothing is uploaded to any server.
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
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});

export default MyLegalRecords;
