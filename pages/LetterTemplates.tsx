import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  defaultValue: string;
}

interface LetterTemplate {
  id: string;
  title: string;
  badge: string;
  category: string;
  summary: string;
  fields: FieldConfig[];
  generateLetter: (vals: Record<string, string>) => string;
}

const TEMPLATES: LetterTemplate[] = [
  {
    id: 't1',
    title: 'Security Deposit Refund Request (to Landlord)',
    badge: 'Tenancy',
    category: 'HOUSING & RENT',
    summary: 'Polite and legally structured letter demanding the refund of security deposit after vacating premises.',
    fields: [
      { key: 'yourName', label: 'Your Name', placeholder: 'e.g. Ramesh Sharma', defaultValue: 'Ramesh Sharma' },
      { key: 'yourPhone', label: 'Your Phone Number', placeholder: 'e.g. 9876543210', defaultValue: '9876543210' },
      { key: 'yourAddress', label: 'Your Current Address', placeholder: 'e.g. Flat 302, Green Park, New Delhi', defaultValue: 'Flat 302, Green Park, New Delhi' },
      { key: 'landlordName', label: 'Landlord Name', placeholder: 'e.g. Shri Alok Verma', defaultValue: 'Shri Alok Verma' },
      { key: 'rentalAddress', label: 'Rented Property Address', placeholder: 'e.g. Flat 104, B-Block, Sector 62, Noida', defaultValue: 'Flat 104, B-Block, Sector 62, Noida' },
      { key: 'vacateDate', label: 'Date Vacated & Keys Handed Over', placeholder: 'e.g. 31st October 2024', defaultValue: '31st October 2024' },
      { key: 'depositAmount', label: 'Security Deposit Amount (₹)', placeholder: 'e.g. ₹50,000', defaultValue: '₹50,000' },
      { key: 'bankDetails', label: 'Your Bank Details for Refund', placeholder: 'e.g. A/C: 1234567890, IFSC: SBIN0001234, SBI Main Branch', defaultValue: 'A/C: 1234567890, IFSC: SBIN0001234, State Bank of India' },
      { key: 'deadlineDays', label: 'Notice Deadline (Days)', placeholder: 'e.g. 7 days', defaultValue: '7 days' },
    ],
    generateLetter: (v) => `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

To,
${v.landlordName || '[Landlord Name]'}
Owner / Landlord of: ${v.rentalAddress || '[Rented Property Address]'}

From,
${v.yourName || '[Your Name]'}
Contact: ${v.yourPhone || '[Your Phone]'}
Current Address: ${v.yourAddress || '[Your Address]'}

SUBJECT: Formal Request for Refund of Security Deposit of ${v.depositAmount || '[Deposit Amount]'} for ${v.rentalAddress || '[Rented Address]'}

Respected Sir / Madam,

1. I was the tenant at the aforementioned property (${v.rentalAddress || '[Rented Address]'}) under our mutual tenancy agreement. 

2. As mutually agreed and per the terms of our agreement, I vacated the premises peacefully and handed over vacant possession along with all keys to you / your representative on ${v.vacateDate || '[Handover Date]'}.

3. At the time of handover, the property was inspected. All electricity, water, and society maintenance charges up to the date of vacating have been duly paid and cleared in full, with receipts shared with you.

4. As per the tenancy agreement, an interest-free security deposit of ${v.depositAmount || '[Deposit Amount]'} was paid by me at the beginning of the tenancy, which was to be refunded in full upon vacating the premises.

5. It has now been considerable time since handover, but the refund is still pending. I kindly request you to remit the full security deposit amount of ${v.depositAmount || '[Deposit Amount]'} to my bank account within ${v.deadlineDays || '7 days'} of receipt of this communication:

   Bank Account Details:
   Beneficiary Name: ${v.yourName || '[Your Name]'}
   Account Details: ${v.bankDetails || '[Bank Name, Account Number, IFSC]'}

6. I trust this matter can be resolved amicably without requiring escalation to the local Rent Authority or legal counsel.

Thanking you.

Yours sincerely,

(Signature)
${v.yourName || '[Your Name]'}
Encl: Copy of rent agreement, final electricity bill receipt, key handover note.`,
  },
  {
    id: 't2',
    title: 'Salary / Workplace Dues Reminder (to Employer)',
    badge: 'Workplace',
    category: 'EMPLOYMENT & DUES',
    summary: 'Formal written notice requesting delayed monthly wages or pending full-and-final settlement dues.',
    fields: [
      { key: 'yourName', label: 'Your Name', placeholder: 'e.g. Sunita Nair', defaultValue: 'Sunita Nair' },
      { key: 'empId', label: 'Employee Code / ID', placeholder: 'e.g. EMP-4091', defaultValue: 'EMP-4091' },
      { key: 'designation', label: 'Your Designation', placeholder: 'e.g. Operations Associate', defaultValue: 'Operations Associate' },
      { key: 'companyName', label: 'Company / Employer Name', placeholder: 'e.g. ABC Solutions Pvt. Ltd.', defaultValue: 'ABC Solutions Pvt. Ltd.' },
      { key: 'managerOrHr', label: 'Attention: HR / Management', placeholder: 'e.g. The HR Director / Accounts Head', defaultValue: 'The HR Director / Accounts Head' },
      { key: 'dueMonths', label: 'Period / Months Pending', placeholder: 'e.g. September and October 2024', defaultValue: 'September and October 2024' },
      { key: 'totalDue', label: 'Total Outstanding Amount (₹)', placeholder: 'e.g. ₹68,000', defaultValue: '₹68,000' },
      { key: 'deadlineDays', label: 'Payment Deadline (Days)', placeholder: 'e.g. 5 business days', defaultValue: '5 business days' },
    ],
    generateLetter: (v) => `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

To,
${v.managerOrHr || 'The HR Manager / Managing Director'}
${v.companyName || '[Company Name]'}

From,
${v.yourName || '[Your Name]'}
Employee ID: ${v.empId || '[Employee ID]'}
Designation: ${v.designation || '[Designation]'}

SUBJECT: Formal Reminder Regarding Unpaid Salary / Pending Dues for ${v.dueMonths || '[Months/Period]'}

Respected Sir / Madam,

1. I am writing to formally bring to your attention that my salary / workplace remuneration for the period of ${v.dueMonths || '[Pending Period]'}, amounting to a total of ${v.totalDue || '[Total Amount]'}, has not yet been credited to my registered salary account.

2. As per the terms of my appointment contract and the provisions of the Payment of Wages Act / state commercial establishment norms, salaries are required to be disbursed within the designated payroll schedule.

3. I have fulfilled all my duties and completed all assigned responsibilities during this period diligently. The delay in salary credit is causing unforeseen personal and financial hardship.

4. I kindly request management to look into this matter urgently and ensure that the outstanding amount of ${v.totalDue || '[Total Amount]'} is credited to my salary bank account within ${v.deadlineDays || '5 business days'} from the date of this letter.

5. If there is any calculation breakdown or documentation needed from my end, please advise me in writing immediately.

I look forward to an early and cordial resolution.

Yours sincerely,

(Signature)
${v.yourName || '[Your Name]'}
Employee ID: ${v.empId || '[Employee ID]'}
Contact: [Your Phone / Email]`,
  },
  {
    id: 't3',
    title: 'Consumer Refund & Defective Product Complaint (to Seller / Platform)',
    badge: 'Consumer',
    category: 'CONSUMER GRIEVANCE',
    summary: 'Complaint letter to a merchant or online marketplace demanding refund or replacement under the Consumer Protection Act.',
    fields: [
      { key: 'yourName', label: 'Your Name', placeholder: 'e.g. Amit Kumar', defaultValue: 'Amit Kumar' },
      { key: 'yourContact', label: 'Your Email / Phone', placeholder: 'e.g. amit.kumar@email.com / 9811223344', defaultValue: 'amit.kumar@email.com / 9811223344' },
      { key: 'sellerName', label: 'Merchant / Platform Name', placeholder: 'e.g. QuickMart Online / XYZ Retail', defaultValue: 'QuickMart Online / XYZ Retail' },
      { key: 'orderId', label: 'Order ID / Invoice Number', placeholder: 'e.g. OD-98234-2024', defaultValue: 'OD-98234-2024' },
      { key: 'purchaseDate', label: 'Date of Purchase / Delivery', placeholder: 'e.g. 15th October 2024', defaultValue: '15th October 2024' },
      { key: 'productName', label: 'Product Name / Description', placeholder: 'e.g. Smart LED Television 43-inch', defaultValue: 'Smart LED Television 43-inch' },
      { key: 'defectDetails', label: 'Defect / Issue Observed', placeholder: 'e.g. Screen display flickers and unit does not power on after 2 days of delivery', defaultValue: 'Screen display flickers and unit does not power on after 2 days of delivery' },
      { key: 'claimAmount', label: 'Refund Amount Claimed (₹)', placeholder: 'e.g. ₹24,999', defaultValue: '₹24,999' },
    ],
    generateLetter: (v) => `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

To,
Customer Grievance Officer / Support Head
${v.sellerName || '[Merchant / Platform Name]'}

From,
${v.yourName || '[Your Name]'}
Contact Information: ${v.yourContact || '[Email / Phone]'}

SUBJECT: Formal Notice of Defective Product & Demand for Full Refund under Consumer Protection Act 2019 — Order ID: ${v.orderId || '[Order ID]'}
1. On ${v.purchaseDate || '[Purchase Date]'}, I purchased the product "${v.productName || '[Product Name]'}" from your platform / store vide Invoice / Order Number ${v.orderId || '[Order ID]'}, for a total consideration of ${v.claimAmount || '[Amount]'}.

2. Upon receipt and examination of the product, I noticed the following substantial defect / deficiency in service:
   "${v.defectDetails || '[Defect Description]'}"

3. Despite multiple attempts to resolve this issue through customer care tickets and support chats, the defect has not been rectified, nor has a replacement or refund been granted in accordance with standard return and consumer warranty commitments.

4. Supplying defective goods or refusing lawful refund constitutes an "unfair trade practice" and "deficiency in service" under the Consumer Protection Act, 2019.

5. I hereby call upon you to process a full refund of ${v.claimAmount || '[Refund Amount]'} back to the original payment source within 7 days from the receipt of this communication, along with pickup of the defective unit from my address.

6. In the event this matter is not settled within 7 days, I shall be compelled to register a formal grievance with the National Consumer Helpline (NCH Docket) and file a complaint before the Consumer Disputes Redressal Commission (e-Daakhil) for principal refund, interest, and costs of litigation.

Yours faithfully,

(Signature)
${v.yourName || '[Your Name]'}
Encl: Copy of Tax Invoice, Photos of Defect, Prior Chat / Ticket History.`,
  },
  {
    id: 't4',
    title: 'Request for Written Acknowledgment of Complaint (to Authority / Office)',
    badge: 'Civic Rights',
    category: 'CITIZEN COMMUNICATION',
    summary: 'Generic polite form requesting a dated, stamped receiving acknowledgment for complaints or letters submitted to public offices.',
    fields: [
      { key: 'yourName', label: 'Your Name', placeholder: 'e.g. Priya Sen', defaultValue: 'Priya Sen' },
      { key: 'yourContact', label: 'Your Phone & Address', placeholder: 'e.g. 9876543210, 14 Civil Lines, Jaipur', defaultValue: '9876543210, 14 Civil Lines, Jaipur' },
      { key: 'authorityName', label: 'Name of Office / Authority', placeholder: 'e.g. The Station House Officer / Municipal Ward Office', defaultValue: 'The Station House Officer / Municipal Ward Office' },
      { key: 'officeAddress', label: 'Office Address / Location', placeholder: 'e.g. Kotwali Police Station / Ward 12 Office', defaultValue: 'Kotwali Police Station / Ward 12 Office' },
      { key: 'complaintSubject', label: 'Subject of Original Complaint', placeholder: 'e.g. Complaint regarding noise pollution / unauthorized encroachment', defaultValue: 'Complaint regarding unauthorized encroachment and harassment' },
      { key: 'submissionDate', label: 'Date of Submission', placeholder: 'e.g. 24th October 2024', defaultValue: '24th October 2024' },
    ],
    generateLetter: (v) => `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

To,
${v.authorityName || '[Officer / Authority Designation]'}
${v.officeAddress || '[Office Name & Address]'}

From,
${v.yourName || '[Your Name]'}
Contact & Address: ${v.yourContact || '[Your Contact & Address]'}

SUBJECT: Submission of Complaint & Request for Stamped Receiving Acknowledgment — Regarding: ${v.complaintSubject || '[Subject of Complaint]'}

Respected Sir / Madam,

1. I am submitting herewith a formal written complaint regarding:
   ${v.complaintSubject || '[Subject Description]'}

2. The complete factual narrative along with relevant supporting documents is enclosed with this application for your perusal and necessary administrative / statutory action.

3. As an ordinary citizen exercising my legitimate right to petition public authorities, I kindly request you to provide a formal stamped and dated receiving acknowledgment (Diary Number / Inward Entry Number / GD Entry Number) on the duplicate copy of this letter for my records.

4. I undertake to cooperate fully with your office and provide any additional information or clarification required during inquiry.

Thanking you in anticipation.

Yours respectfully,

(Signature)
${v.yourName || '[Your Name]'}
Contact: ${v.yourContact || '[Your Contact]'}

Encl: Original complaint letter with supporting annexures (Total pages: ___ )

--------------------------------------------------------------------------------
OFFICE ACKNOWLEDGMENT RECEIPT (For Office Use Only):
Received copy of complaint from: ____________________________________
Diary / Inward / GD Reference Number: _______________________________
Date & Time Received: _______________________________________________
Receiving Officer Signature & Official Stamp: _______________________
--------------------------------------------------------------------------------`,
  },
  {
    id: 't5',
    title: 'Reply to Legal Notice (Acknowledgment & Extension Request)',
    badge: 'Legal Notice',
    category: 'LEGAL CORRESPONDENCE',
    summary: 'Interim reply acknowledging receipt of an advocate notice and formally requesting 15 days to consult legal counsel and compile documentary facts.',
    fields: [
      { key: 'yourName', label: 'Your Name', placeholder: 'e.g. Arvind Verma', defaultValue: 'Arvind Verma' },
      { key: 'yourContact', label: 'Your Address & Contact', placeholder: 'e.g. Flat 204, B-Wing, Pune / 9876543210', defaultValue: 'Flat 204, B-Wing, Pune / 9876543210' },
      { key: 'advocateName', label: 'Sender Advocate Name', placeholder: 'e.g. Adv. K. R. Sharma', defaultValue: 'Adv. K. R. Sharma' },
      { key: 'advocateAddress', label: 'Advocate Chamber / Office Address', placeholder: 'e.g. Chamber 412, District Courts Complex', defaultValue: 'Chamber 412, District Courts Complex' },
      { key: 'clientName', label: 'On Behalf of (Client Name)', placeholder: 'e.g. Shri Vikas Gupta / ABC Enterprises', defaultValue: 'Shri Vikas Gupta' },
      { key: 'noticeRef', label: 'Notice Reference / Date', placeholder: 'e.g. Notice Ref: LEG/2024/88 dated 15th Oct 2024', defaultValue: 'Notice Ref: LEG/2024/88 dated 15th Oct 2024' },
      { key: 'receivedDate', label: 'Date You Received the Notice', placeholder: 'e.g. 20th October 2024', defaultValue: '20th October 2024' },
      { key: 'daysRequested', label: 'Time Extension Requested', placeholder: 'e.g. 15 days', defaultValue: '15 days' },
    ],
    generateLetter: (v) => `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

To,
${v.advocateName || '[Advocate Name]'}
Advocate, Legal Counsel for ${v.clientName || '[Client Name]'}
${v.advocateAddress || '[Advocate Chamber / Address]'}

From,
${v.yourName || '[Your Name]'}
Address & Contact: ${v.yourContact || '[Your Address & Phone]'}

SUBJECT: Interim Reply and Formal Request for Time to Respond — Regarding ${v.noticeRef || '[Notice Reference & Date]'}

Dear Counsel,

1. I am in receipt of your legal notice referenced above, issued on behalf of your client (${v.clientName || '[Client Name]'}), which was delivered at my address on ${v.receivedDate || '[Date Received]'}.

2. Please treat this communication as a formal interim acknowledgment of receipt of your said legal notice, sent strictly WITHOUT PREJUDICE to my legal rights, contentions, and defenses.

3. The allegations, claims, and calculations stated in your notice are disputed and require thorough verification of relevant past correspondence, accounts, and documentary records.

4. Furthermore, I am currently in the process of engaging qualified legal counsel to properly examine the notice and advise me on my legal remedies.

5. In the interest of justice and fair play, I hereby formally request you and your client to grant an extension of ${v.daysRequested || '15 days'} from today to enable my counsel to examine the records and submit a comprehensive reply on merits.

6. You and your client are accordingly requested to refrain from initiating any hasty, unilateral, or adversarial legal proceedings until the expiry of this requested period.

Thanking you.

Yours faithfully,

(Signature)
${v.yourName || '[Your Name]'}
Contact: ${v.yourContact || '[Your Contact]'}`,
  },
];

export default function LetterTemplates() {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 860;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);

  // Initialize form state with default values of first template
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    TEMPLATES.forEach((tmpl) => {
      initial[tmpl.id] = {};
      tmpl.fields.forEach((f) => {
        initial[tmpl.id][f.key] = f.defaultValue;
      });
    });
    return initial;
  });

  const [copiedToast, setCopiedToast] = useState(false);

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];
  const currentValues = formValues[currentTemplate.id] || {};

  const handleFieldChange = (key: string, val: string) => {
    setFormValues((prev) => ({
      ...prev,
      [currentTemplate.id]: {
        ...(prev[currentTemplate.id] || {}),
        [key]: val,
      },
    }));
  };

  const handleReset = () => {
    const defaults: Record<string, string> = {};
    currentTemplate.fields.forEach((f) => {
      defaults[f.key] = f.defaultValue;
    });
    setFormValues((prev) => ({
      ...prev,
      [currentTemplate.id]: defaults,
    }));
  };

  const liveLetter = currentTemplate.generateLetter(currentValues);

  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(liveLetter);
      }
      showToast('Letter copied to clipboard');
    } catch {
      showToast('Letter copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: currentTemplate.title,
          text: liveLetter,
        });
        showToast('Letter shared successfully');
        return;
      } catch {
        // User dismissed share dialog; fallback to copy
      }
    }
    handleCopy();
  };

  const handleDownload = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([liveLetter], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const dateStr = new Date().toISOString().slice(0, 10);
        link.download = `LegalBridge_Letter_${currentTemplate.id}_${dateStr}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Letter downloaded as .txt file');
        return;
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const WA_URL_LIMIT = 1800;

  const handleWhatsApp = async () => {
    const WA_LIMIT = WA_URL_LIMIT;
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        try {
          await (navigator as any).share({
            title: currentTemplate.title,
            text: liveLetter,
          });
          showToast('Letter shared successfully');
          return;
        } catch { /* fall through to wa.me */ }
      }

      if (liveLetter.length <= WA_LIMIT) {
        window.open(`https://wa.me/?text=${encodeURIComponent(liveLetter)}`, '_blank');
        showToast('Opening WhatsApp…');
      } else {
        // Letter is too long for URL — copy full text, open WhatsApp with note
        try {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(liveLetter);
          }
        } catch {}
        const note = 'Full letter copied — paste in WhatsApp.';
        window.open(`https://wa.me/?text=${encodeURIComponent(note)}`, '_blank');
        showToast('Full letter copied! Paste it in WhatsApp.');
      }
    } else {
      // Mobile: copy to clipboard and instruct user
      handleCopy();
      showToast('Letter copied — paste in WhatsApp to share.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Utilities" />

      {/* Floating Toast Notification */}
      {toastMessage.length > 0 && (
        <View style={styles.toastContainer}>
          <View style={styles.toastPill}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Section */}
        <View style={[styles.headerHero, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerInner}>
            <View style={styles.topNavRow}>
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                onPress={() => navigation.navigate('Utilities')}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back-outline" size={18} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                <Text style={[styles.backBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>Back to Tools</Text>
              </TouchableOpacity>

              <View style={[styles.tagBadge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
                <Text style={styles.tagBadgeText}>READY-MADE CITIZEN LETTERS</Text>
              </View>
            </View>

            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Letter Templates (Fill & Copy)
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Ready-to-use letters for deposit refunds, unpaid salary, defective product complaints, and receiving receipts. Fill in the details and copy your completed letter in seconds.
            </Text>
          </View>
        </View>

        <View style={styles.contentBody}>
          {/* Educational Disclaimer Banner */}
          <View style={[styles.disclaimerBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="information-circle-outline" size={20} color={isDark ? '#60A5FA' : COLORS.navyGov} />
            <View style={styles.disclaimerTextGroup}>
              <Text style={[styles.disclaimerTitle, { color: theme.textPrimary }]}>
                Sample Educational Language Only
              </Text>
              <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                These templates provide standard polite language commonly used in everyday communications. You must review and adapt bracketed terms to match your exact facts. This does not constitute an advocate legal notice or formal court petition. For contested disputes, consult a qualified lawyer.
              </Text>
            </View>
          </View>

          {/* Template Selection Tabs */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Choose a Template:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.templateTabsScroll}
            contentContainerStyle={styles.templateTabsContainer}
          >
            {TEMPLATES.map((tmpl) => {
              const active = tmpl.id === selectedTemplateId;
              return (
                <TouchableOpacity
                  key={tmpl.id}
                  style={[
                    styles.tabCard,
                    active
                      ? [styles.tabCardActive, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov, borderColor: isDark ? '#3B82F6' : COLORS.navyGov }]
                      : [styles.tabCardInactive, { backgroundColor: theme.surface, borderColor: theme.border }],
                  ]}
                  onPress={() => setSelectedTemplateId(tmpl.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.tabHeaderRow}>
                    <Text
                      style={[
                        styles.tabCategoryText,
                        active ? { color: COLORS.accentGold } : { color: COLORS.accentGoldDark },
                      ]}
                    >
                      {tmpl.category}
                    </Text>
                    <View style={[styles.tabBadge, active ? { backgroundColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: theme.surfaceMuted }]}>
                      <Text style={[styles.tabBadgeText, active ? { color: '#FFFFFF' } : { color: theme.textMuted }]}>
                        {tmpl.badge}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.tabTitle,
                      active ? { color: '#FFFFFF' } : { color: theme.textPrimary },
                    ]}
                  >
                    {tmpl.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Main Work Area: Split View (Fields on Left, Live Preview on Right) */}
          <View style={[styles.splitLayout, isCompact && styles.splitLayoutStacked]}>
            {/* Left: Input Fields */}
            <View style={[styles.leftPane, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.paneHeader}>
                <Ionicons name="create-outline" size={18} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                <Text style={[styles.paneHeading, { color: theme.textPrimary }]}>Fill Your Details</Text>
              </View>
              <Text style={[styles.paneSubheading, { color: theme.textSecondary }]}>
                Changes appear instantly in the letter preview on the right.
              </Text>

              <View style={styles.fieldsList}>
                {currentTemplate.fields.map((field) => (
                  <View key={field.key} style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>{field.label}</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                          color: theme.textPrimary,
                        },
                      ]}
                      value={currentValues[field.key] ?? field.defaultValue}
                      onChangeText={(text) => handleFieldChange(field.key, text)}
                      placeholder={field.placeholder}
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.leftPaneActions}>
                <TouchableOpacity
                  style={[styles.resetBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={handleReset}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh-outline" size={15} color={theme.textSecondary} />
                  <Text style={[styles.resetBtnText, { color: theme.textSecondary }]}>Reset Fields</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right: Live Preview */}
            <View style={[styles.rightPane, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.paneHeaderBetween}>
                <View style={styles.paneHeader}>
                  <Ionicons name="document-text-outline" size={18} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                  <Text style={[styles.paneHeading, { color: theme.textPrimary }]}>Live Letter Preview</Text>
                </View>

                {/* Sticky Action Buttons */}
                <View style={styles.previewActionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}
                    onPress={handleCopy}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="copy-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Copy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: '#25D366', backgroundColor: theme.surface }]}
                    onPress={handleWhatsApp}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                    <Text style={[styles.actionBtnSecondaryText, { color: '#25D366' }]}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    onPress={handleShare}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="share-social-outline" size={14} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                    <Text style={[styles.actionBtnSecondaryText, { color: theme.textPrimary }]}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    onPress={handleDownload}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="download-outline" size={14} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                    <Text style={[styles.actionBtnSecondaryText, { color: theme.textPrimary }]}>.txt</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    onPress={handleReset}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="refresh-outline" size={14} color={theme.textMuted} />
                    <Text style={[styles.actionBtnSecondaryText, { color: theme.textMuted }]}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                style={[styles.previewPaper, { backgroundColor: theme.surface, borderColor: theme.border }]}
                nestedScrollEnabled={true}
              >
                <Text style={[styles.letterText, { color: theme.textPrimary }]}>
                  {liveLetter}
                </Text>
              </ScrollView>

              <View style={styles.previewFooterNotice}>
                <Ionicons name="bulb-outline" size={15} color={COLORS.accentGoldDark} />
                <Text style={[styles.previewFooterNoticeText, { color: theme.textMuted }]}>
                  Edit details before sending. Keep a copy and postal receipt for your records.
                </Text>
              </View>

              {/* Optional Link: Save a note in My Complaint Notes */}
              <TouchableOpacity
                style={[styles.saveNoteLinkBtn, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
                onPress={() => navigation.navigate('ComplaintNotes')}
                activeOpacity={0.8}
              >
                <Ionicons name="clipboard-outline" size={15} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                <Text style={[styles.saveNoteLinkText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>
                  Save a note that you sent this →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerHero: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerInner: {
    maxWidth: 1040,
    width: '100%',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navyGov,
  },
  tagBadge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.navyDark,
    marginBottom: 6,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    maxWidth: 780,
  },
  contentBody: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 18,
    ...SHADOWS.subtle,
  },
  disclaimerTextGroup: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  templateTabsScroll: {
    marginBottom: 18,
  },
  templateTabsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  tabCard: {
    width: 250,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    ...SHADOWS.subtle,
  },
  tabCardActive: {
    backgroundColor: COLORS.navyGov,
    borderColor: COLORS.navyGov,
  },
  tabCardInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tabCategoryText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  splitLayout: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  splitLayoutStacked: {
    flexDirection: 'column',
  },
  leftPane: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOWS.subtle,
  },
  rightPane: {
    flex: 1.2,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOWS.subtle,
  },
  paneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paneHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  paneHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navyDark,
  },
  paneSubheading: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  fieldsList: {
    gap: 12,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    outlineStyle: 'none',
  } as any,
  leftPaneActions: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.navyGov,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  previewPaper: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    minHeight: 460,
    maxHeight: 600,
  },
  letterText: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    fontSize: 12,
    lineHeight: 19,
  },
  previewFooterNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
  },
  previewFooterNoticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172AEE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#334155',
    ...SHADOWS.card,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  previewActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveNoteLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginTop: 8,
  },
  saveNoteLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
