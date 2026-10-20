import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

import { useTheme } from '../../context/ThemeContext';
import DraftingCoPilot from '../DraftingCoPilot';

interface QueryInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onMicPress: () => void;
  isListening: boolean;
  placeholder?: string;
}

const QueryInput: React.FC<QueryInputProps> = ({
  value,
  onChangeText,
  onMicPress,
  isListening,
  placeholder = "Type your statutory query, offence description, or section inquiry..."
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.outerContainer}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
              color: theme.textPrimary,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.micButton,
            { backgroundColor: theme.surface, borderColor: theme.border },
            isListening && styles.micActive,
          ]}
          onPress={onMicPress}
          activeOpacity={0.8}
          accessibilityLabel="Voice Input"
        >
          <Ionicons
            name={isListening ? "mic" : "mic-outline"}
            size={20}
            color={isListening ? COLORS.white : (isDark ? '#60A5FA' : COLORS.navyGov)}
          />
        </TouchableOpacity>
      </View>

      <DraftingCoPilot
        text={value}
        onApplySuggestion={onChangeText}
        onInsertSection={(sec) => {
          const addition = ` [${sec}]`;
          onChangeText(value ? `${value}${addition}` : sec);
        }}
        mode="query"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.navyDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 84,
    textAlignVertical: 'top',
    ...SHADOWS.subtle,
  },
  micButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  micActive: {
    backgroundColor: COLORS.navyGov,
    borderColor: COLORS.navyMuted,
  },
});

export default QueryInput;