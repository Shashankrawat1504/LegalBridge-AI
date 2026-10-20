import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type ViewPDFRouteProp = RouteProp<RootStackParamList, 'ViewPDF'>;

const ViewPDF: React.FC = () => {
  const route = useRoute<ViewPDFRouteProp>();
  const navigation = useNavigation();
  const { isDark, theme } = useTheme();
  const { filePath, title = 'Official Document Viewer', htmlContent } = route.params || {};

  const [isSharing, setIsSharing] = useState(false);

  // ── Share / export the generated PDF file ──────────────────────────────────
  const handleSharePDF = async () => {
    if (!filePath) return;
    setIsSharing(true);
    try {
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(filePath, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: title,
        });
      } else {
        Alert.alert(
          'Sharing Unavailable',
          'Your device does not support the share sheet. The PDF has been saved to:\n\n' + filePath,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert('Sharing Error', 'Unable to share the document. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // ── Web: open print/save dialog ────────────────────────────────────────────
  const handleWebPrint = () => {
    if (Platform.OS !== 'web') return;
    const src = htmlContent || '';
    if (src) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(src);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
      }
    } else {
      window.print();
    }
  };

  // ── Web: open HTML content in a new tab for immediate viewing ──────────────
  const handleWebOpen = () => {
    if (Platform.OS !== 'web' || !htmlContent) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const isMobile = Platform.OS !== 'web';

  return (
    <View style={[styles.mainWrapper, { backgroundColor: theme.background }]}>
      <OfficialNavbar />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back-outline" size={18} color={theme.textPrimary} />
              <Text style={[styles.backBtnText, { color: theme.textPrimary }]}>Back</Text>
            </TouchableOpacity>

            <View style={[styles.badge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <Text style={styles.badgeText}>DOCUMENT VIEWER</Text>
            </View>

            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{title}</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {filePath ? 'PDF generated on-device • ready to share or save' : 'Standard Statutory Document Preview'}
            </Text>

            {/* ── Action Bar ─────────────────────────────────────────────── */}
            <View style={styles.actionRow}>

              {/* MOBILE: prominent Share PDF button whenever we have a real file */}
              {isMobile && filePath && (
                <TouchableOpacity
                  style={[styles.actionBtnPrimary, isSharing && styles.actionBtnDisabled]}
                  onPress={handleSharePDF}
                  activeOpacity={0.8}
                  disabled={isSharing}
                  accessibilityLabel="Share or save the generated FIR PDF"
                >
                  {isSharing ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Ionicons name="share-social-outline" size={18} color={COLORS.white} />
                  )}
                  <Text style={styles.actionBtnPrimaryText}>
                    {isSharing ? 'Opening Share Sheet…' : 'Share / Save PDF'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* WEB: Print / Save as PDF */}
              {Platform.OS === 'web' && (
                <>
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={handleWebPrint}
                    activeOpacity={0.8}
                    accessibilityLabel="Print or save document as PDF"
                  >
                    <Ionicons name="print-outline" size={18} color={COLORS.white} />
                    <Text style={styles.actionBtnPrimaryText}>Print / Save as PDF</Text>
                  </TouchableOpacity>

                  {htmlContent && (
                    <TouchableOpacity
                      style={[styles.actionBtnSecondary, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                      onPress={handleWebOpen}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="open-outline" size={18} color={theme.textPrimary} />
                      <Text style={[styles.actionBtnSecondaryText, { color: theme.textPrimary }]}>Open in New Tab</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        </View>

        {/* Content Box */}
        <View style={styles.contentWrapper}>
          <View style={[styles.docCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.docBanner}>
              <Ionicons name="document-text" size={32} color={isDark ? '#D97706' : COLORS.navyGov} />
              <View style={styles.docBannerText}>
                <Text style={[styles.docBannerTitle, { color: theme.textPrimary }]}>Verified Legal Document Generated</Text>
                <Text style={[styles.docBannerSub, { color: theme.textSecondary }]}>
                  Compliant with statutory recording standards under Indian law.
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Mobile: file-path confirmation card + prominent CTA */}
            {isMobile && filePath && (
              <View style={[styles.mobileFileCard, { backgroundColor: isDark ? '#0f2d1a' : '#f0fdf4', borderColor: isDark ? '#166534' : '#86efac' }]}>
                <View style={styles.mobileFileCardRow}>
                  <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.mobileFileCardTitle, { color: isDark ? '#4ade80' : '#15803d' }]}>
                      PDF Compiled Successfully
                    </Text>
                    <Text style={[styles.mobileFileCardPath, { color: theme.textSecondary }]} numberOfLines={2}>
                      {filePath}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.mobileShareCTA, isSharing && styles.actionBtnDisabled]}
                  onPress={handleSharePDF}
                  activeOpacity={0.85}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Ionicons name="arrow-up-circle-outline" size={20} color={COLORS.white} />
                  )}
                  <Text style={styles.mobileShareCTAText}>
                    {isSharing ? 'Opening Share Sheet…' : 'Share / Download PDF'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* HTML document summary preview */}
            {htmlContent ? (
              <View style={styles.htmlPreviewContainer}>
                <Text style={[styles.previewHeading, { color: theme.textPrimary }]}>Document Summary & Contents:</Text>
                <Text style={[styles.htmlNotice, { color: theme.textMuted }]}>
                  {isMobile
                    ? 'Your FIR document is ready. Use the Share / Download PDF button above to export it.'
                    : 'Your formal document has been generated. Use the buttons above to save, print, or share an official PDF copy.'}
                </Text>
                <View style={[styles.sanitizedBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                  <Text style={[styles.sanitizedText, { color: theme.textPrimary }]}>
                    {htmlContent
                      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                      .replace(/<[^>]+>/g, '\n')
                      .replace(/\n\s*\n/g, '\n')
                      .trim()}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.statusSuccess} />
                <Text style={[styles.placeholderTitle, { color: theme.textPrimary }]}>Document Ready for Export</Text>
                <Text style={[styles.placeholderSub, { color: theme.textSecondary }]}>
                  {filePath ? `Saved at: ${filePath}` : 'Use the sharing options above to export this file.'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    maxWidth: 900,
    width: '100%',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 13,
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
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.navyGov,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  actionBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  actionBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navyGov,
  },
  contentWrapper: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  docBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  docBannerText: {
    flex: 1,
  },
  docBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 2,
  },
  docBannerSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  htmlPreviewContainer: {
    marginTop: 8,
  },
  previewHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 6,
  },
  htmlNotice: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 14,
  },
  sanitizedBox: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sanitizedText: {
    fontSize: 13,
    color: COLORS.navyDark,
    lineHeight: 22,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navyDark,
  },
  placeholderSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // ── Mobile PDF share card ───────────────────────────────────────────────────
  mobileFileCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  mobileFileCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  mobileFileCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  mobileFileCardPath: {
    fontSize: 11,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  mobileShareCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  mobileShareCTAText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Disabled state for async operations
  actionBtnDisabled: {
    opacity: 0.55,
  },
});

export default ViewPDF;
