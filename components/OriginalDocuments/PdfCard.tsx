import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

interface PdfItem {
  id: number;
  act_name: string;
  description: string;
}

interface PdfCardProps {
  pdf: PdfItem;
  onDownload: (id: number) => void;
  isDownloading?: boolean;
}

const PdfCard: React.FC<PdfCardProps> = ({ pdf, onDownload, isDownloading = false }) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1E3A5F33' : '#EFF6FF', borderColor: isDark ? '#1E40AF44' : '#BFDBFE' }]}>
          <Ionicons name="document-text-outline" size={20} color={isDark ? '#60A5FA' : COLORS.navyGov} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: isDark ? '#93C5FD' : COLORS.navyGov }]} numberOfLines={2}>
            {pdf.act_name}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={3}>
            {pdf.description}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.downloadButton, isDownloading && styles.downloadingButton]}
        onPress={() => onDownload(pdf.id)}
        disabled={isDownloading}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isDownloading ? 'hourglass-outline' : 'download-outline'}
          size={16}
          color={isDownloading ? '#6B7280' : '#fff'}
        />
        <Text style={[styles.downloadText, isDownloading && styles.downloadingText]}>
          {isDownloading ? 'Downloading...' : 'Download'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-end',
  },
  downloadingButton: {
    backgroundColor: '#D1D5DB',
  },
  downloadText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  downloadingText: {
    color: '#6B7280',
  },
});

export default PdfCard;