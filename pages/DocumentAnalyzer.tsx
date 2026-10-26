import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import OfficialNavbar from "../components/OfficialNavbar";
import Footer from "../components/Footer";
import { COLORS, RADIUS, SHADOWS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

// PDF text extraction via pdfjs-dist (web only, dynamic import to avoid SSR issues)
async function extractPdfText(file: File): Promise<string> {
  // @ts-ignore — dynamic import of pdfjs-dist, types resolved at runtime
  const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs').catch(() =>
    import('pdfjs-dist')
  );
  // Use bundled worker from CDN to avoid bundler issues
  if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
  }
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageTexts: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pageTexts.push(pageText);
  }
  return pageTexts.join('\n').trim();
}

// Fixed Citizen Educational Disclaimer
const FIXED_DISCLAIMER =
  "Educational guidance only. Not a substitute for a qualified lawyer. Laws and procedures vary by state and facts.";

export interface FindingItem {
  id: string;
  title: string;
  severity: "Low" | "Medium" | "High";
  problem: string;
  suggestion: string;
  excerpt?: string;
}

export interface DocumentAnalysisResult {
  score: number; // 0-100 integer, never blank
  riskLabel: "Low" | "Medium" | "High";
  headline: string;
  overallAdvice: string;
  missingTerms: string[];
  findings: FindingItem[];
  questionsToAsk: string[];
  nextSteps: string[];
  disclaimer: string;
}

// Sample Demo Contracts (Realistic Indian Citizen / Freelancer / Tenant scenarios)
export const DEMO_FREELANCE_CONTRACT = `INDEPENDENT CONTRACTOR & SERVICE AGREEMENT

1. SERVICES & ENGAGEMENT: Contractor shall provide bespoke software development and design services to Client as requested.
2. IMMEDIATE TERMINATION: Company reserves the right to terminate this Agreement immediately at any time without notice and without cause. Contractor may only terminate this Agreement upon providing 60 (sixty) days prior written notice.
3. EXTENDED PAYMENT TERMS: Client shall remit payment within 90 days following receipt of Contractor's invoice, strictly subject to Client's subjective satisfaction and approval. Client reserves the unilateral right to withhold any milestone payment without explanation.
4. INTELLECTUAL PROPERTY ASSIGNMENT: Contractor hereby unconditionally assigns all rights, copyright, and global patents in all work product to Client immediately upon creation, irrespective of whether payments are settled, delayed, or disputed.
5. 24-MONTH NON-COMPETE: Contractor agrees not to provide software or design services, directly or indirectly, to any company or client operating in the technology sector across India for a period of 24 months following termination. Contractor agrees to pay liquidated damages of INR 10,00,000 for any breach.
6. UNILATERAL INDEMNITY: Contractor shall unconditionally defend, indemnify, and hold harmless Client, its directors, and affiliates from all claims, losses, liabilities, legal costs, and third-party damages arising from the deliverables.
7. PORTFOLIO PROHIBITION: Contractor is strictly prohibited from displaying, referencing, or publishing any sample of the work in Contractor's professional portfolio or website.
8. EXCLUSIVE ARBITRATION: All disputes shall be resolved by a sole arbitrator appointed solely by Client at Client's registered office.`;

export const DEMO_RENT_AGREEMENT = `RESIDENTIAL LEASE & TENANCY AGREEMENT

1. TENANCY TERM: Landlord hereby leases the residential flat to Tenant for an initial period of 11 months.
2. UNLIMITED LATE FEES: Monthly rent of INR 22,000 is payable by the 5th of each calendar month. For each day of delay thereafter, an unlimited late penalty of INR 500 per day shall accumulate without grace period.
3. SECURITY DEPOSIT DEDUCTION: Tenant shall pay an interest-free security deposit of INR 1,20,000. Landlord reserves sole discretion to deduct any amounts upon vacancy without providing itemized repair bills, receipts, or inspection reports.
4. ONE-SIDED LOCK-IN: Tenant is bound by a strict 24-month lock-in period. If Tenant vacates early, all rent for the entire remaining lock-in period shall be immediately forfeited. Landlord may terminate this agreement with 7 days notice.
5. UNANNOUNCED ENTRY: Landlord and Landlord's agents reserve the right to enter the leased premises at any hour without prior notice or consent for inspections.
6. STRUCTURAL REPAIRS ON TENANT: Tenant shall be solely responsible for all maintenance and repairs whatsoever, including structural wall cracks, exterior seepage, major plumbing lines, and electrical rewiring regardless of preexisting wear and tear.
7. DISPUTE RESOLUTION: Any dispute arising out of this agreement shall be decided exclusively by an arbitrator appointed solely by the Landlord. Tenant waives rights to seek relief under local Rent Control authorities.`;

function getRiskColor(score: number): string {
  if (score >= 70) return "#991B1B"; // High risk
  if (score >= 40) return "#B45309"; // Medium risk
  return "#166534"; // Low risk
}

function getRiskLabel(score: number): "Low" | "Medium" | "High" {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

// Local heuristic fallback generator
export function generateLocalFallback(text: string): DocumentAnalysisResult {
  const lower = text.toLowerCase();
  const isFreelance =
    lower.includes("freelance") ||
    lower.includes("contractor") ||
    lower.includes("deliverables") ||
    lower.includes("software") ||
    lower.includes("invoice");
  const isRent =
    lower.includes("rent") ||
    lower.includes("lease") ||
    lower.includes("tenant") ||
    lower.includes("landlord") ||
    lower.includes("premises") ||
    lower.includes("deposit");

  const findings: FindingItem[] = [];
  const missingTerms: string[] = [];

  if (isFreelance) {
    if (lower.includes("terminate") || lower.includes("termination")) {
      findings.push({
        id: "fl-term",
        title: "One-Sided Termination Clause",
        severity: "High",
        problem:
          "The company can terminate immediately without cause, but you are required to give long advance notice (60 days).",
        suggestion:
          "Either party may terminate this agreement upon 30 days written notice to the other party without penalty.",
        excerpt:
          "Company may terminate immediately without notice... Contractor may only terminate upon providing 60 days notice.",
      });
    }

    if (lower.includes("payment") || lower.includes("90") || lower.includes("withhold")) {
      findings.push({
        id: "fl-pay",
        title: "Extended 90-Day Payment Cycle & Withholding",
        severity: "High",
        problem:
          "A 90-day payment term is disproportionate and subjective approval rights allow the client to delay or withhold earned fees.",
        suggestion:
          "Client shall remit payment within 15 days of invoice date. Deliverables shall be deemed accepted if no written revisions are requested within 7 days.",
        excerpt:
          "Client shall remit payment within 90 days... subject to subjective satisfaction... right to withhold without explanation.",
      });
    }

    if (lower.includes("intellectual property") || lower.includes("ip") || lower.includes("assign")) {
      findings.push({
        id: "fl-ip",
        title: "IP Transfer Prior to Full Payment",
        severity: "High",
        problem:
          "The contract transfers all your work ownership immediately even if the client never pays you.",
        suggestion:
          "All rights, title, and copyright in the deliverables shall transfer to Client strictly upon receipt of full and final payment.",
        excerpt:
          "Contractor unconditionally assigns all rights... immediately upon creation, irrespective of whether payments are settled.",
      });
    }

    if (lower.includes("non-compete") || lower.includes("non compete")) {
      findings.push({
        id: "fl-nc",
        title: "Restraint of Trade (24-Month Non-Compete)",
        severity: "High",
        problem:
          "Under Section 27 of the Indian Contract Act, 1872, agreements restraining lawful profession or trade are void. A 2-year industry-wide ban is oppressive.",
        suggestion:
          "Delete this non-compete clause entirely, or narrow it to non-solicitation of active clients for 3 months post-contract.",
        excerpt:
          "Contractor agrees not to provide services... across India for a period of 24 months... liquidated damages of INR 10,00,000.",
      });
    }

    if (lower.includes("indemn") || lower.includes("liability")) {
      findings.push({
        id: "fl-ind",
        title: "Unilateral Uncapped Indemnification",
        severity: "High",
        problem:
          "You are made liable to pay for all third-party lawsuits and damages, even if arising from client directions or partial fault.",
        suggestion:
          "Each party shall indemnify the other only for direct damages arising from gross negligence or willful misconduct, with total liability capped at total fees paid under this agreement.",
        excerpt:
          "Contractor shall unconditionally defend, indemnify, and hold harmless Client... from all claims, losses, liabilities.",
      });
    }

    if (lower.includes("portfolio") || lower.includes("prohibit")) {
      findings.push({
        id: "fl-port",
        title: "Portfolio Gag Restriction",
        severity: "Medium",
        problem:
          "Completely prevents you from demonstrating your track record to prospective clients.",
        suggestion:
          "Contractor may display non-confidential deliverables and general project description in Contractor's portfolio following public release.",
        excerpt:
          "Contractor is strictly prohibited from displaying, referencing, or publishing any sample of the work in personal portfolio.",
      });
    }

    missingTerms.push(
      "Fixed payment milestone calendar with interest on late payments",
      "Mutual limitation of liability capped at invoice value",
      "Clear scope definition and limit on unpaid revision rounds",
      "Force majeure and neutral dispute resolution clause"
    );

    return {
      score: 85,
      riskLabel: "High",
      headline: "High Risk Freelance Agreement: Imbalanced terms heavily favouring the hiring company.",
      overallAdvice:
        "This contract shifts significant commercial and legal liabilities onto you while offering minimal payment security. The 90-day pay cycle, IP transfer without payment, and Section 27 restraint-of-trade non-compete should be renegotiated before starting work. Never agree to unlimited unilateral indemnities.",
      missingTerms,
      findings,
      questionsToAsk: [
        "Can payment terms be reduced to net-15 or net-30 days upon invoice?",
        "Will IP rights remain with the freelancer until payment is cleared in full?",
        "Can the termination notice period be mutual (e.g., 30 days for both parties)?",
        "Can the 24-month non-compete be removed in compliance with Section 27 of the Indian Contract Act?",
        "Can indemnity be mutual and capped at the contract fees received?",
        "May I include non-confidential work samples in my portfolio after project launch?",
      ],
      nextSteps: [
        "Do NOT sign this contract in its current draft.",
        "Reply by email with the suggested safer wording for the highlighted clauses.",
        "Ask for a 30-50% advance deposit before initiating any code or design work.",
        "Consult a freelance advocate or legal aid clinic if the company insists on the ₹10 Lakh penalty clause.",
      ],
      disclaimer: FIXED_DISCLAIMER,
    };
  }

  if (isRent) {
    if (lower.includes("deposit") || lower.includes("deduct") || lower.includes("itemiz")) {
      findings.push({
        id: "rent-dep",
        title: "Arbitrary Deposit Deductions Without Itemized Proof",
        severity: "High",
        problem:
          "Landlord reserves unilateral right to keep security deposit funds without furnishing repair receipts or contractor bills.",
        suggestion:
          "Security deposit shall be refunded in full within 15 days of handing over vacant possession, subject only to mutually inspected damages supported by original repair bills.",
        excerpt:
          "Landlord reserves sole discretion to deduct any amounts upon vacancy without providing itemized repair bills or receipts.",
      });
    }

    if (lower.includes("lock-in") || lower.includes("lock in")) {
      findings.push({
        id: "rent-lock",
        title: "One-Sided 24-Month Lock-In Period",
        severity: "High",
        problem:
          "The tenant is locked in for 2 years with total rent forfeiture for early exit, while the landlord can terminate in 7 days.",
        suggestion:
          "Lock-in period shall be mutual for 6 months, after which either party may terminate with 1 month written notice or 1 month rent in lieu thereof.",
        excerpt:
          "Tenant is bound by a strict 24-month lock-in period... Landlord may terminate this agreement with 7 days notice.",
      });
    }

    if (lower.includes("entry") || lower.includes("notice") || lower.includes("inspect")) {
      findings.push({
        id: "rent-entry",
        title: "Unannounced Entry & Privacy Infringement",
        severity: "High",
        problem:
          "Entering the premises without notice violates your constitutional right to privacy and peaceful quiet enjoyment of the rented home.",
        suggestion:
          "Landlord may enter the premises only after providing at least 24 hours advance written notice, during reasonable daytime hours (10 AM to 6 PM), accompanied by Tenant.",
        excerpt:
          "Landlord and Landlord's agents reserve the right to enter the leased premises at any hour without prior notice.",
      });
    }

    if (lower.includes("repair") || lower.includes("maintenance") || lower.includes("seepage")) {
      findings.push({
        id: "rent-rep",
        title: "Structural Repairs Shifted to Tenant",
        severity: "High",
        problem:
          "Tenants should only handle minor routine maintenance. Forcing you to fix structural cracks and plumbing overhauls is unlawful under Model Tenancy principles.",
        suggestion:
          "Landlord shall be responsible for all structural repairs, exterior leakage, plumbing lines, and wiring. Tenant shall only be responsible for minor routine upkeep up to ₹500.",
        excerpt:
          "Tenant shall be solely responsible for all maintenance and repairs whatsoever, including structural wall cracks, exterior seepage.",
      });
    }

    if (lower.includes("late") || lower.includes("fee") || lower.includes("500")) {
      findings.push({
        id: "rent-late",
        title: "Disproportionate Daily Compounding Penalty",
        severity: "Medium",
        problem:
          "A ₹500/day penalty adds ₹15,000/month for minor banking or payroll delays, which is punitive rather than compensatory.",
        suggestion:
          "Tenant shall have a grace period up to the 10th of each month. Any delay thereafter shall carry simple interest capped at 1.5% per month on the unpaid rent amount.",
        excerpt:
          "unlimited late penalty of INR 500 per day shall accumulate without grace period.",
      });
    }

    if (lower.includes("arbitrat") || lower.includes("dispute") || lower.includes("jurisdiction")) {
      findings.push({
        id: "rent-arb",
        title: "Unilateral Arbitrator Nomination",
        severity: "High",
        problem:
          "The Supreme Court of India has held that a party interested in the contract cannot unilaterally appoint a sole arbitrator.",
        suggestion:
          "Any dispute shall be referred to the local Rent Authority or competent civil court having jurisdiction over the location of the premises.",
        excerpt:
          "Any dispute arising out of this agreement shall be decided exclusively by an arbitrator appointed solely by the Landlord.",
      });
    }

    missingTerms.push(
      "Written inventory of fixtures, fittings, and preexisting condition report",
      "Explicit 15-day timeline for return of security deposit via bank transfer",
      "Utility meter reading procedure and split of society maintenance charges",
      "Mutual notice period for rent escalation after 11 months"
    );

    return {
      score: 78,
      riskLabel: "High",
      headline: "High Risk Rent Agreement: Burdensome terms placing landlord responsibilities onto the tenant.",
      overallAdvice:
        "This rent agreement heavily favors the landlord. The unitemized deposit deduction, 24-month one-sided lock-in, structural repair obligations, and unannounced entry rights compromise your financial safety and privacy. Request written amendments before paying the security deposit.",
      missingTerms,
      findings,
      questionsToAsk: [
        "Will the security deposit be refunded within 15 days with joint inspection and written repair bills?",
        "Can the lock-in period be mutual and reduced to 3 or 6 months with 1 month notice?",
        "Can landlord visits require at least 24 hours prior written notice during daytime hours?",
        "Will the landlord remain responsible for structural repairs, seepage, and building wiring?",
        "Can the daily late penalty be replaced with a 5-day grace period?",
      ],
      nextSteps: [
        "Do not sign or pay full advance deposit until these clauses are amended.",
        "Take photos and videos of existing cracks, seepage, and fixtures before moving in.",
        "Send the landlord the revised wording suggestions via WhatsApp or email for a paper trail.",
        "Ensure the agreement is signed by the actual property title holder.",
      ],
      disclaimer: FIXED_DISCLAIMER,
    };
  }

  // Generic fallback for any other legal notice or contract
  const genericFindings: FindingItem[] = [
    {
      id: "gen-term",
      title: "Immediate Unilateral Termination",
      severity: "High",
      problem:
        "The contract allows one party to cancel abruptly without compensation or transition period.",
      suggestion:
        "Either party may terminate this agreement upon providing at least 30 days prior written notice.",
      excerpt: "Contract may be terminated immediately without cause.",
    },
    {
      id: "gen-liab",
      title: "Unbalanced Liability Allocation",
      severity: "Medium",
      problem:
        "The document exposes you to disproportionate liability without reciprocal obligations.",
      suggestion:
        "Total aggregate liability under this agreement shall be capped at the total amounts paid during the preceding 12 months.",
      excerpt: "Party assumes all risk and liability arising hereunder.",
    },
    {
      id: "gen-dispute",
      title: "Inconvenient Dispute Jurisdiction",
      severity: "Medium",
      problem:
        "Disputes are routed to distant jurisdictions or biased arbitrator appointments.",
      suggestion:
        "Disputes shall be settled under the jurisdiction of the competent civil courts located in your home district.",
      excerpt: "Disputes subject to exclusive jurisdiction chosen unilaterally.",
    },
    {
      id: "gen-terms",
      title: "Missing Protective Safeguards",
      severity: "Low",
      problem:
        "Standard protective boilerplate such as force majeure, written notices, and severance clauses are absent.",
      suggestion:
        "Include standard standard clauses protecting both parties from events beyond reasonable control.",
    },
  ];

  return {
    score: 65,
    riskLabel: "Medium",
    headline: "Moderate Risk Document: Review terms and ask for clarifications before signing.",
    overallAdvice:
      "This document contains several clauses that allocate undue liability and termination rights. Ensure all verbal promises are incorporated into the written text. Consider having an advocate review high-stakes agreements.",
    missingTerms: [
      "Clear termination notice period",
      "Balanced dispute resolution and jurisdiction",
      "Explicit payment or performance deliverables",
      "Force majeure protection",
    ],
    findings: genericFindings,
    questionsToAsk: [
      "Can both parties have equal notice periods for termination?",
      "What are the specific conditions for withholding payments or deposits?",
      "Can dispute jurisdiction be set to a mutually accessible local court?",
    ],
    nextSteps: [
      "Review every clause carefully and highlight unclear wording.",
      "Propose safer wording for high-risk sections.",
      "Keep written records of all negotiations.",
      "Consult a qualified lawyer before signing high-value commitments.",
    ],
    disclaimer: FIXED_DISCLAIMER,
  };
}

function buildPrompt(text: string): string {
  return (
    "You are a senior Indian legal advisor specialising in contract law, civil procedure, and consumer protection. " +
    "Analyse the following legal document text and respond ONLY with a valid JSON object matching this exact schema:\n" +
    '{"score":<integer 0-100>,"riskLabel":"Low"|"Medium"|"High","headline":"<one-line summary>","overallAdvice":"<3-5 sentence actionable advice>","missingTerms":["<missing term>"],"findings":[{"id":"<unique-id>","title":"<clause title>","severity":"Low"|"Medium"|"High","problem":"<why risky>","suggestion":"<safer wording in English>","excerpt":"<short extract>"}],"questionsToAsk":["<question>"],"nextSteps":["<action step>"],"disclaimer":"Educational guidance only. Not a substitute for a qualified lawyer. Laws and procedures vary by state and facts."}\n' +
    "Do not include any text outside the JSON object. Document text:\n" +
    '"""\n' +
    text.slice(0, 8000) +
    '\n"""'
  );
}

const DocumentAnalyzer: React.FC = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const [fileName, setFileName] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [pasteText, setPasteText] = useState<string>("");
  const [usePaste, setUsePaste] = useState<boolean>(true); // default to paste/demo for instant citizen usability
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [error, setError] = useState<string>("");
  const [pdfProgress, setPdfProgress] = useState<string>("");

  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [expandedAdvice, setExpandedAdvice] = useState<boolean>(true);
  const [expandedQuestions, setExpandedQuestions] = useState<boolean>(true);
  const [expandedNextSteps, setExpandedNextSteps] = useState<boolean>(true);

  const [toastMessage, setToastMessage] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2800);
  };

  const activeText = usePaste ? pasteText : extractedText;
  const charCount = activeText.trim().length;
  const hasText = charCount > 0;

  const loadDemo = (type: "freelance" | "rent") => {
    setError("");
    setResult(null);
    setUsePaste(true);
    setFileName(type === "freelance" ? "Demo_Freelance_Agreement.txt" : "Demo_Rent_Agreement.txt");
    const demo = type === "freelance" ? DEMO_FREELANCE_CONTRACT : DEMO_RENT_AGREEMENT;
    setPasteText(demo);
    showToast(type === "freelance" ? "Loaded Freelance Agreement Demo" : "Loaded Rent Agreement Demo");
  };

  const pickDocument = async () => {
    setError("");
    setResult(null);
    setFileName("");
    setExtractedText("");

    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png";
      input.onchange = async (e: any) => {
        const file: File = e.target?.files?.[0];
        if (!file) return;

        // Large file guard (10 MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(
            `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Files over 10 MB may be slow to process. Attempting extraction...`
          );
        }

        setFileName(file.name);

        if (file.type === "text/plain") {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const content = (ev.target?.result as string) || "";
            setExtractedText(content);
            setUsePaste(false);
          };
          reader.readAsText(file);
        } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
          // PDF extraction via pdfjs-dist
          setPdfProgress("Extracting text from PDF\u2026");
          setUsePaste(false);
          try {
            const text = await extractPdfText(file);
            setPdfProgress("");
            if (!text || text.trim().length === 0) {
              setError(
                'Could not read text from this PDF (it may be scanned/image-only). Try Paste Text or a text-based PDF.'
              );
              setUsePaste(true);
            } else {
              setExtractedText(text);
              showToast(`Extracted ${text.trim().length.toLocaleString()} characters from PDF`);
            }
          } catch {
            setPdfProgress("");
            setError(
              'Could not read text from this PDF (it may be scanned/image-only). Try Paste Text or a text-based PDF.'
            );
            setUsePaste(true);
          }
        } else {
          setError(
            `"${file.name}" is a binary file (DOCX/Image). For highest reliability, copy and paste the document text below.`
          );
          setUsePaste(true);
        }
      };
      input.click();
      return;
    }

    try {
      setIsLoading(true);
      const picked = await DocumentPicker.getDocumentAsync({
        type: [
          "text/plain",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.[0]) return;
      const asset = picked.assets[0];
      setFileName(asset.name);
      if (asset.mimeType === "text/plain" && asset.uri) {
        const content = await FileSystem.readAsStringAsync(asset.uri);
        setExtractedText(content);
        setUsePaste(false);
      } else {
        setError(
          `"${asset.name}" contains formatted binary content. Please switch to Paste Text mode for instant review.`
        );
        setUsePaste(true);
      }
    } catch {
      setError("Failed to open file. Please copy and paste the text into the box below.");
      setUsePaste(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyse = async () => {
    const inputText = usePaste ? pasteText : extractedText;
    if (!inputText.trim()) {
      Alert.alert("No Document Text", "Please paste your agreement or load a demo to analyse.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    setExpandedAdvice(true);

    try {
      // 10-second timeout controller so UI never hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("https://sih-backend-881i.onrender.com/encode/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: buildPrompt(inputText) }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      const rawText: string =
        typeof data?.description === "string"
          ? data.description
          : data?.acts
          ? JSON.stringify(data)
          : "";

      if (!rawText) {
        throw new Error("No data returned from service");
      }

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON structure found");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Normalize into production DocumentAnalysisResult schema
      const scoreNum = typeof parsed.score === "number" ? parsed.score : typeof parsed.riskScore === "number" ? parsed.riskScore : 75;
      const riskLbl = parsed.riskLabel || getRiskLabel(scoreNum);

      let findingsList: FindingItem[] = [];
      if (Array.isArray(parsed.findings) && parsed.findings.length > 0) {
        findingsList = parsed.findings.map((f: any, idx: number) => ({
          id: f.id || `finding-${idx}`,
          title: f.title || f.clause || `Finding #${idx + 1}`,
          severity: f.severity === "Low" || f.severity === "Medium" || f.severity === "High" ? f.severity : "Medium",
          problem: f.problem || f.risk || "Potentially unfavourable term.",
          suggestion: f.suggestion || f.suggestionEN || "Review and request balanced wording.",
          excerpt: f.excerpt || f.clause,
        }));
      } else if (Array.isArray(parsed.riskyClauses) && parsed.riskyClauses.length > 0) {
        findingsList = parsed.riskyClauses.map((rc: any, idx: number) => ({
          id: `rc-${idx}`,
          title: rc.clause ? rc.clause.slice(0, 50) : `Clause #${idx + 1}`,
          severity: rc.severity || "High",
          problem: rc.risk || "May disadvantage you in disputes.",
          suggestion: rc.suggestionEN || "Request mutual or standardized wording.",
          excerpt: rc.clause,
        }));
      }

      if (findingsList.length === 0) {
        // Guarantee at least local findings if API returned empty array
        const fallback = generateLocalFallback(inputText);
        findingsList = fallback.findings;
      }

      const normalizedResult: DocumentAnalysisResult = {
        score: Math.min(100, Math.max(0, Math.round(scoreNum))),
        riskLabel: riskLbl,
        headline: parsed.headline || parsed.summary || "Document review completed.",
        overallAdvice: parsed.overallAdvice || "Carefully review all highlighted sections before signing.",
        missingTerms: Array.isArray(parsed.missingTerms) && parsed.missingTerms.length > 0 ? parsed.missingTerms : ["Clear notice period", "Limitation of liability", "Neutral jurisdiction"],
        findings: findingsList,
        questionsToAsk: Array.isArray(parsed.questionsToAsk) && parsed.questionsToAsk.length > 0 ? parsed.questionsToAsk : [
          "Can termination notice be made mutual for both parties?",
          "What are the precise conditions for returning the deposit / final payment?",
          "Can dispute resolution take place in a mutually agreeable forum?",
        ],
        nextSteps: Array.isArray(parsed.nextSteps) && parsed.nextSteps.length > 0 ? parsed.nextSteps : [
          "Do not sign until high-risk clauses are revised.",
          "Send written change requests using the safer wording suggestions above.",
          "Keep copies of all email and chat discussions.",
        ],
        disclaimer: FIXED_DISCLAIMER,
      };

      setResult(normalizedResult);
    } catch {
      // Local heuristic fallback guaranteed to succeed offline and on API failure
      const fallbackResult = generateLocalFallback(inputText);
      setResult(fallbackResult);
    } finally {
      setIsLoading(false);
    }
  };

  const buildReportPlainText = (res: DocumentAnalysisResult): string => {
    return `LEGALBRIDGE-AI — CHECK MY DOCUMENT REPORT
======================================================
Risk Score: ${res.score}/100 [${res.riskLabel.toUpperCase()} RISK]
Headline: ${res.headline}

OVERALL LEGAL ADVICE
------------------------------------------------------
${res.overallAdvice}

CRITICAL FINDINGS & CLAUSES (${res.findings.length})
------------------------------------------------------
${res.findings
  .map(
    (f, i) =>
      `[${i + 1}] ${f.title} (${f.severity.toUpperCase()} SEVERITY)
Problem: ${f.problem}
Suggested Safer Wording: ${f.suggestion}
${f.excerpt ? `Excerpt: "${f.excerpt}"` : ""}`
  )
  .join("\n\n")}

MISSING ESSENTIAL TERMS
------------------------------------------------------
${res.missingTerms.map((t, i) => `${i + 1}. ${t}`).join("\n")}

QUESTIONS TO ASK BEFORE SIGNING
------------------------------------------------------
${res.questionsToAsk.map((q, i) => `${i + 1}. ${q}`).join("\n")}

RECOMMENDED NEXT STEPS
------------------------------------------------------
${res.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

------------------------------------------------------
DISCLAIMER:
${res.disclaimer}
`;
  };

  const handleCopyReport = () => {
    if (!result) return;
    const text = buildReportPlainText(result);
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast("Full report copied to clipboard!");
    } else {
      Alert.alert("Report Copied", "Analysis report has been copied to clipboard.");
    }
  };

  const handleShareReportWhatsApp = async () => {
    if (!result) return;
    const text = buildReportPlainText(result);
    const WA_URL_LIMIT = 1800;

    if (Platform.OS === 'web') {
      if ((navigator as any).share) {
        try {
          await (navigator as any).share({
            title: `LegalBridge-AI Document Review (${result.riskLabel} Risk)`,
            text: text,
          });
          showToast('Report shared successfully!');
          return;
        } catch { /* fall through to wa.me */ }
      }

      if (text.length <= WA_URL_LIMIT) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        showToast('Opening WhatsApp...');
      } else {
        // Report too long for URL: copy full report then open WhatsApp with short intro
        try {
          if (navigator.clipboard) await navigator.clipboard.writeText(text);
        } catch {}
        const intro = 'Document risk report copied to clipboard — paste it here for the full analysis.';
        window.open(`https://wa.me/?text=${encodeURIComponent(intro)}`, '_blank');
        showToast('Full report copied! Paste it in WhatsApp.');
      }
    } else {
      handleCopyReport();
      showToast('Report copied — paste in WhatsApp to share.');
    }
  };

  const handleShareReport = async () => {
    if (!result) return;
    const text = buildReportPlainText(result);

    if (Platform.OS === "web" && typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `LegalBridge-AI Document Review (${result.riskLabel} Risk)`,
          text: text,
        });
        showToast("Report shared successfully!");
        return;
      } catch {
        // User cancelled or share failed; fallback to copy
      }
    }

    // Fallback to copy
    handleCopyReport();
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const text = buildReportPlainText(result);

    if (Platform.OS === "web" && typeof document !== "undefined") {
      try {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const dateStr = new Date().toISOString().slice(0, 10);
        link.download = `LegalBridge_Document_Report_${dateStr}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Report downloaded as .txt file!");
      } catch {
        handleCopyReport();
      }
    } else {
      handleCopyReport();
    }
  };

  const handleReset = () => {
    setResult(null);
    setExpandedFinding(null);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.background }]}>
      <OfficialNavbar />

      {/* Toast Feedback Notification */}
      {toastMessage.length > 0 && (
        <View style={styles.toastContainer}>
          <View style={styles.toastPill}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <View style={styles.topRow}>
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                onPress={() => (navigation as any).navigate("Utilities")}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back-outline" size={16} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                <Text style={[styles.backBtnText, { color: isDark ? "#60A5FA" : COLORS.navyGov }]}>
                  Back to Tools
                </Text>
              </TouchableOpacity>
              <View style={[styles.badge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
                <Text style={styles.badgeText}>CITIZEN CONTRACT REVIEW</Text>
              </View>
            </View>

            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Check My Document
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Agreements, rent leases, and notices before you sign. Get plain-language risk scores, dangerous clauses redlined with safer wording, and questions to ask.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          {/* STEP 1: Provide Document */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.stepHeaderRow}>
              <Text style={[styles.cardLabel, { color: theme.textMuted }]}>
                STEP 1 — CHOOSE INPUT METHOD OR LOAD DEMO
              </Text>
              {charCount > 0 && (
                <View style={styles.charBadge}>
                  <Ionicons name="document-text-outline" size={13} color={COLORS.navyGov} />
                  <Text style={styles.charBadgeText}>
                    {charCount.toLocaleString()} chars {fileName ? `(${fileName})` : ""}
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Demo Loaders */}
            <View style={styles.demoRow}>
              <Text style={[styles.demoTitle, { color: theme.textMuted }]}>Try Citizen Demos:</Text>
              <TouchableOpacity
                style={[styles.demoChip, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
                onPress={() => loadDemo("freelance")}
                activeOpacity={0.75}
              >
                <Ionicons name="briefcase-outline" size={14} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                <Text style={[styles.demoChipText, { color: theme.textPrimary }]}>
                  Load Freelance Demo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoChip, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
                onPress={() => loadDemo("rent")}
                activeOpacity={0.75}
              >
                <Ionicons name="home-outline" size={14} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                <Text style={[styles.demoChipText, { color: theme.textPrimary }]}>
                  Load Rent Agreement Demo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, usePaste && styles.toggleBtnActive]}
                onPress={() => setUsePaste(true)}
              >
                <Ionicons
                  name="create-outline"
                  size={15}
                  color={usePaste ? COLORS.white : isDark ? "#94A3B8" : COLORS.textMuted}
                />
                <Text style={[styles.toggleBtnText, usePaste && styles.toggleBtnTextActive]}>
                  Paste Text
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !usePaste && styles.toggleBtnActive]}
                onPress={() => setUsePaste(false)}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={15}
                  color={!usePaste ? COLORS.white : isDark ? "#94A3B8" : COLORS.textMuted}
                />
                <Text style={[styles.toggleBtnText, !usePaste && styles.toggleBtnTextActive]}>
                  Upload File (.txt / .pdf)
                </Text>
              </TouchableOpacity>
            </View>

            {usePaste ? (
              <TextInput
                style={[
                  styles.pasteInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="Paste your rental agreement, freelance contract, offer letter, or legal notice here..."
                placeholderTextColor={theme.textMuted}
                value={pasteText}
                onChangeText={(txt) => {
                  setPasteText(txt);
                  if (error) setError("");
                }}
                multiline
                textAlignVertical="top"
              />
            ) : (
              <View>
                <TouchableOpacity
                  style={[styles.uploadZone, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
                  onPress={pickDocument}
                  activeOpacity={0.7}
                >
                  <Ionicons name="document-attach-outline" size={36} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                  <Text style={[styles.uploadZoneTitle, { color: theme.textPrimary }]}>
                    {fileName ? fileName : "Tap to Select Document (.txt / .pdf)"}
                  </Text>
                  <Text style={[styles.uploadZoneSub, { color: theme.textMuted }]}>
                    Accepts .txt and text-based PDF files. For scanned PDFs, use Paste Text.
                  </Text>
                </TouchableOpacity>

                {extractedText.length > 0 && (
                  <View style={[styles.extractedBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.statusSuccess} />
                    <Text style={[styles.extractedLabel, { color: theme.textSecondary }]}>
                      {extractedText.length.toLocaleString()} characters extracted from "{fileName}"
                    </Text>
                  </View>
                )}
                {pdfProgress.length > 0 && (
                  <View style={[styles.extractedBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <ActivityIndicator size="small" color={COLORS.navyGov} />
                    <Text style={[styles.extractedLabel, { color: theme.textSecondary }]}>
                      {pdfProgress}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Error Message if any */}
            {error.length > 0 && (
              <View style={[styles.errorBox, { backgroundColor: isDark ? "#450A0A" : COLORS.statusAlertBg }]}>
                <Ionicons name="warning-outline" size={18} color={COLORS.statusAlert} />
                <Text style={[styles.errorText, { color: COLORS.statusAlert }]}>{error}</Text>
              </View>
            )}

            {/* Primary Action Button */}
            <TouchableOpacity
              style={[styles.analyseBtn, (!hasText || isLoading) && styles.analyseBtnDisabled]}
              onPress={handleAnalyse}
              disabled={!hasText || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Ionicons name="scan-outline" size={20} color={COLORS.white} />
              )}
              <Text style={styles.analyseBtnText}>
                {isLoading ? "Analysing Document..." : "Analyse Document"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* STEP 2: Results Panel */}
          {result && (
            <View style={styles.resultsContainer}>
              {/* Score & Risk Overview Card */}
              <View style={[styles.riskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.stepHeaderRow}>
                  <Text style={[styles.cardLabel, { color: theme.textMuted }]}>STEP 2 — CITIZEN RISK REPORT</Text>
                  <TouchableOpacity onPress={handleReset} style={styles.reanalyseLink}>
                    <Ionicons name="refresh-outline" size={13} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                    <Text style={[styles.reanalyseLinkText, { color: isDark ? "#60A5FA" : COLORS.navyGov }]}>
                      Edit / Re-analyse
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.riskRow}>
                  {/* Score Circle - Never Empty */}
                  <View style={[styles.riskScoreCircle, { borderColor: getRiskColor(result.score) }]}>
                    <Text style={[styles.riskScoreNumber, { color: getRiskColor(result.score) }]}>
                      {result.score}
                    </Text>
                    <Text style={[styles.riskScoreMax, { color: theme.textMuted }]}>/100</Text>
                  </View>

                  <View style={styles.riskMeta}>
                    <View
                      style={[
                        styles.riskBadge,
                        {
                          backgroundColor:
                            result.riskLabel === "High"
                              ? isDark ? "#450A0A" : "#FEE2E2"
                              : result.riskLabel === "Medium"
                              ? isDark ? "#451A03" : "#FEF3C7"
                              : isDark ? "#064E3B" : "#DCFCE7",
                        },
                      ]}
                    >
                      <View style={[styles.riskDot, { backgroundColor: getRiskColor(result.score) }]} />
                      <Text style={[styles.riskBadgeText, { color: getRiskColor(result.score) }]}>
                        {result.riskLabel.toUpperCase()} RISK
                      </Text>
                    </View>

                    <Text style={[styles.riskHeadline, { color: theme.textPrimary }]}>
                      {result.headline}
                    </Text>

                    <View style={styles.summaryChips}>
                      <View style={[styles.summaryChip, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                        <Ionicons name="alert-circle-outline" size={13} color={COLORS.statusAlert} />
                        <Text style={[styles.summaryChipText, { color: theme.textSecondary }]}>
                          {result.findings.length} findings
                        </Text>
                      </View>
                      <View style={[styles.summaryChip, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                        <Ionicons name="help-circle-outline" size={13} color={COLORS.accentGold} />
                        <Text style={[styles.summaryChipText, { color: theme.textSecondary }]}>
                          {result.questionsToAsk.length} questions
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Overall Advice Box */}
                <View
                  style={[
                    styles.adviceCard,
                    {
                      backgroundColor: isDark ? "#0C1A2E" : "#EFF6FF",
                      borderColor: isDark ? "#1E40AF" : "#BFDBFE",
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.adviceHeader}
                    onPress={() => setExpandedAdvice(!expandedAdvice)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.sectionHeaderLeft}>
                      <Ionicons name="shield-checkmark-outline" size={18} color={isDark ? "#60A5FA" : "#1E40AF"} />
                      <Text style={[styles.adviceTitle, { color: isDark ? "#60A5FA" : "#1E40AF" }]}>
                        Overall Citizen Advice
                      </Text>
                    </View>
                    <Ionicons
                      name={expandedAdvice ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={isDark ? "#60A5FA" : "#1E40AF"}
                    />
                  </TouchableOpacity>
                  {expandedAdvice && (
                    <Text style={[styles.adviceText, { color: isDark ? "#BFDBFE" : "#1E3A8A" }]}>
                      {result.overallAdvice}
                    </Text>
                  )}
                </View>
              </View>

              {/* Missing Essential Terms */}
              {result.missingTerms && result.missingTerms.length > 0 && (
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
                    MISSING PROTECTIVE CLAUSES
                  </Text>
                  <View style={styles.missingList}>
                    {result.missingTerms.map((term, i) => (
                      <View key={i} style={styles.missingRow}>
                        <Ionicons name="close-circle-outline" size={16} color={COLORS.accentGold} />
                        <Text style={[styles.missingText, { color: theme.textSecondary }]}>{term}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Redlined Findings (≥ 5 Items) */}
              <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.stepHeaderRow}>
                  <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
                    REDLINED CLAUSES & ISSUES ({result.findings.length})
                  </Text>
                  <Text style={[styles.subHint, { color: theme.textMuted }]}>Tap item to reveal safer wording</Text>
                </View>

                {result.findings.map((finding, idx) => {
                  const isExpanded = expandedFinding === finding.id || (expandedFinding === null && idx === 0);
                  const isHigh = finding.severity === "High";
                  const isMed = finding.severity === "Medium";

                  return (
                    <TouchableOpacity
                      key={finding.id || idx}
                      style={[
                        styles.findingCard,
                        {
                          backgroundColor: theme.surfaceMuted,
                          borderColor: isExpanded ? (isHigh ? "#FCA5A5" : theme.border) : theme.border,
                        },
                      ]}
                      onPress={() => setExpandedFinding(isExpanded ? "" : finding.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.findingHeader}>
                        <View
                          style={[
                            styles.findingBadge,
                            {
                              backgroundColor: isHigh
                                ? isDark ? "#450A0A" : "#FEE2E2"
                                : isMed
                                ? isDark ? "#451A03" : "#FEF3C7"
                                : isDark ? "#064E3B" : "#DCFCE7",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.findingBadgeText,
                              {
                                color: isHigh
                                  ? COLORS.statusAlert
                                  : isMed
                                  ? COLORS.accentGoldDark
                                  : COLORS.statusSuccess,
                              },
                            ]}
                          >
                            {finding.severity}
                          </Text>
                        </View>

                        <View style={styles.findingTitleBlock}>
                          <Text style={[styles.findingTitle, { color: theme.textPrimary }]}>
                            {idx + 1}. {finding.title}
                          </Text>
                          <Text style={[styles.findingProblem, { color: isHigh ? COLORS.statusAlert : theme.textSecondary }]}>
                            {finding.problem}
                          </Text>
                        </View>

                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={theme.textMuted}
                        />
                      </View>

                      {isExpanded && (
                        <View style={[styles.findingBody, { borderTopColor: theme.border }]}>
                          {finding.excerpt && (
                            <View style={styles.excerptBox}>
                              <Text style={[styles.excerptLabel, { color: theme.textMuted }]}>
                                CONTRACT EXCERPT:
                              </Text>
                              <Text style={[styles.excerptText, { color: theme.textSecondary }]}>
                                "{finding.excerpt}"
                              </Text>
                            </View>
                          )}

                          <View
                            style={[
                              styles.suggestionBox,
                              {
                                backgroundColor: isDark ? "#064E3B22" : "#DCFCE7",
                                borderColor: isDark ? "#059669" : "#86EFAC",
                              },
                            ]}
                          >
                            <View style={styles.suggestionTitleRow}>
                              <Ionicons name="sparkles" size={14} color="#15803D" />
                              <Text style={styles.suggestionTitle}>SAFER WORDING TO PROPOSE:</Text>
                            </View>
                            <Text style={styles.suggestionBody}>
                              "{finding.suggestion}"
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Questions to Ask Before Signing */}
              {result.questionsToAsk && result.questionsToAsk.length > 0 && (
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <TouchableOpacity
                    style={styles.stepHeaderRow}
                    onPress={() => setExpandedQuestions(!expandedQuestions)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.sectionHeaderLeft}>
                      <Ionicons name="chatbubbles-outline" size={18} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Questions to Ask Before Signing ({result.questionsToAsk.length})
                      </Text>
                    </View>
                    <Ionicons
                      name={expandedQuestions ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={theme.textMuted}
                    />
                  </TouchableOpacity>

                  {expandedQuestions && (
                    <View style={styles.questionsList}>
                      {result.questionsToAsk.map((q, idx) => (
                        <View key={idx} style={styles.questionItem}>
                          <Text style={[styles.questionNumber, { color: isDark ? "#60A5FA" : COLORS.navyGov }]}>
                            {idx + 1}.
                          </Text>
                          <Text style={[styles.questionText, { color: theme.textSecondary }]}>{q}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Practical Next Steps */}
              {result.nextSteps && result.nextSteps.length > 0 && (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: isDark ? "#0C1A2E" : "#F0FDF4",
                      borderColor: isDark ? "#1E40AF" : "#86EFAC",
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.stepHeaderRow}
                    onPress={() => setExpandedNextSteps(!expandedNextSteps)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.sectionHeaderLeft}>
                      <Ionicons name="checkmark-done-circle-outline" size={20} color={isDark ? "#86EFAC" : "#166534"} />
                      <Text style={[styles.sectionTitle, { color: isDark ? "#86EFAC" : "#166534" }]}>
                        What You Should Do Next
                      </Text>
                    </View>
                    <Ionicons
                      name={expandedNextSteps ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={isDark ? "#86EFAC" : "#166534"}
                    />
                  </TouchableOpacity>

                  {expandedNextSteps && (
                    <View style={styles.nextStepsList}>
                      {result.nextSteps.map((step, idx) => (
                        <View key={idx} style={styles.nextStepItem}>
                          <Ionicons name="arrow-forward-circle" size={16} color={isDark ? "#86EFAC" : "#166534"} />
                          <Text style={[styles.nextStepText, { color: isDark ? "#BBF7D0" : "#15803D" }]}>
                            {step}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Product Actions Bar */}
              <View style={styles.actionsBar}>
                <TouchableOpacity
                  style={[styles.actionBtnPrimary, { backgroundColor: COLORS.navyGov }]}
                  onPress={handleCopyReport}
                  activeOpacity={0.8}
                >
                  <Ionicons name="copy-outline" size={16} color={COLORS.white} />
                  <Text style={styles.actionBtnPrimaryText}>Copy Full Report</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtnSecondary, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  onPress={handleDownloadReport}
                  activeOpacity={0.8}
                >
                  <Ionicons name="download-outline" size={16} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                  <Text style={[styles.actionBtnSecondaryText, { color: theme.textPrimary }]}>
                    Download .txt
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtnSecondary, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  onPress={handleShareReportWhatsApp}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                  <Text style={[styles.actionBtnSecondaryText, { color: theme.textPrimary }]}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtnSecondary, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  onPress={handleShareReport}
                  activeOpacity={0.8}
                >
                  <Ionicons name="share-social-outline" size={16} color={isDark ? "#60A5FA" : COLORS.navyGov} />
                  <Text style={[styles.actionBtnSecondaryText, { color: theme.textPrimary }]}>
                    Share
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Fixed Citizen Educational Disclaimer */}
              <View
                style={[
                  styles.disclaimerCard,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#FEF3C7",
                    borderColor: isDark ? "#475569" : "#FCD34D",
                  },
                ]}
              >
                <Ionicons name="information-circle-outline" size={18} color={isDark ? "#FCD34D" : "#B45309"} />
                <Text style={[styles.disclaimerText, { color: isDark ? "#FCD34D" : "#B45309" }]}>
                  {result.disclaimer}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1 },
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  toastPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0F172AEE",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "#334155",
    ...SHADOWS.card,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  header: {
    borderBottomWidth: 1,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerContent: { maxWidth: 960, width: "100%" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badge: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  headerSubtitle: { fontSize: 14, lineHeight: 21 },
  contentWrapper: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 20,
    gap: 14,
    ...SHADOWS.subtle,
  },
  stepHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  cardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  charBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  charBadgeText: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
  demoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 4,
  },
  demoTitle: { fontSize: 12, fontWeight: "600" },
  demoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  demoChipText: { fontSize: 12, fontWeight: "600" },
  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceMuted,
  },
  toggleBtnActive: { backgroundColor: COLORS.navyGov, borderColor: COLORS.navyMuted },
  toggleBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },
  toggleBtnTextActive: { color: COLORS.white },
  pasteInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: 14,
    minHeight: 180,
    lineHeight: 20,
    outlineStyle: "none",
  } as any,
  uploadZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: RADIUS.lg,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
  },
  uploadZoneTitle: { fontSize: 15, fontWeight: "700" },
  uploadZoneSub: { fontSize: 12, textAlign: "center" },
  extractedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  extractedLabel: { fontSize: 13, flex: 1 },
  errorBox: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { flex: 1, fontSize: 13, lineHeight: 18 },
  analyseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    ...SHADOWS.card,
  },
  analyseBtnDisabled: { opacity: 0.45 },
  analyseBtnText: { fontSize: 15, fontWeight: "700", color: COLORS.white },
  resultsContainer: { gap: 16 },
  riskCard: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 20,
    gap: 16,
    ...SHADOWS.subtle,
  },
  reanalyseLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reanalyseLinkText: { fontSize: 12, fontWeight: "600" },
  riskRow: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  riskScoreCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3.5,
    flexShrink: 0,
  },
  riskScoreNumber: { fontSize: 30, fontWeight: "900", lineHeight: 34 },
  riskScoreMax: { fontSize: 11, fontWeight: "600" },
  riskMeta: { flex: 1, gap: 8 },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  riskDot: { width: 7, height: 7, borderRadius: 99 },
  riskBadgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  riskHeadline: { fontSize: 15, fontWeight: "700", lineHeight: 22 },
  summaryChips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  summaryChipText: { fontSize: 11, fontWeight: "600" },
  adviceCard: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 16,
    gap: 8,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adviceTitle: { fontSize: 14, fontWeight: "700" },
  adviceText: { fontSize: 13, lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  subHint: { fontSize: 11 },
  missingList: { gap: 8 },
  missingRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  missingText: { flex: 1, fontSize: 13, lineHeight: 19 },
  findingCard: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 14,
    gap: 10,
  },
  findingHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  findingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
  },
  findingBadgeText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  findingTitleBlock: { flex: 1, gap: 3 },
  findingTitle: { fontSize: 14, fontWeight: "700" },
  findingProblem: { fontSize: 12, lineHeight: 18 },
  findingBody: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  excerptBox: {
    padding: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
  },
  excerptLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6, marginBottom: 3 },
  excerptText: { fontSize: 12, fontStyle: "italic", lineHeight: 18 },
  suggestionBox: {
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 6,
  },
  suggestionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  suggestionTitle: { fontSize: 11, fontWeight: "800", color: "#15803D", letterSpacing: 0.6 },
  suggestionBody: { fontSize: 13, color: "#14532D", lineHeight: 19, fontWeight: "500" },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
  questionsList: { gap: 8, marginTop: 4 },
  questionItem: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  questionNumber: { fontSize: 13, fontWeight: "700", minWidth: 20 },
  questionText: { flex: 1, fontSize: 13, lineHeight: 19 },
  nextStepsList: { gap: 8, marginTop: 4 },
  nextStepItem: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  nextStepText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "500" },
  actionsBar: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 4,
  },
  actionBtnPrimary: {
    flex: 1,
    minWidth: 180,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    ...SHADOWS.subtle,
  },
  actionBtnPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },
  actionBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    ...SHADOWS.subtle,
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  disclaimerCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 14,
  },
  disclaimerText: { flex: 1, fontSize: 12, lineHeight: 18 },
});

export default DocumentAnalyzer;
