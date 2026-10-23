import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';

interface ResponseData {
  acts?: Record<string, string>;
  description?: string;
  possibleOffences?: string[];
  essentialIngredients?: string[];
  firChecklist?: string[];
  disclaimer?: string;
  [key: string]: any;
}

interface QueryResponseProps {
  response: ResponseData | string;
  isLoading: boolean;
  error: string;
  onRetry?: () => void;
  onUseLocalFallback?: () => void;
}

const QueryResponse: React.FC<QueryResponseProps> = ({
  response,
  isLoading,
  error,
  onRetry,
  onUseLocalFallback,
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

    return (
      <View style={styles.responseContent}>
        {/* Possible Offences */}
        {data.possibleOffences && data.possibleOffences.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flag-outline" size={16} color={isDark ? '#60A5FA' : '#2563EB'} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Possible Offence(s)</Text>
            </View>
            {data.possibleOffences.map((offence, idx) => (
              <Text key={idx} style={[styles.bulletText, { color: theme.textSecondary }]}>
                • {offence}
              </Text>
            ))}
          </View>
        )}

        {/* Relevant Provisions */}
        {data.acts && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book-outline" size={16} color={isDark ? '#34D399' : '#16A34A'} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Relevant Provisions</Text>
            </View>
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
        )}

        {/* Essential Ingredients */}
        {data.essentialIngredients && data.essentialIngredients.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={16} color={isDark ? '#FBBF24' : '#D97706'} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Essential Ingredients</Text>
            </View>
            {data.essentialIngredients.map((ingredient, idx) => (
              <Text key={idx} style={[styles.bulletText, { color: theme.textSecondary }]}>
                • {ingredient}
              </Text>
            ))}
          </View>
        )}

        {/* FIR / Investigation Checklist */}
        {data.firChecklist && data.firChecklist.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Ionicons name="clipboard-outline" size={16} color={isDark ? '#F87171' : '#DC2626'} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>FIR / Investigation Checklist</Text>
            </View>
            {data.firChecklist.map((item, idx) => (
              <Text key={idx} style={[styles.bulletText, { color: theme.textSecondary }]}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {/* Description */}
        {data.description && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={16} color={theme.textMuted} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Legal Analysis</Text>
            </View>
            <Text style={[styles.responseText, { color: theme.textSecondary }]}>{data.description}</Text>
          </View>
        )}

        {/* Disclaimer */}
        {data.disclaimer && (
          <View style={[styles.disclaimerBox, { backgroundColor: isDark ? '#1E293B' : '#FEF3C7', borderColor: isDark ? '#3B82F6' : '#FCD34D' }]}>
            <Ionicons name="information-circle-outline" size={14} color={isDark ? '#60A5FA' : '#D97706'} />
            <Text style={[styles.disclaimerText, { color: isDark ? '#93C5FD' : '#92400E' }]}>{data.disclaimer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.responseBox, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: isDark ? 1 : 0 }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Analyzing legal provisions & case laws…
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <Ionicons name="cloud-offline-outline" size={32} color="#DC2626" />
          </View>
          <Text style={[styles.errorTitle, { color: isDark ? '#F87171' : '#B91C1C' }]}>
            Legal Engine Notice
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>{error}</Text>

          <View style={styles.errorActions}>
            {onRetry && (
              <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
                <Ionicons name="refresh" size={15} color="#fff" />
                <Text style={styles.retryBtnText}>Retry Analysis</Text>
              </TouchableOpacity>
            )}

            {onUseLocalFallback && (
              <TouchableOpacity style={styles.localFallbackBtn} onPress={onUseLocalFallback} activeOpacity={0.8}>
                <Ionicons name="sparkles-outline" size={15} color="#2563EB" />
                <Text style={styles.localFallbackBtnText}>Local AI Fallback</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
  responseContent: {
    gap: 16,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  actContainer: {
    marginBottom: 8,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  actDescription: {
    fontSize: 13,
    color: '#6B7280',
    padding: 12,
    paddingTop: 0,
    lineHeight: 20,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  errorIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  localFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  localFallbackBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default QueryResponse;