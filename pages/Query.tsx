import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import QueryHeader from '../components/Query/QueryHeader';
import QueryInput from '../components/Query/QueryInput';
import QueryResponse from '../components/Query/QueryResponse';
import SubmitButton from '../components/Query/SubmitButton';
import { COLORS, RADIUS } from '../constants/theme';
import { API_CONFIG } from '../constants/api';
import { useTheme } from '../context/ThemeContext';
import {
  CitizenGuidance,
  getStructuredGuidance,
  FIXED_DISCLAIMER,
} from '../components/Query/fallbackGuidance';

const EXAMPLE_QUERIES = [
  'Landlord not returning deposit',
  'Unpaid salary',
  'Online UPI fraud',
  'Defective product / refund denied',
  'Neighbour harassment / noise',
  'Notice received — what should I do?',
  'Consumer complaint basics',
  'Workplace unfair treatment',
];

const Query: React.FC = () => {
  const { theme } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [guidance, setGuidance] = useState<CitizenGuidance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // In-memory cache of last 10 query -> response pairs for instant repeat demos
  const responseCache = useRef<Map<string, CitizenGuidance>>(new Map());

  const handleQuerySubmit = async (): Promise<void> => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError('');

    const cacheKey = trimmed.toLowerCase();

    // 1. Instant Cache Check
    if (responseCache.current.has(cacheKey)) {
      setGuidance(responseCache.current.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    try {
      // 2. Fetch with 10s AbortController timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENCODE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      // Normalize response or fall back to structured local guidance if invalid/error
      if (data && !data.error && (data.description || data.acts)) {
        const rightsList: string[] = [];
        if (data.acts) {
          Object.entries(data.acts).forEach(([act, desc]) => {
            rightsList.push(`${act}: ${desc}`);
          });
        }
        if (rightsList.length === 0) {
          rightsList.push('Right to legal remedy and non-discrimination under Indian law.');
        }

        const normalized: CitizenGuidance = {
          summary: data.description || `Plain-language guidance for: "${trimmed}".`,
          possibleIssues: data.possibleOffences || [
            'Evaluation of statutory and civil remedies',
            'Documentation of factual sequence and claims',
          ],
          yourRights: rightsList,
          nextSteps: data.firChecklist || [
            'Send a formal, polite written communication to the concerned party.',
            'Gather all matching receipts, agreements, and chat records.',
            'If unresolved within 7–14 days, consider legal notice or statutory helpline escalation.',
          ],
          documentsToKeep: [
            'All written agreements, invoices, or payment slips',
            'Bank account statements showing debits or transfers',
            'Chronological communication record (emails, SMS, chat transcripts)',
          ],
          whenToSeeLawyer:
            'If substantial financial value is involved, or if you receive a formal legal notice or court summons.',
          relatedTools: [
            { label: 'Letter Templates', route: 'LetterTemplates', icon: 'mail-outline' },
            { label: 'Citizen Action Guides', route: 'Guides', icon: 'book-outline' },
            { label: 'Find Help (Helplines)', route: 'Helplines', icon: 'call-outline' },
          ],
          disclaimer: FIXED_DISCLAIMER,
        };

        // Update Cache (max 10 items)
        if (responseCache.current.size >= 10) {
          const oldestKey = responseCache.current.keys().next().value;
          if (oldestKey) responseCache.current.delete(oldestKey);
        }
        responseCache.current.set(cacheKey, normalized);

        setGuidance(normalized);
      } else {
        // Fallback to structured local guidance
        useLocalFallback(trimmed);
      }
    } catch {
      // Automatic fallback on network failure or abort timeout
      useLocalFallback(trimmed);
    } finally {
      setIsLoading(false);
    }
  };

  const useLocalFallback = (text: string) => {
    const fallback = getStructuredGuidance(text);
    const cacheKey = text.toLowerCase().trim();

    if (responseCache.current.size >= 10) {
      const oldestKey = responseCache.current.keys().next().value;
      if (oldestKey) responseCache.current.delete(oldestKey);
    }
    responseCache.current.set(cacheKey, fallback);

    setGuidance(fallback);
  };

  const handleSelectExample = (example: string) => {
    setQuery(example);
  };

  const handleClear = () => {
    setQuery('');
    setGuidance(null);
    setError('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Utilities" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header + Subtitle + Back to Tools */}
        <QueryHeader />

        <View style={styles.content}>
          {/* 2. Example Chips (Citizen Scenarios) */}
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
            Common Citizen Questions (tap to fill):
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {EXAMPLE_QUERIES.map((example) => (
              <TouchableOpacity
                key={example}
                style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handleSelectExample(example)}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles-outline" size={13} color={COLORS.accentGoldDark} />
                <Text style={[styles.chipText, { color: theme.textSecondary }]}>{example}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 3. Query Input (Multiline) */}
          <QueryInput
            value={query}
            onChangeText={setQuery}
            showMic={false}
          />

          {/* 4. Primary Button: "Get guidance" */}
          <View style={styles.buttonWrapper}>
            <SubmitButton
              title="Get guidance"
              onPress={handleQuerySubmit}
              disabled={!query.trim() || isLoading}
            />
          </View>

          {/* 5. Results Panel (Structured Layout) */}
          <QueryResponse
            guidance={guidance}
            isLoading={isLoading}
            error={error}
            onRetry={handleQuerySubmit}
            onClear={handleClear}
          />
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full ?? 99,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonWrapper: {
    marginBottom: 20,
  },
});

export default Query;