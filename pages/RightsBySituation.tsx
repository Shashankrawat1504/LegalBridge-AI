import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

export interface HelpfulToolLink {
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface SituationItem {
  id: string;
  title: string;
  category: 'Tenancy' | 'Workplace' | 'Consumer' | 'Safety & Women' | 'Cyber Fraud' | 'Student & Youth';
  summary: string;
  icon: keyof typeof Ionicons.glyphMap;
  basicRights: string[];
  practicalNextSteps: string[];
  proofToKeep: string[];
  whenToGetHelp: string[];
  helpfulTools: HelpfulToolLink[];
  disclaimer: string;
}

export const DEMO_SITUATIONS: SituationItem[] = [
  {
    id: 's1',
    title: 'Tenant / Renter Rights',
    category: 'Tenancy',
    summary: 'Protection against unfair eviction, arbitrary rent hikes, and non-return of rental security deposits.',
    icon: 'home-outline',
    basicRights: [
      'Right to a written, signed copy of the Rent Agreement.',
      'Right to timely receipts or digital proof for every rent payment made.',
      'Protection against arbitrary eviction without reasonable notice agreed in contract.',
      'Protection against unlawful disconnection of essential utilities (electricity, water).',
      'Right to the full refund of security deposit after normal wear and tear.',
      'Right to peaceful enjoyment of premises without unauthorized entry by the landlord.',
    ],
    practicalNextSteps: [
      'Document everything in writing via email or WhatsApp rather than relying on verbal assurances.',
      'Send a formal, polite written deposit refund request with a 7 to 14 day payment deadline.',
      'Request itemized repair invoices for any deductions the landlord claims before accepting cuts.',
      'Hand over keys with a signed handover receipt and dated photos of the empty apartment.',
      'If landlord refuses dialogue, issue an advocate legal notice or file before the local Rent Authority.',
    ],
    proofToKeep: [
      'Registered or signed Tenancy / Lease Agreement',
      'Bank statements or receipts showing security deposit and monthly rent payments',
      'Electricity, water, and society maintenance clearance receipts',
      'Handover photos/videos of property condition on vacating day',
      'All written WhatsApp or email communications regarding deposit or vacating notice',
    ],
    whenToGetHelp: [
      'If the landlord threatens physical force, locks you out, or cuts water/electricity illegally',
      'If the deposit amount is high and the owner stops responding altogether',
      'To serve an advocate legal demand notice under Section 106 Transfer of Property Act',
    ],
    helpfulTools: [
      { label: 'Deposit Refund Template', route: 'LetterTemplates', icon: 'mail-outline' },
      { label: 'Landlord Deposit Guide', route: 'Guides', icon: 'book-outline' },
      { label: 'Check Rent Agreement', route: 'Document Analyzer', icon: 'scan-outline' },
    ],
    disclaimer:
      'Tenancy legislation varies across Indian states (e.g. Model Tenancy Act, Delhi Rent Control Act). Check local municipal and state rent authority guidelines.',
  },
  {
    id: 's2',
    title: 'Employee / Worker Rights',
    category: 'Workplace',
    summary: 'Right to timely wages, written appointment terms, safe working conditions, and statutory notice pay.',
    icon: 'briefcase-outline',
    basicRights: [
      'Right to receive agreed wages on time (typically by 7th–10th of each calendar month).',
      'Right to a written appointment letter specifying salary, role, and notice period.',
      'Right to statutory full-and-final settlement (FnF), gratuity, and leave encashment upon resignation.',
      'Protection against unlawful or retaliatory wage deductions without written explanation.',
      'Right to a dignified, safe workplace free from harassment, bullying, and wage exploitation.',
      'Statutory limits on standard working hours and entitlement to overtime where applicable.',
    ],
    practicalNextSteps: [
      'Send a formal, polite written reminder to HR and Finance detailing pending salary months.',
      'Keep copies of all attendance records, approved timesheets, and project completion emails.',
      'Complete official handover formalities and ensure you receive a signed No-Dues clearance.',
      'If management ignores reminders, escalate to Company Directors or file a wage petition before the Labour Commissioner.',
    ],
    proofToKeep: [
      'Offer letter, appointment letter, and compensation revision letters',
      'Monthly salary slips and Form 16 / Provident Fund statements',
      'Bank statements showing the absence of salary deposit',
      'Resignation email and written acceptance confirmation',
      'Handover sign-off and asset return receipts',
    ],
    whenToGetHelp: [
      'If the employer terminates you abruptly without contractually agreed notice pay',
      'If the company closes operations with multiple months of pending wages',
      'To issue an advocate legal notice for breach of employment contract',
    ],
    helpfulTools: [
      { label: 'Salary Dues Reminder Letter', route: 'LetterTemplates', icon: 'mail-outline' },
      { label: 'Unpaid Salary Action Guide', route: 'Guides', icon: 'book-outline' },
      { label: 'NALSA Legal Aid Helpline', route: 'Helplines', icon: 'call-outline' },
    ],
    disclaimer:
      'Legal remedies differ between "workmen" covered under Industrial Disputes law and supervisory or managerial personnel. Consult an employment lawyer for specific relief.',
  },
  {
    id: 's3',
    title: 'Consumer Rights (Defects & Refunds)',
    category: 'Consumer',
    summary: 'Protection against defective goods, refused warranties, misleading advertisements, and e-commerce frauds.',
    icon: 'cart-outline',
    basicRights: [
      'Right to safety against goods and services hazardous to life and property.',
      'Right to be informed about the quality, quantity, potency, purity, standard, and price of goods.',
      'Right to seek redressal against unfair trade practices or restrictive trade practices.',
      'Right to replacement or full refund for defective goods or deficient services.',
      'Protection against misleading advertisements and fake product descriptions.',
      'Right to file consumer grievances digitally from home via e-Jagriti without mandatory advocate hire.',
    ],
    practicalNextSteps: [
      'Submit an official written grievance to the seller / marketplace grievance officer first.',
      'Retain photos, unboxing videos, and tax invoices proving the defect was present upon arrival.',
      'Register a grievance with the National Consumer Helpline by dialing 1915 or on consumerhelpline.gov.in.',
      'If unresolved, file a formal complaint petition before the District Consumer Commission via e-Jagriti.',
    ],
    proofToKeep: [
      'Original tax invoice, receipt, or order confirmation email',
      'Photographs, unboxing videos, or service engineer inspection reports',
      'Customer support chat transcripts and email escalation trails',
      'Bank transaction reference (UTR) numbers showing payment deduction',
    ],
    whenToGetHelp: [
      'High-value claims (automobiles, real estate delays, complex medical negligence)',
      'When the opposite party challenges territorial or pecuniary jurisdiction',
      'To file an execution application for non-compliance with a Consumer Forum order',
    ],
    helpfulTools: [
      { label: 'Consumer Complaint Letter', route: 'LetterTemplates', icon: 'mail-outline' },
      { label: 'National Consumer Helpline (1915)', route: 'Helplines', icon: 'call-outline' },
      { label: 'Consumer Basics Guide', route: 'Guides', icon: 'book-outline' },
    ],
    disclaimer:
      'Consumer petitions must be filed within two years from the date on which the cause of action arose under the Consumer Protection Act 2019.',
  },
  {
    id: 's4',
    title: 'Women Safety, Dignity & Workplace Protection',
    category: 'Safety & Women',
    summary: 'Legal rights protecting women against domestic harassment, stalking, dowry demands, and workplace sexual harassment.',
    icon: 'shield-checkmark-outline',
    basicRights: [
      'Right to live free from domestic violence, emotional abuse, and physical cruelty under the DV Act.',
      'Right to a safe workplace free from sexual harassment under the POSH Act 2013.',
      'Right to lodge a complaint before an Internal Complaints Committee (ICC) in every organisation with 10+ employees.',
      'Right to "Zero FIR" — any police station can record an urgent complaint irrespective of where the crime occurred.',
      'Right to not be arrested after sunset and before sunrise except in extraordinary circumstances with magistrate permission.',
      'Right to privacy: a woman complainant cannot be summoned to a police station for questioning; questioning must happen at her residence in presence of family/lady officer.',
      'Right to free legal aid through NALSA / State Legal Services Authority regardless of income.',
    ],
    practicalNextSteps: [
      'In any immediate emergency or threat to bodily safety, call 112 (National Emergency) or 181 (Women Helpline).',
      'Reach out to trusted friends, family, or certified counsellors for safety coordination.',
      'Document harassing calls, messages, emails, dates, times, and witness presence in a safe place.',
      'For workplace harassment, submit a formal written complaint to your company’s Internal Committee (ICC) within 3 months.',
      'Consult the District Legal Services Authority (DLSA) for a free woman advocate and protection officer assistance.',
    ],
    proofToKeep: [
      'Screenshots of abusive messages, WhatsApp chats, call recordings, or social media harassment',
      'Medical examination records or injury certificates (MLC) from a government or registered hospital',
      'Dated notes recording exact remarks, dates, locations, and colleagues present',
      'Prior written complaints or police acknowledgment receipts',
    ],
    whenToGetHelp: [
      'Whenever physical danger, threats of violence, or stalking occurs — contact police immediately',
      'To seek a court protection order, residence order, or monetary relief under the DV Act',
      'If workplace management suppresses or retaliates against your POSH complaint',
    ],
    helpfulTools: [
      { label: 'Women Helpline 181', route: 'Helplines', icon: 'call-outline' },
      { label: 'National Emergency 112', route: 'Helplines', icon: 'call-outline' },
      { label: 'NALSA Free Legal Aid (15100)', route: 'Helplines', icon: 'call-outline' },
      { label: 'Police Complaint Guide', route: 'Guides', icon: 'book-outline' },
    ],
    disclaimer:
      'In acute crisis or danger, always contact 112 or 181 immediately. This app provides educational information and does not deploy emergency police assistance.',
  },
  {
    id: 's5',
    title: 'Online & Financial Fraud Target',
    category: 'Cyber Fraud',
    summary: 'Immediate rights and emergency actions if you are scammed via UPI, fake loans, phishing links, or unauthorized card debits.',
    icon: 'lock-closed-outline',
    basicRights: [
      'Zero liability protection under RBI guidelines if unauthorized electronic banking fraud is reported to your bank within 3 days.',
      'Right to have fraudulent bank accounts, debit cards, and UPI IDs blocked immediately upon customer request.',
      'Right to receive a formal dispute tracking docket number from your bank.',
      'Right to register a cybercrime complaint on the national portal (cybercrime.gov.in) and obtain an acknowledgment slip.',
      'Protection against abusive loan recovery agents: recovery calls can only be made between 8:00 AM and 7:00 PM per RBI norms.',
    ],
    practicalNextSteps: [
      'Call your bank immediately to freeze your compromised account, debit card, and net banking access.',
      'Dial 1930 (Cyber Crime Helpline) within golden hours to attempt freezing the stolen money in the recipient account.',
      'Lodge a formal complaint online at cybercrime.gov.in and download the PDF acknowledgment.',
      'Submit the cybercrime acknowledgment slip in person at your home bank branch within 72 hours.',
      'Never share OTPs, click suspicious "refund" links, or install remote-access apps (AnyDesk, TeamViewer) sent by strangers.',
    ],
    proofToKeep: [
      'Bank statement highlighting the fraudulent debit transactions',
      'Unique Transaction Reference (UTR) numbers and recipient UPI IDs',
      'Screenshots of fake SMS, phishing links, caller numbers, and WhatsApp chats',
      'Complaint acknowledgment number from cybercrime.gov.in and written bank dispute form',
    ],
    whenToGetHelp: [
      'If the bank rejects liability despite prompt reporting within RBI timelines',
      'To file an escalation before the RBI Banking Ombudsman (cms.rbi.org.in)',
      'If substantial funds or identity theft was involved requiring court intervention',
    ],
    helpfulTools: [
      { label: 'Cyber Crime Helpline 1930', route: 'Helplines', icon: 'call-outline' },
      { label: 'Cybercrime Portal Link', route: 'Helplines', icon: 'call-outline' },
      { label: 'UPI Fraud 24-Hr Guide', route: 'Guides', icon: 'book-outline' },
    ],
    disclaimer:
      'Fast reporting to 1930 and your home bank is vital. This educational overview cannot independently freeze bank accounts or reverse transactions.',
  },
  {
    id: 's6',
    title: 'Student & Youth Rights (Colleges & Hostels)',
    category: 'Student & Youth',
    summary: 'Rights against original certificate withholding, arbitrary fee forfeitures, hostel deposits, and campus discrimination.',
    icon: 'school-outline',
    basicRights: [
      'Colleges and universities cannot forcibly retain original academic certificates (10th/12th/Degree) under UGC regulations.',
      'Right to proportional fee refund if a student withdraws admission within prescribed UGC admission windows.',
      'Right to a fair refund of hostel security deposits upon completing tenancy or course exit.',
      'Right to an internal grievance redressal mechanism and anti-ragging committee on every recognized campus.',
      'Right to transparent evaluation, access to evaluated answer copies, or re-totaling under standard university statutes.',
    ],
    practicalNextSteps: [
      'Send a formal, polite written representation referencing UGC Notification on Refund of Fees and Non-Retention of Certificates.',
      'Retain proof of original fee payments, admission surrender letters, and courier tracking slips.',
      'Lodge a grievance on the UGC e-Samadhan portal (samadhan.ugc.ac.in) for higher education institutions.',
      'For private coaching institutes refusing statutory refunds for deficient service, approach the National Consumer Helpline (1915).',
    ],
    proofToKeep: [
      'Admission fee payment receipts and prospectus/fee structure documents',
      'Written withdrawal application submitted within university deadlines',
      'College ID card, provisional allotment letters, and email communications',
      'Photocopies of all educational certificates before submitting for verification',
    ],
    whenToGetHelp: [
      'If an institution unlawfully withholds your original degrees preventing you from joining another job/college',
      'To file a writ petition before the High Court or a consumer petition for compensation',
    ],
    helpfulTools: [
      { label: 'Written Acknowledgment Letter', route: 'LetterTemplates', icon: 'mail-outline' },
      { label: 'Consumer Helpline 1915', route: 'Helplines', icon: 'call-outline' },
      { label: 'NALSA Student Legal Aid', route: 'Helplines', icon: 'call-outline' },
    ],
    disclaimer:
      'Higher education institutions are regulated by statutory bodies such as UGC, AICTE, NMC, and BCI. Verify institutional affiliation and specific refund deadlines.',
  },
];

const CATEGORIES = [
  'All',
  'Tenancy',
  'Workplace',
  'Consumer',
  'Safety & Women',
  'Cyber Fraud',
  'Student & Youth',
] as const;

export default function RightsBySituation() {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSituation, setActiveSituation] = useState<SituationItem | null>(null);

  const filteredSituations = DEMO_SITUATIONS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCat;
    return (
      matchesCat &&
      (item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.basicRights.some((r) => r.toLowerCase().includes(query)))
    );
  });

  const handleToolNavigation = (route: string) => {
    setActiveSituation(null);
    navigation.navigate(route as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfficialNavbar currentRoute="Utilities" />

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
                <Text style={styles.tagBadgeText}>PLAIN-LANGUAGE RIGHTS</Text>
              </View>
            </View>

            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Rights by Situation
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Know your basic rights in real-world situations: renting a home, working a job, buying products, campus disputes, and digital safety.
            </Text>
          </View>
        </View>

        <View style={styles.contentBody}>
          {/* Educational Disclaimer Banner */}
          <View style={[styles.disclaimerBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="information-circle-outline" size={20} color={isDark ? '#60A5FA' : COLORS.navyGov} />
            <View style={styles.disclaimerTextGroup}>
              <Text style={[styles.disclaimerTitle, { color: theme.textPrimary }]}>
                Educational Rights Overview
              </Text>
              <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                These guides summarise fundamental legal protections and practical next steps for everyday citizens. For contested disputes or active lawsuits, always consult a qualified advocate or your local Legal Services Authority.
              </Text>
            </View>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search situations (e.g. tenant, salary, consumer, harassment, cyber, student)..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    active
                      ? [styles.chipActive, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov, borderColor: isDark ? '#3B82F6' : COLORS.navyGov }]
                      : [styles.chipInactive, { backgroundColor: theme.surface, borderColor: theme.border }],
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active ? styles.chipTextActive : [styles.chipTextInactive, { color: theme.textSecondary }],
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Situations Grid */}
          <View style={styles.cardsGrid}>
            {filteredSituations.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isCompact ? styles.cardFull : styles.cardHalf,
                  { backgroundColor: theme.cardBackground, borderColor: theme.border },
                ]}
                onPress={() => setActiveSituation(item)}
                activeOpacity={0.85}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <Ionicons name={item.icon} size={22} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                  </View>
                  <View style={styles.cardTopMeta}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.cardCategory}>{item.category.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                  </View>
                </View>

                <Text style={[styles.cardSummary, { color: theme.textSecondary }]} numberOfLines={3}>
                  {item.summary}
                </Text>

                <View style={styles.rightsPreviewBox}>
                  <Text style={styles.rightsPreviewLabel}>KEY RIGHTS COVERED:</Text>
                  {item.basicRights.slice(0, 2).map((r, i) => (
                    <Text key={i} style={[styles.rightsPreviewItem, { color: theme.textSecondary }]} numberOfLines={1}>
                      • {r}
                    </Text>
                  ))}
                </View>

                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                  <Text style={[styles.readBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>
                    View Plain-Language Rights & Actions
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Footer />
      </ScrollView>

      {/* Situation Detail Modal */}
      {activeSituation && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActiveSituation(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                isCompact ? styles.modalCardCompact : styles.modalCardRegular,
              ]}
            >
              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <View style={styles.modalHeaderInfo}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.cardCategory}>{activeSituation.category.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{activeSituation.title}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.closeModalBtn, { backgroundColor: theme.surfaceMuted }]}
                  onPress={() => setActiveSituation(null)}
                >
                  <Ionicons name="close" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
                {/* 1. Basic Rights */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.accentGoldDark} />
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                      Your Basic Rights (Plain Language)
                    </Text>
                  </View>
                  <View style={styles.bulletsList}>
                    {activeSituation.basicRights.map((r, idx) => (
                      <View key={idx} style={styles.bulletItem}>
                        <Ionicons name="checkmark-circle" size={16} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                        <Text style={[styles.bulletText, { color: theme.textPrimary }]}>{r}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 2. Practical Next Steps */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="footsteps-outline" size={18} color={COLORS.accentGoldDark} />
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                      Practical Next Steps
                    </Text>
                  </View>
                  <View style={styles.stepsList}>
                    {activeSituation.practicalNextSteps.map((step, idx) => (
                      <View key={idx} style={[styles.stepCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                        <View style={[styles.stepNum, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}>
                          <Text style={styles.stepNumText}>{idx + 1}</Text>
                        </View>
                        <Text style={[styles.stepText, { color: theme.textSecondary }]}>{step}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 3. Proof to Keep */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="folder-outline" size={18} color={COLORS.accentGoldDark} />
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                      Proof & Documents to Keep
                    </Text>
                  </View>
                  <View style={styles.proofList}>
                    {activeSituation.proofToKeep.map((doc, idx) => (
                      <View key={idx} style={styles.proofItem}>
                        <Ionicons name="document-text-outline" size={16} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                        <Text style={[styles.proofText, { color: theme.textSecondary }]}>{doc}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 4. When to Get Help */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="alert-circle-outline" size={18} color={COLORS.accentGoldDark} />
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                      When to Get Legal / Emergency Help
                    </Text>
                  </View>
                  <View style={styles.proofList}>
                    {activeSituation.whenToGetHelp.map((item, idx) => (
                      <View key={idx} style={styles.proofItem}>
                        <Ionicons name="arrow-forward-circle" size={16} color="#D97706" />
                        <Text style={[styles.proofText, { color: theme.textSecondary }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 5. Helpful Tools in this app */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="apps-outline" size={18} color={COLORS.accentGoldDark} />
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                      Helpful Tools in LegalBridge-AI
                    </Text>
                  </View>
                  <View style={styles.toolsRow}>
                    {activeSituation.helpfulTools.map((t, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.toolChip, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                        onPress={() => handleToolNavigation(t.route)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={t.icon} size={15} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                        <Text style={[styles.toolChipText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>
                          {t.label}
                        </Text>
                        <Ionicons name="arrow-forward" size={12} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Disclaimer */}
                <View style={[styles.modalDisclaimerBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                  <Text style={[styles.modalDisclaimerText, { color: theme.textMuted }]}>
                    {activeSituation.disclaimer}
                  </Text>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  style={[styles.closeDoneBtn, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}
                  onPress={() => setActiveSituation(null)}
                >
                  <Text style={styles.closeDoneBtnText}>Done Reading</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    maxWidth: 960,
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
    maxWidth: 760,
  },
  contentBody: {
    maxWidth: 960,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
    ...SHADOWS.subtle,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    outlineStyle: 'none',
  } as any,
  clearBtn: {
    padding: 4,
  },
  filterScroll: {
    marginBottom: 18,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: COLORS.navyGov,
    borderColor: COLORS.navyGov,
  },
  chipInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: COLORS.textSecondary,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOWS.subtle,
  },
  cardFull: {
    width: '100%',
  },
  cardHalf: {
    width: '48.9%',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopMeta: {
    flex: 1,
  },
  badgeRow: {
    marginBottom: 3,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navyDark,
    lineHeight: 20,
  },
  cardSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  rightsPreviewBox: {
    backgroundColor: 'rgba(217, 119, 6, 0.06)',
    borderRadius: RADIUS.sm,
    padding: 8,
    marginBottom: 12,
  },
  rightsPreviewLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  rightsPreviewItem: {
    fontSize: 11,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  readBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navyGov,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '90%',
    width: '100%',
    ...SHADOWS.subtle,
    overflow: 'hidden',
  },
  modalCardCompact: {
    maxWidth: '100%',
  },
  modalCardRegular: {
    maxWidth: 720,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHeaderInfo: {
    flex: 1,
    paddingRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navyDark,
    lineHeight: 24,
    marginTop: 4,
  },
  closeModalBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 18,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bulletsList: {
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  stepsList: {
    gap: 8,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  proofList: {
    gap: 6,
  },
  proofItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  proofText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  toolChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalDisclaimerBox: {
    padding: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: 14,
  },
  modalDisclaimerText: {
    fontSize: 11,
    lineHeight: 16,
  },
  modalFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  closeDoneBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  closeDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
