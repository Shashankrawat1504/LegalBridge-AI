import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import TagList from './TagList';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

interface CaseItem {
  id: number;
  caseHeading: string;
  query: string;
  applicableArticle?: string;
  description: string;
  status: string;
  tags?: string;
}

interface CaseCardProps {
  caseItem: CaseItem;
  onShowDetails: (id: number) => void;
  onEdit: (id: number) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseItem, onShowDetails, onEdit }) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <Text style={[styles.caseHeading, { color: isDark ? '#93C5FD' : COLORS.navyGov }]} numberOfLines={2}>
          {caseItem.caseHeading}
        </Text>
        <StatusBadge status={caseItem.status} />
      </View>

      {/* Legal question */}
      <Text style={[styles.queryText, { color: theme.textSecondary }]} numberOfLines={3}>
        {caseItem.query}
      </Text>

      {/* Applicable Article chip */}
      {!!caseItem.applicableArticle && (
        <View style={[styles.articleRow, { backgroundColor: isDark ? '#1E3A5F22' : '#EFF6FF', borderColor: isDark ? '#1E40AF44' : '#BFDBFE' }]}>
          <Ionicons name="document-text-outline" size={13} color={isDark ? '#60A5FA' : COLORS.navyGov} />
          <Text style={[styles.articleChip, { color: isDark ? '#93C5FD' : COLORS.navyGov }]} numberOfLines={1}>
            {caseItem.applicableArticle}
          </Text>
        </View>
      )}

      {/* Tags */}
      <View style={styles.tagsSection}>
        <TagList tags={caseItem.tags} />
      </View>

      {/* Footer actions */}
      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => onShowDetails(caseItem.id)}
          style={[styles.actionBtn, { backgroundColor: isDark ? '#1E3A5F33' : '#EFF6FF', borderColor: isDark ? '#1E40AF55' : '#BFDBFE' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={15} color={isDark ? '#60A5FA' : COLORS.navyGov} />
          <Text style={[styles.detailsText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onEdit(caseItem.id)}
          style={[styles.actionBtn, { backgroundColor: isDark ? '#16533122' : '#DCFCE7', borderColor: isDark ? '#16533155' : '#86EFAC' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={15} color={isDark ? '#4ADE80' : COLORS.statusSuccess} />
          <Text style={[styles.editText, { color: isDark ? '#4ADE80' : COLORS.statusSuccess }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  caseHeading: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    lineHeight: 24,
  },
  queryText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  articleChip: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  tagsSection: {
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  detailsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CaseCard;