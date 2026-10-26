import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const STORAGE_KEY = '@lawai_user_documents';

// ── Generate demo document content for viewable demo docs ──────────────
const generateDemoContent = (docId: string): string => {
  switch (docId) {
    case 'demo-1':
      return `FIRST INFORMATION REPORT

Case No. 456/2026
Police Station: Connaught Place, Delhi
Date: 15 Oct 2026

Complainant: Rahul Sharma, S/o Shri Mohan Sharma, R/o Block A, Janpath, New Delhi
Age: 32 years, Occupation: Businessman
Mobile: +91-9876543210

Offence: Theft of mobile phone and wallet
Place: Connaught Place, New Delhi
Time: Between 14:30-15:00 hours on 15 Oct 2026

Description:
The complainant alleges that while walking near the Metro Station exit at Connaught Place, unknown accused snatched his mobile phone (iPhone 14, Black, IMEI: 356789012345678) and leather wallet containing ₹15,000 in cash, two debit cards (HDFC and SBI), and ID proofs. The accused fled towards the inner circle direction on a motorcycle. The complainant immediately raised an alarm and approached the police booth. CCTV footage from the area may be available.

Property stolen:
- iPhone 14 Black (value ₹70,000)
- Leather wallet (value ₹2,000)
- Cash ₹15,000
- Debit cards (2)
- PAN card, Aadhar card

Prayer:
It is prayed that an FIR be registered under appropriate sections of BNS 2023 (Sections 303(2) theft, 304 snatching, 318 cheating) and investigation be initiated to apprehend the accused and recover the stolen property.

Signature: _________________
Complainant
Date: 15 Oct 2026
Witness: Police Constable #456`;

    case 'demo-2':
      return `AFFIDAVIT FOR BAIL

IN THE COURT OF SESSIONS JUDGE, SAKET COURTS, NEW DELHI

CASE: Bail Application in FIR No. 123/2026
POLICE STATION: Central District, Delhi
REGISTRAR COURT DELHI

I, Amit Verma, S/o Shri Rajesh Verma, R/o Flat 402, Tower B, Rohini Sector 16, New Delhi-110085, do hereby solemnly affirm and declare as follows:

1. That I am the accused in the above-referenced case FIR No. 123/2026 registered under sections 318(4) and 324 of BNS 2023.

2. That I am a law-abiding citizen with no criminal antecedents. I am a software engineer by profession, aged 28 years, working with TechCorp India Pvt Ltd since 2020 with a monthly income of ₹85,000.

3. That I have deep roots in the society as my family resides at the above address for the last 25 years. I am not a flight risk and shall cooperate fully with the investigation.

4. That the allegations against me are false and motivated. I have been falsely implicated due to a property dispute with the complainant over ancestral property in Meerut.

5. That I am ready to furnish any surety or bail bond as directed by this Hon'ble Court. My father, Shri Rajesh Verma, retired government servant, is willing to stand as surety.

6. That I have a dependent mother aged 65 years and my presence is essential for her care and medical support.

DEPONENT
VERIFICATION
Verified at New Delhi on this 20th day of October 2026 that the contents of this affidavit are true to my knowledge.

(Sd/-) Amit Verma
DEPONENT`;

    case 'demo-3':
      return `HIGH COURT OF DELHI AT NEW DELHI

WRIT PETITION (CRIMINAL) No. 881/2026

IN THE MATTER OF:
Shri Sunil Kumar ... Petitioner
Vs.
Union of India & Others ... Respondents

ORDER PASSED ON: 12 Oct 2026

NOTICE OF MOTION heard on 10 Oct 2026.

Facts:
The petitioner is the owner of property bearing No. A-45, Rajouri Garden, New Delhi. The respondent authorities issued a demolition notice dated 01 Sep 2026 alleging unauthorised construction. The petitioner contends that the construction is fully authorised as per approved building plan dated 15 Mar 2020 (Building Plan No. BD/2020/7890). The construction comprises of two additional floors which were sanctioned by the MCD as per rules.

Issue:
Whether the demolition notice is contrary to the principles of natural justice and whether the petitioner should be granted a stay pending final adjudication.

Held:
Issue notice to the respondents. Pending adjudication of the writ petition, operation of the demolition notice dated 01 Sep 2026 is hereby stayed. Respondents shall maintain status quo. Petitioner is permitted to file detailed affidavit-in-reply within four weeks.

Let copies of this order be supplied to the parties.

(Sd/-) Hon'ble Justice XYZ
JUDGE, HIGH COURT OF DELHI
DATED: 12 Oct 2026`;

    case 'demo-4':
      return `RENT AGREEMENT

THIS RENT AGREEMENT is made on this 1st day of November 2026

BETWEEN

Shri Rajesh Gupta, S/o Shri Kedar Nath Gupta, R/o Flat 201, Saraswati Vihar, New Delhi-110092 (hereinafter called the "Landlord")

AND

Shri Priyansh Sharma, S/o Shri Ramesh Sharma, R/o Village & Post Office, District Meerut, Uttar Pradesh (hereinafter called the "Tenant")

WITNESSETH:
1. Shri Sunil Kumar, Advocate, Delhi
2. Smt. Meena Devi, Flat 202, Saraswati Vihar, New Delhi

1. The Landlord agrees to let and the Tenant agrees to take on rent the residential premises Flat No. 101, Building A, Sector 62, Noida, Uttar Pradesh (hereinafter called the "Demised Premises").

2. The term of this agreement shall be for a period of 11 (eleven) months commencing from 1st November 2026 and ending on 31st October 2027.

3. The monthly rent shall be ₹18,000 (Rupees Eighteen Thousand Only) payable on or before the 5th day of each month. Late payment will attract interest at 18% per annum.

4. The Tenant shall pay a security deposit of ₹54,000 (Rupees Fifty-Four Thousand Only) at the time of signing this agreement, refundable without interest at the time of vacating the premises after deducting any dues.

5. The Tenant shall use the premises for residential purposes only and shall not sublet without prior written consent of the Landlord.

6. Electricity, water, and maintenance charges shall be borne by the Tenant.

7. The Landlord shall ensure the premises are in good condition and habitable.

IN WITNESS WHEREOF, the parties have executed this agreement on the date first above written.

Sd/- LANDLAND          Sd/- TENANT          Sd/- WITNESS
Rajesh Gupta            Priyansh Sharma      Sunil Kumar`;

    case 'demo-5':
      return `CHARGE SHEET

POLICE STATION: Connaught Place, Delhi
FIR No. 456/2026
CASE: State vs. Unknown Accused
UNDER SECTIONS: 303(2), 304, 318(4) BNS 2023

IN THE COURT OF MM (METROPOLITAN MAGISTRATE), DELHI

The undersigned SHO Connaught Place, Delhi submits this charge sheet stating that on 15 Oct 2026 at about 14:45 hours, a case was registered on the complaint of Shri Rahul Sharma alleging theft of mobile phone and wallet.

Investigation revealed that the accused persons, acting in furtherance of common intention, committed theft and snatching as follows:

CHARGE:
1. That on 15 Oct 2026 at about 14:30 hours at Connaught Place, you along with your associates committed theft of iPhone 14 and wallet worth ₹87,000 from Rahul Sharma, which is punishable under Section 303(2) BNS.

2. That you used criminal force to snatch the mobile from the possession of the complainant, punishable under Section 304 BNS.

3. That you dishonestly induced the complainant to part with property by false pretext, punishable under Section 318(4) BNS.

EVIDENCE:
- CCTV footage from Connaught Place Metro Station
- Witness statements of passers
- Recovery attempt was made but accused absconded

This case is triable exclusively by the Court of Session.

(Sd/-)
SHO Connaught Place
Delhi
Date: 25 Oct 2026`;

    case 'demo-6':
      return `LEGAL NOTICE

REGISTRATION NO. LN-2026-789
DATE: 05 Nov 2026

FROM:
Adv. Priya Sharma
Chamber No. 203, District Court Complex, New Delhi-110001

TO:
Shri Vikram Singh
R/o H.No. 45, Lane 3, Karol Bagh, New Delhi-110005

SUBJECT: RECOVERY OF OUTSTANDING LOAN AMOUNT

Dear Sir,

Under instruction and authority of my client, M/s Green Finance Ltd., I hereby serve upon you this legal notice as follows:

1. My client had extended a loan of ₹5,00,000 (Rupees Five Lakhs Only) to you on 15 March 2025, evidenced by loan agreement dated 15 March 2025, repayable in 24 EMIs of ₹23,500 each.

2. Despite repeated reminders and notices dated 15 Sep 2025, 15 Dec 2025, and 15 Mar 2026, you have failed to make payments. The total outstanding amount now stands at ₹3,12,000 (Rupees Three Lakhs Twelve Thousand Only) including interest and charges.

3. I hereby call upon you to pay the outstanding amount of ₹3,12,000 within 15 days from receipt of this notice, failing which my client shall be constrained to initiate legal proceedings for recovery under applicable laws.

4. This notice is without prejudice to any other legal rights and remedies available to my client.

Sincerely,
(Sd/-)
Adv. Priya Sharma
Legal Counsel`;

    case 'demo-7':
      return `CIVIL SUIT FOR SPECIFIC PERFORMANCE

IN THE COURT OF CIVIL JUDGE (JR. DIVISION), DELHI

CS No. 456/2026
DATE OF INSTITUTION: 01 Nov 2026

PLAINTIFF: Shri Anil Kumar Gupta
R/o Flat 205, Mayur Vihar Phase II, Delhi-110091

DEFENDANT: Shri Rajendra Prasad
R/o H.No. 78, Sector 4, Dwarka, New Delhi-110075

SUIT FOR SPECIFIC PERFORMANCE OF AGREEMENT TO SELL

The plaintiff states as follows:

1. That the plaintiff and defendant entered into a sale agreement dated 15 July 2026 for purchase of flat No. 78, Sector 4, Dwarka, Delhi for consideration of ₹45,00,000.

2. The plaintiff paid advance of ₹15,00,000 as per agreement. The defendant agreed to execute and register the sale deed by 15 Oct 2026.

3. Despite repeated requests and legal notice dated 20 Oct 2026, the defendant has failed to execute the sale deed and is now refusing to honour the agreement.

4. The plaintiff is ready and willing to pay the balance consideration of ₹30,00,00.

PRAYER:
It is prayed that this Hon'ble Court may:
a) Pass a decree of specific performance directing the defendant to execute the sale deed in favour of plaintiff.
b) Award costs of this suit.
c) Pass such other orders as deemed fit.

(Sd/-)
Counsel for Plaintiff
Advocate, Delhi Court Complex`;

    case 'demo-8':
      return `MEMORANDUM OF UNDERSTANDING

THIS MEMORANDUM OF UNDERSTANDING (MOU) is made on this 10th day of November 2026

BETWEEN

M/s TechCorp India Pvt Ltd.
A company incorporated under the Companies Act, 2013
Having its registered office at Tower B, Cyber City, Gurugram, Haryana
(hereinafter referred to as "First Party")

AND

M/s Innovative Solutions LLP
A limited liability partnership registered at Gurugram, Haryana
(hereinafter referred to as "Second Party")

WHEREAS the First Party is engaged in software development and IT consulting services and the Second Party is engaged in providing marketing and business development services.

NOW THEREFORE, the parties agree as follows:

1. The First Party shall provide software development services to the Second Party on a project basis as per the specifications agreed upon in Annexure A attached herewith.

2. The Second Party shall provide marketing and business development services to the First Party to promote its software products in the Indian market.

3. The commercial terms shall be governed by the Master Services Agreement dated 01 Oct 2026 between the parties.

4. This MOU shall remain valid for a period of 2 (two) years from the date of execution and may be extended by mutual consent.

5. Either party may terminate this MOU by giving 30 days written notice to the other party.

IN WITNESS WHEREOF, the authorized representatives of both parties have executed this MOU.

Sd/-                                    Sd/-
For M/s TechCorp India Pvt Ltd            For M/s Innovative Solutions LLP
Name: Amit Sharma                           Name: Vikram Singh
Designation: CEO                           Designation: Managing Partner
Date: 10 Nov 2026                       Date: 10 Nov 2026`;

    case 'demo-9':
      return `PROMISSORY NOTE

PROMISSORY NOTE NO. PN-2026-456
DATE: 15 November 2026
PLACE: New Delhi

FOR VALUE RECEIVED, I/We hereby jointly and severally promise to pay to:

Shri Rajesh Kumar Gupta
R/o Flat 202, Saraswati Vihar, New Delhi-110092

or order, the sum of ₹2,00,000 (Rupees Two Lakhs Only) without any deduction, on or before 15 May 2027, with interest thereon at the rate of 12% per annum payable half-yearly.

This promissory note is issued by:

1. Shri Anil Kumar Verma
R/o H.No. 45, Sector 3, Rohini, Delhi-110085
Aadhar: 1234-5678-9012

2. Shri Suresh Kumar Verma
R/o H.No. 46, Sector 3, Rohini, Delhi-110085
Aadhar: 1234-5678-9013

The amount is repayable at New Delhi. This note is negotiable and transferable by endorsement and delivery.

This promissory note is issued under the Negotiable Instruments Act, 1881.

WITNESSES:
1. Shri Sunil Kumar, Advocate
2. Smt. Meena Devi, Social Worker

Sd/-                                    Sd/-
Anil Kumar Verma                        Suresh Kumar Verma`;

    case 'demo-10':
      return `POWER OF ATTORNEY

POWER OF ATTORNEY NO. POA-2026-789
DATE: 20 November 2026

KNOW ALL MEN BY THESE PRESENTS that I, Shri Vijay Kumar Sharma, S/o Late Shri Om Prakash Sharma, R/o Flat 305, Mayur Vihar Phase I, Delhi-110091, do hereby appoint, constitute and nominate:

Shri Rajendra Prasad Verma
R/o H.No. 78, Sector 4, Dwarka, New Delhi-110075

as my true and lawful Attorney to do all or any of the following acts on my behalf:

1. To sign, execute, and deliver all documents, agreements, deeds, and other papers necessary for the sale of my property bearing No. A-12, Sector 7, Dwarka, New Delhi.

2. To receive payments, issue receipts, and manage all financial transactions related to the said property.

3. To appear before any government authority, court, tribunal, or other body for matters related to the said property.

4. To file, prosecute, or defend any legal proceedings related to the said property.

5. To do all such acts and things as may be necessary for the effective execution of this Power of Attorney.

This Power of Attorney shall remain valid until revoked by me in writing or until the completion of the said transaction.

IN WITNESS WHEREOF, I have executed this Power of Attorney on this 20th day of November 2026.

Sd/-
Vijay Kumar Sharma
GRANTOR

WITNESSES:
1. Shri Sunil Kumar, Advocate
2. Smt. Meena Devi, Social Worker`;

    case 'demo-11':
      return `SETTLEMENT DEED

SETTLEMENT DEED NO. SD-2026-345
DATE: 25 November 2026
REGISTRAR: Sub-Registrar, New Delhi

THIS SETTLEMENT DEED is made on this 25th day of November 2026

BETWEEN

Shri Ramesh Chandra Gupta
R/o Flat 101, Sector 62, Noida, Uttar Pradesh
(hereinafter referred to as "Settlor")

AND

Smt. Savita Gupta
W/o Shri Ramesh Chandra Gupta
R/o Flat 101, Sector 62, Noida, Uttar Pradesh
(hereinafter referred to as "Settlee")

WHEREAS the Settlor is the absolute owner of the property described in Schedule A attached herewith.

WHEREAS the Settlor desires to settle the said property in favour of the Settlee as a gift.

NOW THIS DEED WITNESSETH as follows:

1. The Settlor hereby settles, transfers, and conveys absolutely the property described in Schedule A to the Settlee as a gift without any consideration.

2. The Settlee shall become the absolute owner of the said property from the date of execution of this deed.

3. The Settlor declares that the said property is free from all encumbrances, charges, and liabilities.

4. The Settlee accepts this settlement and agrees to pay all government dues, taxes, and charges on the said property from the date of transfer.

5. This deed is irrevocable and cannot be cancelled without mutual consent of both parties.

SCHEDULE A
Property: Flat No. 101, Building A, Sector 62, Noida, Uttar Pradesh
Area: 1200 sq. ft.
Plot No. A-45, Sector 62, Noida

IN WITNESS WHEREOF, the parties have executed this Settlement Deed.

Sd/-                                    Sd/-
Ramesh Chandra Gupta                      Savita Gupta
SETTLOR                                  SETTLEE

WITNESSES:
1. Shri Sunil Kumar, Advocate
2. Smt. Meena Devi, Social Worker`;

    case 'demo-12':
      return `NON-DISCLOSURE AGREEMENT

NON-DISCLOSURE AGREEMENT NO. NDA-2026-999
DATE: 30 November 2026

BETWEEN

M/s Innovation Labs Pvt Ltd.
A company incorporated under the Companies Act, 2013
Having its registered office at Tower C, Cyber City, Gurugram, Haryana
(hereinafter referred to as "Disclosing Party")

AND

Shri Amit Verma
R/o Flat 402, Tower B, Rohini Sector 16, New Delhi-110085
(hereinafter referred to as "Receiving Party")

WHEREAS the Disclosing Party is engaged in software development and possesses confidential information.

WHEREAS the Receiving Party may have access to such confidential information in the course of business.

NOW THEREFORE, the parties agree as follows:

1. "Confidential Information" means all technical data, business plans, source code, algorithms, customer lists, and any other information disclosed by the Disclosing Party.

2. The Receiving Party agrees to maintain the confidentiality of all Confidential Information and shall not disclose it to any third party without prior written consent.

3. The Receiving Party shall use the Confidential Information only for the purpose of performing services for the Disclosing Party.

4. This obligation of confidentiality shall continue for a period of 5 (five) years from the date of termination of this agreement.

5. The Receiving Party shall return or destroy all Confidential Information upon termination of this agreement.

6. This agreement shall be governed by the laws of India and any dispute shall be subject to the jurisdiction of courts in Delhi.

IN WITNESS WHEREOF, the parties have executed this NDA.

Sd/-                                    Sd/-
For M/s Innovation Labs Pvt Ltd            Amit Verma
Name: Rajesh Kumar                         Signature: ___________
Designation: CEO
Date: 30 Nov 2026                      Date: 30 Nov 2026`;

    case 'demo-13':
      return `FIRST INFORMATION REPORT

Case No. 789/2026
Police Station: Women's Cell, Rohini, Delhi
Date: 05 Dec 2026

Complainant: Smt. Meena Devi, W/o Shri Rajesh Kumar, R/o Flat 305, Mayur Vihar Phase I, Delhi-110091
Age: 28 years, Occupation: Homemaker
Mobile: +91-9876543211

Offence: Domestic violence and cruelty by husband and in-laws
Place: Matrimonial home, Flat 305, Mayur Vihar Phase I, Delhi
Time: Continuous since marriage in March 2025

Description:
The complainant alleges that she was married to Shri Rajesh Kumar on 15 March 2025. Since the marriage, her husband and in-laws have subjected her to continuous mental and physical cruelty. They demand dowry of ₹10 Lakhs which her family cannot afford. On 01 Dec 2026, the husband and mother-in-law physically assaulted her, beating her with a rod, and locked her in a room for 12 hours without food. She managed to escape and approached the Women's Cell. She has medical certificate from GTB Hospital showing injuries.

Particulars of accused:
1. Shri Rajesh Kumar, Husband, Age 32, Software Engineer
2. Smt. Kamla Devi, Mother-in-law, Age 58
3. Shri Sunil Kumar, Father-in-law, Age 62

Prayer:
It is prayed that an FIR be registered under appropriate sections of BNS 2023 (Sections 85, 86, 323, 324, 351) and DV Act 2005. Investigation be initiated to protect the complainant and take action against the accused.

Signature: _________________
Complainant
Date: 05 Dec 2026
Witness: Lady Constable #789`;

    case 'demo-14':
      return `AFFIDAVIT FOR NAME CHANGE

IN THE COURT OF SUB-DIVISIONAL MAGISTRATE, SOUTH EAST DELHI

CASE: Name Change Application
REGISTRAR: New Delhi

I, Smt. Priya Verma, D/o Late Shri Om Prakash Sharma, R/o Flat 101, Sector 62, Noida, Uttar Pradesh-201309, do hereby solemnly affirm and declare as follows:

1. That my name as per my educational records is "Priya Sharma" but I wish to change it to "Priya Verma" after marriage.

2. That I am commonly known as "Priya Verma" in my social and personal life since my marriage on 15 August 2025.

3. That the change of name is not for any fraudulent purpose or to deceive any person or authority.

4. That I have published a name change advertisement in two newspapers (Hindustan Times and Navbharat Times) on 01 Nov 2026 as required by law.

5. That I request this Hon'ble Court to issue a certificate allowing me to change my name from "Priya Sharma" to "Priya Verma" in all official records including Aadhar, PAN, Passport, and educational certificates.

6. I undertake to inform all concerned authorities about this name change and submit the court certificate wherever required.

DEPONENT
VERIFICATION
Verified at New Delhi on this 5th day of December 2026 that the contents of this affidavit are true to my knowledge.

(Sd/-) Priya Verma
DEPONENT`;

    case 'demo-15':
      return `HIGH COURT OF DELHI AT NEW DELHI

ANTICIPATORY BAIL APPLICATION No. AB-2026-567

IN THE MATTER OF:
Shri Vikram Singh ... Petitioner
Vs.
State of NCT of Delhi ... Respondent

ORDER PASSED ON: 10 Dec 2026

HEARD on 08 Dec 2026.

Facts:
The petitioner is accused in FIR No. 234/2026 registered at Police Station Connaught Place under Sections 318(4) and 324 of BNS 2023. The allegations relate to a financial dispute between the petitioner and complainant which arose from a business transaction. The petitioner is a law-abiding citizen with no criminal antecedents. He is a practicing Chartered Accountant since 2015 and is a registered member of ICAI.

Issue:
Whether the petitioner is entitled to anticipatory bail in view of the nature of allegations and his antecedents.

Held:
Considering the nature of allegations which are primarily of financial nature and the fact that the petitioner has deep roots in society (residing at current address for 10 years), this Court is inclined to grant anticipatory bail subject to conditions.

CONDITIONS:
1. The petitioner shall cooperate with the investigation and appear before the investigating officer as and when called.
2. The petitioner shall not tamper with evidence or influence witnesses.
3. The petitioner shall not leave the jurisdiction of this Court without prior permission.
4. The petitioner shall furnish a personal bond of ₹50,000 with one surety of like amount.

Anticipatory bail is granted to the petitioner for a period of 30 days from today or till filing of charge sheet, whichever is earlier.

Let copies of this order be supplied to the parties.

(Sd/-) Hon'ble Justice ABC
JUDGE, HIGH COURT OF DELHI
DATED: 10 Dec 2026`;

    case 'demo-16':
      return `LEGAL NOTICE

REGISTRATION NO. LN-2026-888
DATE: 12 Dec 2026

FROM:
Adv. Ramesh Gupta
Chamber No. 456, District Court Complex, Patiala House, New Delhi-110001

TO:
Shri Suresh Kumar
R/o H.No. 123, Lane 5, Karol Bagh, New Delhi-110005

SUBJECT: HANDOVER OF RENTED PREMISES

Dear Sir,

Under instruction and authority of my client, Smt. Savita Gupta, R/o Flat 101, Sector 62, Noida, I hereby serve upon you this legal notice as follows:

1. My client is the owner of Flat No. 101, Building A, Sector 62, Noida which was rented to you on 01 January 2025 under a lease agreement for a period of 11 months ending on 31 December 2025.

2. The rent agreement expired on 31 December 2025 and you were served a notice dated 15 November 2025 requesting you to vacate the premises on or before 31 December 2025.

3. Despite the expiry of the agreement and the notice, you have failed to vacate the premises and are continuing to occupy the same illegally without paying rent since January 2026.

4. The current outstanding rent for the period January 2026 to December 2026 amounts to ₹2,16,000 (Rupees Two Lakhs Sixteen Thousand Only) at the rate of ₹18,000 per month.

5. I hereby call upon you to:
   a) Vacate the premises within 15 days from receipt of this notice
   b) Pay the outstanding rent of ₹2,16,000 within 15 days
   c) Hand over possession of the premises in good condition

6. Failing compliance, my client shall be constrained to initiate eviction proceedings under applicable laws and also file a suit for recovery of rent and damages.

This notice is without prejudice to any other legal rights and remedies available to my client.

Sincerely,
(Sd/-)
Adv. Ramesh Gupta
Legal Counsel`;

    default:
      return 'Demo document content';
  }
};

// ── Demo seed: shown on first launch so the library isn't empty (16 professional documents) ──────────────
const DEMO_SEED: UserDocument[] = [
  {
    id: 'demo-1',
    name: 'FIR_Case_2026_Delhi_Police.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 214032,
    category: 'FIR',
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Case No. 456/2026 — Theft at Connaught Place',
  },
  {
    id: 'demo-2',
    name: 'Bail_Application_Affidavit.docx',
    uri: '',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 87440,
    category: 'Affidavit',
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Session Court, Saket — bail hearing 22 Oct 2026',
  },
  {
    id: 'demo-3',
    name: 'High_Court_Stay_Order_Oct2026.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 512000,
    category: 'Court Order',
    addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Delhi HC — W.P. (Crl.) 881/2026, stay on demolition',
  },
  {
    id: 'demo-4',
    name: 'Rent_Agreement_Noida_Nov2026.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 128000,
    category: 'Agreement',
    addedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Residential rent, ₹18,000/month, 11 months',
  },
  {
    id: 'demo-5',
    name: 'ChargeSheet_Theft_ConnaughtPlace.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 156000,
    category: 'Charge Sheet',
    addedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'FIR 456/2026 — Sections 303(2), 304, 318(4) BNS',
  },
  {
    id: 'demo-6',
    name: 'LegalNotice_LoanRecovery_Meerut.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 98000,
    category: 'Legal Notice',
    addedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Loan ₹5L — Outstanding ₹3.12L with interest',
  },
  {
    id: 'demo-7',
    name: 'CivilSuit_SpecificPerformance_Delhi.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 142000,
    category: 'Court Order',
    addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'CS 456/2026 — Sale deed execution for flat in Dwarka',
  },
  {
    id: 'demo-8',
    name: 'MOU_TechCorp_InnovativeSolutions.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 178000,
    category: 'Agreement',
    addedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Business partnership MOU — 2 years validity',
  },
  {
    id: 'demo-9',
    name: 'PromissoryNote_Loan_Delhi.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 95000,
    category: 'Other',
    addedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '₹2L loan at 12% interest — Due May 2027',
  },
  {
    id: 'demo-10',
    name: 'PowerOfAttorney_PropertySale.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 135000,
    category: 'Other',
    addedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Property sale POA — Dwarka flat A-12',
  },
  {
    id: 'demo-11',
    name: 'SettlementDeed_Gift_Noida.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 168000,
    category: 'Agreement',
    addedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Gift settlement — Flat 101, Sector 62, Noida',
  },
  {
    id: 'demo-12',
    name: 'NonDisclosureAgreement_InnovationLabs.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 112000,
    category: 'Agreement',
    addedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'NDA — 5-year confidentiality obligation',
  },
  {
    id: 'demo-13',
    name: 'FIR_DomesticViolence_WomenCell.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 198000,
    category: 'FIR',
    addedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Case 789/2026 — DV Act, BNS 85, 86, 323, 324',
  },
  {
    id: 'demo-14',
    name: 'Affidavit_NameChange_Court.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 89000,
    category: 'Affidavit',
    addedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Name change from Priya Sharma to Priya Verma',
  },
  {
    id: 'demo-15',
    name: 'HighCourt_AnticipatoryBail_Dec2026.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 145000,
    category: 'Court Order',
    addedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'AB 567/2026 — FIR 234/2026, ₹50K bond',
  },
  {
    id: 'demo-16',
    name: 'LegalNotice_Eviction_RentArrears.pdf',
    uri: '',
    mimeType: 'application/pdf',
    size: 95000,
    category: 'Legal Notice',
    addedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Rent arrears ₹2.16L — Eviction notice',
  },
];

type DocCategory = 'All' | 'FIR' | 'Affidavit' | 'Court Order' | 'Agreement' | 'Other' | 'Charge Sheet' | 'Legal Notice';

interface UserDocument {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  size: number;
  category: DocCategory;
  addedAt: string;
  notes: string;
}

const CATEGORIES: DocCategory[] = ['All', 'FIR', 'Affidavit', 'Court Order', 'Agreement', 'Other', 'Charge Sheet', 'Legal Notice'];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const OriginalDocuments: React.FC = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<UserDocument[]>([]);
  const [activeCategory, setActiveCategory] = useState<DocCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<UserDocument | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editCategory, setEditCategory] = useState<DocCategory>('Other');
  const [showTagModal, setShowTagModal] = useState(false);

  // Load saved documents from AsyncStorage on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Apply search + category filter whenever inputs change
  useEffect(() => {
    let results = documents;
    if (activeCategory !== 'All') {
      results = results.filter((d) => d.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.notes.toLowerCase().includes(q)
      );
    }
    setFilteredDocs(results);
  }, [documents, activeCategory, searchQuery]);

  const loadDocuments = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Re-seed with updated 16 documents for demo
        setDocuments(DEMO_SEED);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SEED));
      } else {
        // First launch — seed with demo documents
        setDocuments(DEMO_SEED);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SEED));
      }
    } catch {
      setDocuments(DEMO_SEED);
    }
  };

  const persistDocuments = async (docs: UserDocument[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  };

  // ── Upload Handler ─────────────────────────────────────────────────────────
  const handlePickDocument = async () => {
    if (Platform.OS === 'web') {
      // Web: use native <input type="file"> picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        const newDoc: UserDocument = {
          id: Date.now().toString(),
          name: file.name,
          uri: URL.createObjectURL(file),
          mimeType: file.type,
          size: file.size,
          category: 'Other',
          addedAt: new Date().toISOString(),
          notes: '',
        };
        const updated = [newDoc, ...documents];
        setDocuments(updated);
        await persistDocuments(updated);
        Alert.alert('Document Added', `"${file.name}" has been added to your library.`);
      };
      input.click();
      return;
    }

    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];

      // Copy to permanent app storage directory (so it persists after cache clear)
      const destDir = `${FileSystem.documentDirectory}lawai_docs/`;
      const dirInfo = await FileSystem.getInfoAsync(destDir);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });

      const destUri = `${destDir}${Date.now()}_${asset.name}`;
      await FileSystem.copyAsync({ from: asset.uri, to: destUri });

      const newDoc: UserDocument = {
        id: Date.now().toString(),
        name: asset.name,
        uri: destUri,
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size ?? 0,
        category: 'Other',
        addedAt: new Date().toISOString(),
        notes: '',
      };

      const updated = [newDoc, ...documents];
      setDocuments(updated);
      await persistDocuments(updated);
      Alert.alert('Document Uploaded', `"${asset.name}" has been saved to your local library.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Open Document (view in new tab/window) ───────────────────────────────────
  const handleOpen = async (doc: UserDocument) => {
    // For demo docs without real URI, generate content on-the-fly
    if (!doc.uri || doc.uri === '') {
      const content = generateDemoContent(doc.id);
      
      if (Platform.OS === 'web') {
        // Web: create blob and open in new tab
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        return;
      } else {
        // Native: create temp file and open/sharing
        const tempUri = `${FileSystem.documentDirectory}${doc.name}`;
        await FileSystem.writeAsStringAsync(tempUri, content);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Open Document',
          });
        } else {
          Alert.alert('Error', 'Cannot open document on this device.');
        }
        return;
      }
    }

    // For user-uploaded docs with real URI
    if (Platform.OS === 'web') {
      window.open(doc.uri, '_blank');
    } else if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(doc.uri, {
        dialogTitle: 'Open Document',
      });
    } else {
      Alert.alert('Error', 'Cannot open document on this device.');
    }
  };

  // ── Share Document (share with other apps) ───────────────────────────────────
  const handleShare = async (doc: UserDocument) => {
    // For demo docs without real URI, generate content on-the-fly
    if (!doc.uri || doc.uri === '') {
      const content = generateDemoContent(doc.id);
      
      if (Platform.OS === 'web') {
        // Web: create blob and download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Document Downloaded', `${doc.name} has been downloaded.`);
        return;
      } else {
        // Native: create temp file and share
        const tempUri = `${FileSystem.documentDirectory}${doc.name}`;
        await FileSystem.writeAsStringAsync(tempUri, content);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Share Document',
          });
        } else {
          Alert.alert('Sharing not available on this device.');
        }
        return;
      }
    }

    // For user-uploaded docs with real URI
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = doc.uri;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Alert.alert('Document Downloaded', `${doc.name} has been downloaded.`);
    } else if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(doc.uri, {
        dialogTitle: 'Share Document',
      });
    } else {
      Alert.alert('Sharing not available on this device.');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = (doc: UserDocument) => {
    if (Platform.OS === 'web') {
      // Web: use browser confirm dialog
      if (window.confirm(`Are you sure you want to remove "${doc.name}" from your library?`)) {
        performDelete(doc);
      }
    } else {
      // Native: use Alert.alert
      Alert.alert(
        'Remove Document',
        `Are you sure you want to remove "${doc.name}" from your library?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => performDelete(doc),
          },
        ]
      );
    }
  };

  const performDelete = async (doc: UserDocument) => {
    try {
      // Delete local file (native only)
      if (Platform.OS !== 'web' && doc.uri) {
        try { await FileSystem.deleteAsync(doc.uri, { idempotent: true }); } catch {}
      }
      const updated = documents.filter((d) => d.id !== doc.id);
      setDocuments(updated);
      await persistDocuments(updated);
      Alert.alert('Document Removed', `"${doc.name}" has been removed from your library.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove document. Please try again.');
    }
  };

  // ── Tag / Category Edit ────────────────────────────────────────────────────
  const openTagModal = (doc: UserDocument) => {
    setSelectedDoc(doc);
    setEditNotes(doc.notes);
    setEditCategory(doc.category);
    setShowTagModal(true);
  };

  const saveTags = async () => {
    if (!selectedDoc) return;
    const updated = documents.map((d) =>
      d.id === selectedDoc.id ? { ...d, category: editCategory, notes: editNotes } : d
    );
    setDocuments(updated);
    await persistDocuments(updated);
    setShowTagModal(false);
  };

  const getMimeIcon = (mimeType: string): any => {
    if (mimeType.includes('pdf')) return 'document-text';
    if (mimeType.includes('word') || mimeType.includes('docx')) return 'document';
    if (mimeType.includes('image')) return 'image';
    return 'attach';
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: theme.background }]}>
      <OfficialNavbar />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
              onPress={() => (navigation as any).navigate('Utilities')}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back-outline" size={18} color={isDark ? '#60A5FA' : COLORS.navyGov} />
              <Text style={[styles.backBtnText, { color: isDark ? '#60A5FA' : COLORS.navyGov }]}>Back to Tools</Text>
            </TouchableOpacity>

            <View style={[styles.badge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
              <Text style={styles.badgeText}>PERSONAL DOCUMENT VAULT</Text>
            </View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Legal Document Library</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Save and organise your personal legal documents: agreements, notices, court papers you received, complaint copies, and ID documents — stored securely on your device.
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          {/* Upload Button */}
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={handlePickDocument}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={22} color={COLORS.white} />
            )}
            <Text style={styles.uploadBtnText}>
              {isLoading ? 'Uploading...' : 'Upload Legal Document'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.uploadHint, { color: theme.textMuted }]}>PDF, DOCX, TXT, JPG/PNG • Stored locally on your device</Text>

          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
            <Ionicons name="search-outline" size={17} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search documents by name or category..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={17} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {CATEGORIES.map((cat) => {
              const displayLabel = cat === 'FIR' ? 'Complaints / FIR'
                : cat === 'Court Order' ? 'Court Papers'
                : cat === 'Legal Notice' ? 'Notices'
                : cat === 'Agreement' ? 'Agreements'
                : cat === 'Affidavit' ? 'Affidavits'
                : cat === 'Charge Sheet' ? 'Official Papers'
                : cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    activeCategory === cat && styles.chipActive,
                  ]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: theme.textSecondary }, activeCategory === cat && styles.chipTextActive]}>
                    {displayLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.resultsLabel, { color: theme.textMuted }]}>
            {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'}
          </Text>

          {/* Document List */}
          {filteredDocs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Documents Yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Tap "Upload Legal Document" to add your first file.
              </Text>
            </View>
          ) : (
            filteredDocs.map((doc) => (
              <View key={doc.id} style={[styles.docCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={styles.docRow}>
                  <View style={[styles.docIconBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <Ionicons name={getMimeIcon(doc.mimeType)} size={24} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                  </View>
                  <View style={styles.docMeta}>
                    <Text style={[styles.docName, { color: theme.textPrimary }]} numberOfLines={2}>{doc.name}</Text>
                    <View style={styles.docDetails}>
                      <View style={styles.categoryPill}>
                        <Text style={styles.categoryPillText}>{doc.category}</Text>
                      </View>
                      <Text style={[styles.docSize, { color: theme.textMuted }]}>{formatBytes(doc.size)}</Text>
                      <Text style={[styles.docTime, { color: theme.textMuted }]}>{timeAgo(doc.addedAt)}</Text>
                    </View>
                    {doc.notes ? (
                      <Text style={[styles.docNotes, { color: theme.textSecondary }]} numberOfLines={1}>{doc.notes}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.docActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                    onPress={() => handleOpen(doc)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="eye-outline" size={17} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                    <Text style={[styles.actionBtnText, isDark && { color: '#60A5FA' }]}>Open</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                    onPress={() => handleShare(doc)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-outline" size={17} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                    <Text style={[styles.actionBtnText, isDark && { color: '#60A5FA' }]}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                    onPress={() => openTagModal(doc)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pricetag-outline" size={17} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                    <Text style={[styles.actionBtnText, isDark && { color: '#60A5FA' }]}>Tag</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDanger]}
                    onPress={() => handleDelete(doc)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={17} color={COLORS.statusAlert} />
                    <Text style={[styles.actionBtnText, { color: COLORS.statusAlert }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <Footer />
      </ScrollView>

      {/* Tag / Category Modal — uses proper Modal so it works on web + native */}
      <Modal
        visible={showTagModal && !!selectedDoc}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTagModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Edit Document Tags</Text>
            {selectedDoc && (
              <Text style={[styles.modalDocName, { color: theme.textMuted }]} numberOfLines={1}>
                {selectedDoc.name}
              </Text>
            )}

            <Text style={[styles.modalLabel, { color: theme.textMuted }]}>CATEGORY</Text>
            <View style={styles.modalChipsRow}>
              {(CATEGORIES.filter((c) => c !== 'All') as DocCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    editCategory === cat && styles.chipActive,
                  ]}
                  onPress={() => setEditCategory(cat)}
                >
                  <Text style={[styles.chipText, { color: theme.textSecondary }, editCategory === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: theme.textMuted }]}>NOTES</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="Add a short note (e.g. Case No. 12345/2026)"
              placeholderTextColor={theme.textMuted}
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancel, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                onPress={() => setShowTagModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveTags}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: COLORS.surfaceLight },
  container: { flex: 1 },
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: { maxWidth: 960, width: '100%' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backBtnText: { fontSize: 13, fontWeight: '600' },
  badge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: COLORS.accentGoldDark, letterSpacing: 0.6 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.navyDark, marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21 },
  contentWrapper: { maxWidth: 960, width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 24 },

  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    marginBottom: 6,
  },
  uploadBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  uploadHint: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    ...SHADOWS.subtle,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.navyDark, outlineStyle: 'none' } as any,
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.navyGov, borderColor: COLORS.navyMuted },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  resultsLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },

  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  docRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docMeta: { flex: 1 },
  docName: { fontSize: 15, fontWeight: '700', color: COLORS.navyDark, marginBottom: 6 },
  docDetails: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  categoryPill: {
    backgroundColor: COLORS.accentGoldLight,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryPillText: { fontSize: 11, fontWeight: '700', color: COLORS.accentGoldDark },
  docSize: { fontSize: 12, color: COLORS.textMuted },
  docTime: { fontSize: 12, color: COLORS.textMuted },
  docNotes: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, fontStyle: 'italic' },

  docActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnDanger: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.navyGov },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navyDark },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    borderRadius: RADIUS.lg,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    ...SHADOWS.elevated,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.navyDark, marginBottom: 4 },
  modalDocName: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.6, marginBottom: 8 },
  modalChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 14,
    color: COLORS.navyDark,
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  modalSave: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: RADIUS.md, backgroundColor: COLORS.navyGov },
  modalSaveText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

export default OriginalDocuments;
