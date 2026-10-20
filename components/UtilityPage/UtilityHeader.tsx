import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, RADIUS } from '../../constants/theme';

interface UtilityHeaderProps {
  title?: string;
  subtitle?: string;
}

const UtilityHeader: React.FC<UtilityHeaderProps> = ({
  title = "Law Enforcement & Legal Tools Directory",
  subtitle = "Official digital resources authorized for statutory verification, case documentation, and legal intelligence."
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.headerContent}>
        <View style={[styles.badge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
          <Text style={styles.badgeText}>OPERATIONAL MODULES</Text>
        </View>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    maxWidth: 800,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },
  badge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.navyGov,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.navyDark,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 640,
  },
});

export default UtilityHeader;