import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

const OfficialFIRFormat = () => {
  const navigation = useNavigation();
  const [isDownloading, setIsDownloading] = useState(false);

  // Function to download and save the FIR .docx file
  const downloadDocx = async () => {
    setIsDownloading(true);

    try {
      const baseDir = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory ?? '';
      const fileUri = baseDir + 'FIR-Format.docx';

      await FileSystem.downloadAsync(
        'https://savelifefoundation.org/wp-content/uploads/2016/11/A1-Format-of-FIR-part-of-Step-I.docx',
        fileUri
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Sharing not available', 'Your device does not support file sharing.');
      }

      Alert.alert('Download Complete', 'The official FIR format document has been downloaded.');
    } catch (error) {
      console.error('Error downloading the file:', error);
      Alert.alert('Download Error', 'There was an issue downloading the FIR format document.');
    } finally {
      setIsDownloading(false);
    }
  };

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
              <Text style={styles.backBtnText}>Back to Tools</Text>
            </TouchableOpacity>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>STATUTORY TEMPLATE</Text>
            </View>

            <Text style={styles.headerTitle}>Official FIR Standard Format</Text>
            <Text style={styles.headerSubtitle}>
              National standardized First Information Report document (Part-I Format) approved for state police departments and legal authorities.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.card}>
            <View style={styles.docHeaderRow}>
              <View style={styles.docIconBox}>
                <Ionicons name="document-text-outline" size={26} color={COLORS.navyGov} />
              </View>
              <View style={styles.docMeta}>
                <Text style={styles.docTitle}>Standard FIR Template (.docx)</Text>
                <Text style={styles.docSub}>Format A-1 • Government of India Approved Structure</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.description}>
              This document contains the verified template for lodging and recording First Information Reports under Section 154 CrPC / Section 173 BNSS. It includes all required fields: District, Police Station, GD Reference, Acts & Sections, Complainant Particulars, Occurrence Details, and Inquest/Action Taken endorsements.
            </Text>

            <View style={styles.guidelinesBox}>
              <Text style={styles.guidelinesTitle}>Official Usage Instructions</Text>
              <Text style={styles.guidelinesText}>
                1. Ensure all GD numbers match station registers.{'\n'}
                2. Enter all penal sections in the designated legal schedule.{'\n'}
                3. Issue an authenticated physical copy with station seal to the informant.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
              onPress={downloadDocx}
              disabled={isDownloading}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isDownloading ? 'hourglass-outline' : 'download-outline'}
                size={18}
                color={COLORS.white}
              />
              <Text style={styles.downloadText}>
                {isDownloading ? 'Downloading Template...' : 'Download Official FIR Format (.docx)'}
              </Text>
            </TouchableOpacity>
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
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    maxWidth: 820,
    width: '100%',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  backBtnText: {
    fontSize: 12,
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
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
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
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  docIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docMeta: {
    flex: 1,
  },
  docTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 2,
  },
  docSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: 18,
  },
  guidelinesBox: {
    backgroundColor: COLORS.surfaceLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.navyGov,
    borderRadius: RADIUS.sm,
    padding: 14,
    marginBottom: 24,
  },
  guidelinesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navyDark,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  guidelinesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.navyMuted,
    ...SHADOWS.subtle,
  },
  downloadButtonDisabled: {
    opacity: 0.65,
  },
  downloadText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default OfficialFIRFormat;
