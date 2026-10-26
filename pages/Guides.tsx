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

export interface GuideItem {
  id: string;
  title: string;
  category: 'Police & Complaints' | 'Consumer Disputes' | 'Tenancy & Housing' | 'Workplace & Salary' | 'Cyber & Digital';
  summary: string;
  readTime: string;
  icon: keyof typeof Ionicons.glyphMap;
  whatThisIsAbout: string;
  steps: { title: string; detail: string }[];
  documentsToKeep: string[];
  whenToGetLegalHelp: string[];
  importantDisclaimer: string;
}

export const DEMO_GUIDES: GuideItem[] = [
  {
    id: 'g1',
    title: 'How to File a Police Complaint / FIR as a Complainant',
    category: 'Police & Complaints',
    summary: 'A step-by-step guide on what to carry, your right to a free FIR copy, and what to do if an officer refuses to register your complaint.',
    readTime: '4 min read',
    icon: 'shield-outline',
    whatThisIsAbout:
      'A First Information Report (FIR) is the document prepared by police when they receive information about the commission of a cognizable offence (serious crimes like theft, assault, cheating, or serious physical harm). Non-cognizable matters are generally recorded as Non-Cognizable Reports (NCR).',
    steps: [
      {
        title: 'Determine if your issue is cognizable or non-cognizable',
        detail:
          'Police are legally mandated to register an FIR for cognizable offences under law (Lalita Kumari judgment). For minor or non-violent private disputes, they may record a Non-Cognizable Report (NCR) which usually requires magistrate sanction for investigation.',
      },
      {
        title: 'Prepare a clear, chronological written complaint',
        detail:
          'Write down what happened in plain words: Date, exact time, location, persons involved or description of suspects, witnesses present, and what was stolen or damaged. Sign and date the letter.',
      },
      {
        title: 'Visit the local police station or check online portal',
        detail:
          'Visit the police station having jurisdiction over the area where the incident occurred. Many states also offer citizen portals or "Zero FIR" facility (where any police station can record an urgent complaint and transfer it to the concerned station).',
      },
      {
        title: 'Insist on a stamped acknowledgment or free copy',
        detail:
          'Section 154 CrPC / Section 173 BNSS mandates that a copy of the registered FIR must be given to the complainant immediately, completely free of cost. Always obtain a dated acknowledgment seal on a duplicate copy of your written complaint.',
      },
      {
        title: 'If police refuse to register your complaint',
        detail:
          'Do not argue or escalate at the counter. Send your signed complaint via Registered Post / Speed Post with Acknowledgment Due (RPAD) or online to the Superintendent of Police (SP) or Deputy Commissioner of Police (DCP). If still unresolved, consult a lawyer to file a private complaint before the Judicial Magistrate.',
      },
    ],
    documentsToKeep: [
      'Government photo ID (Aadhaar, Voter ID, Passport, or Driving License)',
      'Signed duplicate copy of the complaint letter with receipt/stamp',
      'Postal tracking slip if sent by Registered Post',
      'Any supporting evidence (medical bills, CCTV, chat screenshots, call logs, photographs)',
      'Names and phone numbers of eyewitnesses',
    ],
    whenToGetLegalHelp: [
      'If you face counter-threats or harassment after reporting',
      'If the police refuse to accept a complaint in a serious crime',
      'If you need to file an application before a Magistrate or High Court for protection',
      'Whenever personal bodily safety or anticipatory protection is concerned',
    ],
    importantDisclaimer:
      'This guide provides general educational information about standard police reporting procedures in India. It does not initiate an official police inquiry. Always seek assistance from a licensed advocate or legal services authority for specific legal counsel.',
  },
  {
    id: 'g2',
    title: 'Consumer Complaint Basics: Defective Products & Denied Refunds',
    category: 'Consumer Disputes',
    summary: 'How to claim refunds, replace defective goods, report unfair trade practices, and escalate to the National Consumer Helpline (1915) or e-Daakhil.',
    readTime: '3 min read',
    icon: 'cart-outline',
    whatThisIsAbout:
      'The Consumer Protection Act 2019 protects consumers against unfair trade practices, defective goods, deficient services, misleading advertisements, and refusal of statutory refunds by e-commerce platforms and retail stores.',
    steps: [
      {
        title: 'Send a formal written notice / grievance to customer support',
        detail:
          'First raise a support ticket or send a formal email to the merchant or platform grievance officer. Specify order ID, date, defect details, and set a clear timeline (e.g. 7 days) for replacement or refund.',
      },
      {
        title: 'Lodge a complaint on National Consumer Helpline (NCH)',
        detail:
          'If the company fails to resolve your grievance, dial 1915 or register online at consumerhelpline.gov.in. NCH assigns a docket number and coordinates directly with 700+ registered enterprise grievance desks.',
      },
      {
        title: 'File on e-Daakhil for formal Consumer Commission redressal',
        detail:
          'For unresolved disputes, you can file a formal case online via edaakhil.nic.in before your District Consumer Disputes Redressal Commission without needing mandatory lawyer representation for consumer complaints up to statutory limits.',
      },
      {
        title: 'Claim compensation for financial loss or mental harassment',
        detail:
          'In your complaint petition, clearly state the principal refund amount sought, interest, and reasonable compensation for distress or incidental expenses incurred.',
      },
    ],
    documentsToKeep: [
      'Original tax invoice, receipt, or order confirmation email',
      'Unboxing video or photos showing defective or damaged items',
      'Complete email trails, chat transcripts, or support ticket IDs',
      'Bank statement showing payment debit and transaction IDs',
      'Courier tracking slips or delivery confirmation notes',
    ],
    whenToGetLegalHelp: [
      'Disputes involving high monetary value or complex medical negligence',
      'When an opposite party files complex jurisdictional objections',
      'If you need to enforce a Consumer Commission execution decree against a non-compliant company',
    ],
    importantDisclaimer:
      'Consumer complaint procedures vary based on claim value and local commission rules. This guide is for educational awareness and does not constitute filing a legal petition.',
  },
  {
    id: 'g3',
    title: 'Landlord Not Returning Security Deposit: Practical Steps',
    category: 'Tenancy & Housing',
    summary: 'What to do when your tenancy ends and the owner makes unfair deductions or delays returning your deposit refund.',
    readTime: '4 min read',
    icon: 'home-outline',
    whatThisIsAbout:
      'Security deposits are held in trust by landlords to cover legitimate unpaid rent or extraordinary structural damage. Normal wear and tear is not legally deductible. This guide explains how to document your exit and recover your funds lawfully.',
    steps: [
      {
        title: 'Complete a documented handover inspection',
        detail:
          'Take dated photos and videos of every room, wall, appliance, and meter reading on the day of vacating. Have the landlord or their agent sign a key handover / inventory checklist acknowledging physical possession.',
      },
      {
        title: 'Send a formal refund demand letter with a 7–14 day deadline',
        detail:
          'Send a polite but firm written communication (email or WhatsApp, followed by Speed Post) stating that keys were handed over, all utility bills are cleared, and requesting the deposit balance via bank transfer by a specific date.',
      },
      {
        title: 'Demand itemised bills for claimed damage deductions',
        detail:
          'If the landlord claims excessive repainting or repair deductions, formally request original repair invoices. Normal wear and tear due to reasonable passage of time cannot be penalised under standard tenancy law.',
      },
      {
        title: 'Do not withhold keys or take arbitrary self-help action',
        detail:
          'Avoid unauthorised actions like continuing to occupy without rent or damaging property, as this weakens your legal claim. Maintain civil, written proof of every interaction.',
      },
      {
        title: 'Explore Rent Authority, Consumer Forum, or Legal Notice',
        detail:
          'If the landlord remains unresponsive, issue a formal legal notice through an advocate. Depending on state tenancy acts, you may approach the local Rent Authority / Rent Tribunal or file a summary civil suit for money recovery.',
      },
    ],
    documentsToKeep: [
      'Original registered or notarised Rent Agreement',
      'Security deposit transfer receipt or bank transaction proof',
      'Monthly rent payment proofs (bank transfer statements or receipts)',
      'Handover photos/videos of the empty apartment and meter readings',
      'Written termination notice served within notice period agreed in contract',
    ],
    whenToGetLegalHelp: [
      'If the deposit amount is substantial and the landlord stops answering calls',
      'If the landlord issues unfounded threats of criminal trespass or theft',
      'To draft and serve an advocate-issued legal demand notice under Section 106 Transfer of Property Act',
    ],
    importantDisclaimer:
      'Tenancy laws vary by Indian state (e.g., Delhi Rent Control, Maharashtra Rent Control, Model Tenancy Act). Verify state-specific rent authority rules or consult a local legal professional.',
  },
  {
    id: 'g4',
    title: 'Unpaid Salary & Workplace Dues: Employee Rights',
    category: 'Workplace & Salary',
    summary: 'Steps for employees and contractual workers to recover delayed wages, gratuity, full-and-final settlements, and notice pay.',
    readTime: '3 min read',
    icon: 'briefcase-outline',
    whatThisIsAbout:
      'Payment of Wages Act and state Shops & Commercial Establishments Acts require employers to pay salaries within statutory timelines (typically by the 7th or 10th of each month) and settle Full & Final dues promptly upon resignation or termination.',
    steps: [
      {
        title: 'Submit a polite written reminder to HR and Finance',
        detail:
          'Send a formal email asking for your pending salary, expense reimbursements, or Full & Final (FnF) statement with breakdown. Reference your employee code and date of exit.',
      },
      {
        title: 'Check your contract and employment policies',
        detail:
          'Review your appointment letter regarding notice period clauses, leaves encashment, and settlement timelines. Document that you have completed all official asset returns and handover formalities.',
      },
      {
        title: 'Escalate to the Grievance Cell or Company Directors',
        detail:
          'If lower management ignores requests, address the email to senior executive directors or corporate founders highlighting statutory wage obligations.',
      },
      {
        title: 'Lodge a complaint before the Labour Commissioner',
        detail:
          'Workers and non-managerial staff can file a wage dispute petition before the local Labour Commissioner or under the Payment of Wages Act. For private managerial employees, commercial recovery suits or legal notices are typical remedies.',
      },
    ],
    documentsToKeep: [
      'Appointment / Offer Letter and latest increment letters',
      'Monthly salary slips and Form 16 / PF statements',
      'Bank statement showing the absence of salary credit',
      'Resignation email and written acceptance of resignation',
      'No-Dues clearance certificate and company property return receipts',
    ],
    whenToGetLegalHelp: [
      'If the employer terminates you without statutory notice pay or severance',
      'If the company is undergoing insolvency or closing down operations',
      'To issue an advocate legal notice for breach of contract or unpaid dues',
    ],
    importantDisclaimer:
      'Remedies differ significantly between "workmen" governed by Industrial Disputes law and managerial/supervisory corporate employees. Consult an employment lawyer for tailored advice.',
  },
  {
    id: 'g5',
    title: 'Online & UPI Fraud: First 24-Hour Action Plan',
    category: 'Cyber & Digital',
    summary: 'Emergency protocol if you fall victim to financial cyber fraud, fake KYC scams, fraudulent UPI debit requests, or OTP theft.',
    readTime: '3 min read',
    icon: 'lock-closed-outline',
    whatThisIsAbout:
      'In cyber financial fraud, the first 2 to 24 hours (often called the "golden hours") are crucial. If reported immediately, banks and cyber cells can freeze suspect transaction accounts before the fraudster withdraws the money.',
    steps: [
      {
        title: 'Block compromised card, net banking, and UPI immediately',
        detail:
          'Call your bank\'s 24x7 fraud prevention helpline or use mobile banking app to freeze your debit/credit card, disable UPI, and lock internet banking credentials.',
      },
      {
        title: 'Call 1930 (National Cyber Crime Reporting Helpline)',
        detail:
          'Immediately dial 1930 from anywhere in India. Provide your bank name, account number, fraudulent transaction ID, amount, and the recipient account/UPI ID if known.',
      },
      {
        title: 'File a complaint on cybercrime.gov.in',
        detail:
          'Log in to cybercrime.gov.in and register a financial fraud report within 24 hours. Download the PDF acknowledgment containing your Complaint Acknowledgement Number.',
      },
      {
        title: 'Submit the complaint acknowledgment to your home bank branch',
        detail:
          'Visit your home bank branch with the cybercrime acknowledgment slip. Under RBI guidelines on customer liability, reporting unauthorised transactions within 3 days limits customer liability.',
      },
      {
        title: 'Preserve all digital evidence and never share OTPs further',
        detail:
          'Do not delete SMS alerts, WhatsApp chats, or call records. Do not click links claiming to "refund" your money — scammers often pretend to be cyber police or bank executives.',
      },
    ],
    documentsToKeep: [
      'Bank statement highlighting the fraudulent debit transactions',
      'Unique Transaction Reference (UTR) numbers and UPI reference IDs',
      'Screenshots of phishing SMS, suspicious links, WhatsApp chats, and caller phone numbers',
      'Cybercrime portal acknowledgment PDF (from cybercrime.gov.in)',
      'Written dispute form submitted to the bank with received stamp',
    ],
    whenToGetLegalHelp: [
      'If your bank refuses to accept liability despite zero-fault prompt reporting',
      'To file an escalation before the RBI Banking Ombudsman (cms.rbi.org.in)',
      'If significant life savings were stolen and police investigation requires legal intervention',
    ],
    importantDisclaimer:
      'This guide outlines standard preventive actions based on Reserve Bank of India and Ministry of Home Affairs advisories. It cannot independently recover funds. Report directly to your bank and 1930.',
  },
];

const CATEGORIES = [
  'All',
  'Police & Complaints',
  'Consumer Disputes',
  'Tenancy & Housing',
  'Workplace & Salary',
  'Cyber & Digital',
] as const;

export default function Guides() {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGuide, setActiveGuide] = useState<GuideItem | null>(null);

  const filteredGuides = DEMO_GUIDES.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCat;
    return (
      matchesCat &&
      (item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.whatThisIsAbout.toLowerCase().includes(query))
    );
  });

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
                <Text style={styles.tagBadgeText}>CITIZEN ACTION GUIDES</Text>
              </View>
            </View>

            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Citizen Guides
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Clear, step-by-step guidance for everyday situations: police complaints, tenant security deposits, consumer refunds, salary delays, and digital fraud.
            </Text>
          </View>
        </View>

        <View style={styles.contentBody}>
          {/* Educational Disclaimer Banner */}
          <View style={[styles.disclaimerBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="information-circle-outline" size={20} color={isDark ? '#60A5FA' : COLORS.navyGov} />
            <View style={styles.disclaimerTextGroup}>
              <Text style={[styles.disclaimerTitle, { color: theme.textPrimary }]}>
                Educational Guidance Only
              </Text>
            </View>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search guides (e.g. deposit, FIR, salary, cyber, refund)..."
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

          {/* Guide Cards Grid */}
          <View style={styles.cardsGrid}>
            {filteredGuides.map((guide) => (
              <TouchableOpacity
                key={guide.id}
                style={[
                  styles.card,
                  isCompact ? styles.cardFull : styles.cardHalf,
                  { backgroundColor: theme.cardBackground, borderColor: theme.border },
                ]}
                onPress={() => setActiveGuide(guide)}
                activeOpacity={0.85}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <Ionicons name={guide.icon} size={22} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                  </View>
                  <View style={styles.cardTopMeta}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.cardCategory}>{guide.category.toUpperCase()}</Text>
                      <Text style={[styles.readTime, { color: theme.textMuted }]}>• {guide.readTime}</Text>
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{guide.title}</Text>
                  </View>
                </View>

                <Text style={[styles.cardSummary, { color: theme.textSecondary }]} numberOfLines={3}>
                  {guide.summary}
                </Text>

                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                  <Text style={[styles.readGuideBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>
                    Read Step-by-Step Guide
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Footer />
      </ScrollView>

      {/* Guide Details Modal */}
      {activeGuide && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActiveGuide(null)}
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
                    <Text style={styles.cardCategory}>{activeGuide.category.toUpperCase()}</Text>
                    <Text style={[styles.readTime, { color: theme.textMuted }]}>• {activeGuide.readTime}</Text>
                  </View>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{activeGuide.title}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.closeModalBtn, { backgroundColor: theme.surfaceMuted }]}
                  onPress={() => setActiveGuide(null)}
                >
                  <Ionicons name="close" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Modal Scroll Content */}
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
                {/* Section 1: What this is about */}
                <View style={styles.detailSection}>
                  <View style={styles.sectionHeadingRow}>
                    <Ionicons name="book-outline" size={18} color={COLORS.accentGoldDark} />
                    <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>What This Is About</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                    {activeGuide.whatThisIsAbout}
                  </Text>
                </View>

                {/* Section 2: Steps */}
                <View style={styles.detailSection}>
                  <View style={styles.sectionHeadingRow}>
                    <Ionicons name="list-outline" size={18} color={COLORS.accentGoldDark} />
                    <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Action Steps (Numbered)</Text>
                  </View>
                  <View style={styles.stepsContainer}>
                    {activeGuide.steps.map((step, idx) => (
                      <View key={idx} style={[styles.stepItem, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                        <View style={[styles.stepNumberBadge, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}>
                          <Text style={styles.stepNumberText}>{idx + 1}</Text>
                        </View>
                        <View style={styles.stepContent}>
                          <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>{step.title}</Text>
                          <Text style={[styles.stepDetail, { color: theme.textSecondary }]}>{step.detail}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Section 3: Documents / proof to keep */}
                <View style={styles.detailSection}>
                  <View style={styles.sectionHeadingRow}>
                    <Ionicons name="folder-outline" size={18} color={COLORS.accentGoldDark} />
                    <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Documents & Proof to Keep</Text>
                  </View>
                  <View style={styles.checkList}>
                    {activeGuide.documentsToKeep.map((doc, idx) => (
                      <View key={idx} style={styles.checkItem}>
                        <Ionicons name="checkbox-outline" size={18} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                        <Text style={[styles.checkText, { color: theme.textSecondary }]}>{doc}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Section 4: When to get legal help */}
                <View style={styles.detailSection}>
                  <View style={styles.sectionHeadingRow}>
                    <Ionicons name="alert-circle-outline" size={18} color={COLORS.accentGoldDark} />
                    <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>When to Get Legal Help</Text>
                  </View>
                  <View style={styles.checkList}>
                    {activeGuide.whenToGetLegalHelp.map((item, idx) => (
                      <View key={idx} style={styles.checkItem}>
                        <Ionicons name="arrow-forward-circle-outline" size={18} color="#D97706" />
                        <Text style={[styles.checkText, { color: theme.textSecondary }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Section 5: Disclaimer */}
                <View style={[styles.modalDisclaimerBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                  <Text style={[styles.modalDisclaimerTitle, { color: theme.textPrimary }]}>Disclaimer</Text>
                  <Text style={[styles.modalDisclaimerText, { color: theme.textMuted }]}>
                    {activeGuide.importantDisclaimer}
                  </Text>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  style={[styles.closeDoneBtn, { backgroundColor: isDark ? '#1E3A8A' : COLORS.navyGov }]}
                  onPress={() => setActiveGuide(null)}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.6,
  },
  readTime: {
    fontSize: 11,
    color: COLORS.textMuted,
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
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  readGuideBtnText: {
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
  detailSection: {
    marginBottom: 20,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navyDark,
    letterSpacing: 0.2,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  stepsContainer: {
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.navyGov,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 3,
  },
  stepDetail: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  checkList: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
  modalDisclaimerBox: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
  },
  modalDisclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navyDark,
    marginBottom: 4,
  },
  modalDisclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
  },
  modalFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  closeDoneBtn: {
    backgroundColor: COLORS.navyGov,
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
