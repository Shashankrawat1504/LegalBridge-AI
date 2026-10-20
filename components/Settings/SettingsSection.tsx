import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';

interface SettingsSectionProps {
  title: string;
  description?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  iconName,
  iconColor = '#1e3a8a',
  children
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={iconName} size={24} color={isDark ? '#60a5fa' : iconColor} />
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      </View>
      {description && (
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>{description}</Text>
      )}
      <View style={[styles.sectionContent, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: isDark ? 1 : 0 }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    margin: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default SettingsSection;