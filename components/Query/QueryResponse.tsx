import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';

interface ResponseData {
  acts?: Record<string, string>;
  description?: string;
  [key: string]: any;
}

interface QueryResponseProps {
  response: ResponseData | string;
  isLoading: boolean;
  error: string;
}

const QueryResponse: React.FC<QueryResponseProps> = ({
  response,
  isLoading,
  error
}) => {
  const { theme, isDark } = useTheme();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleDescription = (section: string): void => {
    setActiveSection(activeSection === section ? null : section);
  };

  const renderResponse = (data: ResponseData | string): React.JSX.Element => {
    if (typeof data === 'string') {
      return <Text style={[styles.responseText, { color: theme.textSecondary }]}>{data}</Text>;
    }

    if (data.acts) {
      return (
        <View>
          {Object.entries(data.acts).map(([act, description]) => (
            <View key={act} style={[styles.actContainer, { borderColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.actHeader, { backgroundColor: theme.surfaceMuted }]}
                onPress={() => toggleDescription(act)}
              >
                <Text style={[styles.actTitle, { color: theme.textPrimary }]}>{act}</Text>
                <Ionicons
                  name={activeSection === act ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
              {activeSection === act && (
                <Text style={[styles.actDescription, { color: theme.textSecondary }]}>{description}</Text>
              )}
            </View>
          ))}
        </View>
      );
    }

    return <Text style={[styles.responseText, { color: theme.textMuted }]}>No response data available</Text>;
  };

  return (
    <View style={[styles.responseBox, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: isDark ? 1 : 0 }]}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        renderResponse(response)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  responseBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  responseText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  actContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  actHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  actTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  actDescription: {
    fontSize: 14,
    color: '#6B7280',
    padding: 12,
    paddingTop: 0,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});

export default QueryResponse;