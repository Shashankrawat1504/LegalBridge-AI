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
- **Not a law firm:** LegalBridge-AI does not provide legal representation or create an attorney-client relationship.
- **Not government filing:** It does not directly file FIRs or register cases with courts or police.
- **Not police software:** It does not track suspects or process internal law-enforcement records.
- **Educational Aid Only:** All guidance, risk scores, and templates are purely informational. Users dealing with complex or high-stakes disputes should always consult a qualified advocate.

---

## ✨ Features (Citizen Tools)

LegalBridge-AI provides 6 citizen-focused tools accessible directly from the central **Tools Hub**:

### 1. Legal Help Assistant
- **What it does:** Interactive conversational assistant for everyday legal issues (rent, salary, UPI fraud, workplace, neighbour disputes).
- **Key features:**
  - Bilingual guidance with instant English/Hindi toggle
  - Plain-language answers explaining what the law means for you
  - Practical next steps and when to see a lawyer
  - Works offline with structured fallbacks for common topics
- **Perfect for:** Quick questions when you don't know where to start

### 2. Know Your Rights
- **What it does:** Understand Indian laws, legal terms, and your rights in simple words.
- **Key features:**
  - **By Situation:** Tenant rights, worker rights, consumer rights, and police interaction explained for everyday life
  - **Key Laws:** Plain-language explanations of important Indian statutes (BNS, IPC, CrPC, and others)
  - **Glossary:** Simple meanings of legal terms like FIR, notice, affidavit, bail, and more
- **Perfect for:** Learning what your rights are in specific situations

### 3. Guides & Templates
- **What it does:** Step-by-step guides and ready-to-use letter templates for common legal situations.
- **Key features:**
  - **Step-by-step Guides:** Walkthroughs for filing complaints, handling consumer issues, and understanding basic rights
  - **Letter Templates:** Ready-made letters for deposit refund, salary demands, consumer complaints, and more
  - Copy, edit, and share templates easily
- **Perfect for:** Taking action with confidence using proven formats

### 4. Find Help (Helplines)
- **What it does:** Verified national helplines and legal aid contacts.
- **Key features:**
  - National Consumer Helpline (1915)
  - Cyber Crime Helpline (1930)
  - National Legal Services Authority (NALSA / 15100)
  - Women's Helpline (1091)
  - State legal aid portals
- **Perfect for:** Finding who to call for immediate help

### 5. My Legal Records
- **What it does:** Save personal legal documents and keep complaint notes privately on your device.
- **Key features:**
  - **My Notes:** Record when you complained, who you spoke to, dates, amounts, and follow-ups
  - **My Documents:** Save and organize rent agreements, notices, court papers, complaint copies, and ID documents
  - 100% local storage—nothing uploaded to any server
- **Perfect for:** Keeping all your legal information in one secure place

### 6. Check My Document
- **What it does:** Upload agreements or notices for plain-language risk analysis before signing.
- **Key features:**
  - Upload contracts, agreements, or legal notices (.txt or .pdf)
  - 0–100 Risk Score with severity-coded red flags
  - Highlights unfair lock-ins, excessive non-competes, unilateral indemnity clauses
  - Suggests safer wording and questions to ask before signing
  - Copy full report for your records
- **Perfect for:** Understanding what you're about to sign

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
│   ├── UtilityPage.tsx       # Central Tools Hub listing all 6 citizen tools
│   ├── Query.tsx             # Legal Help Assistant (Bilingual English/Hindi)
│   ├── DocumentAnalyzer.tsx  # Check My Document (Risk score, PDF analysis)
│   ├── KnowYourRights.tsx    # Hub for: Rights by Situation, Key Laws, Glossary
│   ├── GuidesAndTemplates.tsx # Hub for: Step-by-step Guides, Letter Templates
│   ├── MyLegalRecords.tsx    # Hub for: My Complaint Notes, My Document Library
│   ├── Helplines.tsx         # Verified emergency & legal aid helplines
│   ├── LetterTemplates.tsx   # Ready-to-use letter templates
│   ├── BareActs.tsx          # Key Laws act browser (Know Your Rights section)
│   ├── Guides.tsx            # Step-by-step citizen guides (Guides & Templates section)
│   ├── RightsBySituation.tsx # Citizen rights breakdowns (Know Your Rights section)
│   ├── ComplaintNotes.tsx    # Private, local incident & timeline notes (My Legal Records section)
│   ├── Glossary.tsx          # Plain-language legal definitions (Know Your Rights section)
│   ├── OriginalDocuments.tsx # Personal document library (My Legal Records section)
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
│   ├── UtilityPage/          # Tools hub components
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

- **Zero Cloud Leakage for Private Records:** Notes entered in *My Legal Records* and documents saved in your personal library are stored locally using browser `AsyncStorage` and are never uploaded to any remote server.
- **Client-Side Document Extraction:** PDF text extraction for *Check My Document* runs in-browser using Web Workers.
- **Secret Hygiene:** Environment files (`.env`, `.env.local`), build artifacts (`dist/`, `web-build/`), and native keystores are strictly excluded from source control via `.gitignore`.

---

## ⚖️ Legal Disclaimer

LegalBridge-AI is developed exclusively as an educational and rights-awareness initiative. It does not provide legal advice, representation, or formal legal services. Legal statutes, rules, and procedures differ across states and jurisdictions. For specific legal issues, disputes, or official filings, please contact a registered legal advocate or visit your nearest Legal Services Authority (NALSA / DLSA).

---

## 📄 License

This project is licensed under the [0BSD License](LICENSE).
