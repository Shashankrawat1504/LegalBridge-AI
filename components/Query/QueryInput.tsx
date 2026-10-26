import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

import { useTheme } from '../../context/ThemeContext';
import DraftingCoPilot from '../DraftingCoPilot';

interface QueryInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showMic?: boolean;
}

const QueryInput: React.FC<QueryInputProps> = ({
  value,
  onChangeText,
  placeholder = "Describe your situation in your own words (e.g. My landlord refuses to refund my security deposit after I vacated...)",
  showMic = false,
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
      </View>

      <DraftingCoPilot
        text={value}
        onApplySuggestion={onChangeText}
        onInsertSection={(sec) => {
          const addition = ` [${sec}]`;
          onChangeText(value ? `${value}${addition}` : sec);
        }}
        mode="query"
        showMic={showMic}
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
});

export default QueryInput;