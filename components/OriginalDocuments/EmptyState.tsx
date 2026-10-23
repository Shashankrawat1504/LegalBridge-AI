import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No documents found',
  subMessage = 'Try adjusting your search criteria or check back later.',
  iconName = 'folder-open-outline',
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={48} color={theme.textMuted} />
      <Text style={[styles.message, { color: theme.textPrimary }]}>{message}</Text>
      <Text style={[styles.subMessage, { color: theme.textSecondary }]}>{subMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 10,
  },
  message: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmptyState;