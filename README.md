# LegalBridge-AI ⚖️🛡️
> An advanced legal technology mobile and web platform featuring AI-driven FIR drafting, offline resilience, automated PII masking, and cryptographic evidence verification.

---

## 📌 What is LegalBridge-AI?
**LegalBridge-AI** is a professional-grade legal technology platform designed to bridge the gap between citizens, law enforcement officers, and legal aid systems. It streamlines police reporting, case management, and legal drafting using modern mobile/web architecture and secure Generative AI.

---

## 🚀 Core Features

* **📄 BNSS §173 Form IF-1 PDF Export:** Generates court-ready, standardized legal PDF reports complying with statutory requirements.
* **🤖 AI Drafting Co-Pilot:** Powered by Google Gemini 1.5 Flash to provide real-time contextual auto-completions, bilingual legal assistance, and 40+ field auto-fill extractions.
* **💾 Offline Resilience & Auto-Save:** Built with a 2.5-second debounced auto-save engine and rolling 5-checkpoint version history using local `AsyncStorage` for low-connectivity zones.
* **🔒 Cryptographic Evidence (BSA §63):** Computes true bitstream SHA-256 cryptographic hashes for attached photo and document exhibits locally on the device to maintain strict chain-of-custody.
* **🛡️ Automated PII Masking:** Real-time stateless Regex/NLP processing layer that redacts sensitive personal data (Aadhaar, victim names, contact numbers) in-memory before export.
* **⚖️ AI Bail Estimator:** Evaluates custody duration and offense types against Supreme Court guidelines to calculate bail eligibility percentages for undertrial prisoners.

---

## 🛠️ Tech Stack

* **Frontend & Mobile:** Next.js 16, React 19, Expo SDK 54 (Cross-Platform Mobile & Web)
* **Backend & Database:** Supabase, PostgreSQL, Row-Level Security (RLS), and `pgvector` for semantic legal searches
* **AI Engine:** Google Gemini 1.5 Flash via Vercel AI SDK (with request cancellation support)
* **Local Storage:** React Native `AsyncStorage` and pre-indexed local JSON Bare Acts datasets (BNS, BNSS, BSA)

---

## ⚙️ Quick Start & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/Shashankrawat1504/LegalBridge-AI.git](https://github.com/Shashankrawat1504/LegalBridge-AI.git)
cd LegalBridge-AI
