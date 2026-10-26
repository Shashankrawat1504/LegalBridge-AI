# LegalBridge-AI

> **Citizen legal-help web app for everyday people in India (educational).**

LegalBridge-AI is a web-first citizen assistance platform built to simplify Indian law into plain language, practical steps, and accessible tools. It helps ordinary citizens understand their rights, draft complaint and notice letters, review agreements before signing, and organize personal legal documents safely.

---

## 📖 Overview

### Who It's For
- **Tenants:** Resolving withheld security deposits, unfair eviction notices, or unreasonable landlord demands.
- **Workers & Freelancers:** Navigating unpaid wages, one-sided independent contractor agreements, delayed invoices, and notice periods.
- **Consumers:** Handling defective products, refund denials, and online UPI fraud without legalese.
- **Students & Families:** Demystifying consumer rights, basic criminal procedure, and official civic grievance channels.

### What It Is NOT
- ❌ **Not a law firm:** LegalBridge-AI does not provide legal representation or create an attorney-client relationship.
- ❌ **Not government filing:** It does not directly file FIRs or register cases with courts or police.
- ❌ **Not police software:** It does not track suspects or process internal law-enforcement records.
- ℹ️ **Educational Aid Only:** All guidance, risk scores, and templates are purely informational. Users dealing with complex or high-stakes disputes should always consult a qualified advocate.

---

## ✨ Features (Citizen Tools)

LegalBridge-AI provides 10 citizen-focused tools accessible directly from the central **Utilities Hub**:

1. **Legal Help Assistant** (`Query`)
   - Interactive conversational assistant for everyday legal issues (rent, salary, UPI fraud, workplace, neighbour disputes).
   - **Bilingual guidance:** Instant **[ English ] [ हिंदी ]** toggle with citizen-friendly Hindi translations.
   - Dual-mode architecture: Optional AI API with instant, fully offline heuristic fallbacks for common topics.

2. **Know the Law (Simple)** (`Bare Acts`)
   - Key Indian statutes simplified for everyday citizens: Bharatiya Nyaya Sanhita (BNS 2023), Bharatiya Nagarik Suraksha Sanhita (BNSS), and consumer protection provisions.
   - Searchable and categorized with plain-language explanations.

3. **Citizen Guides** (`Guides`)
   - Step-by-step walkthroughs for common disputes: What to do if your landlord keeps your deposit, how to report UPI fraud within the golden hour, and resolving consumer complaints.

4. **Letter Templates** (`LetterTemplates`)
   - Ready-to-use, legally phrased formal letters (security deposit refund notice, demand for unpaid salary, consumer deficiency complaint).
   - Live editing, instant copy to clipboard, `.txt` download, and **WhatsApp Web/Mobile share**.

5. **Find Help (Helplines)** (`Helplines`)
   - Verified national directory: National Consumer Helpline (1915), Cyber Crime Helpline (1930), National Legal Services Authority (NALSA / 15100), Women's Helpline (1091), and state legal aid portals.

6. **Rights by Situation** (`RightsBySituation`)
   - Practical rights breakdowns organized by life situations: Tenant rights, employee rights, consumer rights, and police interaction / custody rights in simple terms.

7. **My Complaint Notes** (`ComplaintNotes`)
   - On-device incident and timeline logger.
   - Securely record communications, dates, amounts owed, and follow-ups. Stored 100% locally on the user's device via `AsyncStorage` with zero cloud leakage.

8. **Legal Glossary (Simple)** (`Glossary`)
   - Demystifies intimidating legal jargon (FIR, Cognizable, Bail, Affidavit, Legal Notice, Injunction, Quash) into clear 1-2 sentence everyday explanations.

9. **My Legal Document Library** (`Original Documents`)
   - Personal legal document organizer.
   - Securely store, categorize, and preview agreements, notices, rent deeds, and receipts directly in browser storage. Pre-seeded with realistic educational demo documents.

10. **Check My Document** (`Document Analyzer`)
    - Upload contracts, agreements, or legal notices (`.txt` or `.pdf` with client-side text extraction via `pdfjs-dist`).
    - Instant analysis: 0–100 Risk Score, severity-coded red flags (unfair lock-ins, excessive non-competes, unilateral indemnity), missing protective terms, questions to ask before signing, and **WhatsApp report export**.

---

## 🛠️ Tech Stack

- **Frontend & App Framework:** [Expo](https://expo.dev/) (SDK 54), [React Native Web](https://necolas.github.io/react-native-web/) (0.21), [React](https://react.dev/) (19.1)
- **Language:** TypeScript 5.9 (Strict type safety, zero TypeScript errors)
- **Navigation:** React Navigation (Native Stack)
- **Styling:** Custom responsive design system with warm, accessible government-civic color palette (`constants/theme.ts`) and dark/light mode (`context/ThemeContext.ts`)
- **Local Persistence:** `@react-native-async-storage/async-storage` (All citizen notes, document lists, and language preferences remain strictly private on the user's device)
- **Document Processing:** Dynamic client-side PDF text extraction via `pdfjs-dist` (web-optimized)
- **AI & Fallbacks:** Google Gemini API integration (`@google/generative-ai`) paired with structured offline heuristic fallbacks
- **Platform Focus:** Web-first responsive experience (optimized for modern desktop and mobile browsers: Chrome, Edge, Safari, Firefox)

---

## 📁 Project Directory Structure

```text
LegalBridge-AI/
├── App.tsx                   # Central React Navigation router & theme provider
├── index.ts                  # Expo root application entry point
├── app.json                  # Expo application configuration & metadata
├── types.ts                  # Navigation stack parameter types
├── pages/                    # Citizen screens
│   ├── Landing.tsx           # Home landing page with citizen hero & tool highlights
│   ├── UtilityPage.tsx       # Central Utilities Hub listing all citizen tools
│   ├── Query.tsx             # Legal Help Assistant (Bilingual English/Hindi)
│   ├── DocumentAnalyzer.tsx  # Check My Document (Risk score, PDF parse, WhatsApp)
│   ├── LetterTemplates.tsx   # Ready-to-use letter templates with WhatsApp share
│   ├── BareActs.tsx          # Know the Law (Simple) act browser
│   ├── Guides.tsx            # Step-by-step citizen guides
│   ├── Helplines.tsx         # Verified emergency & legal aid helplines
│   ├── RightsBySituation.tsx # Citizen rights breakdowns
│   ├── ComplaintNotes.tsx    # Private, local incident & timeline notes
│   ├── Glossary.tsx          # Plain-language legal definitions
│   ├── OriginalDocuments.tsx # Personal document library
│   ├── Settings.tsx          # App settings & accessibility options
│   ├── Download.tsx          # Client app installation information
│   ├── Vision.tsx            # Project mission & constitutional legal aid vision
│   ├── KeyFeatures.tsx       # Feature overview breakdown
│   ├── Contact.tsx           # Feedback & support contact
│   ├── PrivacyPolicy.tsx     # Citizen privacy & on-device storage policy
│   ├── TermsAndConditions.tsx# Terms of service & educational disclaimers
│   └── Accessibility.tsx     # Accessibility statement
├── components/               # Reusable UI components
│   ├── OfficialNavbar.tsx    # Responsive header with branding and navigation
│   ├── Footer.tsx            # Civic footer with links & disclaimers
│   ├── DraftingCoPilot.tsx   # Query composition helper
│   ├── VoiceDictation.tsx    # Voice input modal
│   ├── Query/                # Legal Help Assistant components
│   │   ├── QueryHeader.tsx   # Assistant header
│   │   ├── QueryInput.tsx    # Query input box
│   │   ├── QueryResponse.tsx # Answer card, Hindi toggle, action bar
│   │   ├── SubmitButton.tsx  # Interactive submit button
│   │   ├── fallbackGuidance.ts # Dual-language structured offline answers
│   │   └── hindiGuidance.ts  # Plain citizen Hindi guidance dictionary
│   ├── UtilityPage/          # Utilities hub components
│   │   ├── UtilityHeader.tsx
│   │   └── UtilityCard.tsx
│   └── Settings/             # Settings UI components
├── context/                  # Context providers (ThemeContext)
├── constants/                # Design tokens (theme.ts) & API endpoints (api.ts)
├── services/                 # External service adapters (geminiTranscribe.ts)
├── assets/                   # App icons, splash screens, emblem, and vector artwork
├── data/                     # Static data files
│   ├── demos/                # Demo contract documents for testing
│   │   ├── Sample_Freelance_Service_Agreement_Demo.txt
│   │   └── Sample_Residential_Rent_Agreement_Demo.txt
│   └── acts/                 # Legal act JSON datasets
│       ├── cpc.json
│       ├── crpc.json
│       ├── iea.json
│       ├── ipc.json
│       └── mva.json
├── .env.example              # Sample environment configuration template
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- `npm` (comes bundled with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shashankrawat1504/LegalBridge-AI.git
   cd LegalBridge-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (Optional):**
   ```bash
   cp .env.example .env
   ```
   *Note: All core features, offline guidance dictionaries, letter templates, PDF extraction, and demo analyzers function without any API key.*

4. **Start the web application:**
   ```bash
   npx expo start --web
   ```
   *Or run via npm:*
   ```bash
   npm run web
   ```
   Open your browser at `http://localhost:8081` (or the port displayed in your terminal).

---

## 🧪 Quality & Verification

- **TypeScript Compilation:**
  ```bash
  npx tsc --noEmit
  ```
  Passes with **0 errors**.

- **Web Production Export:**
  ```bash
  npx expo export --platform web
  ```
  Builds the production-ready static web bundle in `dist/` cleanly.

---

## 🔒 Privacy & Security Philosophy

- **Zero Cloud Leakage for Private Notes:** Incident timelines entered in *My Complaint Notes* and documents saved in *My Legal Document Library* are stored locally using browser `AsyncStorage` and are never uploaded to any remote server.
- **Client-Side Document Extraction:** PDF text extraction for *Check My Document* runs in-browser using Web Workers.
- **Secret Hygiene:** Environment files (`.env`, `.env.local`), build artifacts (`dist/`, `web-build/`), and native keystores are strictly excluded from source control via `.gitignore`.

---

## ⚖️ Legal Disclaimer

LegalBridge-AI is developed exclusively as an educational and rights-awareness initiative. It does not provide legal advice, representation, or formal legal services. Legal statutes, rules, and procedures differ across states and jurisdictions. For specific legal issues, disputes, or official filings, please contact a registered legal advocate or visit your nearest Legal Services Authority (NALSA / DLSA).

---

## 📄 License

This project is licensed under the [0BSD License](LICENSE).
