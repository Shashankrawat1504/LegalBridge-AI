export { default as FIRHeader } from './FIRHeader';
export { default as DownloadSection } from './DownloadSection';
export { default as FIRDetailsCard } from './FIRDetailsCard';
export { default as OffenceDetailsCard } from './OffenceDetailsCard';
export { default as ComplainantDetailsCard } from './ComplainantDetailsCard';
export { default as FormButton } from './FormButton';
export { FIRAutoFillPreviewModal, extractFIRFieldsFromNarrative } from './FIRAutoFillPreviewModal';
export type { ExtractedFieldItem } from './FIRAutoFillPreviewModal';
export { UpdateNarrativeModal } from './UpdateNarrativeModal';
export { default as FIREvidenceCard, getExhibitLetter } from './FIREvidenceCard';
export type { FIRExhibitItem, EvidenceSource } from './FIREvidenceCard';
export {
  generateNarrativeFromFields,
  checkNarrativeToFieldsSync,
} from './FIRBidirectionalSync';
export type {
  ClauseUpdateItem,
  NarrativeSyncResult,
} from './FIRBidirectionalSync';
export { FIRDraftsModal } from './FIRDraftsModal';
export {
  loadAllDrafts,
  saveDraftRecord,
  deleteDraftRecord,
  duplicateDraftRecord,
  renameDraftRecord,
  getLastActiveDraft,
  setActiveDraftId,
  generateNewDraftId,
} from './FIRDraftManager';
export type {
  FIRDraftRecord,
  FIRDraftVersion,
} from './FIRDraftManager';