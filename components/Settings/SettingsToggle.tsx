import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

interface SettingsToggleProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }, disabled && styles.disabledText]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }, disabled && styles.disabledText]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#cbd5e1', true: '#10b981' }}
        thumbColor={value ? '#fff' : '#f1f5f9'}
        ios_backgroundColor="#cbd5e1"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default SettingsToggle;