import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

interface FormButtonProps {
  title: string;
  loadingTitle: string;
  isLoading: boolean;
  onPress: () => void;
  iconName: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
}

const FormButton: React.FC<FormButtonProps> = ({
  title,
  loadingTitle,
  isLoading,
  onPress,
  iconName,
  backgroundColor = COLORS.navyGov,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.85}
    >
      <View style={[styles.buttonContent, isLoading && styles.buttonContentDisabled, { backgroundColor }]}>
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Ionicons name={iconName} size={18} color={COLORS.white} />
        )}
        <Text style={styles.buttonText}>
          {isLoading ? loadingTitle : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.navyMuted,
    ...SHADOWS.subtle,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonContentDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});

export default FormButton;