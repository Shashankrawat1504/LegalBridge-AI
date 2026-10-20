import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import SpeechToText from 'react-native-voice';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import QueryHeader from '../components/Query/QueryHeader';
import QueryInput from '../components/Query/QueryInput';
import QueryResponse from '../components/Query/QueryResponse';
import SubmitButton from '../components/Query/SubmitButton';
import CasePopup from '../components/Query/CasePopup';
import CaseModal from '../components/Query/CaseModal';
import { COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

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
  [key: string]: any;
}

const Query: React.FC = () => {
  const { theme } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<ResponseData | string>('Response will appear here...');
  const [isListening, setIsListening] = useState<boolean>(false);
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

  // ── Voice Search: bind result listener so spoken text fills the input ─────
  useEffect(() => {
    SpeechToText.onSpeechResults = (e: any) => {
      const spoken = e?.value?.[0];
      if (spoken) setQuery(spoken);
      setIsListening(false);
    };
    SpeechToText.onSpeechError = () => setIsListening(false);

    return () => {
      SpeechToText.onSpeechResults = undefined as any;
      SpeechToText.onSpeechError = undefined as any;
    };
  }, []);

  const handleMicClick = async (): Promise<void> => {
    // Web Speech API fallback for Chrome / Edge browser
    if (
      typeof window !== 'undefined' &&
      ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)
    ) {
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SR();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setIsListening(true);
      recognition.onresult = (event: any) => {
        setQuery(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
      return;
    }

    // Native mobile voice via react-native-voice
    try {
      if (isListening) {
        await SpeechToText.stopListening();
        setIsListening(false);
      } else {
        await SpeechToText.startListening();
        setIsListening(true);
      }
    } catch {
      setIsListening(false);
    }
  };

  const handleQuerySubmit = async (): Promise<void> => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('https://sih-backend-881i.onrender.com/encode/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data: ResponseData = await res.json();

      // Detect backend-level failures even when HTTP status is 200
      if (data.error || (!data.acts && !data.description)) {
        setError(
          'The AI legal reasoning engine is currently unreachable. The backend database server is offline — please try again later.'
        );
        return;
      }

      setResponse(data);
      setCaseDetails({
        caseHeading: 'New Case Identified',
        userQuery: query,
        tags: 'legal query, IPC, investigation',
        description: data.description || 'Detailed case description here.',
        caseStatus: 'under investigation',
      });
      setShowPopup(true);
    } catch {
      setError('Network error — unable to reach the AI legal server. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
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
      await fetch('https://sih-backend-881i.onrender.com/case_save/', {
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
          <QueryResponse response={response} isLoading={isLoading} error={error} />

          <QueryInput
            value={query}
            onChangeText={setQuery}
            onMicPress={handleMicClick}
            isListening={isListening}
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
});

export default Query;