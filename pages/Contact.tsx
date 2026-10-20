import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

const Contact = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 800;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      Alert.alert('Incomplete Form', 'Please complete all required fields before submitting.');
      return;
    }
    console.log('Submitted Contact Query:', formData);
    setSubmitted(true);
    Alert.alert(
      'Official Query Received',
      'Your inquiry has been logged in the official legal grievance & assistance system. A representative will review your message.'
    );
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Contact" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.heroInner}>
            <View style={[styles.tagBadge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <Text style={styles.tagBadgeText}>OFFICIAL COMMUNICATIONS & LIAISON</Text>
            </View>
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>Departmental Contact & Support</Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              Connect with the LegalBridge-AI technical coordination desk, judicial liaison officers, and public assistance divisions for support or platform inquiries.
            </Text>
          </View>
        </View>

        {/* Main Content Layout */}
        <View style={styles.contentWrapper}>
          <View style={[styles.mainRow, isCompact && styles.mainRowCompact]}>
            {/* Contact Information Cards */}
            <View style={[styles.infoColumn, isCompact && styles.columnFull]}>
              <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Official Contact Details</Text>
                <Text style={[styles.cardHeaderSubtitle, { color: theme.textMuted }]}>
                  Directorate of Legal Affairs & Technical Operations
                </Text>

                <View style={styles.contactItemList}>
                  <View style={[styles.contactItem, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <Ionicons name="mail-outline" size={20} color={COLORS.navyGov} />
                    </View>
                    <View style={styles.contactTextContainer}>
                      <Text style={styles.contactLabel}>Official Email Desk</Text>
                      <Text style={[styles.contactValue, { color: theme.textPrimary }]}>code.a.cola.01@gmail.com</Text>
                      <Text style={[styles.contactNote, { color: theme.textMuted }]}>Monitored Mon-Sat, 09:30 - 18:00 IST</Text>
                    </View>
                  </View>

                  <View style={[styles.contactItem, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <Ionicons name="call-outline" size={20} color={COLORS.navyGov} />
                    </View>
                    <View style={styles.contactTextContainer}>
                      <Text style={styles.contactLabel}>Institutional Helpline</Text>
                      <Text style={[styles.contactValue, { color: theme.textPrimary }]}>+91-123-456-7890</Text>
                      <Text style={[styles.contactNote, { color: theme.textMuted }]}>Toll-free judicial portal assistance</Text>
                    </View>
                  </View>

                  <View style={[styles.contactItem, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <Ionicons name="location-outline" size={20} color={COLORS.navyGov} />
                    </View>
                    <View style={styles.contactTextContainer}>
                      <Text style={styles.contactLabel}>Secretariat Address</Text>
                      <Text style={[styles.contactValue, { color: theme.textPrimary }]}>
                        Ministry of Law & Justice, Madhya Pradesh, India
                      </Text>
                      <Text style={[styles.contactNote, { color: theme.textMuted }]}>National Law Enforcement Portal Cell</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.disclaimerNotice, { backgroundColor: theme.surfaceMuted }]}>
                  <Text style={[styles.disclaimerNoticeText, { color: theme.textSecondary }]}>
                    Note: For urgent criminal emergency assistance, dial 112 directly. This portal is for statutory assistance, technical support, and administrative liaison.
                  </Text>
                </View>
              </View>
            </View>

            {/* Official Message Submission Form */}
            <View style={[styles.formColumn, isCompact && styles.columnFull]}>
              <View style={[styles.formCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Submit an Official Communication</Text>
                <Text style={[styles.cardHeaderSubtitle, { color: theme.textMuted }]}>
                  All submissions are logged with reference timestamps for audit compliance.
                </Text>

                <View style={styles.formField}>
                  <Text style={[styles.label, { color: theme.textPrimary }]}>
                    Full Name / Designation <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    placeholder="Enter your name or official designation"
                    placeholderTextColor={theme.textMuted}
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.label, { color: theme.textPrimary }]}>
                    Official Email Address <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    placeholder="name@gov.in or email address"
                    placeholderTextColor={theme.textMuted}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.label, { color: theme.textPrimary }]}>
                    Matter / Query Particulars <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    placeholder="Provide detailed description of your legal inquiry, system feedback, or verification request..."
                    placeholderTextColor={theme.textMuted}
                    value={formData.message}
                    onChangeText={(text) => handleInputChange('message', text)}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                >
                  <Ionicons name="paper-plane-outline" size={17} color={COLORS.white} />
                  <Text style={styles.submitBtnText}>Submit Communication</Text>
                </TouchableOpacity>
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
  heroSection: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroInner: {
    maxWidth: 820,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },
  tagBadge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.navyGov,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.navyDark,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 680,
  },
  contentWrapper: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  mainRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  mainRowCompact: {
    flexDirection: 'column',
  },
  infoColumn: {
    flex: 1,
    width: '100%',
  },
  formColumn: {
    flex: 1.2,
    width: '100%',
  },
  columnFull: {
    width: '100%',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: 24,
    ...SHADOWS.subtle,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: 24,
    ...SHADOWS.subtle,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 4,
  },
  cardHeaderSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  contactItemList: {
    gap: 16,
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    gap: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 2,
  },
  contactNote: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  disclaimerNotice: {
    backgroundColor: COLORS.surfaceMuted,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.navyGov,
    padding: 12,
    borderRadius: RADIUS.sm,
  },
  disclaimerNoticeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navyDark,
    marginBottom: 6,
  },
  requiredMark: {
    color: COLORS.statusAlert,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.navyDark,
  },
  textArea: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.navyDark,
    minHeight: 120,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.navyMuted,
    ...SHADOWS.subtle,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});

export default Contact;
