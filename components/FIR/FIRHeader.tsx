import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADIUS } from '../../constants/theme';

import { useTheme } from '../../context/ThemeContext';

interface FIRHeaderProps {
  title?: string;
  subtitle?: string;
}

const FIRHeader: React.FC<FIRHeaderProps> = ({
  title = "Official FIR Builder & Generator",
  subtitle = "Draft standard First Information Reports compliant with Section 173 of Bharatiya Nagarik Suraksha Sanhita (BNSS)."
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.headerContent}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={18} color={COLORS.navyGov} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <View style={[styles.badge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
            <Text style={styles.badgeText}>POLICE PROCEDURAL MODULE</Text>
          </View>
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
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    maxWidth: 900,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 6,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    maxWidth: 720,
  },
});

export default FIRHeader;