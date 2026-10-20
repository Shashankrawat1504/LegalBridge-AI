/**
 * FIRDraftManager.ts
 *
 * Offline FIR Draft Versioning, Persistence, and State Restoration for LegalBridge-AI.
 *
 * Provides:
 *  - Multi-draft support with unique IDs
 *  - Auto-save engine with debounce
 *  - Version history per draft (up to 5 checkpoints)
 *  - Draft cloning / duplication
 *  - Local persistence via AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIRExhibitItem } from './FIREvidenceCard';

export interface FIRDraftVersion {
  versionId: string;
  timestamp: string; // ISO date string
  formattedTime: string; // "19/10/2026, 23:35"
  label: string; // "Auto-saved", "Manual save", "Before Auto-Fill", etc.
  formData: Record<string, string>;
  exhibits: FIRExhibitItem[];
}

export interface FIRDraftRecord {
  id: string; // "draft_1729384918231_xyz"
  title: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  formattedUpdatedAt: string;
  firNo: string;
  policeStation: string;
  district: string;
  complainantName: string;
  narrativePreview: string;
  exhibitsCount: number;
  formData: Record<string, string>;
  exhibits: FIRExhibitItem[];
  versions: FIRDraftVersion[];
}

const STORAGE_KEY_DRAFTS_LIST = 'LAWAI_FIR_DRAFTS_V2';
const STORAGE_KEY_ACTIVE_DRAFT_ID = 'LAWAI_ACTIVE_DRAFT_ID';
const MAX_VERSIONS_PER_DRAFT = 5;

/**
 * Loads all saved FIR drafts sorted by last updated descending.
 */
export async function loadAllDrafts(): Promise<FIRDraftRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_DRAFTS_LIST);
    if (!raw) return [];
    const drafts: FIRDraftRecord[] = JSON.parse(raw);
    if (!Array.isArray(drafts)) return [];
    return drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (err) {
    console.error('Failed to load FIR drafts:', err);
    return [];
  }
}

/**
 * Saves or updates a draft record. Manages up to 5 version snapshots.
 */
export async function saveDraftRecord(
  draftData: {
    id: string;
    title?: string;
    notes?: string;
    formData: Record<string, string>;
    exhibits: FIRExhibitItem[];
  },
  versionLabel: string = 'Auto-saved'
): Promise<FIRDraftRecord> {
  const allDrafts = await loadAllDrafts();
  const existingIdx = allDrafts.findIndex((d) => d.id === draftData.id);
  const now = new Date();
  const nowIso = now.toISOString();
  const nowFormatted = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const complainant = draftData.formData.complainantName?.trim() || '';
  const firNum = draftData.formData.firNo?.trim() || '';
  const ps = draftData.formData.policeStation?.trim() || '';
  const dist = draftData.formData.district?.trim() || '';
  const narrative = draftData.formData.narrative?.trim() || '';

  // Auto-generate title if not explicitly provided
  let computedTitle = draftData.title?.trim();
  if (!computedTitle) {
    if (existingIdx !== -1 && allDrafts[existingIdx].title) {
      computedTitle = allDrafts[existingIdx].title;
    } else if (complainant) {
      computedTitle = `FIR Draft - ${complainant}${ps ? ` (${ps})` : ''}`;
    } else if (firNum) {
      computedTitle = `FIR No. ${firNum} (Draft)`;
    } else {
      computedTitle = `Draft FIR - ${nowFormatted.slice(0, 10)}`;
    }
  }

  // Create version snapshot
  const newVersion: FIRDraftVersion = {
    versionId: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowIso,
    formattedTime: nowFormatted,
    label: versionLabel,
    formData: { ...draftData.formData },
    exhibits: draftData.exhibits ? [...draftData.exhibits] : [],
  };

  let updatedRecord: FIRDraftRecord;

  if (existingIdx !== -1) {
    const existing = allDrafts[existingIdx];
    const prevVersions = existing.versions || [];
    // Optimize version buffer to prevent checkpoint flooding from frequent 2.5s auto-saves:
    // If saving an 'Auto-saved' checkpoint and the most recent version is also 'Auto-saved'
    // created less than 5 minutes ago, update that version instead of consuming another slot.
    let mergedVersions: FIRDraftVersion[];
    const AUTO_SAVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    const lastVersion = prevVersions[0];

    if (
      versionLabel === 'Auto-saved' &&
      lastVersion &&
      lastVersion.label === 'Auto-saved' &&
      now.getTime() - new Date(lastVersion.timestamp).getTime() < AUTO_SAVE_THRESHOLD_MS
    ) {
      // Update top auto-saved version in-place
      mergedVersions = [newVersion, ...prevVersions.slice(1)].slice(0, MAX_VERSIONS_PER_DRAFT);
    } else {
      // Push new version and keep only last MAX_VERSIONS_PER_DRAFT
      mergedVersions = [newVersion, ...prevVersions].slice(0, MAX_VERSIONS_PER_DRAFT);
    }

    updatedRecord = {
      ...existing,
      title: computedTitle,
      notes: draftData.notes !== undefined ? draftData.notes : existing.notes,
      updatedAt: nowIso,
      formattedUpdatedAt: nowFormatted,
      firNo: firNum,
      policeStation: ps,
      district: dist,
      complainantName: complainant,
      narrativePreview: narrative.slice(0, 160),
      exhibitsCount: draftData.exhibits?.length || 0,
      formData: { ...draftData.formData },
      exhibits: draftData.exhibits ? [...draftData.exhibits] : [],
      versions: mergedVersions,
    };
    allDrafts[existingIdx] = updatedRecord;
  } else {
    updatedRecord = {
      id: draftData.id,
      title: computedTitle,
      notes: draftData.notes || '',
      createdAt: nowIso,
      updatedAt: nowIso,
      formattedUpdatedAt: nowFormatted,
      firNo: firNum,
      policeStation: ps,
      district: dist,
      complainantName: complainant,
      narrativePreview: narrative.slice(0, 160),
      exhibitsCount: draftData.exhibits?.length || 0,
      formData: { ...draftData.formData },
      exhibits: draftData.exhibits ? [...draftData.exhibits] : [],
      versions: [newVersion],
    };
    allDrafts.unshift(updatedRecord);
  }

  await AsyncStorage.setItem(STORAGE_KEY_DRAFTS_LIST, JSON.stringify(allDrafts));
  await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_DRAFT_ID, draftData.id);

  return updatedRecord;
}

/**
 * Deletes a draft record by ID.
 */
export async function deleteDraftRecord(id: string): Promise<void> {
  const allDrafts = await loadAllDrafts();
  const filtered = allDrafts.filter((d) => d.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY_DRAFTS_LIST, JSON.stringify(filtered));

  const activeId = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_DRAFT_ID);
  if (activeId === id) {
    await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_DRAFT_ID);
  }
}

/**
 * Clones / duplicates a draft record.
 */
export async function duplicateDraftRecord(sourceId: string): Promise<FIRDraftRecord | null> {
  const allDrafts = await loadAllDrafts();
  const source = allDrafts.find((d) => d.id === sourceId);
  if (!source) return null;

  const now = new Date();
  const newId = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const duplicateRecord: FIRDraftRecord = {
    ...source,
    id: newId,
    title: `Copy of ${source.title}`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    formattedUpdatedAt: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    versions: [
      {
        versionId: `v_${Date.now()}`,
        timestamp: now.toISOString(),
        formattedTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        label: `Cloned from ${source.title}`,
        formData: { ...source.formData },
        exhibits: [...source.exhibits],
      },
    ],
  };

  allDrafts.unshift(duplicateRecord);
  await AsyncStorage.setItem(STORAGE_KEY_DRAFTS_LIST, JSON.stringify(allDrafts));
  return duplicateRecord;
}

/**
 * Renames a draft or updates its notes.
 */
export async function renameDraftRecord(id: string, newTitle: string, notes?: string): Promise<void> {
  const allDrafts = await loadAllDrafts();
  const idx = allDrafts.findIndex((d) => d.id === id);
  if (idx !== -1) {
    allDrafts[idx].title = newTitle.trim() || allDrafts[idx].title;
    if (notes !== undefined) {
      allDrafts[idx].notes = notes;
    }
    await AsyncStorage.setItem(STORAGE_KEY_DRAFTS_LIST, JSON.stringify(allDrafts));
  }
}

/**
 * Gets the last active draft if available.
 */
export async function getLastActiveDraft(): Promise<FIRDraftRecord | null> {
  try {
    const activeId = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_DRAFT_ID);
    const drafts = await loadAllDrafts();
    if (!drafts.length) return null;

    if (activeId) {
      const match = drafts.find((d) => d.id === activeId);
      if (match) return match;
    }
    return drafts[0];
  } catch {
    return null;
  }
}

/**
 * Sets the active draft ID.
 */
export async function setActiveDraftId(id: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_DRAFT_ID, id);
}

/**
 * Generates a fresh draft ID.
 */
export function generateNewDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
