import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

interface UtilityCardProps {
  name: string;
  icon: string;
  description: string;
  onPress: () => void;
  category?: string;
  badge?: string;
}

const UtilityCard: React.FC<UtilityCardProps> = ({
  name,
  icon,
  description,
  onPress,
  category = "OPERATIONAL TOOL",
  badge,
}) => {
  const { theme } = useTheme();
  // Ensure we use thin-line icon outline variant
  const iconName = icon.endsWith('-outline') ? icon : `${icon}-outline`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
        <Ionicons name={iconName as any} size={22} color={COLORS.navyGov} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.categoryText}>{category}</Text>
          {badge && (
            <View style={[styles.badgePill, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <Text style={[styles.badgePillText, { color: theme.textSecondary }]}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{name}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  badgePill: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.navyGov,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  arrowContainer: {
    marginLeft: 12,
    padding: 4,
  },
});

export default UtilityCard;