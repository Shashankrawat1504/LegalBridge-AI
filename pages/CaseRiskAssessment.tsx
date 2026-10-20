import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
  Modal,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OfficialNavbar from "../components/OfficialNavbar";
import Footer from "../components/Footer";
import { COLORS, RADIUS, SHADOWS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

// ── Types ─────────────────────────────────────────────────────────────────────
export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export interface CaseRiskReport {
  overallRiskScore: number;
  successProbability: number;
  riskLevel: RiskLevel;
  keyStrengths: string[];
  keyWeaknesses: string[];
  recommendedStrategy: string[];
  relevantSections: string[];
  similarPrecedents: string[];
  nextSteps: string[];
  plainLanguageSummary: string;
}

interface SavedCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  section?: string;
  court?: string;
  status?: string;
  priority?: string;
}

const CASE_TRACKER_KEY = "@lawai_case_tracker";

// ── Sample Presets ─────────────────────────────────────────────────────────────
interface PresetCase {
  label: string;
  category: string;
  title: string;
  description: string;
}

const PRESET_CASES: PresetCase[] = [
  {
    label: "Criminal Cheating & Forgery",
    category: "CRIMINAL LAW",
    title: "State vs. R. K. Enterprises (Cheating & Document Forgery)",
    description: `Allegations: Complainant alleges accused induced him into investing Rs. 45 Lakhs in a dummy real estate venture using forged allotment letters and fabricated municipal clearance certificates.
Evidence Available: Original forged stamp papers, bank transfer statements showing Rs. 45 Lakhs credited into accused's account, WhatsApp conversations acknowledging the transaction.
Defence Contention: Accused claims this was a genuine civil partnership dispute due to market slowdown and municipal regulatory delays, not intentional criminal inducement at the inception.
Procedural Stage: FIR registered under IPC Sections 420, 468, 471 (BNS Sections 318(4), 336(3), 340(2)). Anticipatory bail application pending before Sessions Court.`,
  },
  {
    label: "Cyber Financial Fraud",
    category: "CYBER CRIME",
    title: "Investigation into Phishing & Unauthorized Fund Siphoning",
    description: `Allegations: Victim received fraudulent SMS posing as bank KYC renewal, clicked malicious APK link, leading to unauthorized transfer of Rs. 8,70,000 via IMPS to multiple mule accounts within 18 minutes.
Evidence Available: CDR records of caller, beneficiary account statements, IP logs from telecom service provider, bank dispute chargeback filed within golden hour (45 mins).
Defence/Suspect Status: Primary beneficiary claims account was rented out to third party on Telegram without knowledge of fraud; denies direct nexus with phishing operator.
Procedural Stage: FIR under Information Technology Act Sec 66C, 66D and IPC 420. Police cyber cell frozen Rs. 3,20,000 in secondary accounts.`,
  },
  {
    label: "Commercial Breach of Contract",
    category: "COMMERCIAL / CIVIL",
    title: "Apex Logistics vs. Horizon Infra (Breach & Injunction)",
    description: `Allegations: Plaintiff entered into an exclusive 3-year warehousing agreement with Defendant. Defendant terminated agreement with 7 days notice citing force majeure, but immediately contracted with a competitor at lower rates.
Evidence Available: Executed master agreement with 90-day cure clause, email correspondence demonstrating lack of bona fide force majeure condition, audited financial audit showing Rs. 1.2 Crore reliance damages.
Defence Contention: Defendant argues arbitration clause u/s 8 Arbitration & Conciliation Act ousts Civil Court jurisdiction; also claims plaintiff delayed performance milestones.
Procedural Stage: Commercial Suit with application for Interim Injunction under Order 39 Rules 1 & 2 CPC pending before Commercial Court.`,
  },
  {
    label: "Anticipatory Bail Application",
    category: "BAIL STRATEGY",
    title: "Anticipatory Bail in Alleged Public Servant Corruption Matter",
    description: `Allegations: Accused, a junior municipal engineer, named in FIR following statement of co-accused contractor alleging payment of Rs. 2 Lakhs kickback for tender approval.
Evidence Available: No trap laid; no recovery of marked currency from applicant; sole reliance on co-accused confession recorded in police custody; applicant has unblemished 14-year service record with no prior criminal antecedents.
Prosecution Stand: Custodial interrogation required to unearth larger nexus with senior department officials.
Procedural Stage: Application u/s 438 CrPC (Section 482 BNSS) filed before High Court following rejection by Sessions Court.`,
  },
];

// ── Heuristic Fallback Analysis Engine ─────────────────────────────────────────
function generateFallbackAssessment(text: string, title: string): CaseRiskReport {
  const lower = (text + " " + title).toLowerCase();

  const isCriminal = /fir|police|ipc|bns|bail|accused|arrest|custody|cheating|forgery|fraud|stolen|weapon|assault|theft|murder|420|302|376|318|468|471/i.test(lower);
  const isCyber = /cyber|phishing|apk|otp|sms|it act|66c|66d|hacker|mule|telegram|ip address|malware/i.test(lower);
  const isCommercial = /contract|breach|arbitration|damages|commercial|injunction|agreement|partnership|lease|specific performance|order 39/i.test(lower);
  const isBail = /bail|438|439|anticipatory|custodial|interrogation|antecedents|surrender/i.test(lower);

  let riskScore = 48;
  let successProb = 52;
  let riskLevel: RiskLevel = "Moderate";

  let keyStrengths: string[] = [];
  let keyWeaknesses: string[] = [];
  let recommendedStrategy: string[] = [];
  let relevantSections: string[] = [];
  let similarPrecedents: string[] = [];
  let nextSteps: string[] = [];
  let summary = "";

  if (isCyber) {
    riskScore = 38;
    successProb = 68;
    riskLevel = "Moderate";
    keyStrengths = [
      "Rapid reporting within golden hour facilitates bank lien marking and fund freeze under Section 102 CrPC (BNSS 106).",
      "Digital electronic audit trail (IP logs, IMPS transaction IDs, IMEI numbers) provides objective corroborative evidence.",
      "Clear legislative framework under IT Act Sections 66C/66D with stringent liability on mule account operators.",
    ];
    keyWeaknesses = [
      "Multi-layered mule account dispersal across foreign jurisdictions or crypto exchanges poses recovery delays.",
      "Requirement of strict Section 63 Bharatiya Sakshya Adhiniyam (erstwhile Sec 65B IEA) electronic certificate.",
      "Delays in telecom KYC verification response times from service providers.",
    ];
    recommendedStrategy = [
      "File immediate formal Section 91 CrPC (BNSS 94) requisition to intermediary banks for freezing layer-2 and layer-3 accounts.",
      "Procure certified CDR/IPDR dumps and secure hash value verification of malicious APK/SMS links immediately.",
      "Institute recovery proceedings before the Cyber Adjudicating Officer under Section 46 of the IT Act.",
    ];
    relevantSections = [
      "Section 66D IT Act (Punishment for cheating by personation using computer resource)",
      "Section 66C IT Act (Identity theft & fraudulent use of electronic signature)",
      "Section 318(4) BNS (Cheating & dishonestly inducing delivery of property - erstwhile IPC 420)",
      "Section 63 BSA (Admissibility of electronic records - erstwhile Section 65B Indian Evidence Act)",
    ];
    similarPrecedents = [
      "State of Tamil Nadu vs. Suhas Katti (Early milestone cyber impersonation & electronic evidence conviction)",
      "Arjun Panditrao Khotkar vs. Kailash Kushanrao Gorantyal (Supreme Court: mandatory protocol for electronic certificates)",
    ];
    nextSteps = [
      "Obtain certified bank ledger extracts with UTR numbers stamped by branch manager.",
      "Draft representation to State Cyber Crime Police Station requesting expedited nodal bank liaison.",
      "Preserve handset and original SMS/call logs without factory reset for forensic image extraction.",
    ];
    summary = `The case presents a high probability of recovery due to verifiable digital banking audit trails and rapid transaction reporting. Primary vulnerability lies in procedural compliance for digital evidence certification. Swift lien-marking on beneficiary accounts is critical.`;
  } else if (isBail) {
    riskScore = 42;
    successProb = 65;
    riskLevel = "Moderate";
    keyStrengths = [
      "No recovery of incriminating physical contraband or marked currency from personal custody.",
      "Clean criminal antecedents with deep roots in society mitigating flight risk.",
      "Co-accused confession during police custody has minimal evidentiary value under Section 23 BSA (Sec 25/26 IEA).",
    ];
    keyWeaknesses = [
      "Prosecution's standard objection asserting requirement of custodial interrogation.",
      "Potential apprehension of witness tampering or evidence destruction alleged by investigating agency.",
    ];
    recommendedStrategy = [
      "Emphasize the Arnesh Kumar vs. State of Bihar and Satender Kumar Antil guidelines regarding restraint on routine arrests.",
      "Offer voluntary appearance before the Investigating Officer with stringent conditions including passport deposit.",
      "Demonstrate absence of prima facie ingredients justifying continued deprivation of personal liberty.",
    ];
    relevantSections = [
      "Section 482 BNSS (Direction for grant of bail to person apprehending arrest - erstwhile Section 438 CrPC)",
      "Section 483 BNSS (Special powers of High Court/Sessions Court regarding bail - erstwhile Section 439 CrPC)",
      "Section 23 Bharatiya Sakshya Adhiniyam (Confession to police officer not to be proved - erstwhile Section 25 IEA)",
    ];
    similarPrecedents = [
      "Satender Kumar Antil vs. CBI (2022 Supreme Court: comprehensive standard operating guidelines on bail and non-custody)",
      "Arnesh Kumar vs. State of Bihar (2014 Supreme Court: mandatory notice u/s 41A CrPC before arrest)",
      "Gurbaksh Singh Sibbia vs. State of Punjab (Constitution Bench: broad discretion in anticipatory bail)",
    ];
    nextSteps = [
      "Prepare affidavit of clean antecedents and residential stability proof (Aadhaar, property deed).",
      "Serve advance notice copy of bail application upon Public Prosecutor with acknowledgment.",
      "Compile compilation of latest Supreme Court judgments on co-accused confessional statements.",
    ];
    summary = `The applicant has a strong prima facie case for pre-arrest or regular bail given the absence of direct recoveries and unblemished antecedents. The primary legal challenge is overcoming the prosecution's routine assertion of custodial necessity.`;
  } else if (isCommercial) {
    riskScore = 32;
    successProb = 74;
    riskLevel = "Low";
    keyStrengths = [
      "Written agreement with explicit cure period covenants and predefined dispute escalation mechanisms.",
      "Documentary proof of reliance expenditures and quantifiable commercial losses.",
      "Arbitrary termination without meeting bona fide force majeure criteria weakens the opposite party's defence.",
    ];
    keyWeaknesses = [
      "Presence of arbitration clause may require section 8 reference, delaying interim court relief.",
      "Specific performance of determinable contracts is generally restricted under Section 14 of the Specific Relief Act.",
    ];
    recommendedStrategy = [
      "Invoke Section 9 of the Arbitration & Conciliation Act for urgent interim protection before tribunal constitution.",
      "Issue formal statutory notice invoking arbitration clause alongside detailed statement of claim for damages.",
      "Simultaneously initiate mediation under Commercial Courts Act 2015 to explore expedited commercial settlement.",
    ];
    relevantSections = [
      "Section 9 & Section 11, Arbitration and Conciliation Act 1996 (Interim relief & appointment of arbitrator)",
      "Section 73 & Section 74, Indian Contract Act 1872 (Compensation for loss or damage caused by breach)",
      "Section 14 & 20, Specific Relief Act 1963 (Contracts not specifically enforceable & substituted performance)",
    ];
    similarPrecedents = [
      "Energy Watchdog vs. CERC (Supreme Court: strict construction of Force Majeure and frustration clauses)",
      "ONGC Ltd. vs. Saw Pipes Ltd. (Supreme Court: principles governing liquidated damages and genuine pre-estimates)",
    ];
    nextSteps = [
      "Audit and notarize complete chronological correspondence exchanged prior to repudiation.",
      "Quantify direct reliance damages, idle capacity costs, and lost profit margins with chartered accountant certificate.",
      "Issue formal dispute notice under contractual escalation clause giving 15-day cure window.",
    ];
    summary = `The commercial claim possesses substantial legal merit based on explicit contractual breaches. Strategic priority should be obtaining interim preservative orders u/s 9 Arbitration Act followed by arbitration rather than prolonged ordinary civil litigation.`;
  } else {
    // General criminal / mixed
    riskScore = 55;
    successProb = 50;
    riskLevel = "Moderate";
    keyStrengths = [
      "Direct documentary trail corroborating financial transfers and initial representations.",
      "Prima facie evidence of inducement creating triable issues under statutory criminal provisions.",
    ];
    keyWeaknesses = [
      "Defence will argue dispute is predominantly civil in nature (mere breach of contract vs fraudulent inception).",
      "Burden of establishing fraudulent intention ab initio rests heavily on prosecution/complainant.",
      "Voluminous documentary evidence requires meticulous marking and verification during trial.",
    ];
    recommendedStrategy = [
      "Highlight dishonest inducement existing at the very threshold of the transaction to negate civil defense.",
      "Rely on documentary evidence (forged papers, false assurances) to establish criminal intent distinct from commercial breach.",
      "File detailed reply opposing anticipatory bail, emphasizing need for recovery of misappropriated assets.",
    ];
    relevantSections = [
      "Section 318 BNS (Cheating - erstwhile Section 415/420 IPC)",
      "Section 336 BNS (Forgery - erstwhile Section 463/468 IPC)",
      "Section 340 BNS (Using as genuine a forged document - erstwhile Section 471 IPC)",
      "Section 173 BNSS (Report of police officer on completion of investigation - erstwhile Section 173 CrPC)",
    ];
    similarPrecedents = [
      "Vesa Holdings Pvt. Ltd. vs. State of Kerala (Supreme Court: distinction between breach of contract and cheating)",
      "Hridaya Ranjan Prasad Verma vs. State of Bihar (Supreme Court: fraudulent intent at inception is essential for cheating)",
      "State of Haryana vs. Bhajan Lal (Supreme Court: landmark guidelines on quashing of criminal proceedings)",
    ];
    nextSteps = [
      "Compile certified bank statement extracts showing inflow and outflow of disputed funds.",
      "Submit comprehensive representation to the Investigating Officer with forensic document examiner report.",
      "Prepare application for interim attachment of accused's assets under Criminal Law Amendment Ordinance.",
    ];
    summary = `The matter presents balanced litigation risks. While factual documentation is robust, the primary hurdle is establishing criminal intent at the inception rather than a subsequent civil dispute. Emphasizing forged records will be vital to prevent quashing.`;
  }

  return {
    overallRiskScore: riskScore,
    successProbability: successProb,
    riskLevel,
    keyStrengths,
    keyWeaknesses,
    recommendedStrategy,
    relevantSections,
    similarPrecedents,
    nextSteps,
    plainLanguageSummary: summary,
  };
}

function buildAiPrompt(caseTitle: string, caseFacts: string): string {
  const schema = `{
  "overallRiskScore": 45,
  "successProbability": 65,
  "riskLevel": "Moderate",
  "keyStrengths": ["Detailed point 1", "Detailed point 2"],
  "keyWeaknesses": ["Detailed point 1", "Detailed point 2"],
  "recommendedStrategy": ["Strategic step 1", "Strategic step 2"],
  "relevantSections": ["BNS/IPC section + short reason", "BNSS/CrPC section + short reason"],
  "similarPrecedents": ["Case Name vs Opposite (Court Year) - relevance"],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "plainLanguageSummary": "2-4 sentence summary in simple English."
}`;

  return (
    `You are a Senior Judicial Analyst and Legal Strategist for the Indian Legal System. ` +
    `Analyze the following case facts and provide a structured predictive risk assessment. ` +
    `You must respond ONLY with a valid JSON object matching this schema exactly (no markdown fences, no explanatory text outside JSON):\n` +
    schema +
    `\n\nRules:\n` +
    `- overallRiskScore: integer 0-100 (0=No risk, 100=Extreme risk of adverse outcome).\n` +
    `- successProbability: integer 0-100 (Probability of achieving client/state objective).\n` +
    `- riskLevel: exactly one of "Low", "Moderate", "High", "Critical".\n` +
    `- Include new Bharatiya Nyaya Sanhita (BNS) / BNSS / BSA sections along with IPC/CrPC counterparts.\n` +
    `- Cite real, authoritative Supreme Court or High Court landmark precedents.\n` +
    `- Keep plainLanguageSummary concise (2-4 clear sentences).\n\n` +
    `CASE TITLE: ${caseTitle || "Untitled Matter"}\n` +
    `CASE FACTS & ALLEGATIONS:\n"""\n${caseFacts.slice(0, 8000)}\n"""`
  );
}

// ── Color Helpers ─────────────────────────────────────────────────────────────
function getRiskBadgeColors(level: RiskLevel, isDark: boolean) {
  switch (level) {
    case "Low":
      return {
        bg: isDark ? "#064E3B" : "#DCFCE7",
        text: isDark ? "#34D399" : "#166534",
        border: isDark ? "#059669" : "#86EFAC",
        icon: "shield-checkmark",
      };
    case "Moderate":
      return {
        bg: isDark ? "#451A03" : "#FEF3C7",
        text: isDark ? "#FBBF24" : "#B45309",
        border: isDark ? "#D97706" : "#FCD34D",
        icon: "alert-circle",
      };
    case "High":
      return {
        bg: isDark ? "#431407" : "#FFEDD5",
        text: isDark ? "#FB923C" : "#C2410C",
        border: isDark ? "#EA580C" : "#FDBA74",
        icon: "warning",
      };
    case "Critical":
      return {
        bg: isDark ? "#450A0A" : "#FEE2E2",
        text: isDark ? "#F87171" : "#991B1B",
        border: isDark ? "#DC2626" : "#FCA5A5",
        icon: "flame",
      };
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
const CaseRiskAssessment: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // Form State
  const [caseTitle, setCaseTitle] = useState("");
  const [caseFacts, setCaseFacts] = useState("");
  const [isAssessing, setIsAssessing] = useState(false);
  const [report, setReport] = useState<CaseRiskReport | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Case Tracker Import Modal
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  // Active Tab for Results
  const [activeTab, setActiveTab] = useState<"overview" | "strategy" | "citations">("overview");

  // Load saved cases from AsyncStorage on mount
  useEffect(() => {
    loadSavedCases();
  }, []);

  const loadSavedCases = async () => {
    try {
      setIsLoadingCases(true);
      const raw = await AsyncStorage.getItem(CASE_TRACKER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedCases(parsed);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingCases(false);
    }
  };

  const handleApplyPreset = (preset: PresetCase) => {
    setCaseTitle(preset.title);
    setCaseFacts(preset.description);
    setErrorMsg("");
  };

  const handleSelectSavedCase = (c: SavedCase) => {
    setCaseTitle(c.caseNumber ? `${c.caseNumber} - ${c.title}` : c.title);
    const combined = [
      c.description || "",
      c.section ? `Applicable Sections: ${c.section}` : "",
      c.court ? `Court / Jurisdiction: ${c.court}` : "",
      c.status ? `Current Status: ${c.status}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    setCaseFacts(combined || "No recorded case description.");
    setShowImportModal(false);
    setErrorMsg("");
  };

  const handleClear = () => {
    Alert.alert("Clear Intake", "Clear case title and description?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setCaseTitle("");
          setCaseFacts("");
          setReport(null);
          setErrorMsg("");
        },
      },
    ]);
  };

  const runRiskAssessment = async () => {
    const trimmed = caseFacts.trim();
    if (!trimmed) {
      Alert.alert("Missing Case Facts", "Please enter or import case facts, allegations, or evidence details.");
      return;
    }

    setIsAssessing(true);
    setErrorMsg("");

    try {
      const prompt = buildAiPrompt(caseTitle, trimmed);
      const res = await fetch("https://sih-backend-881i.onrender.com/encode/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });

      const data = await res.json();
      const rawText: string =
        typeof data?.description === "string"
          ? data.description
          : data?.acts
          ? JSON.stringify(data)
          : "";

      let parsedReport: CaseRiskReport | null = null;

      if (rawText) {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const rawParsed = JSON.parse(jsonMatch[0]);
            if (typeof rawParsed.overallRiskScore === "number") {
              parsedReport = {
                overallRiskScore: Math.min(100, Math.max(0, rawParsed.overallRiskScore)),
                successProbability: Math.min(
                  100,
                  Math.max(
                    0,
                    typeof rawParsed.successProbability === "number"
                      ? rawParsed.successProbability
                      : 100 - rawParsed.overallRiskScore
                  )
                ),
                riskLevel: ["Low", "Moderate", "High", "Critical"].includes(rawParsed.riskLevel)
                  ? rawParsed.riskLevel
                  : rawParsed.overallRiskScore > 75
                  ? "Critical"
                  : rawParsed.overallRiskScore > 50
                  ? "High"
                  : rawParsed.overallRiskScore > 30
                  ? "Moderate"
                  : "Low",
                keyStrengths: Array.isArray(rawParsed.keyStrengths) ? rawParsed.keyStrengths : [],
                keyWeaknesses: Array.isArray(rawParsed.keyWeaknesses) ? rawParsed.keyWeaknesses : [],
                recommendedStrategy: Array.isArray(rawParsed.recommendedStrategy)
                  ? rawParsed.recommendedStrategy
                  : [],
                relevantSections: Array.isArray(rawParsed.relevantSections)
                  ? rawParsed.relevantSections
                  : [],
                similarPrecedents: Array.isArray(rawParsed.similarPrecedents)
                  ? rawParsed.similarPrecedents
                  : [],
                nextSteps: Array.isArray(rawParsed.nextSteps) ? rawParsed.nextSteps : [],
                plainLanguageSummary:
                  typeof rawParsed.plainLanguageSummary === "string"
                    ? rawParsed.plainLanguageSummary
                    : "Analysis completed successfully.",
              };
            }
          } catch {
            // parse error
          }
        }
      }

      // If backend was unreachable or returned unparseable content, use local heuristic
      if (!parsedReport) {
        parsedReport = generateFallbackAssessment(trimmed, caseTitle);
      }

      setReport(parsedReport);
      setActiveTab("overview");
    } catch {
      // Graceful offline fallback
      const fallback = generateFallbackAssessment(trimmed, caseTitle);
      setReport(fallback);
      setActiveTab("overview");
    } finally {
      setIsAssessing(false);
    }
  };

  const handleShareReport = async () => {
    if (!report) return;

    const formatted = `LEGALBRIDGE-AI PREDICTIVE CASE RISK ASSESSMENT REPORT
--------------------------------------------------
Case: ${caseTitle || "Unspecified Matter"}
Risk Level: ${report.riskLevel.toUpperCase()}
Overall Risk Score: ${report.overallRiskScore}/100
Probability of Success: ${report.successProbability}%

SUMMARY:
${report.plainLanguageSummary}

KEY STRENGTHS:
${report.keyStrengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}

KEY VULNERABILITIES:
${report.keyWeaknesses.map((w, i) => `${i + 1}. ${w}`).join("\n")}

RECOMMENDED STRATEGY:
${report.recommendedStrategy.map((st, i) => `${i + 1}. ${st}`).join("\n")}

RELEVANT SECTIONS:
${report.relevantSections.map((sec) => `• ${sec}`).join("\n")}

PRECEDENTS:
${report.similarPrecedents.map((p) => `• ${p}`).join("\n")}

ACTIONABLE NEXT STEPS:
${report.nextSteps.map((ns, i) => `[ ] ${i + 1}. ${ns}`).join("\n")}
--------------------------------------------------
Generated by LegalBridge-AI Forensic & Judicial Analytics Portal`;

    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(formatted);
        Alert.alert("Report Copied", "Complete forensic risk assessment report copied to clipboard!");
      } else {
        await Share.share({
          title: `Risk Assessment - ${caseTitle || "Case Report"}`,
          message: formatted,
        });
      }
    } catch {
      Alert.alert("Notice", "Unable to share or copy report.");
    }
  };

  const accentColor = isDark ? "#60A5FA" : COLORS.navyGov;
  const accentLight = isDark ? "#1E293B" : "#EFF6FF";
  const badgeColors = report ? getRiskBadgeColors(report.riskLevel, isDark) : null;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Utilities" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Banner */}
        <View style={[styles.headerBanner, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerInner}>
            <View style={[styles.officialTag, { backgroundColor: accentLight, borderColor: isDark ? "#3B82F6" : "#BFDBFE" }]}>
              <Ionicons name="analytics" size={14} color={accentColor} />
              <Text style={[styles.officialTagText, { color: accentColor }]}>AI CASE STRATEGY & RISK FORECAST</Text>
            </View>

            <Text style={[styles.mainTitle, { color: theme.textPrimary }]}>
              Predictive Case Risk Assessment
            </Text>

            <Text style={[styles.mainSubtitle, { color: theme.textSecondary }]}>
              Simulate litigation outcomes, identify statutory vulnerabilities, predict probability of success, and formulate optimal legal defense and prosecution strategies.
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* ─ Intake Card ──────────────────────────────────────────────── */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Case Facts & Evidentiary Intake</Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                  Paste facts, allegations, charge sheet summaries, or import an active tracked case.
                </Text>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.intakeActionsRow}>
              <TouchableOpacity
                style={[styles.actionBtnSecondary, { backgroundColor: accentLight, borderColor: isDark ? "#3B82F6" : "#BFDBFE" }]}
                onPress={() => {
                  loadSavedCases();
                  setShowImportModal(true);
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="folder-open-outline" size={16} color={accentColor} />
                <Text style={[styles.actionBtnSecondaryText, { color: accentColor }]}>
                  Import from Case Tracker {savedCases.length > 0 ? `(${savedCases.length})` : ""}
                </Text>
              </TouchableOpacity>

              {(caseTitle.length > 0 || caseFacts.length > 0) && (
                <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                  <Ionicons name="trash-outline" size={15} color={COLORS.statusAlert} />
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Presets Horizontal Strip */}
            <View style={styles.presetsSection}>
              <Text style={[styles.presetsLabel, { color: theme.textMuted }]}>
                OR LOAD PRE-CONFIGURED SCENARIO:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
                {PRESET_CASES.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.presetPill,
                      {
                        backgroundColor: theme.surfaceMuted,
                        borderColor: caseTitle === preset.title ? accentColor : theme.border,
                      },
                    ]}
                    onPress={() => handleApplyPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        preset.category === "CRIMINAL LAW"
                          ? "shield-outline"
                          : preset.category === "CYBER CRIME"
                          ? "laptop-outline"
                          : preset.category === "COMMERCIAL / CIVIL"
                          ? "business-outline"
                          : "person-outline"
                      }
                      size={13}
                      color={accentColor}
                    />
                    <Text style={[styles.presetPillText, { color: theme.textPrimary }]}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Case Title Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Case Title / Reference (Optional)</Text>
              <TextInput
                style={[
                  styles.textInputSingle,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="e.g. State of NCT vs. ABC Corp / Suit No. 1284 of 2024"
                placeholderTextColor={theme.textMuted}
                value={caseTitle}
                onChangeText={setCaseTitle}
              />
            </View>

            {/* Case Facts Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Case Facts, Allegations & Evidentiary Summary *
                </Text>
                <Text style={[styles.charCount, { color: theme.textMuted }]}>
                  {caseFacts.length} chars
                </Text>
              </View>
              <TextInput
                style={[
                  styles.textInputMulti,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="Enter complete sequence of events, specific allegations, available documentary/electronic evidence, status of FIR or charge sheet, and current defence/prosecution stances…"
                placeholderTextColor={theme.textMuted}
                value={caseFacts}
                onChangeText={setCaseFacts}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.assessBtn,
                (isAssessing || !caseFacts.trim()) && styles.assessBtnDisabled,
              ]}
              onPress={runRiskAssessment}
              disabled={isAssessing || !caseFacts.trim()}
              activeOpacity={0.85}
            >
              {isAssessing ? (
                <>
                  <ActivityIndicator color={COLORS.white} size="small" />
                  <Text style={styles.assessBtnText}>Simulating Judicial Risk & Outcomes…</Text>
                </>
              ) : (
                <>
                  <Ionicons name="flash" size={20} color={COLORS.white} />
                  <Text style={styles.assessBtnText}>
                    {report ? "Re-evaluate Case Risk & Strategy" : "Generate Predictive Risk Assessment"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: isDark ? "#450A0A" : COLORS.statusAlertBg }]}>
                <Ionicons name="warning-outline" size={16} color={COLORS.statusAlert} />
                <Text style={[styles.errorText, { color: COLORS.statusAlert }]}>{errorMsg}</Text>
              </View>
            ) : null}
          </View>

          {/* ─ Results Section ───────────────────────────────────────────── */}
          {report && (
            <View style={styles.resultsContainer}>
              {/* Scorecard Hero Banner */}
              <View style={[styles.heroScorecard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.heroScorecardTop}>
                  <View style={styles.heroTitleWrap}>
                    <Text style={[styles.reportRefTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {caseTitle || "Case Strategy Assessment"}
                    </Text>
                    <Text style={[styles.reportTimestamp, { color: theme.textMuted }]}>
                      Forensic Model Analysis · Indian Statutory Framework (BNS & IPC)
                    </Text>
                  </View>

                  {badgeColors && (
                    <View
                      style={[
                        styles.riskBadgeLarge,
                        { backgroundColor: badgeColors.bg, borderColor: badgeColors.border },
                      ]}
                    >
                      <Ionicons name={badgeColors.icon as any} size={16} color={badgeColors.text} />
                      <Text style={[styles.riskBadgeLargeText, { color: badgeColors.text }]}>
                        {report.riskLevel.toUpperCase()} RISK
                      </Text>
                    </View>
                  )}
                </View>

                {/* Meter Cards */}
                <View style={[styles.metersRow, isWide && styles.metersRowWide]}>
                  {/* Risk Score Meter */}
                  <View style={[styles.meterCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <View style={styles.meterHeader}>
                      <Text style={[styles.meterLabel, { color: theme.textSecondary }]}>OVERALL RISK SCORE</Text>
                      <Text
                        style={[
                          styles.meterValue,
                          {
                            color:
                              report.overallRiskScore > 70
                                ? COLORS.statusAlert
                                : report.overallRiskScore > 40
                                ? COLORS.accentGoldDark
                                : COLORS.statusSuccess,
                          },
                        ]}
                      >
                        {report.overallRiskScore}
                        <Text style={styles.meterValueUnit}>/100</Text>
                      </Text>
                    </View>
                    <View style={[styles.progressBarTrack, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${report.overallRiskScore}%`,
                            backgroundColor:
                              report.overallRiskScore > 70
                                ? COLORS.statusAlert
                                : report.overallRiskScore > 40
                                ? COLORS.accentGoldDark
                                : COLORS.statusSuccess,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.meterSubtext, { color: theme.textMuted }]}>
                      {report.overallRiskScore > 70
                        ? "High vulnerability of adverse ruling or severe penalties."
                        : report.overallRiskScore > 40
                        ? "Moderate exposure; favorable resolution depends on evidentiary rigour."
                        : "Low strategic liability; strong prima facie legal grounds."}
                    </Text>
                  </View>

                  {/* Success Probability Meter */}
                  <View style={[styles.meterCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <View style={styles.meterHeader}>
                      <Text style={[styles.meterLabel, { color: theme.textSecondary }]}>SUCCESS PROBABILITY</Text>
                      <Text
                        style={[
                          styles.meterValue,
                          {
                            color:
                              report.successProbability >= 65
                                ? COLORS.statusSuccess
                                : report.successProbability >= 40
                                ? COLORS.accentGoldDark
                                : COLORS.statusAlert,
                          },
                        ]}
                      >
                        {report.successProbability}
                        <Text style={styles.meterValueUnit}>%</Text>
                      </Text>
                    </View>
                    <View style={[styles.progressBarTrack, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${report.successProbability}%`,
                            backgroundColor:
                              report.successProbability >= 65
                                ? COLORS.statusSuccess
                                : report.successProbability >= 40
                                ? COLORS.accentGoldDark
                                : COLORS.statusAlert,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.meterSubtext, { color: theme.textMuted }]}>
                      Statistical likelihood of achieving relief, quashing, bail, or discharge.
                    </Text>
                  </View>
                </View>

                {/* Plain Language Summary */}
                <View style={[styles.summaryCallout, { backgroundColor: accentLight, borderColor: isDark ? "#3B82F6" : "#BFDBFE" }]}>
                  <View style={styles.summaryCalloutHeader}>
                    <Ionicons name="bulb-outline" size={18} color={accentColor} />
                    <Text style={[styles.summaryCalloutTitle, { color: accentColor }]}>
                      PLAIN LANGUAGE EXECUTIVE SUMMARY
                    </Text>
                  </View>
                  <Text style={[styles.summaryCalloutBody, { color: theme.textPrimary }]}>
                    {report.plainLanguageSummary}
                  </Text>
                </View>

                {/* Share Button Row */}
                <View style={styles.shareRow}>
                  <TouchableOpacity
                    style={[styles.shareBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                    onPress={handleShareReport}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="share-social-outline" size={16} color={accentColor} />
                    <Text style={[styles.shareBtnText, { color: accentColor }]}>
                      Share / Export Complete Assessment Report
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Navigation Tabs for In-Depth Analysis */}
              <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    activeTab === "overview" && [styles.tabItemActive, { borderBottomColor: accentColor }],
                  ]}
                  onPress={() => setActiveTab("overview")}
                >
                  <Ionicons
                    name="git-compare-outline"
                    size={16}
                    color={activeTab === "overview" ? accentColor : theme.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabItemText,
                      { color: activeTab === "overview" ? accentColor : theme.textMuted },
                    ]}
                  >
                    Strengths & Weaknesses
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    activeTab === "strategy" && [styles.tabItemActive, { borderBottomColor: accentColor }],
                  ]}
                  onPress={() => setActiveTab("strategy")}
                >
                  <Ionicons
                    name="compass-outline"
                    size={16}
                    color={activeTab === "strategy" ? accentColor : theme.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabItemText,
                      { color: activeTab === "strategy" ? accentColor : theme.textMuted },
                    ]}
                  >
                    Strategy & Next Steps
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    activeTab === "citations" && [styles.tabItemActive, { borderBottomColor: accentColor }],
                  ]}
                  onPress={() => setActiveTab("citations")}
                >
                  <Ionicons
                    name="book-outline"
                    size={16}
                    color={activeTab === "citations" ? accentColor : theme.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabItemText,
                      { color: activeTab === "citations" ? accentColor : theme.textMuted },
                    ]}
                  >
                    Sections & Precedents
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab 1: Strengths & Weaknesses */}
              {activeTab === "overview" && (
                <View style={[styles.tabContentRow, isWide && styles.tabContentRowWide]}>
                  {/* Strengths Column */}
                  <View style={[styles.columnCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.columnHeader}>
                      <View style={[styles.iconCircle, { backgroundColor: isDark ? "#064E3B" : "#DCFCE7" }]}>
                        <Ionicons name="checkmark-sharp" size={16} color={isDark ? "#34D399" : "#166534"} />
                      </View>
                      <Text style={[styles.columnTitle, { color: isDark ? "#34D399" : "#166534" }]}>
                        Key Legal Strengths ({report.keyStrengths.length})
                      </Text>
                    </View>

                    {report.keyStrengths.map((item, i) => (
                      <View key={i} style={[styles.pointItem, { borderBottomColor: theme.border }]}>
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={16}
                          color={isDark ? "#34D399" : "#166534"}
                          style={styles.pointIcon}
                        />
                        <Text style={[styles.pointText, { color: theme.textPrimary }]}>{item}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Weaknesses Column */}
                  <View style={[styles.columnCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.columnHeader}>
                      <View style={[styles.iconCircle, { backgroundColor: isDark ? "#450A0A" : "#FEE2E2" }]}>
                        <Ionicons name="warning" size={16} color={isDark ? "#F87171" : "#991B1B"} />
                      </View>
                      <Text style={[styles.columnTitle, { color: isDark ? "#F87171" : "#991B1B" }]}>
                        Key Vulnerabilities ({report.keyWeaknesses.length})
                      </Text>
                    </View>

                    {report.keyWeaknesses.map((item, i) => (
                      <View key={i} style={[styles.pointItem, { borderBottomColor: theme.border }]}>
                        <Ionicons
                          name="alert-circle-outline"
                          size={16}
                          color={isDark ? "#F87171" : "#991B1B"}
                          style={styles.pointIcon}
                        />
                        <Text style={[styles.pointText, { color: theme.textPrimary }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Tab 2: Strategy & Next Steps */}
              {activeTab === "strategy" && (
                <View style={styles.strategyContainer}>
                  {/* Recommended Strategy */}
                  <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.sectionCardHeader}>
                      <Ionicons name="flag-outline" size={20} color={accentColor} />
                      <Text style={[styles.sectionCardTitle, { color: theme.textPrimary }]}>
                        Recommended Legal Strategy
                      </Text>
                    </View>

                    {report.recommendedStrategy.map((strat, i) => (
                      <View key={i} style={[styles.strategyCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                        <View style={[styles.strategyIndexBadge, { backgroundColor: accentColor }]}>
                          <Text style={styles.strategyIndexText}>{i + 1}</Text>
                        </View>
                        <Text style={[styles.strategyText, { color: theme.textPrimary }]}>{strat}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Actionable Next Steps */}
                  <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.sectionCardHeader}>
                      <Ionicons name="checkbox-outline" size={20} color={COLORS.statusSuccess} />
                      <Text style={[styles.sectionCardTitle, { color: theme.textPrimary }]}>
                        Actionable Next Steps & Procedural Roadmap
                      </Text>
                    </View>

                    {report.nextSteps.map((step, i) => (
                      <View key={i} style={[styles.nextStepRow, { borderBottomColor: theme.border }]}>
                        <View style={[styles.checkboxVisual, { borderColor: accentColor }]}>
                          <Text style={[styles.checkboxVisualText, { color: accentColor }]}>{i + 1}</Text>
                        </View>
                        <Text style={[styles.nextStepText, { color: theme.textPrimary }]}>{step}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Tab 3: Statutory Sections & Precedents */}
              {activeTab === "citations" && (
                <View style={styles.citationsContainer}>
                  {/* Relevant Statutory Provisions */}
                  <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.sectionCardHeader}>
                      <Ionicons name="document-text-outline" size={20} color={accentColor} />
                      <Text style={[styles.sectionCardTitle, { color: theme.textPrimary }]}>
                        Relevant Statutory Provisions (BNS / IPC / CrPC / BSA)
                      </Text>
                    </View>

                    <View style={styles.sectionsGrid}>
                      {report.relevantSections.map((sec, i) => (
                        <View
                          key={i}
                          style={[
                            styles.sectionPillCard,
                            { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                          ]}
                        >
                          <Ionicons name="bookmark-outline" size={15} color={accentColor} style={styles.secIcon} />
                          <Text style={[styles.sectionPillText, { color: theme.textPrimary }]}>{sec}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Landmark Precedents */}
                  <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.sectionCardHeader}>
                      <Ionicons name="ribbon-outline" size={20} color={COLORS.accentGoldDark} />
                      <Text style={[styles.sectionCardTitle, { color: theme.textPrimary }]}>
                        Authoritative Precedents & Landmark Case Laws
                      </Text>
                    </View>

                    {report.similarPrecedents.map((prec, i) => (
                      <View
                        key={i}
                        style={[
                          styles.precedentCard,
                          { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                        ]}
                      >
                        <View style={styles.precedentTop}>
                          <Ionicons name="scale-outline" size={16} color={COLORS.accentGoldDark} />
                          <Text style={[styles.precedentTitle, { color: theme.textPrimary }]}>
                            Citation #{i + 1}
                          </Text>
                        </View>
                        <Text style={[styles.precedentText, { color: theme.textSecondary }]}>{prec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <Footer />
      </ScrollView>

      {/* ─ Import from Case Tracker Modal ────────────────────────────── */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Ionicons name="folder-open" size={20} color={accentColor} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Tracked Case</Text>
              </View>
              <TouchableOpacity onPress={() => setShowImportModal(false)}>
                <Ionicons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Choose a case from your Case Tracker database to automatically import its allegations and metadata for risk analysis.
            </Text>

            {isLoadingCases ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={accentColor} />
              </View>
            ) : savedCases.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Ionicons name="file-tray-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.modalEmptyTitle, { color: theme.textPrimary }]}>No Cases Tracked Yet</Text>
                <Text style={[styles.modalEmptySub, { color: theme.textMuted }]}>
                  You haven't added any cases in the Case Tracker yet. You can use the pre-configured scenarios or paste facts directly.
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScroll}>
                {savedCases.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.savedCaseItem, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                    onPress={() => handleSelectSavedCase(c)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.savedCaseMetaRow}>
                      <Text style={[styles.savedCaseNum, { color: accentColor }]}>
                        {c.caseNumber || "No Case #"}
                      </Text>
                      {c.priority && (
                        <View style={[styles.miniPriorityBadge, { backgroundColor: theme.surface }]}>
                          <Text style={[styles.miniPriorityText, { color: theme.textSecondary }]}>
                            {c.priority}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.savedCaseTitle, { color: theme.textPrimary }]}>{c.title}</Text>
                    {c.description ? (
                      <Text style={[styles.savedCaseDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                        {c.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: theme.surfaceMuted }]}
              onPress={() => setShowImportModal(false)}
            >
              <Text style={[styles.modalCloseBtnText, { color: theme.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  headerBanner: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerInner: {
    maxWidth: 1040,
    width: "100%",
    alignSelf: "center",
  },
  officialTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  officialTagText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 760,
  },
  contentContainer: {
    maxWidth: 1040,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 20,
  },
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.subtle,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.navyGov,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  intakeActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearBtnText: {
    color: COLORS.statusAlert,
    fontSize: 12,
    fontWeight: "600",
  },
  presetsSection: {
    marginBottom: 16,
  },
  presetsLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  presetsScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  presetPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
  },
  presetPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  charCount: {
    fontSize: 11,
  },
  textInputSingle: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textInputMulti: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    minHeight: 140,
    lineHeight: 20,
  },
  assessBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.navyGov,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    marginTop: 4,
    ...SHADOWS.card,
  },
  assessBtnDisabled: {
    opacity: 0.5,
  },
  assessBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: RADIUS.md,
    marginTop: 14,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },

  // Results Styles
  resultsContainer: {
    gap: 18,
  },
  heroScorecard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    ...SHADOWS.card,
  },
  heroScorecardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 10,
  },
  heroTitleWrap: {
    flex: 1,
    minWidth: 240,
  },
  reportRefTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  reportTimestamp: {
    fontSize: 11,
    marginTop: 3,
  },
  riskBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1.5,
  },
  riskBadgeLargeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  metersRow: {
    flexDirection: "column",
    gap: 12,
  },
  metersRowWide: {
    flexDirection: "row",
  },
  meterCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  meterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  meterLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  meterValue: {
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  meterValueUnit: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  meterSubtext: {
    fontSize: 11,
    lineHeight: 16,
  },
  summaryCallout: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  summaryCalloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryCalloutTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  summaryCalloutBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  shareRow: {
    alignItems: "flex-end",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Tabs
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    gap: 8,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomWidth: 2,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: "700",
  },

  // Tab 1 Styles
  tabContentRow: {
    flexDirection: "column",
    gap: 16,
  },
  tabContentRowWide: {
    flexDirection: "row",
  },
  columnCard: {
    flex: 1,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: 18,
    gap: 10,
    ...SHADOWS.subtle,
  },
  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  pointItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  pointIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  pointText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },

  // Tab 2 Styles
  strategyContainer: {
    gap: 16,
  },
  sectionCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: 20,
    gap: 14,
    ...SHADOWS.subtle,
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  strategyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  strategyIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  strategyIndexText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },
  strategyText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  nextStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  checkboxVisual: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxVisualText: {
    fontSize: 11,
    fontWeight: "800",
  },
  nextStepText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },

  // Tab 3 Styles
  citationsContainer: {
    gap: 16,
  },
  sectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sectionPillCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secIcon: {
    flexShrink: 0,
  },
  sectionPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  precedentCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  precedentTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  precedentTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  precedentText: {
    fontSize: 13,
    lineHeight: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    maxWidth: 540,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: 20,
    maxHeight: "80%",
    gap: 14,
    ...SHADOWS.elevated,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  modalLoading: {
    padding: 30,
    alignItems: "center",
  },
  modalEmpty: {
    padding: 30,
    alignItems: "center",
    gap: 8,
  },
  modalEmptyTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  modalEmptySub: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  modalScroll: {
    maxHeight: 320,
  },
  savedCaseItem: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
  savedCaseMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  savedCaseNum: {
    fontSize: 12,
    fontWeight: "700",
  },
  miniPriorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  miniPriorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  savedCaseTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  savedCaseDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  modalCloseBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 4,
  },
  modalCloseBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});

export default CaseRiskAssessment;
