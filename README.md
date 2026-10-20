```markdown
<div align="center">

# LegalBridge-AI ⚖️🛡️
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2554-purple?style=flat-square&logo=expo)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Gemini 1.5 Flash](https://img.shields.io/badge/Gemini-1.5%25Flash-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*An advanced legal technology mobile and web platform featuring AI-driven FIR drafting, offline resilience, automated PII masking, cryptographic digital evidence verification, and real-time statutory compliance.*

</div>

---

## 📌 Comprehensive Project Overview

**LegalBridge-AI** is a professional-grade legal technology platform engineered to bridge the gap between citizens, law enforcement officers, and legal aid systems[cite: 1]. The application addresses critical systemic bottlenecks—such as prolonged pre-trial detention[cite: 4], manual evidence handling[cite: 1], and lack of low-connectivity accessibility[cite: 3]—by combining a robust hybrid cloud architecture with advanced Generative AI capabilities.

---

## 🏛️ Deep Dive: Core Functional Modules

### 1. FIR Drafting & Statutory Document Generation
* **BNSS §173 Form IF-1 PDF Export:** Generates court-ready, standardized legal PDF reports strictly complying with Bharatiya Nagarik Suraksha Sanhita requirements using native printing and sharing workflows.
* **Ambient Drafting Co-Pilot:** Powered by Google's Gemini 1.5 Flash via the Vercel AI SDK, providing real-time contextual auto-completions, phrasing enhancements, and bilingual legal writing assistance[cite: 1, 3].
* **Smart Section Recommender:** Automatically analyzes crime narratives to suggest appropriate penal sections under the BNS (Bharatiya Nyaya Sanhita) and BNSS[cite: 3].
* **Natural Language Auto-Fill Extraction:** Parses unstructured police notes, incident text, or raw text into 40+ structured statutory form fields[cite: 1, 3].

### 2. Offline Resilience & Draft Versioning Engine
* **Debounced Auto-Save & Storage:** Silently persists form edits, narrative updates, and exhibit metadata every 2.5 seconds using local device storage (`AsyncStorage`)[cite: 3].
* **5-Checkpoint Version History:** Maintains rolling snapshot histories per draft (tracking auto-saves, manual checkpoints, and pre-auto-fill states), allowing users to safely roll back changes.
* **Multi-Draft Workspace Manager:** Modal interface designed to manage, resume, duplicate, rename, or delete offline drafts seamlessly across app restarts[cite: 3].

### 3. Digital Evidence & Compliance (BSA §63)
* **Cryptographic Evidence Attachment:** Allows attaching photo and document exhibits (`FIRExhibitItem`) directly to case files[cite: 1].
* **Bitstream SHA-256 Hashing:** Computes true cryptographic hashes for digital evidence directly on-device using WebCrypto or native file system reading, satisfying strict chain-of-custody compliance under Bharatiya Sakshya Adhiniyam (§63 BSA)[cite: 1].

### 4. Privacy & Advanced Legal Tools
* **Automated PII Masking Engine:** Operates as a real-time, stateless processing layer using Regex and NLP rules to redact sensitive personal data (such as Aadhaar details, victim names, and contact numbers) before files are exported or shared[cite: 5].
* **AI Bail Estimator Algorithm:** Functions as an algorithmic evaluation tool that assesses custody duration and offense types against Supreme Court precedents and guidelines to calculate bail eligibility percentages for undertrial prisoners[cite: 4].
* **Dual-Engine Voice Dictation:** Supports real-time speech-to-text input in both English (`en-IN`) and Hindi (`hi-IN`) for hands-free incident logging[cite: 1, 3].

---

## 🛠️ Technology Stack

* **Frontend & Client Layer:** Next.js 16, React 19, Expo SDK 54 (Cross-Platform Mobile & Web)[cite: 1, 3]
* **Styling & Presentation:** Tailwind CSS, responsive accessible UI design[cite: 1]
* **Gateway & Orchestration:** Next.js Server Actions, Express/Node API routing, Vercel AI SDK with custom `AbortController` request cancellation[cite: 3]
* **AI & Intelligence:** Google Gemini 1.5 Flash API Engine (Multimodal context, prompt streams)[cite: 1, 3]
* **Backend & Cloud Database:** Supabase, PostgreSQL, Row-Level Security (RLS), and `pgvector` extension for semantic legal precedent and statute searches[cite: 1, 3]
* **Offline Storage:** React Native `AsyncStorage` and pre-indexed local JSON Bare Acts datasets (BNS, BNSS, BSA)[cite: 3]

---

## 📊 System Architecture

```text
 ┌──────────────┐     ┌─────────────────────┐     ┌───────────────────┐     ┌────────────────────────┐
 │ ACCESS LAYER │ --> │   CLIENT & OFFLINE  │ --> │   GATEWAY & AI    │ --> │ SECURE CLOUD & BACKEND │
 │ (Web / Expo) │     │ (AsyncStorage / UI) │     │ (Vercel / Gemini) │     │   (Supabase / pgvector)│
 └──────────────┘     └─────────────────────┘     └───────────────────┘     └────────────────────────┘

```

LegalBridge-AI utilizes a **Hybrid Client-Server Architecture** with an **Offline-First** design pattern, ensuring complete functionality in low-connectivity environments while maintaining secure cloud synchronization.

---

## ⚙️ Getting Started & Installation

### Prerequisites

* Node.js (v18+ recommended)
* npm or yarn
* Expo CLI

### 1. Clone the Repository

```bash
git clone [https://github.com/Shashankrawat1504/LegalBridge-AI.git](https://github.com/Shashankrawat1504/LegalBridge-AI.git)
cd LegalBridge-AI

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Setup

Create a `.env` file in the root directory and add your required configuration keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

```

### 4. Run the Development Server

For Web:

```bash
npx expo start --web

```

For Mobile (Expo Go):

```bash
npx expo start

```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---
