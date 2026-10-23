import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { API_CONFIG } from '../constants/api';
import { useTheme } from '../context/ThemeContext';
import VoiceDictation from './VoiceDictation';

export interface DetailedSection {
  section: string;
  reason: string;
  confidence: number; // 0-100
}

export interface CoPilotSuggestion {
  relevantSections: string[];
  detailedSections: DetailedSection[];
  improvedPhrasing: string;
  missingElements: string[];
  citations: string[];
  hindiSuggestion?: string;
  detectedOffenceType?: string;
}

interface DraftingCoPilotProps {
  text: string;
  onApplySuggestion: (improvedText: string) => void;
  onInsertSection?: (section: string) => void;
  mode?: 'fir' | 'query' | 'general';
  compact?: boolean;
  showMic?: boolean;
  metadata?: {
    date?: string;
    time?: string;
    location?: string;
    complainant?: string;
  };
  onRequestAutoFill?: () => void;
}

// ── Heuristic Fallback Engine ──────────────────────────────────────────────────
export function generateFallbackCoPilot(text: string, mode: 'fir' | 'query' | 'general' = 'fir'): CoPilotSuggestion {
  const lower = text.toLowerCase();

  const isCyber = /cyber|otp|phishing|apk|hacked|online|telegram|whatsapp|link|unauthorized|crypto|upi|wallet fraud/i.test(lower);
  const isTheft = /theft|stolen|stole|snatch|snatched|robbed|robbery|loot|wallet|mobile|chain|bag|money|cash|vehicle theft|pickpocket/i.test(lower);
  const isCheating = /cheat|fraud|forged|forgery|money transfer|invest|fake|misappropriat|scam|duped|allotment|deed/i.test(lower);
  const isAssault = /beat|hit|assault|hurt|injur|weapon|knife|attack|fight|slap|fracture|blood|hospital/i.test(lower);
  const isThreat = /threat|threatened|kill|abuse|extort|blackmail|ransom/i.test(lower);

  if (isCyber) {
    return {
      detectedOffenceType: 'Cyber Financial Fraud & Impersonation',
      relevantSections: [
        'Section 66D IT Act (Cheating by personation using computer resource)',
        'Section 318(4) BNS (Cheating & dishonestly inducing delivery of property - IPC 420)',
        'Section 66C IT Act (Identity theft / electronic credential fraud)',
        'Section 316(2) BNS (Criminal breach of trust - IPC 406)',
      ],
      detailedSections: [
        {
          section: 'Section 66D IT Act',
          reason: 'Cheating by personation using electronic communications, phishing links, or spoofed portals.',
          confidence: 96,
        },
        {
          section: 'Section 318(4) BNS / IPC 420',
          reason: 'Dishonest inducement causing financial delivery into unauthorized beneficiary accounts.',
          confidence: 94,
        },
        {
          section: 'Section 66C IT Act',
          reason: 'Fraudulent or dishonest use of victim’s unique credentials, OTP, or digital signatures.',
          confidence: 88,
        },
        {
          section: 'Section 316(2) BNS / IPC 406',
          reason: 'Criminal breach of trust regarding electronic funds transferred under false pretences.',
          confidence: 79,
        },
      ],
      improvedPhrasing:
        `On the date and time specified herein, the complainant was targeted by unknown cyber perpetrators through deceptive electronic communications. The accused fraudulently obtained unauthorized access, impersonated legitimate authorities, and induced an illicit financial transfer amounting to the disputed sum without the complainant’s informed consent.`,
      missingElements: [
        'Transaction ID, UTR number, and beneficiary bank/UPI identifiers',
        'Specific originating phone number, APK link, or web URL used by suspects',
        'National Cyber Crime Reporting Portal (1930) acknowledgement number',
      ],
      citations: [
        'Arjun Panditrao Khotkar vs. Kailash Kushanrao Gorantyal (Supreme Court: mandatory protocol for digital certificates)',
      ],
      hindiSuggestion:
        'अज्ञात साइबर अपराधियों द्वारा प्रार्थी से इलेक्ट्रॉनिक माध्यम से धोखाधड़ी कर अनधिकृत वित्तीय लेनदेन किया गया तथा बैंक राशि का गबन किया गया।',
    };
  }

  if (isTheft) {
    return {
      detectedOffenceType: 'Theft / Snatching / Dispossession',
      relevantSections: [
        'Section 304 BNS (Snatching - specialized under new Bharatiya Nyaya Sanhita)',
        'Section 303(2) BNS (Theft - erstwhile Section 379 IPC)',
        'Section 309 BNS (Robbery - erstwhile Section 392 IPC)',
        'Section 317(2) BNS (Stolen property receiving/retaining - IPC 411)',
      ],
      detailedSections: [
        {
          section: 'Section 304 BNS (Snatching)',
          reason: 'Sudden or aggressive physical dispossession of movable property from the person of complainant.',
          confidence: 97,
        },
        {
          section: 'Section 303(2) BNS / IPC 379',
          reason: 'Dishonest removal of movable property out of lawful possession without consent.',
          confidence: 95,
        },
        {
          section: 'Section 309 BNS / IPC 392',
          reason: 'Theft committed with accompanying use of force, restraint, or imminent physical threat.',
          confidence: 89,
        },
        {
          section: 'Section 317(2) BNS / IPC 411',
          reason: 'Dishonest receipt or retention of dispossessed stolen property with knowledge.',
          confidence: 82,
        },
      ],
      improvedPhrasing:
        `The complainant was intercepted by the accused persons who, acting with premeditation and dishonest intention, unlawfully dispossessed and forcibly removed valuable personal property (described hereunder) from the complainant’s lawful custody without consent.`,
      missingElements: [
        'Exact identification marks, brand, serial/IMEI numbers of stolen items',
        'Estimated aggregate monetary valuation of dispossessed articles',
        'Direction of flight and vehicle make/registration of fleeing suspects',
      ],
      citations: [
        'State of Maharashtra vs. Vishwanath (Supreme Court: essentials of dishonest moving of property)',
      ],
      hindiSuggestion:
        'अज्ञात अभियुक्तों द्वारा बेईमानी के आशय से प्रार्थी की सहमति के बिना उसके सामान को बलपूर्वक छीनकर चोरी की गई।',
    };
  }

  if (isCheating) {
    return {
      detectedOffenceType: 'Cheating, Fraud & Criminal Breach of Trust',
      relevantSections: [
        'Section 318(4) BNS (Cheating & dishonestly inducing delivery of property - IPC 420)',
        'Section 336 BNS (Forgery for purpose of cheating - IPC 468)',
        'Section 340 BNS (Using forged document as genuine - IPC 471)',
        'Section 316 BNS (Criminal Breach of Trust - IPC 405/406)',
      ],
      detailedSections: [
        {
          section: 'Section 318(4) BNS / IPC 420',
          reason: 'Fraudulent inducement made at inception causing complainant to part with substantial property.',
          confidence: 96,
        },
        {
          section: 'Section 336 BNS / IPC 468',
          reason: 'Fabrication and execution of false deeds or clearance certificates for fraudulent purposes.',
          confidence: 92,
        },
        {
          section: 'Section 340 BNS / IPC 471',
          reason: 'Fraudulent presentation of forged instruments as genuine to deceive the complainant.',
          confidence: 90,
        },
        {
          section: 'Section 316 BNS / IPC 406',
          reason: 'Dishonest misappropriation of funds entrusted under fiduciary or partnership arrangement.',
          confidence: 84,
        },
      ],
      improvedPhrasing:
        `The accused persons dishonestly induced the complainant through fraudulent assurances and fabricated representations made at the inception of the transaction, thereby causing wrongful gain to themselves and commensurate wrongful loss to the complainant.`,
      missingElements: [
        'Documentary evidence showing false representations made at the very outset',
        'Certified bank statements evidencing financial outflow to the accused',
        'Names and statements of witnesses present during initial representations',
      ],
      citations: [
        'Hridaya Ranjan Prasad Verma vs. State of Bihar (Supreme Court: fraudulent intent at inception is mandatory)',
      ],
      hindiSuggestion:
        'अभियुक्तों ने प्रार्थी को झूठे प्रलोभन व फर्जी दस्तावेज दिखाकर छलपूर्वक धनराशि प्राप्त की तथा आपराधिक विश्वासघात किया।',
    };
  }

  if (isAssault || isThreat) {
    return {
      detectedOffenceType: 'Assault, Grievous Hurt & Criminal Intimidation',
      relevantSections: [
        'Section 115(2) BNS (Voluntarily causing hurt - IPC 323)',
        'Section 118(1) BNS (Voluntarily causing hurt by dangerous weapons - IPC 324)',
        'Section 351(2) BNS (Criminal intimidation with threat to cause death/hurt - IPC 506)',
        'Section 3(5) BNS (Common intention / joint liability - IPC 34)',
      ],
      detailedSections: [
        {
          section: 'Section 115(2) BNS / IPC 323',
          reason: 'Bodily injury, pain, or infirmity voluntarily caused to the complainant by physical assault.',
          confidence: 95,
        },
        {
          section: 'Section 118(1) BNS / IPC 324',
          reason: 'Use of blunt/sharp instruments, rods, or weapons likely to cause grievous harm.',
          confidence: 91,
        },
        {
          section: 'Section 351(2) BNS / IPC 506',
          reason: 'Threatening injury to person, life, or property with intent to cause severe alarm.',
          confidence: 88,
        },
        {
          section: 'Section 3(5) BNS / IPC 34',
          reason: 'Acts performed jointly by several persons acting in furtherance of a shared common intention.',
          confidence: 85,
        },
      ],
      improvedPhrasing:
        `The accused persons formed an unlawful common intention, mounted an unprovoked physical assault upon the complainant using dangerous instruments, inflicted bodily injuries, and issued grave criminal intimidation threatening life and limb.`,
      missingElements: [
        'Medico-Legal Case (MLC) number, date of examination, and hospital name',
        'Specific description of weapons or instruments brandished/utilized',
        'Independent eyewitness testimonies from residents or passersby',
      ],
      citations: [
        'Bishna vs. State of West Bengal (Supreme Court: corroborative weight of medical evidence in assault)',
      ],
      hindiSuggestion:
        'अभियुक्तों द्वारा एकराय होकर प्रार्थी पर जानलेवा हमला कर गंभीर चोटें पहुंचाई गईं तथा जान से मारने की धमकी दी गई।',
    };
  }

  // Generalized Cognizable Offence
  return {
    detectedOffenceType: 'Cognizable Criminal Offence',
    relevantSections: [
      'Section 173 BNSS (Information in cognizable cases / FIR registration - CrPC 154)',
      'Section 3(5) BNS (Joint liability & common intention - IPC 34)',
      'Section 324 BNS (Mischief causing damage to property - IPC 425/427)',
    ],
    detailedSections: [
      {
        section: 'Section 173 BNSS (CrPC 154)',
        reason: 'Mandatory statutory duty of police to register an FIR upon disclosure of cognizable offences.',
        confidence: 98,
      },
      {
        section: 'Section 3(5) BNS (IPC 34)',
        reason: 'Joint participation and shared criminal intention in the commission of unlawful acts.',
        confidence: 86,
      },
      {
        section: 'Section 324 BNS (IPC 427)',
        reason: 'Unlawful destruction or deterioration of property value caused by overt acts of accused.',
        confidence: 80,
      },
    ],
    improvedPhrasing:
      `The complainant hereby reports that the events set forth herein occurred within the territorial jurisdiction of this Police Station, establishing prima facie commission of a cognizable offence requiring statutory investigation under the Bharatiya Nagarik Suraksha Sanhita, 2023.`,
    missingElements: [
      'Specific date, time, and physical locus coordinates of the incident',
      'Clear identification or physical description of named and unnamed accused',
      'Detailed inventory of dispossessed property, injuries, or monetary loss',
    ],
    citations: [
      'Lalita Kumari vs. Govt. of U.P. (Supreme Court: mandatory registration of FIR in cognizable matters)',
    ],
    hindiSuggestion:
      'प्रार्थी निवेदन करता है कि घटित घटना संज्ञेय अपराध की श्रेणी में आती है, अतः उचित कानूनी धाराओं में अभियोग पंजीकृत किया जाए।',
  };
}

// ── Court-Ready FIR Template Generator ─────────────────────────────────────────
export function generateCourtReadyFIRTemplate(
  userText: string,
  suggestion: CoPilotSuggestion,
  metadata?: { date?: string; time?: string; location?: string; complainant?: string },
  isHindi: boolean = false
): string {
  const dateStr = metadata?.date
    ? `${metadata.date}${metadata.time ? ` at ${metadata.time} hrs` : ''}`
    : '[Date & Time of Occurrence, e.g. 15/08/2024 at 18:30 hrs]';
  const placeStr = metadata?.location?.trim() || '[Place of Occurrence / Location coordinates within PS jurisdiction]';
  const complainantStr = metadata?.complainant?.trim() || '[Complainant Full Name, S/o or D/o, Age, Address & Phone]';

  const sectionsFormatted = suggestion.detailedSections && suggestion.detailedSections.length > 0
    ? suggestion.detailedSections
        .map(
          (s, idx) =>
            `   (${String.fromCharCode(97 + idx)}) ${s.section} [${s.confidence}% Match]\n       Rationale: ${s.reason}`
        )
        .join('\n')
    : suggestion.relevantSections.map((s, idx) => `   (${String.fromCharCode(97 + idx)}) ${s}`).join('\n');

  const missingList = suggestion.missingElements.length > 0
    ? suggestion.missingElements.map((m) => `   • Action Required: Provide / verify ${m}`).join('\n')
    : '';

  if (isHindi) {
    return `प्रथम सूचना रिपोर्ट एवं औपचारिक शिकायत पत्र
(धारा 173 भारतीय नागरिक सुरक्षा संहिता, 2023 / धारा 154 दंड प्रक्रिया संहिता के अंतर्गत)

1. घटना का दिनांक, समय एवं स्थान:
   • दिनांक व समय: ${dateStr}
   • घटना स्थल: ${placeStr}

2. शिकायतकर्ता का विवरण:
   • प्रार्थी/शिकायतकर्ता: ${complainantStr}

3. घटना का क्रमिक विवरण एवं तथ्य:
${suggestion.hindiSuggestion || suggestion.improvedPhrasing || userText}

4. अभियुक्तों की भूमिका व हुलिया / विवरण:
   • अभियुक्तों का विवरण: अज्ञात / नामजद अभियुक्तों द्वारा पूर्व-नियोजित षड्यंत्र एवं सामान्य आशय से अपराध कारित किया गया।

5. चोरी/क्षतिग्रस्त संपत्ति या चोटों का विवरण:
   • संपत्ति / क्षति विवरण: [चोरी हुई वस्तु, धनराशि, बैंक ट्रांजैक्शन संदर्भ या चोट का विवरण]

6. आकर्षित होने वाली वैधानिक धाराएं (BNS / IPC):
${sectionsFormatted}

7. कानूनी प्रार्थना / अनुतोष:
अतः श्रीमान जी से विनम्र निवेदन है कि उपरोक्त संज्ञेय अपराध के संबंध में अविलंब प्राथमिकी (FIR) दर्ज कर कानूनी जांच शुरू की जाए, दोषियों के विरुद्ध सख्त दंडात्मक कार्रवाई की जाए तथा प्रार्थी को न्याय प्रदान किया जाए।

हस्ताक्षर / अंगूठा निशान: _______________
शिकायतकर्ता
दिनांक: _______________`;
  }

  return `FORMAL COMPLAINT & FIRST INFORMATION REPORT
(Under Section 173 Bharatiya Nagarik Suraksha Sanhita, 2023 / Section 154 Cr.P.C.)

1. DATE, TIME & PLACE OF OCCURRENCE:
   • Date & Time: ${dateStr}
   • Place of Occurrence: ${placeStr}

2. COMPLAINANT STATEMENT & PARTICULARS:
   • Complainant: ${complainantStr}

3. CHRONOLOGICAL FACTS & SEQUENCE OF EVENTS:
${suggestion.improvedPhrasing || userText}

${userText.trim().length > 30 && userText.trim() !== suggestion.improvedPhrasing.trim() ? `[Original Complainant Note: "${userText.trim()}"]\n` : ''}4. ROLE, IDENTITY & MODUS OPERANDI OF ACCUSED:
   • The accused persons acted with premeditation and unlawful common intention, committing overt acts without lawful authority or justification.

5. PARTICULARS OF PROPERTY / INJURIES / FINANCIAL LOSS:
   • Dispossessed Property / Injury Details: [Specify items, serial/IMEI numbers, bank UTRs, or medical MLC reference]
${missingList ? `\n[EVIDENTIARY VERIFICATION CHECKLIST]:\n${missingList}\n` : ''}
6. STATUTORY OFFENCES PRIMA FACIE ATTRACTED:
The facts disclosed herein disclose the commission of cognizable offences punishable under:
${sectionsFormatted}

7. FORMAL PRAYER & STATUTORY SUBMISSION:
It is most respectfully submitted that an FIR under the aforementioned sections be formally registered, immediate investigative steps including spot panchnama and forensic recovery be initiated, and the perpetrators be apprehended and dealt with in accordance with the law.

Sd/-
Complainant
Date: [Current Date]`;
}

function buildCoPilotPrompt(text: string, mode: 'fir' | 'query' | 'general'): string {
  const schema = `{
  "detectedOffenceType": "e.g. Theft / Snatching / Cyber Fraud",
  "relevantSections": ["BNS/IPC section + short reason"],
  "detailedSections": [
    {
      "section": "Section 304 BNS (Snatching) / IPC 379",
      "reason": "Forceful dispossession of mobile while in motion",
      "confidence": 96
    }
  ],
  "improvedPhrasing": "clearer legal version of the current paragraph",
  "missingElements": ["what is still missing for a strong complaint"],
  "citations": ["short case name or principle if relevant"],
  "hindiSuggestion": "Hindi version of improved phrasing"
}`;

  return (
    `You are the LegalBridge-AI Ambient Legal Drafting Co-Pilot and Statutory Section Recommender for Indian legal enforcement. ` +
    `Analyze this ongoing draft (${mode.toUpperCase()}) and suggest immediate legal enhancements. ` +
    `Respond ONLY with a valid JSON object matching this schema (no markdown formatting, no surrounding text):\n` +
    schema +
    `\n\nRules:\n` +
    `- detailedSections: 3-5 precise Bharatiya Nyaya Sanhita (BNS) & IPC provisions with confidence percentage (70-99) and exact rationale.\n` +
    `- improvedPhrasing: 1-2 formal, legally precise sentences capturing the draft.\n` +
    `- missingElements: 2-3 critical factual or legal points still absent.\n` +
    `- hindiSuggestion: clean Devanagari Hindi translation of the improved phrasing.\n\n` +
    `DRAFT TEXT:\n"""\n${text.slice(0, 3000)}\n"""`
  );
}

export const DraftingCoPilot: React.FC<DraftingCoPilotProps> = ({
  text,
  onApplySuggestion,
  onInsertSection,
  mode = 'general',
  compact = false,
  showMic = true,
  metadata,
  onRequestAutoFill,
}) => {
  const { theme, isDark } = useTheme();

  const [isEnabled, setIsEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<CoPilotSuggestion | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Undo Stack
  const [undoSnapshot, setUndoSnapshot] = useState<string | null>(null);

  const debounceTimer = useRef<any>(null);
  const lastProcessedText = useRef<string>('');

  useEffect(() => {
    if (!isEnabled) {
      setSuggestion(null);
      return;
    }

    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setSuggestion(null);
      setIsAnalyzing(false);
      return;
    }

    // If text hasn't changed meaningfully, avoid re-fetch
    if (trimmed === lastProcessedText.current) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(trimmed);
    }, 350); // Reduced from 750ms for faster responsiveness

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [text, isEnabled]);

  const fetchSuggestions = async (content: string) => {
    lastProcessedText.current = content;
    setIsAnalyzing(true);

    try {
      const prompt = buildCoPilotPrompt(content, mode);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENCODE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      const rawText: string =
        typeof data?.description === 'string'
          ? data.description
          : data?.acts
          ? JSON.stringify(data)
          : '';

      let parsed: CoPilotSuggestion | null = null;
      if (rawText) {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const json = JSON.parse(match[0]);
            if (Array.isArray(json.relevantSections) && typeof json.improvedPhrasing === 'string') {
              const detailed: DetailedSection[] = Array.isArray(json.detailedSections) && json.detailedSections.length > 0
                ? json.detailedSections.map((ds: any) => ({
                    section: ds.section || 'BNS Provision',
                    reason: ds.reason || 'Prima facie attracted',
                    confidence: typeof ds.confidence === 'number' ? ds.confidence : 88,
                  }))
                : json.relevantSections.map((rs: string, idx: number) => ({
                    section: rs,
                    reason: 'Statutory offence established from factual allegations.',
                    confidence: 95 - idx * 5,
                  }));

              parsed = {
                detectedOffenceType: typeof json.detectedOffenceType === 'string' ? json.detectedOffenceType : undefined,
                relevantSections: json.relevantSections,
                detailedSections: detailed,
                improvedPhrasing: json.improvedPhrasing,
                missingElements: Array.isArray(json.missingElements) ? json.missingElements : [],
                citations: Array.isArray(json.citations) ? json.citations : [],
                hindiSuggestion: typeof json.hindiSuggestion === 'string' ? json.hindiSuggestion : undefined,
              };
            }
          } catch {}
        }
      }

      if (!parsed) {
        parsed = generateFallbackCoPilot(content, mode);
      }

      setSuggestion(parsed);
    } catch {
      // Fallback on network delay/error
      setSuggestion(generateFallbackCoPilot(content, mode));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyPhrasing = (improved: string) => {
    setUndoSnapshot(text);
    onApplySuggestion(improved);
    setAppliedNotice('Applied improved legal phrasing!');
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  const handleInjectTemplate = (isHindi: boolean = false) => {
    if (!suggestion) return;
    setUndoSnapshot(text);

    const template = generateCourtReadyFIRTemplate(text, suggestion, metadata, isHindi);
    onApplySuggestion(template);
    setAppliedNotice(isHindi ? 'हिंदी प्राथमिकी प्रारूप अंतःस्थापित किया गया!' : 'Injected Court-Ready FIR Template!');
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  const handleUndo = () => {
    if (undoSnapshot !== null) {
      onApplySuggestion(undoSnapshot);
      setUndoSnapshot(null);
      setAppliedNotice('Restored prior draft!');
      setTimeout(() => setAppliedNotice(null), 2500);
    }
  };

  const accentColor = isDark ? '#60A5FA' : COLORS.navyGov;
  const accentBg = isDark ? '#1E293B' : '#EFF6FF';
  const accentBorder = isDark ? '#3B82F6' : '#BFDBFE';

  // If disabled, render minimal inactive pill
  if (!isEnabled) {
    return (
      <View style={[styles.disabledContainer, { borderColor: theme.border }]}>
        <TouchableOpacity
          style={styles.enableRow}
          onPress={() => setIsEnabled(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="sparkles-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.disabledText, { color: theme.textMuted }]}>
            Enable Ambient Drafting Co-Pilot & Section Recommender
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasContent = Boolean(suggestion && text.trim().length >= 3);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: hasContent ? accentBorder : theme.border,
        },
        compact && styles.containerCompact,
      ]}
    >
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerTitleRow}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <View style={[styles.coPilotIconBox, { backgroundColor: accentBg }]}>
            <Ionicons name="sparkles" size={13} color={accentColor} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Ambient Drafting Co-Pilot
            </Text>
            {suggestion?.detectedOffenceType ? (
              <Text style={[styles.offenceTypeSub, { color: accentColor }]}>
                {suggestion.detectedOffenceType}
              </Text>
            ) : null}
          </View>

          {isAnalyzing ? (
            <View style={[styles.statusPill, { backgroundColor: '#FEF3C7' }]}>
              <ActivityIndicator size="small" color="#B45309" style={{ transform: [{ scale: 0.65 }] }} />
              <Text style={[styles.statusPillText, { color: '#B45309' }]}>Analyzing…</Text>
            </View>
          ) : hasContent ? (
            <View style={[styles.statusPill, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
              <View style={[styles.greenDot, { backgroundColor: isDark ? '#34D399' : '#166534' }]} />
              <Text style={[styles.statusPillText, { color: isDark ? '#34D399' : '#166534' }]}>Ready</Text>
            </View>
          ) : (
            <Text style={[styles.idleHint, { color: theme.textMuted }]}>Type to see suggestions</Text>
          )}
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          {/* Compact Dictation Pill - only shown if showMic is true */}
          {showMic && (mode === 'fir' || mode === 'query') && (
            <VoiceDictation
              compact
              onTranscript={(spokenText, isFinal) => {
                if (isFinal) {
                  // Append speech to current text so Co-Pilot debounce fires naturally
                  const current = (text || '').trimEnd();
                  onApplySuggestion(current ? `${current} ${spokenText}` : spokenText);
                }
              }}
            />
          )}

          {undoSnapshot !== null && (
            <TouchableOpacity style={styles.undoBtn} onPress={handleUndo} activeOpacity={0.75}>
              <Ionicons name="arrow-undo-outline" size={13} color={COLORS.accentGoldDark} />
              <Text style={[styles.undoBtnText, { color: COLORS.accentGoldDark }]}>Undo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => setIsExpanded(!isExpanded)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={17}
              color={theme.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => setIsEnabled(false)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle-outline" size={17} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded Suggestions Panel */}
      {isExpanded && hasContent && suggestion && (
        <View style={[styles.panelBody, { borderTopColor: theme.border }]}>
          {appliedNotice && (
            <View style={[styles.appliedNotice, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle" size={14} color={isDark ? '#34D399' : '#166534'} />
              <Text style={[styles.appliedNoticeText, { color: isDark ? '#34D399' : '#166534' }]}>
                {appliedNotice}
              </Text>
              {onRequestAutoFill && (
                <TouchableOpacity
                  onPress={onRequestAutoFill}
                  style={[styles.quickAutoFillBadge, { backgroundColor: accentColor }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="sparkles" size={11} color={COLORS.white} />
                  <Text style={styles.quickAutoFillBadgeText}>Auto-Fill Form</Text>
                </TouchableOpacity>
              )}
              {undoSnapshot !== null && (
                <TouchableOpacity onPress={handleUndo} style={styles.undoNoticeBtn}>
                  <Text style={styles.undoNoticeText}>Undo</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ─ FEATURE: One-Click Court-Ready FIR Template Injector ─────── */}
          <View style={[styles.templateInjectorCard, { backgroundColor: accentBg, borderColor: accentBorder }]}>
            <View style={styles.templateInjectorHeader}>
              <View style={[styles.templateIconCircle, { backgroundColor: accentColor }]}>
                <Ionicons name="document-text" size={16} color={COLORS.white} />
              </View>
              <View style={styles.templateTitleWrap}>
                <Text style={[styles.templateCardTitle, { color: theme.textPrimary }]}>
                  One-Click FIR Template Injector
                </Text>
                <Text style={[styles.templateCardSub, { color: theme.textSecondary }]}>
                  Intelligently expands your narrative into 7 statutory clauses (Locus, Sequence, Accused, Sections, Prayer).
                </Text>
              </View>
            </View>

            <View style={styles.templateActionRow}>
              <TouchableOpacity
                style={[styles.injectPrimaryBtn, { backgroundColor: accentColor }]}
                onPress={() => handleInjectTemplate(false)}
                activeOpacity={0.85}
              >
                <Ionicons name="flash" size={14} color={COLORS.white} />
                <Text style={styles.injectPrimaryBtnText}>Inject Court-Ready FIR Template</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.injectHindiBtn, { backgroundColor: theme.surface, borderColor: accentBorder }]}
                onPress={() => handleInjectTemplate(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="language" size={13} color={accentColor} />
                <Text style={[styles.injectHindiBtnText, { color: accentColor }]}>हिंदी प्रारूप जोड़ें</Text>
              </TouchableOpacity>

              {onRequestAutoFill && (
                <TouchableOpacity
                  style={[
                    styles.autoFillEntireBtn,
                    {
                      backgroundColor: isDark ? '#064E3B' : '#DCFCE7',
                      borderColor: isDark ? '#059669' : '#86EFAC',
                    },
                  ]}
                  onPress={onRequestAutoFill}
                  activeOpacity={0.85}
                >
                  <Ionicons name="sparkles" size={13} color={isDark ? '#34D399' : '#166534'} />
                  <Text style={[styles.autoFillEntireBtnText, { color: isDark ? '#34D399' : '#166534' }]}>
                    Auto-Fill Entire FIR Form
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ─ FEATURE: Smart FIR Section Recommender ──────────────────── */}
          {suggestion.detailedSections && suggestion.detailedSections.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="shield-checkmark" size={14} color={isDark ? '#34D399' : '#166534'} />
                <Text style={[styles.sectionHeading, { color: isDark ? '#34D399' : '#166534' }]}>
                  SMART SECTION RECOMMENDER (BNS & IPC)
                </Text>
              </View>

              <View style={styles.detailedSectionsList}>
                {suggestion.detailedSections.map((secItem, idx) => {
                  const isHighConf = secItem.confidence >= 90;
                  const confBg = isHighConf ? (isDark ? '#064E3B' : '#DCFCE7') : (isDark ? '#451A03' : '#FEF3C7');
                  const confColor = isHighConf ? (isDark ? '#34D399' : '#166534') : (isDark ? '#FBBF24' : '#B45309');

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.detailedSectionCard,
                        { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                      ]}
                      onPress={() => onInsertSection && onInsertSection(secItem.section)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.detailedSecTopRow}>
                        <Text style={[styles.detailedSecTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                          {secItem.section}
                        </Text>
                        <View style={[styles.confPill, { backgroundColor: confBg }]}>
                          <Text style={[styles.confPillText, { color: confColor }]}>
                            {secItem.confidence}% Match
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.detailedSecReason, { color: theme.textSecondary }]}>
                        {secItem.reason}
                      </Text>

                      <View style={styles.insertPromptRow}>
                        <Ionicons name="add-circle" size={13} color={accentColor} />
                        <Text style={[styles.insertPromptText, { color: accentColor }]}>
                          Tap to append to narrative
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Improved Legal Phrasing */}
          {suggestion.improvedPhrasing ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="create-outline" size={14} color={accentColor} />
                <Text style={[styles.sectionHeading, { color: accentColor }]}>IMPROVED LEGAL PHRASING</Text>
              </View>

              <View style={[styles.phrasingCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                <Text style={[styles.phrasingText, { color: theme.textPrimary }]}>
                  {suggestion.improvedPhrasing}
                </Text>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: accentColor }]}
                    onPress={() => handleApplyPhrasing(suggestion.improvedPhrasing)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-sharp" size={13} color={COLORS.white} />
                    <Text style={styles.applyBtnText}>Apply to Text</Text>
                  </TouchableOpacity>

                  {suggestion.hindiSuggestion && (
                    <TouchableOpacity
                      style={[styles.hindiBtn, { backgroundColor: accentBg, borderColor: accentBorder }]}
                      onPress={() => handleApplyPhrasing(suggestion.hindiSuggestion!)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="language" size={13} color={accentColor} />
                      <Text style={[styles.hindiBtnText, { color: accentColor }]}>हिंदी में बदलें</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ) : null}

          {/* Missing Elements Checklist */}
          {suggestion.missingElements.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="alert-circle-outline" size={14} color={COLORS.statusAlert} />
                <Text style={[styles.sectionHeading, { color: COLORS.statusAlert }]}>
                  RECOMMENDED PARTICULARS TO ADD
                </Text>
              </View>

              <View style={styles.missingList}>
                {suggestion.missingElements.map((item, i) => (
                  <View key={i} style={styles.missingItem}>
                    <Ionicons name="ellipse" size={5} color={COLORS.statusAlert} style={styles.bulletDot} />
                    <Text style={[styles.missingItemText, { color: theme.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Citations / Precedent footnote */}
          {suggestion.citations.length > 0 && (
            <View style={styles.citationRow}>
              <Ionicons name="ribbon-outline" size={12} color={theme.textMuted} />
              <Text style={[styles.citationText, { color: theme.textMuted }]} numberOfLines={1}>
                {suggestion.citations[0]}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginVertical: 8,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  containerCompact: {
    marginVertical: 4,
  },
  disabledContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 6,
    alignItems: 'center',
  },
  enableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disabledText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  coPilotIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  offenceTypeSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  idleHint: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  undoBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionIconBtn: {
    padding: 2,
  },
  panelBody: {
    borderTopWidth: 1,
    padding: 12,
    gap: 14,
  },
  appliedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
  },
  appliedNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  undoNoticeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  undoNoticeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickAutoFillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  quickAutoFillBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // Template Injector Card
  templateInjectorCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  templateInjectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  templateIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  templateTitleWrap: {
    flex: 1,
  },
  templateCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  templateCardSub: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  templateActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  injectPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  injectPrimaryBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  injectHindiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  injectHindiBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  autoFillEntireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  autoFillEntireBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Detailed Sections Recommender
  sectionBlock: {
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  detailedSectionsList: {
    gap: 8,
  },
  detailedSectionCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  detailedSecTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailedSecTitle: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  confPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
  },
  confPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailedSecReason: {
    fontSize: 12,
    lineHeight: 16,
  },
  insertPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  insertPromptText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Improved phrasing
  phrasingCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  phrasingText: {
    fontSize: 13,
    lineHeight: 19,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  applyBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  hindiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  hindiBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Missing list
  missingList: {
    gap: 4,
  },
  missingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    marginTop: 6,
  },
  missingItemText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  citationText: {
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
  },
});

export default DraftingCoPilot;
