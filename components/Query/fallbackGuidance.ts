import { Ionicons } from '@expo/vector-icons';
import { CitizenGuidanceHi, getHindiGuidance } from './hindiGuidance';

export interface CitizenGuidance {
  summary: string;
  possibleIssues: string[];
  yourRights: string[];
  nextSteps: string[];
  documentsToKeep: string[];
  whenToSeeLawyer: string;
  relatedTools?: Array<{ label: string; route: string; icon: keyof typeof Ionicons.glyphMap }>;
  disclaimer: string;
  /** Optional pre-built Hindi translation — available for all local fallback intents */
  guidanceHi?: CitizenGuidanceHi;
}

export const FIXED_DISCLAIMER =
  'Educational guidance only. Not a substitute for a qualified lawyer. Laws and procedures vary by state and facts.';

export function getStructuredGuidance(query: string): CitizenGuidance {
  const q = query.toLowerCase().trim();

  // 1. Rent / Security Deposit / Tenant
  if (
    q.includes('deposit') ||
    q.includes('landlord') ||
    q.includes('tenant') ||
    q.includes('rent') ||
    q.includes('lease') ||
    q.includes('evict')
  ) {
    return {
      summary:
        'In India, security deposits are held in trust by the landlord to guarantee against actual damage and unpaid bills. Landlords cannot deduct money for normal wear and tear or delay refund indefinitely.',
      possibleIssues: [
        'Security deposit delayed or unlawfully withheld after vacating',
        'Arbitrary deductions claimed for painting or normal wear and tear',
        'Lack of formal written handover inspection',
        'Threats of unauthorized eviction or disconnection of water/electricity',
      ],
      yourRights: [
        'Right to full refund of security deposit after deducting only legitimate, pre-agreed dues.',
        'Right to receive itemized repair bills and receipts for any deductions claimed.',
        'Right to reasonable notice before vacating as specified in your rent agreement.',
        'Protection against arbitrary eviction or utility cuts without due process of law.',
      ],
      nextSteps: [
        'Send a formal, polite written demand letter via Speed Post or email giving a clear 7–14 day deadline.',
        'Attach proof of keys handover and photos/videos of the empty apartment taken on vacating day.',
        'Request original contractor invoices for any repair deductions the owner claims.',
        'If the landlord remains unresponsive, issue an advocate legal notice or file before the local Rent Authority.',
      ],
      documentsToKeep: [
        'Signed Rent / Lease Agreement',
        'Bank transfer proofs or receipts for deposit and monthly rent payments',
        'Utility bill receipts (electricity, water, maintenance) cleared up to vacating date',
        'Handover checklist, dated photos/videos of property condition, and key handover chats',
      ],
      whenToSeeLawyer:
        'If the deposit amount is high (e.g. over 2 months rent) and the owner ceases communication or threatens physical lockout.',
      relatedTools: [
        { label: 'Deposit Refund Template', route: 'LetterTemplates', icon: 'mail-outline' },
        { label: 'Landlord Deposit Guide', route: 'Guides', icon: 'book-outline' },
        { label: 'Check Rent Agreement', route: 'Document Analyzer', icon: 'scan-outline' },
      ],
      disclaimer: FIXED_DISCLAIMER,
      guidanceHi: getHindiGuidance(query),
    };
  }
  // 2. Unpaid Salary / Workplace Dues
  if (
    q.includes('salary') ||
    q.includes('wage') ||
    q.includes('unpaid') ||
    q.includes('employer') ||
    q.includes('boss') ||
    q.includes('fnf') ||
    q.includes('resignation') ||
    q.includes('fired') ||
    q.includes('termination')
  ) {
    return {
      summary:
        'Under the Payment of Wages Act and State Shops & Commercial Establishments Acts, employers are legally required to disburse monthly salaries on time (usually by the 7th or 10th) and settle Full & Final dues promptly upon exit.',
      possibleIssues: [
        'Delayed monthly salary or withheld full-and-final settlement',
        'Unauthorized deductions from wages or withheld expense reimbursements',
        'Refusal to issue experience letter or relieving certificate after resignation',
        'Termination without contractually agreed notice pay',
      ],
      yourRights: [
        'Right to receive agreed wages on the designated payroll date without unlawful cuts.',
        'Right to full and final settlement within statutory timelines following resignation.',
        'Right to relieving letter and experience certificate upon completing handover.',
        'Protection against sudden termination without contractual notice pay or severance.',
      ],
      nextSteps: [
        'Send a formal, polite written reminder to HR and Finance detailing pending salary months and amount.',
        'Ensure you complete all company property handovers and obtain a signed No-Dues clearance.',
        'Escalate in writing to Company Directors or Founders if HR remains unresponsive after 5 business days.',
        'File a wage recovery petition before the local Labour Commissioner or send an advocate legal notice.',
      ],
      documentsToKeep: [
        'Appointment / Offer Letter and latest compensation revision letters',
        'Monthly pay slips and bank account statement showing absence of credit',
        'Resignation email and written acceptance confirmation',
        'Signed No-Dues clearance certificate and company property return receipts',
      ],
      whenToSeeLawyer:
        'If the company terminates you abruptly without severance pay, is shutting down, or owes multiple months of unpaid wages.',
      relatedTools: [
        { label: 'Salary Dues Reminder Letter', route: 'LetterTemplates', icon: 'mail-outline' },
        { label: 'Unpaid Salary Action Guide', route: 'Guides', icon: 'book-outline' },
        { label: 'NALSA Legal Aid Helpline', route: 'Helplines', icon: 'call-outline' },
      ],
      disclaimer: FIXED_DISCLAIMER,
      guidanceHi: getHindiGuidance(query),
    };
  }

  // 3. Online UPI / Banking Cyber Fraud
  if (
    q.includes('upi') ||
    q.includes('cyber') ||
    q.includes('fraud') ||
    q.includes('otp') ||
    q.includes('scam') ||
    q.includes('phishing') ||
    q.includes('debit') ||
    q.includes('hacked')
  ) {
    return {
      summary:
        'In financial cyber fraud, the first 2 to 24 hours ("golden hours") are critical. Reporting immediately allows police cyber cells to instruct beneficiary banks to freeze stolen funds in transit before cash withdrawal.',
      possibleIssues: [
        'Unauthorized debit from bank account or UPI payment application',
        'Tricked into scanning QR code or sharing OTP under pretext of refund/KYC update',
        'Remote access application installed by scammer (AnyDesk, TeamViewer)',
        'Threatening calls or extortion messages from fraudulent loan apps',
      ],
      yourRights: [
        'Zero customer liability under Reserve Bank of India (RBI) guidelines if reported within 3 days.',
        'Right to have compromised debit/credit cards and net-banking blocked instantly by your bank.',
        'Right to receive a formal dispute reference docket number from the bank fraud cell.',
        'Right to lodge a national cyber crime report and obtain an official acknowledgment slip.',
      ],
      nextSteps: [
        'Call your bank immediately to freeze your compromised account, UPI, and debit cards.',
        'Dial 1930 (National Cyber Crime Helpline) without delay and provide transaction IDs and amounts.',
        'Register a formal complaint at cybercrime.gov.in and download the PDF acknowledgment.',
        'Submit a copy of the cybercrime complaint to your home bank branch within 72 hours.',
      ],
      documentsToKeep: [
        'Bank statement highlighting the fraudulent debit transactions',
        'Unique Transaction Reference (UTR) numbers and recipient UPI IDs',
        'Screenshots of phishing SMS, suspicious links, WhatsApp chats, and caller phone numbers',
        'Official complaint acknowledgment PDF from cybercrime.gov.in',
      ],
      whenToSeeLawyer:
        'If your bank refuses to process your zero-liability claim despite prompt reporting within RBI rules, or for high-value financial theft.',
      relatedTools: [
        { label: 'Cyber Crime Helpline 1930', route: 'Helplines', icon: 'call-outline' },
        { label: 'Cybercrime Portal Link', route: 'Helplines', icon: 'call-outline' },
        { label: 'UPI Fraud 24-Hr Action Guide', route: 'Guides', icon: 'book-outline' },
      ],
      disclaimer: FIXED_DISCLAIMER,
      guidanceHi: getHindiGuidance(query),
    };
  }

  // 4. Defective Product / Consumer Refund
  if (
    q.includes('consumer') ||
    q.includes('refund') ||
    q.includes('defective') ||
    q.includes('product') ||
    q.includes('warranty') ||
    q.includes('ecommerce') ||
    q.includes('amazon') ||
    q.includes('flipkart')
  ) {
    return {
      summary:
        'The Consumer Protection Act 2019 safeguards buyers against defective products, deficient service, and refusal of lawful refunds. Consumers can file grievances directly through National Consumer Helpline (1915) or e-Jagriti.',
      possibleIssues: [
        'Defective or damaged product delivered with refusal of return or replacement',
        'Service deficiency by appliance repair, travel booking, or telecom provider',
        'Misleading product specifications or deceptive advertising',
        'Hidden fees or cancellation charges charged unfairly',
      ],
      yourRights: [
        'Right to replacement or full refund for goods that fail to perform as advertised.',
        'Right to protection against unfair trade practices and false warranty denials.',
        'Right to compensation for incidental financial loss caused by defective goods.',
        'Right to file consumer petitions digitally via e-Jagriti without needing to hire a lawyer.',
      ],
      nextSteps: [
        'Lodge a formal written complaint with the customer grievance officer of the company.',
        'Dial 1915 or register online at consumerhelpline.gov.in to initiate mediation.',
        'Keep unboxing videos, photos of defect, and original tax invoices intact.',
        'If unresolved after 15 days, file a formal complaint before the District Consumer Commission via e-Jagriti.',
      ],
      documentsToKeep: [
        'Original tax invoice, receipt, or order confirmation email',
        'Photographs, unboxing video, or authorized technician repair job-sheet',
        'Complete email trails, support chat logs, and ticket reference numbers',
        'Bank debit statement showing transaction date and amount paid',
      ],
      whenToSeeLawyer:
        'For high-value disputes (vehicles, real estate delays, medical negligence) or when opposing counsel appears before the State Commission.',
      relatedTools: [
        { label: 'Consumer Complaint Letter', route: 'LetterTemplates', icon: 'mail-outline' },
        { label: 'Consumer Helpline 1915', route: 'Helplines', icon: 'call-outline' },
        { label: 'Consumer Basics Guide', route: 'Guides', icon: 'book-outline' },
      ],
      disclaimer: FIXED_DISCLAIMER,
      guidanceHi: getHindiGuidance(query),
    };
  }

  // 5. Neighbour Harassment / Noise / Disputes
  if (
    q.includes('neighbour') ||
    q.includes('neighbor') ||
    q.includes('noise') ||
    q.includes('harassment') ||
    q.includes('loud') ||
    q.includes('fighting')
  ) {
    return {
      summary:
        'Excessive continuous noise and verbal intimidation violate municipal nuisance rules and Indian penal provisions against criminal intimidation. Noise is prohibited between 10:00 PM and 6:00 AM under Noise Pollution Rules 2000.',
      possibleIssues: [
        'Persistent loud noise, late-night music, or construction during prohibited hours',
        'Common area encroachment, parking blockages, or unauthorized alterations',
        'Verbal abuse, intimidation, or harassment by neighbours',
      ],
      yourRights: [
        'Right to quiet enjoyment of your home under the Noise Pollution (Regulation and Control) Rules.',
        'Protection against criminal intimidation, intentional insult, and trespass under BNS.',
        'Right to file a written complaint before the Residents Welfare Association (RWA) and local police.',
      ],
      nextSteps: [
        'Maintain a dated diary recording exact dates, hours, and decibel/video recordings of nuisance.',
        'Submit a formal written grievance to your society / RWA managing committee.',
        'Dial 112 (National Emergency) while the noise violation is actively occurring for immediate police intervention.',
        'If verbal threats or intimidation occur, submit a written complaint to the local Station House Officer.',
      ],
      documentsToKeep: [
        'Audio/video recordings with timestamps and witness names',
        'Copies of written complaints sent to RWA or building management',
        'Police emergency call logs and stamped complaint acknowledgment copies',
      ],
      whenToSeeLawyer:
        'If the neighbour issues threats of physical harm, damages your property, or initiates false counter-complaints.',
      relatedTools: [
        { label: 'Written Acknowledgment Letter', route: 'LetterTemplates', icon: 'mail-outline' },
        { label: 'Emergency Helpline 112', route: 'Helplines', icon: 'call-outline' },
        { label: 'Police Complaint Guide', route: 'Guides', icon: 'book-outline' },
      ],
      disclaimer: FIXED_DISCLAIMER,
      guidanceHi: getHindiGuidance(query),
    };
  }

  // 6. Notice Received / Legal Notice
  if (
    q.includes('notice') ||
    q.includes('summons') ||
    q.includes('court paper') ||
    q.includes('lawyer notice')
  ) {
    return {
      summary:
        'Receiving a legal notice is a formal communication, not an arrest order. Do not panic, but do not ignore it: legal notices usually set a strict reply window (typically 15 to 30 days) to prevent escalation into a lawsuit.',
      possibleIssues: [
        'Notice regarding tenancy dispute, unpaid dues, or eviction demand',
        'Cheque bounce notice under Section 138 Negotiable Instruments Act',
        'Employment breach or non-compete allegation notice',
        'Summons or notice from a consumer forum or civil court',
      ],
      yourRights: [
        'Right to receive specific, itemized factual allegations in writing.',
        'Right to draft and serve a formal written reply refuting incorrect allegations.',
        'Right to inspect contract documents and transaction records referenced in the notice.',
        'Right to engage an advocate or seek free legal aid through NALSA if eligible.',
      ],
      nextSteps: [
        'Preserve the postal envelope showing the date and tracking barcode of when you received it.',
        'Read every paragraph carefully and mark all dates, figures, and factual inaccuracies.',
        'Gather all matching payment receipts, emails, and agreements related to the dispute.',
        'Consult an advocate to send a formal legal reply within the stipulated deadline.',
      ],
      documentsToKeep: [
        'Original legal notice along with the envelope and postal speed-post barcode',
        'Underlying agreements, invoices, or bank transaction statements',
        'All past communications between you and the sender',
      ],
      whenToSeeLawyer:
        'Immediately. Never reply to an advocate-issued legal notice without legal review, as admissions can be used against you in court.',
      relatedTools: [
        { label: 'NALSA Free Legal Aid', route: 'Helplines', icon: 'call-outline' },
        { label: 'Legal Glossary (Simple)', route: 'Glossary', icon: 'book-outline' },
        { label: 'Check My Document', route: 'Document Analyzer', icon: 'scan-outline' },
      ],
      disclaimer: FIXED_DISCLAIMER,
      guidanceHi: getHindiGuidance(query),
    };
  }

  // 7. General Legal Guidance Fallback
  return {
    summary:
      'Understanding your legal rights and preserving clear documentation is the first and most critical step in resolving any dispute under Indian law.',
    possibleIssues: [
      'Dispute regarding terms of service, payment, or civil obligations',
      'Need to establish clear timeline of facts and gather supporting evidence',
      'Evaluating whether matter requires police complaint, consumer mediation, or civil remedy',
    ],
    yourRights: [
      'Right to be treated fairly and not subjected to arbitrary harassment or unilateral penalties.',
      'Right to written communication and reasonable opportunity to respond before action is taken.',
      'Right to access statutory grievance mechanisms (Consumer Forum, Rent Tribunal, Labour Office).',
      'Right to legal representation and free legal aid if eligible under Section 12 of Legal Services Authorities Act.',
    ],
    nextSteps: [
      'Write down a clear, chronological summary of what happened with dates, names, and amounts.',
      'Gather all contracts, receipts, payment proofs, and chat histories in a single folder.',
      'Send a polite, written communication requesting resolution before escalating.',
      'If unresolved, consult a qualified lawyer or local Legal Services Authority.',
    ],
    documentsToKeep: [
      'Any signed contracts, agreements, or application forms',
      'Bank transaction proofs, payment receipts, or invoices',
      'Written correspondence (emails, letters, chat transcripts)',
    ],
    whenToSeeLawyer:
      'Whenever substantial financial value, threats of criminal action, or formal court deadlines are involved.',
    relatedTools: [
      { label: 'Letter Templates', route: 'LetterTemplates', icon: 'mail-outline' },
      { label: 'Citizen Action Guides', route: 'Guides', icon: 'book-outline' },
      { label: 'Find Help (Helplines)', route: 'Helplines', icon: 'call-outline' },
    ],
    disclaimer: FIXED_DISCLAIMER,
    guidanceHi: getHindiGuidance(query),
  };
}
