import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { COLORS, RADIUS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// Import components
import {
  FIRHeader,
  DownloadSection,
  FIRDetailsCard,
  OffenceDetailsCard,
  ComplainantDetailsCard,
  FormButton,
  FIRAutoFillPreviewModal,
  FIREvidenceCard,
  FIRDraftsModal,
  loadAllDrafts,
  saveDraftRecord,
  getLastActiveDraft,
  generateNewDraftId,
  setActiveDraftId,
} from '../components/FIR';
import type { FIRExhibitItem, FIRDraftRecord, FIRDraftVersion } from '../components/FIR';
import { generateFallbackCoPilot } from '../components/DraftingCoPilot';

const FormToPDF = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [autoFillVisible, setAutoFillVisible] = useState(false);

  // Draft & Versioning State
  const [currentDraftId, setCurrentDraftId] = useState<string>(() => generateNewDraftId());
  const [draftsList, setDraftsList] = useState<FIRDraftRecord[]>([]);
  const [draftsModalVisible, setDraftsModalVisible] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const dirtyRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [resumeBannerVisible, setResumeBannerVisible] = useState(false);
  const [lastActiveDraft, setLastActiveDraft] = useState<FIRDraftRecord | null>(null);

  const [exhibits, setExhibits] = useState<FIRExhibitItem[]>([]);
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    policeStation: '',
    year: '',
    firNo: '',
    date: '',
    act1: '',
    sections1: '',
    act2: '',
    sections2: '',
    act3: '',
    sections3: '',
    otherActs: '',
    offenceDay: '',
    offenceDate: '',
    offenceTime: '',
    infoReceivedDate: '',
    infoReceivedTime: '',
    generalDiaryRef: '',
    typeOfInfo: '',
    occurrenceDirection: '',
    beatNo: '',
    address: '',
    outsidePS: '',
    complainantName: '',
    fatherName: '',
    birthDate: '',
    nationality: '',
    passportNo: '',
    passportIssueDate: '',
    passportIssuePlace: '',
    occupation: '',
    complainantAddress: '',
    accusedDetails: '',
    delayReason: '',
    stolenProperties: '',
    stolenValue: '',
    inquestReportNo: '',
    actionTaken: '',
    officerName: '',
    officerRank: '',
    officerNo: '',
    signature: '',
    dispatchDate: '',
    dispatchTime: '',
    narrative: '',
  });

  // Undo snapshot for auto-fill
  const previousFormDataRef = useRef<Record<string, string> | null>(null);
  const [canUndoAutoFill, setCanUndoAutoFill] = useState(false);

  // Handle field changes
  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    dirtyRef.current = true;
    setIsDirty(true);
  };

  const handleExhibitsChange = (updated: FIRExhibitItem[]) => {
    setExhibits(updated);
    dirtyRef.current = true;
    setIsDirty(true);
  };

  // Auto-fill: merge extracted fields with Undo support
  const handleAutoFillApply = (extracted: Record<string, string>) => {
    previousFormDataRef.current = { ...formData }; // snapshot for undo
    setCanUndoAutoFill(true);
    setFormData((prev) => ({ ...prev, ...extracted }));
    dirtyRef.current = true;
    setIsDirty(true);
  };

  const handleUndoAutoFill = () => {
    if (previousFormDataRef.current) {
      setFormData(previousFormDataRef.current as any);
      previousFormDataRef.current = null;
      setCanUndoAutoFill(false);
      dirtyRef.current = true;
      setIsDirty(true);
    }
  };

  // Initial load: check for drafts and last active draft
  useEffect(() => {
    const init = async () => {
      const all = await loadAllDrafts();
      setDraftsList(all);
      const last = await getLastActiveDraft();
      if (last && last.formData && Object.values(last.formData).some((v) => v && v.trim())) {
        setLastActiveDraft(last);
        setResumeBannerVisible(true);
      }
    };
    init();
  }, []);

  // Debounced auto-save effect
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        dirtyRef.current = false;
        const saved = await saveDraftRecord(
          {
            id: currentDraftId,
            formData,
            exhibits,
          },
          'Auto-saved'
        );
        setLastSavedTime(saved.formattedUpdatedAt);
        if (!dirtyRef.current) {
          setIsDirty(false);
        }
        loadAllDrafts().then(setDraftsList);
      } catch (err) {
        console.error('Auto-save error:', err);
      } finally {
        setIsSaving(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [formData, exhibits, isDirty, currentDraftId]);

  // Manual save draft
  const handleManualSaveDraft = async () => {
    setIsSaving(true);
    try {
      const saved = await saveDraftRecord(
        {
          id: currentDraftId,
          formData,
          exhibits,
        },
        'Manual Checkpoint'
      );
      setLastSavedTime(saved.formattedUpdatedAt);
      setIsDirty(false);
      const all = await loadAllDrafts();
      setDraftsList(all);
      Alert.alert('Draft Saved', `"${saved.title}" saved successfully to offline storage.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  // Resume a draft
  const handleResumeDraft = (draft: FIRDraftRecord) => {
    setCurrentDraftId(draft.id);
    setFormData(draft.formData as any);
    setExhibits(draft.exhibits ? [...draft.exhibits] : []);
    setIsDirty(false);
    setLastSavedTime(draft.formattedUpdatedAt);
    setResumeBannerVisible(false);
    setActiveDraftId(draft.id);
  };

  // Rollback to version snapshot
  const handleRollbackVersion = async (draft: FIRDraftRecord, version: FIRDraftVersion) => {
    setCurrentDraftId(draft.id);
    setFormData(version.formData as any);
    setExhibits(version.exhibits ? [...version.exhibits] : []);
    setIsDirty(false);
    setLastSavedTime(version.formattedTime);
    setResumeBannerVisible(false);
    await saveDraftRecord(
      {
        id: draft.id,
        formData: version.formData,
        exhibits: version.exhibits,
      },
      `Rolled back to ${version.label}`
    );
    const all = await loadAllDrafts();
    setDraftsList(all);
  };

  // Start fresh draft
  const handleStartNewDraft = () => {
    const newId = generateNewDraftId();
    setCurrentDraftId(newId);
    resetFormToDefaults();
  };

  // Reset form to default empty state
  const resetFormToDefaults = () => {
    setFormData({
      state: '',
      district: '',
      policeStation: '',
      year: '',
      firNo: '',
      date: '',
      act1: '',
      sections1: '',
      act2: '',
      sections2: '',
      act3: '',
      sections3: '',
      otherActs: '',
      offenceDay: '',
      offenceDate: '',
      offenceTime: '',
      infoReceivedDate: '',
      infoReceivedTime: '',
      generalDiaryRef: '',
      typeOfInfo: '',
      occurrenceDirection: '',
      beatNo: '',
      address: '',
      outsidePS: '',
      complainantName: '',
      fatherName: '',
      birthDate: '',
      nationality: '',
      passportNo: '',
      passportIssueDate: '',
      passportIssuePlace: '',
      occupation: '',
      complainantAddress: '',
      accusedDetails: '',
      delayReason: '',
      stolenProperties: '',
      stolenValue: '',
      inquestReportNo: '',
      actionTaken: '',
      officerName: '',
      officerRank: '',
      officerNo: '',
      signature: '',
      dispatchDate: '',
      dispatchTime: '',
      narrative: '',
    });
    setExhibits([]);
    setIsDirty(false);
    setLastSavedTime(null);
    setResumeBannerVisible(false);
  };

  // Handle when a draft is deleted (if it was the active one)
  const handleDraftDeleted = (deletedId: string) => {
    if (deletedId === currentDraftId) {
      // Reset form to empty state
      resetFormToDefaults();
      // Generate a new draft ID
      const newId = generateNewDraftId();
      setCurrentDraftId(newId);
      // Save the new active draft ID to AsyncStorage
      setActiveDraftId(newId);
    }
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = ['state', 'district', 'policeStation', 'firNo', 'complainantName', 'address'];
    const fieldLabels: Record<string, string> = {
      state: 'State / UT',
      district: 'District',
      policeStation: 'Police Station',
      firNo: 'FIR Number',
      complainantName: 'Complainant Name',
      address: 'Place of Occurrence',
    };
    for (const field of requiredFields) {
      if (!(formData as Record<string, string>)[field]?.trim()) {
        Alert.alert('Validation Error', `Please fill in the ${fieldLabels[field] || field} field.`);
        return false;
      }
    }
    return true;
  };
  const downloadDocx = async () => {
    setIsDownloading(true);

    try {
      // Generate a simple placeholder PDF with FIR format instructions
      const pdfContent = `
OFFICIAL FIR FORMAT
==================

This document contains the official format for First Information Report (FIR) as per Indian law.

For the complete official FIR format, please refer to:
- Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023
- Your State Police Department guidelines

This is a placeholder document for reference purposes only.

Generated by LegalBridge-AI
      `.trim();

      if (Platform.OS === 'web') {
        // On web, create a downloadable text file (PDF placeholder)
        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Official_FIR_Format.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert(
          'Download Complete',
          'Official FIR format document has been downloaded.',
          [{ text: 'OK' }]
        );
      } else {
        // On mobile, save as text file and share
        const fileUri = FileSystem.documentDirectory + 'Official_FIR_Format.txt';
        await FileSystem.writeAsStringAsync(fileUri, pdfContent);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Save FIR Format',
          });
        } else {
          Alert.alert(
            'Download Complete',
            'The FIR format has been saved to your device documents.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error downloading the file:', error);
      Alert.alert(
        'Download Failed',
        'There was an issue downloading the FIR format. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper to sanitize HTML strings
  const escapeHtml = (str: string = ''): string => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Generate Court-Ready BNSS-Compliant FIR PDF
  const generatePDF = async () => {
    if (!validateForm()) return;

    setIsGeneratingPDF(true);

    // 1. Run Co-Pilot engine to extract recommended BNS / IPC sections and offence classification
    const coPilotResult = generateFallbackCoPilot(formData.narrative || '', 'fir');
    const recommendedSections = coPilotResult.detailedSections || [];
    const detectedOffence = coPilotResult.detectedOffenceType || 'Cognizable Criminal Offence';

    // 2. Format primary sections
    const primaryAct = formData.act1?.trim() || 'Bharatiya Nyaya Sanhita, 2023 (BNS)';
    const primarySection = formData.sections1?.trim() || (recommendedSections.length > 0 ? recommendedSections[0].section : 'Section 173 BNSS');

    // 3. Generate QR Code and Document Reference
    const firDocRef = `${formData.district.toUpperCase().slice(0, 4)}/PS-${formData.policeStation.toUpperCase().slice(0, 4)}/${formData.year || new Date().getFullYear()}/FIR-${formData.firNo}`;
    const generatedTimestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // 4. Construct Court-Ready Official Form IF-1 HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>FIRST INFORMATION REPORT - FORM IF1 (BNSS Sec 173)</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 18px 24px;
            font-size: 11pt;
            line-height: 1.45;
          }
          .official-frame {
            border: 2px solid #0f172a;
            padding: 16px 20px;
            background: #ffffff;
            position: relative;
          }
          .inner-border {
            border: 1px solid #334155;
            padding: 14px 18px;
          }
          .crest-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .crest-center {
            text-align: center;
            flex: 1;
            padding: 0 10px;
          }
          .crest-state {
            font-size: 13pt;
            font-weight: 800;
            letter-spacing: 1.5px;
            color: #0f172a;
            text-transform: uppercase;
            margin: 0 0 2px 0;
          }
          .crest-dept {
            font-size: 9pt;
            font-weight: 700;
            letter-spacing: 1px;
            color: #1e3a8a;
            text-transform: uppercase;
            margin: 0 0 4px 0;
          }
          .doc-title-main {
            font-size: 15pt;
            font-weight: 900;
            letter-spacing: 1px;
            color: #0f172a;
            margin: 4px 0 2px 0;
            text-transform: uppercase;
          }
          .doc-sub-form {
            font-size: 9.5pt;
            font-weight: 700;
            color: #334155;
            margin: 0 0 4px 0;
          }
          .statutory-badge {
            display: inline-block;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 8.5pt;
            font-weight: 700;
            color: #1e3a8a;
            margin-top: 3px;
          }
          .qr-box {
            text-align: center;
            border: 1px solid #cbd5e1;
            padding: 6px;
            background: #f8fafc;
            border-radius: 4px;
            min-width: 95px;
          }
          .qr-caption {
            font-size: 6.5pt;
            font-weight: 700;
            color: #475569;
            margin-top: 3px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .ref-box {
            min-width: 120px;
            text-align: right;
            font-size: 8pt;
            color: #475569;
          }
          .ref-badge {
            background: #1e3a8a;
            color: #ffffff;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 7.5pt;
            display: inline-block;
            margin-bottom: 4px;
          }
          .clause-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 9.5pt;
          }
          .clause-table th, .clause-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
            vertical-align: top;
          }
          .clause-table th {
            background: #f1f5f9;
            font-weight: 700;
            color: #0f172a;
            text-align: left;
            width: 32%;
          }
          .clause-table td {
            color: #1e293b;
          }
          .sub-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            font-size: 9pt;
          }
          .sub-table th {
            background: #e2e8f0;
            color: #0f172a;
            padding: 4px 6px;
            border: 1px solid #94a3b8;
            font-size: 8pt;
            text-transform: uppercase;
          }
          .sub-table td {
            border: 1px solid #cbd5e1;
            padding: 4px 6px;
            font-size: 8.5pt;
          }
          .sec-pill {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            border: 1px solid #bfdbfe;
            font-weight: 700;
            font-size: 8pt;
            padding: 1px 6px;
            border-radius: 3px;
            margin-right: 4px;
          }
          .conf-badge {
            display: inline-block;
            background: #dcfce7;
            color: #15803d;
            font-weight: 700;
            font-size: 7.5pt;
            padding: 1px 5px;
            border-radius: 3px;
          }
          .narrative-box {
            background: #f8fafc;
            border: 1px solid #94a3b8;
            padding: 10px 12px;
            border-radius: 4px;
            font-size: 9pt;
            line-height: 1.55;
            color: #0f172a;
            text-align: justify;
            min-height: 80px;
          }
          .action-taken-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 8px 10px;
            font-size: 8.5pt;
            color: #166534;
            margin-top: 6px;
            border-radius: 3px;
          }
          .sig-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #94a3b8;
          }
          .sig-box {
            width: 45%;
            text-align: center;
          }
          .sig-line {
            border-top: 1px dashed #475569;
            margin-bottom: 4px;
          }
          .sig-title {
            font-size: 8.5pt;
            font-weight: 700;
            color: #0f172a;
          }
          .sig-sub {
            font-size: 7.5pt;
            color: #475569;
          }
          .official-seal {
            border: 2px dashed #1e3a8a;
            color: #1e3a8a;
            font-size: 7.5pt;
            font-weight: 800;
            padding: 6px 12px;
            border-radius: 6px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
          }
          .footer-note {
            margin-top: 14px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 7pt;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="official-frame">
          <div class="inner-border">
            
            <!-- OFFICIAL HEADER -->
            <div class="crest-row">
              <div class="ref-box">
                <span class="ref-badge">CCTNS / e-FIR</span><br/>
                <strong>Ref No:</strong><br/>
                ${escapeHtml(firDocRef)}<br/>
                <span style="font-size:7pt; color:#64748b;">Gen: ${escapeHtml(generatedTimestamp)}</span>
              </div>
              
              <div class="crest-center">
                <div class="crest-state">State Police Department</div>
                <div class="crest-dept">Government of India • Ministry of Home Affairs</div>
                <div class="doc-title-main">First Information Report</div>
                <div class="doc-sub-form">FORM – IF1 (Integrated Form I)</div>
                <div class="statutory-badge">
                  Recorded Under Section 173 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)
                  <br/>
                  <span style="font-size:7.5pt; font-weight:normal; color:#475569;">[Erstwhile Section 154, Code of Criminal Procedure, 1973 (Cr.P.C.)]</span>
                </div>
              </div>

              <div class="qr-box">
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="#ffffff" rx="4"/>
                  <rect x="6" y="6" width="28" height="28" fill="#0f172a" rx="2"/>
                  <rect x="12" y="12" width="16" height="16" fill="#ffffff"/>
                  <rect x="16" y="16" width="8" height="8" fill="#1e3a8a"/>
                  <rect x="66" y="6" width="28" height="28" fill="#0f172a" rx="2"/>
                  <rect x="72" y="12" width="16" height="16" fill="#ffffff"/>
                  <rect x="76" y="16" width="8" height="8" fill="#1e3a8a"/>
                  <rect x="6" y="66" width="28" height="28" fill="#0f172a" rx="2"/>
                  <rect x="12" y="72" width="16" height="16" fill="#ffffff"/>
                  <rect x="16" y="76" width="8" height="8" fill="#1e3a8a"/>
                  <rect x="42" y="10" width="6" height="16" fill="#0f172a"/>
                  <rect x="52" y="14" width="8" height="6" fill="#0f172a"/>
                  <rect x="42" y="32" width="16" height="6" fill="#1e3a8a"/>
                  <rect x="10" y="42" width="14" height="6" fill="#0f172a"/>
                  <rect x="30" y="42" width="10" height="8" fill="#0f172a"/>
                  <rect x="46" y="44" width="8" height="8" fill="#1e3a8a"/>
                  <rect x="58" y="40" width="12" height="6" fill="#0f172a"/>
                  <rect x="76" y="42" width="14" height="6" fill="#0f172a"/>
                  <rect x="42" y="58" width="8" height="12" fill="#0f172a"/>
                  <rect x="56" y="56" width="14" height="8" fill="#1e3a8a"/>
                  <rect x="74" y="58" width="16" height="8" fill="#0f172a"/>
                  <rect x="42" y="76" width="14" height="8" fill="#0f172a"/>
                  <rect x="62" y="72" width="6" height="16" fill="#0f172a"/>
                  <rect x="74" y="76" width="16" height="12" fill="#1e3a8a"/>
                </svg>
                <div class="qr-caption">Secure Digital Seal</div>
              </div>
            </div>

            <!-- CLAUSE 1: POLICE JURISDICTION & REGISTRATION -->
            <table class="clause-table">
              <tr>
                <th style="width:25%;">1. District:</th>
                <td style="width:25%;"><strong>${escapeHtml(formData.district)}</strong></td>
                <th style="width:25%;">Police Station:</th>
                <td style="width:25%;"><strong>${escapeHtml(formData.policeStation)}</strong></td>
              </tr>
              <tr>
                <th>Year:</th>
                <td>${escapeHtml(formData.year || new Date().getFullYear().toString())}</td>
                <th>FIR Number & Date:</th>
                <td><strong>No. ${escapeHtml(formData.firNo)}</strong> dt. <strong>${escapeHtml(formData.date || new Date().toLocaleDateString('en-GB'))}</strong></td>
              </tr>
            </table>

            <!-- CLAUSE 2: ACTS AND STATUTORY PROVISIONS (CO-PILOT INJECTED) -->
            <table class="clause-table">
              <tr>
                <th style="width:25%;">2. (i) Primary Act & Sections:</th>
                <td colspan="3">
                  <span class="sec-pill">${escapeHtml(primaryAct)}</span>
                  <strong>${escapeHtml(primarySection)}</strong>
                </td>
              </tr>
              ${formData.act2 && formData.sections2 ? `
              <tr>
                <th>(ii) Secondary Act &amp; Sections:</th>
                <td colspan="3">
                  <span class="sec-pill">${escapeHtml(formData.act2)}</span>
                  <strong>${escapeHtml(formData.sections2)}</strong>
                </td>
              </tr>
              ` : ''}
              ${formData.act3 && formData.sections3 ? `
              <tr>
                <th>(iii) Special / Local Laws:</th>
                <td colspan="3">
                  <span class="sec-pill">${escapeHtml(formData.act3)}</span>
                  <strong>${escapeHtml(formData.sections3)}</strong>
                </td>
              </tr>
              ` : ''}
              <tr>
                <th>(iv) Classified Offence Category:</th>
                <td colspan="3">
                  <strong>${escapeHtml(detectedOffence)}</strong>
                  <span class="conf-badge" style="margin-left:8px;">Cognizable Under Sec 173 BNSS</span>
                </td>
              </tr>
              ${recommendedSections.length > 0 ? `
              <tr>
                <th>(v) Recommended Legal Sections (Co-Pilot Schedule):</th>
                <td colspan="3" style="padding:4px;">
                  <table class="sub-table">
                    <thead>
                      <tr>
                        <th style="width:28%;">Section & Act</th>
                        <th style="width:52%;">Prima Facie Legal Ground & Scope</th>
                        <th style="width:20%; text-align:center;">Statutory Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${recommendedSections.map((sec) => `
                        <tr>
                          <td><strong>${escapeHtml(sec.section)}</strong></td>
                          <td>${escapeHtml(sec.reason)}</td>
                          <td style="text-align:center;"><span class="conf-badge">${sec.confidence}% Confidence</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </td>
              </tr>
              ` : ''}
            </table>

            <!-- CLAUSE 3 & 4: OCCURRENCE, GD REF, INFORMATION TYPE -->
            <table class="clause-table">
              <tr>
                <th style="width:25%;">3. (a) Occurrence of Offence:</th>
                <td style="width:25%;">Date: <strong>${escapeHtml(formData.offenceDate || formData.date || 'As stated')}</strong></td>
                <th style="width:25%;">Time:</th>
                <td style="width:25%;"><strong>${escapeHtml(formData.offenceTime || 'Not recorded')}</strong></td>
              </tr>
              <tr>
                <th>(b) General Diary Entry:</th>
                <td>${escapeHtml(formData.generalDiaryRef || 'GD No. ' + (formData.firNo ? formData.firNo + '/B' : '014/2026'))}</td>
                <th>(c) Information Received Date:</th>
                <td>${escapeHtml(formData.infoReceivedDate || formData.date || new Date().toLocaleDateString('en-GB'))} ${escapeHtml(formData.infoReceivedTime || '')}</td>
              </tr>
              <tr>
                <th>4. Type of Information:</th>
                <td colspan="3">
                  <strong>${escapeHtml(formData.typeOfInfo || 'Written / Electronically Dictated Statutory Information')}</strong>
                  <span style="font-size:8pt; color:#475569; margin-left:8px;">(LegalBridge-AI Audio/Drafting Co-Pilot Recorded)</span>
                </td>
              </tr>
            </table>

            <!-- CLAUSE 5: PLACE OF OCCURRENCE -->
            <table class="clause-table">
              <tr>
                <th style="width:25%;">5. (a) Place of Occurrence:</th>
                <td colspan="3"><strong>${escapeHtml(formData.address || 'Jurisdiction of Police Station')}</strong></td>
              </tr>
              <tr>
                <th>(b) Direction & Distance from P.S.:</th>
                <td>${escapeHtml(formData.occurrenceDirection || 'Approx 1.5 km East')} (Beat No. ${escapeHtml(formData.beatNo || '04')})</td>
                <th>(c) Outside P.S. Territory:</th>
                <td>${escapeHtml(formData.outsidePS || 'No (Within Territorial Jurisdiction)')}</td>
              </tr>
            </table>

            <!-- CLAUSE 6: COMPLAINANT / INFORMANT DETAILS -->
            <table class="clause-table">
              <tr>
                <th style="width:25%;">6. Complainant / Informant:</th>
                <td style="width:25%;"><strong>${escapeHtml(formData.complainantName)}</strong></td>
                <th style="width:25%;">Father's / Husband's Name:</th>
                <td style="width:25%;">${escapeHtml(formData.fatherName || 'Not recorded')}</td>
              </tr>
              <tr>
                <th>Date of Birth / Age:</th>
                <td>${escapeHtml(formData.birthDate || 'Major')}</td>
                <th>Nationality & Occupation:</th>
                <td>${escapeHtml(formData.nationality || 'Indian')} • ${escapeHtml(formData.occupation || 'Private / Commercial')}</td>
              </tr>
              <tr>
                <th>Address of Complainant:</th>
                <td colspan="3">${escapeHtml(formData.complainantAddress || formData.address)}</td>
              </tr>
            </table>

            <!-- CLAUSE 7, 8, 9, 10, 11: ACCUSED, DELAY, PROPERTY, INQUEST -->
            <table class="clause-table">
              <tr>
                <th style="width:25%;">7. Details of Accused Persons:</th>
                <td colspan="3"><strong>${escapeHtml(formData.accusedDetails || 'Unknown accused suspects acting in concert (Particulars detailed in narrative)')}</strong></td>
              </tr>
              <tr>
                <th>8. Reasons for Delay in Reporting:</th>
                <td>${escapeHtml(formData.delayReason || 'Nil (Reported promptly upon commission/discovery)')}</td>
                <th>9. Stolen / Involved Property:</th>
                <td>${escapeHtml(formData.stolenProperties || 'As documented in schedule of seized/dispossessed articles')}</td>
              </tr>
              <tr>
                <th>10. Total Valuation of Property:</th>
                <td><strong>${escapeHtml(formData.stolenValue ? '₹ ' + formData.stolenValue : 'Under formal investigation valuation')}</strong></td>
                <th>11. Inquest / U.D. Case No.:</th>
                <td>${escapeHtml(formData.inquestReportNo || 'N/A (Pending further statutory enquiry)')}</td>
              </tr>
            </table>

            <!-- CLAUSE 11A: SCHEDULE OF ATTACHED EVIDENCE & EXHIBITS (CHAIN OF CUSTODY) -->
            <div style="margin-bottom: 12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                <span style="font-weight: 700; font-size: 9.5pt; color: #0f172a;">
                  11A. Schedule of Attached Evidence &amp; Exhibits (Chain of Custody - Sec 63 BSA / Sec 173 BNSS):
                </span>
                <span style="font-size: 8pt; font-weight:700; color:#1e3a8a; background:#e0f2fe; padding:2px 8px; border-radius:3px;">
                  ${exhibits.length} Exhibit(s) Registered
                </span>
              </div>
              <table class="sub-table" style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="width:12%; text-align:center;">Exhibit #</th>
                    <th style="width:38%;">Nature &amp; Description of Article</th>
                    <th style="width:20%;">Source / Recovery</th>
                    <th style="width:16%;">Date &amp; Collector</th>
                    <th style="width:14%; text-align:center;">Digital Integrity</th>
                  </tr>
                </thead>
                <tbody>
                  ${exhibits.length === 0 ? `
                    <tr>
                      <td colspan="5" style="text-align:center; padding:8px; color:#64748b; font-style:italic;">
                        No physical/digital exhibits attached at initial report recording. Seizure memos, if any, to follow during investigation under Section 185 BNSS.
                      </td>
                    </tr>
                  ` : exhibits.map((ex) => `
                    <tr>
                      <td style="text-align:center; font-weight:700; color:#0284c7;">${escapeHtml(ex.exhibitNumber)}</td>
                      <td>
                        <strong>${escapeHtml(ex.title)}</strong><br/>
                        <span style="font-size:7.5pt; color:#475569;">${escapeHtml(ex.description)}</span>
                      </td>
                      <td><span class="sec-pill" style="font-size:7.5pt;">${escapeHtml(ex.source)}</span></td>
                      <td style="font-size:7.5pt; color:#334155;">
                        ${escapeHtml(ex.collectedAt)}<br/>
                        <strong>${escapeHtml(ex.collectedBy)}</strong>
                      </td>
                      <td style="text-align:center; font-size:7pt; color:#15803d; font-family:monospace;">
                        ${escapeHtml(ex.integrityHash)}<br/>
                        <span style="font-size:6.5pt; color:#166534; font-weight:700;">[Vault Preserved]</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div style="font-size:7pt; color:#64748b; margin-top:3px; font-style:italic;">
                * All electronic records and media files referenced above are hash-sealed and secured under continuous chain of custody in accordance with Section 63 of the Bharatiya Sakshya Adhiniyam, 2023.
              </div>
            </div>

            <!-- CLAUSE 12: INCIDENT NARRATIVE (FULL STATEMENT) -->
            <div style="margin-bottom: 10px;">
              <div style="font-weight: 700; font-size: 9.5pt; color: #0f172a; margin-bottom: 4px;">
                12. First Information Contents (Statement / Narrative of Offence):
              </div>
              <div class="narrative-box">
                ${escapeHtml(formData.narrative || 'Complainant statement recorded verbatim under Section 173(1) BNSS.').replace(/\n/g, '<br/>')}
              </div>
            </div>

            <!-- CLAUSE 13: ACTION TAKEN -->
            <div class="action-taken-box">
              <strong>13. Action Taken:</strong> Since the above information discloses commission of cognizable offence(s) as mentioned at Item No. 2, registered the case and took up the investigation under Section 175 BNSS (Cr.P.C. 156). FIR read over to the Informant, admitted to be correctly recorded, and a true copy given to the Informant free of cost as mandated under Section 173(2) BNSS.
            </div>

            <!-- SIGNATURE AND ENDORSEMENT ROW -->
            <div class="sig-row">
              <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-title">Signature / Thumb Impression of Informant</div>
                <div class="sig-sub">[Electronically Recorded & Attested]</div>
              </div>

              <div class="official-seal">
                Police Station Seal<br/>
                ${escapeHtml(formData.policeStation)}<br/>
                Sec 173 BNSS Compliant
              </div>

              <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-title">Signature of Officer-in-Charge / I.O.</div>
                <div class="sig-sub">
                  Name: <strong>${escapeHtml(formData.officerName || 'Station House Officer')}</strong><br/>
                  Rank: ${escapeHtml(formData.officerRank || 'Inspector of Police')} • No: ${escapeHtml(formData.officerNo || 'IO-7721')}
                </div>
              </div>
            </div>

            <!-- FOOTER WITH STATUTORY CERTIFICATION -->
            <div class="footer-note">
              <div>
                14. Dispatch to Court: <strong>${escapeHtml(formData.dispatchDate || formData.date || new Date().toLocaleDateString('en-GB'))}</strong> under Sec 173(2) BNSS
              </div>
              <div>
                Page 1 of 1 • LegalBridge-AI Integrated CCTNS Standard FIR Document
              </div>
              <div>
                Valid for Judicial Cognizance (Sec 190 BNSS)
              </div>
            </div>

          </div>
        </div>
      </body>
      </html>
    `;

    try {
      if (Platform.OS === 'web') {
        // Web: trigger browser print dialog (Save as PDF is a standard browser option)
        await Print.printAsync({ html: htmlContent });
        return;
      }

      // Mobile: generate a real PDF file via expo-print
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const sharingAvailable = await Sharing.isAvailableAsync();

      if (sharingAvailable) {
        // Primary path: share sheet lets user save to Files, WhatsApp, email, etc.
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Official FIR No. ${formData.firNo || 'Draft'} — BNSS §173`,
        });
      } else {
        // Fallback: navigate to ViewPDF with the real file path so the share
        // button in that screen can still offer Sharing.shareAsync(filePath)
        (navigation as any).navigate('ViewPDF', {
          filePath: uri,
          htmlContent,
          title: `Court-Ready FIR Report — No. ${formData.firNo || 'Draft'} (BNSS §173)`,
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'PDF Generation Failed',
        'Unable to compile the official FIR document. Please verify all required fields and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: theme.background }]}>
      <OfficialNavbar />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <FIRHeader
          title="FIR Management & Generation Desk"
          subtitle="Download official statutory formats and generate customized First Information Reports."
        />

        <View style={styles.contentInner}>
          {/* Download Section */}
          <DownloadSection
            isDownloading={isDownloading}
            onDownload={downloadDocx}
          />

          {/* Resume Previous Draft Banner */}
          {resumeBannerVisible && lastActiveDraft && (
            <View style={[styles.resumeBanner, { backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: '#3b82f6' }]}>
              <View style={styles.resumeBannerLeft}>
                <Ionicons name="time" size={20} color="#2563eb" />
                <View style={styles.resumeBannerTextWrap}>
                  <Text style={[styles.resumeBannerTitle, { color: theme.textPrimary }]}>
                    Resume Previous In-Progress Draft?
                  </Text>
                  <Text style={[styles.resumeBannerSub, { color: theme.textSecondary }]}>
                    "{lastActiveDraft.title}" • Updated {lastActiveDraft.formattedUpdatedAt}
                  </Text>
                </View>
              </View>

              <View style={styles.resumeBannerActions}>
                <TouchableOpacity
                  style={styles.resumeBannerBtn}
                  onPress={() => handleResumeDraft(lastActiveDraft)}
                >
                  <Ionicons name="arrow-redo" size={13} color="#ffffff" />
                  <Text style={styles.resumeBannerBtnText}>Resume</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dismissBannerBtn, { borderColor: theme.border }]}
                  onPress={() => setResumeBannerVisible(false)}
                >
                  <Text style={[styles.dismissBannerBtnText, { color: theme.textSecondary }]}>Start Fresh</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleBlock}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Generate Standardized FIR Document</Text>
                
                {/* Live Auto-save indicator */}
                <View style={styles.saveStatusRow}>
                  {isSaving ? (
                    <View style={styles.saveStatusBadge}>
                      <ActivityIndicator size="small" color="#2563eb" />
                      <Text style={[styles.saveStatusText, { color: '#2563eb' }]}>Auto-saving...</Text>
                    </View>
                  ) : isDirty ? (
                    <View style={styles.saveStatusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: '#d97706' }]} />
                      <Text style={[styles.saveStatusText, { color: '#d97706' }]}>Unsaved changes (auto-saving)</Text>
                    </View>
                  ) : lastSavedTime ? (
                    <View style={styles.saveStatusBadge}>
                      <Ionicons name="cloud-done-outline" size={13} color="#16a34a" />
                      <Text style={[styles.saveStatusText, { color: '#16a34a' }]}>Saved offline ({lastSavedTime})</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Drafts Toolbar */}
              <View style={styles.draftsToolbar}>
                <TouchableOpacity
                  style={[styles.draftToolbarBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={handleManualSaveDraft}
                  activeOpacity={0.7}
                >
                  <Ionicons name="save-outline" size={14} color={COLORS.navyGov} />
                  <Text style={[styles.draftToolbarBtnText, { color: COLORS.navyGov }]}>Save Draft</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.draftToolbarBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
                  onPress={() => setDraftsModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="folder-open-outline" size={14} color={COLORS.navyGov} />
                  <Text style={[styles.draftToolbarBtnText, { color: COLORS.navyGov }]}>
                    My Drafts ({draftsList.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              Complete the required particulars below to compile and generate a compliant FIR report in PDF format.
            </Text>

            {/* FIR Details Card */}
            <FIRDetailsCard
              formData={{
                state: formData.state,
                district: formData.district,
                policeStation: formData.policeStation,
                year: formData.year,
                firNo: formData.firNo,
                date: formData.date,
              }}
              onChange={handleChange}
            />

            {/* Offence Details Card */}
            <OffenceDetailsCard
              formData={{
                offenceDate: formData.offenceDate,
                offenceTime: formData.offenceTime,
                address: formData.address,
                narrative: formData.narrative,
                accusedDetails: formData.accusedDetails,
                stolenProperties: formData.stolenProperties,
                stolenValue: formData.stolenValue,
                inquestReportNo: formData.inquestReportNo,
              }}
              allFormData={formData as Record<string, string>}
              onChange={handleChange}
              onRequestAutoFill={() => setAutoFillVisible(true)}
              onUndoAutoFill={handleUndoAutoFill}
              canUndoAutoFill={canUndoAutoFill}
            />

            {/* Evidence & Exhibits Card (Chain of Custody) */}
            <FIREvidenceCard
              firNo={formData.firNo}
              officerName={formData.officerName}
              exhibits={exhibits}
              onExhibitsChange={handleExhibitsChange}
            />

            {/* Complainant Details Card */}
            <ComplainantDetailsCard
              formData={{
                complainantName: formData.complainantName,
                fatherName: formData.fatherName,
                birthDate: formData.birthDate,
                nationality: formData.nationality,
                occupation: formData.occupation,
                complainantAddress: formData.complainantAddress,
              }}
              onChange={handleChange}
            />

            {/* Generate PDF Button */}
            <FormButton
              title="Generate & Save FIR PDF"
              loadingTitle="Compiling Official Document..."
              isLoading={isGeneratingPDF}
              onPress={generatePDF}
              iconName="document-text-outline"
              backgroundColor={COLORS.navyGov}
            />
          </View>
        </View>

        <Footer />
      </ScrollView>

      {/* AI Auto-Fill Preview Modal */}
      <FIRAutoFillPreviewModal
        visible={autoFillVisible}
        onClose={() => setAutoFillVisible(false)}
        narrativeText={formData.narrative}
        currentFormData={formData as Record<string, string>}
        onApplyFields={handleAutoFillApply}
      />

      {/* Offline Drafts & Version History Modal */}
      <FIRDraftsModal
        visible={draftsModalVisible}
        onClose={() => setDraftsModalVisible(false)}
        drafts={draftsList}
        currentDraftId={currentDraftId}
        onResumeDraft={handleResumeDraft}
        onRollbackVersion={handleRollbackVersion}
        onStartNewDraft={handleStartNewDraft}
        onRefreshDrafts={async () => {
          const all = await loadAllDrafts();
          setDraftsList(all);
        }}
        onDraftDeleted={handleDraftDeleted}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  container: {
    flex: 1,
  },
  contentInner: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 12,
  },
  resumeBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  resumeBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resumeBannerTextWrap: {
    flex: 1,
  },
  resumeBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  resumeBannerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  resumeBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resumeBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.navyGov,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  resumeBannerBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  dismissBannerBtn: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  dismissBannerBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    margin: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitleBlock: {
    flex: 1,
    minWidth: 260,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.navyDark,
  },
  saveStatusRow: {
    marginTop: 4,
  },
  saveStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  saveStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  draftsToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  draftToolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  draftToolbarBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
});

export default FormToPDF;
