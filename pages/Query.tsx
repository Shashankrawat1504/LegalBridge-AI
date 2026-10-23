import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import QueryHeader from '../components/Query/QueryHeader';
import QueryInput from '../components/Query/QueryInput';
import QueryResponse from '../components/Query/QueryResponse';
import SubmitButton from '../components/Query/SubmitButton';
import CasePopup from '../components/Query/CasePopup';
import CaseModal from '../components/Query/CaseModal';
import { COLORS, RADIUS } from '../constants/theme';
import { API_CONFIG } from '../constants/api';
import { useTheme } from '../context/ThemeContext';
import { generateFallbackCoPilot } from '../components/DraftingCoPilot';

interface CaseDetails {
  caseHeading: string;
  userQuery: string;
  tags: string;
  description: string;
  caseStatus: string;
}

interface ResponseData {
  acts?: Record<string, string>;
  description?: string;
  error?: string;
  possibleOffences?: string[];
  essentialIngredients?: string[];
  firChecklist?: string[];
  disclaimer?: string;
  [key: string]: any;
}

const Query: React.FC = () => {
  const { theme } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<ResponseData | string>('Response will appear here...');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [caseDetails, setCaseDetails] = useState<CaseDetails>({
    caseHeading: '',
    userQuery: '',
    tags: '',
    description: '',
    caseStatus: 'closed',
  });

  // Response cache for instant repeat demos
  const responseCache = useRef<Map<string, ResponseData>>(new Map());

  // Example query chips for quick demo
  const EXAMPLE_QUERIES = [
    'Theft of mobile',
    'Snatching',
    'House burglary',
    'Cheating / fraud',
    'Assault / hurt',
    'Criminal intimidation',
    'Cyber fraud (UPI)',
    'Trespass',
  ];

  const handleQuerySubmit = async (): Promise<void> => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    // Check cache first for instant response
    const cacheKey = query.trim().toLowerCase();
    if (responseCache.current.has(cacheKey)) {
      const cached = responseCache.current.get(cacheKey)!;
      setResponse(cached);
      setCaseDetails({
        caseHeading: 'New Case Identified',
        userQuery: query,
        tags: 'legal query, BNS, investigation',
        description: cached.description || 'Detailed case description here.',
        caseStatus: 'under investigation',
      });
      setShowPopup(true);
      setIsLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENCODE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data: ResponseData = await res.json();

      // Detect backend-level failures even when HTTP status is 200
      if (data.error || (!data.acts && !data.description)) {
        // Auto-run local fallback instead of showing error
        handleUseLocalAnalysis();
        return;
      }

      // Cache successful response (limit to last 10)
      if (responseCache.current.size >= 10) {
        const firstKey = responseCache.current.keys().next().value;
        if (firstKey) {
          responseCache.current.delete(firstKey);
        }
      }
      responseCache.current.set(cacheKey, data);

      setResponse(data);
      setCaseDetails({
        caseHeading: 'New Case Identified',
        userQuery: query,
        tags: 'legal query, BNS, investigation',
        description: data.description || 'Detailed case description here.',
        caseStatus: 'under investigation',
      });
      setShowPopup(true);
    } catch (err: any) {
      // Auto-run local fallback on any network error/timeout
      handleUseLocalAnalysis();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseLocalAnalysis = (): void => {
    setError('');
    const fallback = generateFallbackCoPilot(query, 'query');
    const actsObj: Record<string, string> = {};
    fallback.detailedSections.forEach((ds) => {
      actsObj[ds.section] = `${ds.reason} (Confidence: ${ds.confidence}%)`;
    });

    const structuredResponse: ResponseData = {
      acts: actsObj,
      description: fallback.improvedPhrasing,
      possibleOffences: [fallback.detectedOffenceType || 'Cognizable Criminal Offence'],
      essentialIngredients: fallback.detailedSections.map(ds => ds.reason),
      firChecklist: fallback.missingElements,
      disclaimer: 'Guidance only — not a substitute for IO / legal determination.',
    };

    setResponse(structuredResponse);
    setCaseDetails({
      caseHeading: fallback.detectedOffenceType || 'Legal Intelligence Analysis',
      userQuery: query,
      tags: `${fallback.detectedOffenceType || 'legal'}, BNS, BNSS`,
      description: fallback.improvedPhrasing,
      caseStatus: 'under review',
    });
    setShowPopup(true);
  };

  const handleSaveCase = async (): Promise<void> => {
    const payload = {
      cases: [
        {
          id: 4,
          caseHeading: caseDetails.caseHeading,
          applicableArticle: caseDetails.description,
        },
      ],
    };

    try {
      await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CASE_SAVE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      Alert.alert('Success', 'Case saved successfully');
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to save case');
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setCaseDetails({ ...caseDetails, [key]: value });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QueryHeader />

        <View style={styles.content}>
          <QueryResponse
            response={response}
            isLoading={isLoading}
            error={error}
            onRetry={handleQuerySubmit}
            onUseLocalFallback={handleUseLocalAnalysis}
          />

          {/* Example Query Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {EXAMPLE_QUERIES.map((example) => (
              <TouchableOpacity
                key={example}
                style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setQuery(example)}
                activeOpacity={0.7}
              >
                <Ionicons name="flash-outline" size={12} color={theme.textMuted} />
                <Text style={[styles.chipText, { color: theme.textSecondary }]}>{example}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <QueryInput
            value={query}
            onChangeText={setQuery}
            showMic={false}
          />

          <SubmitButton onPress={handleQuerySubmit} disabled={!query.trim() || isLoading} />

          <CasePopup
            visible={showPopup}
            onPress={() => {
              setShowPopup(false);
              setModalVisible(true);
            }}
          />

          <CaseModal
            visible={modalVisible}
            caseDetails={caseDetails}
            onClose={() => setModalVisible(false)}
            onSave={handleSaveCase}
            onInputChange={handleInputChange}
          />
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceLight },
  scrollContainer: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full ?? 99,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Query;