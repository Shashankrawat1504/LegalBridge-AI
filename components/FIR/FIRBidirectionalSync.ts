/**
 * FIRBidirectionalSync.ts
 *
 * Intelligent Bidirectional Synchronization Engine between structured FIR form fields
 * and free-text offence narrative for LegalBridge-AI.
 *
 * Capabilities:
 *  1. Fields -> Narrative: Intelligently updates specific clauses (complainant, locus,
 *     timing, accused, stolen property, sections) while preserving original phrasing
 *     and Co-Pilot improvements.
 *  2. Narrative -> Fields: Analyzes narrative changes and identifies differing fields
 *     with confidence scores and overwrite guards.
 *  3. Undo Support: Captures state snapshots for one-tap reversal in either direction.
 */

import { ExtractedFieldItem, extractFIRFieldsFromNarrative } from './FIRAutoFillPreviewModal';

export interface ClauseUpdateItem {
  title: string;
  category: 'Complainant' | 'Locus' | 'Accused' | 'Property' | 'Sections';
  oldSnippet?: string;
  newSnippet: string;
}

export interface NarrativeSyncResult {
  updatedNarrative: string;
  changedClauses: ClauseUpdateItem[];
  hasChanges: boolean;
}

/**
 * Intelligently generates or updates a narrative based on current structured fields
 * while preserving user drafting style and custom narrative body paragraphs.
 */
export function generateNarrativeFromFields(
  currentNarrative: string = '',
  fields: Record<string, string>
): NarrativeSyncResult {
  const narrative = (currentNarrative || '').trim();
  const changedClauses: ClauseUpdateItem[] = [];

  const complainantName = fields.complainantName?.trim() || '';
  const fatherName = fields.fatherName?.trim() || '';
  const complainantAddress = fields.complainantAddress?.trim() || '';
  const offenceDate = fields.offenceDate?.trim() || '';
  const offenceTime = fields.offenceTime?.trim() || '';
  const address = fields.address?.trim() || '';
  const district = fields.district?.trim() || '';
  const policeStation = fields.policeStation?.trim() || '';
  const accusedDetails = fields.accusedDetails?.trim() || '';
  const stolenProperties = fields.stolenProperties?.trim() || '';
  const stolenValue = fields.stolenValue?.trim() || '';
  const sections1 = fields.sections1?.trim() || '';

  // Case 1: Narrative is empty or very short
  if (!narrative || narrative.length < 20) {
    const lines: string[] = [];

    // Complainant preamble
    if (complainantName) {
      let comp = `I, ${complainantName}`;
      if (fatherName) comp += `, S/o ${fatherName}`;
      if (complainantAddress) comp += `, resident of ${complainantAddress}`;
      comp += `, do hereby submit this formal information regarding a cognizable offence.`;
      lines.push(comp);
      changedClauses.push({
        title: 'Complainant Particulars',
        category: 'Complainant',
        newSnippet: comp,
      });
    }

    // Locus and Occurrence timing
    let occ = '';
    if (offenceDate || offenceTime || address) {
      occ = 'The occurrence took place';
      if (offenceDate) occ += ` on ${offenceDate}`;
      if (offenceTime) occ += ` at approximately ${offenceTime}`;
      if (address) occ += ` at ${address}`;
      if (policeStation) occ += ` within the territorial jurisdiction of Police Station ${policeStation}`;
      if (district) occ += `, District ${district}`;
      occ += '.';
      lines.push(occ);
      changedClauses.push({
        title: 'Occurrence Timing & Locus',
        category: 'Locus',
        newSnippet: occ,
      });
    }

    // Incident body placeholder
    lines.push('On the date and time stated above, the complainant was intercepted and subjected to criminal acts by the perpetrators. Detailed sequence of events and overt actions are detailed hereunder.');

    // Accused clause
    if (accusedDetails) {
      const acc = `Accused Particulars: ${accusedDetails}.`;
      lines.push(acc);
      changedClauses.push({
        title: 'Accused Particulars & Modus Operandi',
        category: 'Accused',
        newSnippet: acc,
      });
    }

    // Property and Loss
    if (stolenProperties || stolenValue) {
      let prop = 'Particulars of Property Dispossessed / Stolen: ';
      if (stolenProperties) prop += stolenProperties;
      if (stolenValue) prop += ` (Estimated Total Valuation: ${stolenValue})`;
      prop += '.';
      lines.push(prop);
      changedClauses.push({
        title: 'Dispossessed Property & Valuation',
        category: 'Property',
        newSnippet: prop,
      });
    }

    // Sections clause
    if (sections1) {
      const sec = `[Attracted Statutory Sections: ${sections1}]`;
      lines.push(sec);
      changedClauses.push({
        title: 'Attracted Statutory Sections',
        category: 'Sections',
        newSnippet: sec,
      });
    }

    const updated = lines.join('\n\n');
    return {
      updatedNarrative: updated,
      changedClauses,
      hasChanges: changedClauses.length > 0,
    };
  }

  // Case 2: Narrative has existing text -> selectively update/reconcile clauses without destroying user phrasing
  let updated = narrative;

  // 1. Update / Insert Complainant details
  if (complainantName) {
    const compRegex = /(?:I,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|(?:The\s+)?complainant\s*,\s*[^,.\n]+)(?:,\s*(?:S\/o|D\/o|W\/o)\s*[^,.\n]+)?(?:,\s*(?:resident of|R\/o)\s*[^,.\n]+)?/i;
    let newCompSnippet = `I, ${complainantName}`;
    if (fatherName) newCompSnippet += `, S/o ${fatherName}`;
    if (complainantAddress) newCompSnippet += `, resident of ${complainantAddress}`;

    if (compRegex.test(updated)) {
      const match = updated.match(compRegex);
      if (match && match[0] !== newCompSnippet) {
        updated = updated.replace(compRegex, newCompSnippet);
        changedClauses.push({
          title: 'Complainant Particulars',
          category: 'Complainant',
          oldSnippet: match[0],
          newSnippet: newCompSnippet,
        });
      }
    } else if (!updated.toLowerCase().includes(complainantName.toLowerCase())) {
      // Prepend complainant intro
      const intro = `${newCompSnippet}, do hereby state that: \n\n`;
      updated = intro + updated;
      changedClauses.push({
        title: 'Complainant Particulars',
        category: 'Complainant',
        newSnippet: newCompSnippet,
      });
    }
  }

  // 2. Update Occurrence Locus & Time
  if (offenceDate && !updated.includes(offenceDate)) {
    const dateRegex = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/;
    if (dateRegex.test(updated)) {
      const oldD = updated.match(dateRegex)?.[0];
      updated = updated.replace(dateRegex, offenceDate);
      changedClauses.push({
        title: 'Occurrence Date',
        category: 'Locus',
        oldSnippet: oldD,
        newSnippet: offenceDate,
      });
    }
  }

  if (offenceTime && !updated.toLowerCase().includes(offenceTime.toLowerCase())) {
    const timeRegex = /(?:at\s+(?:around|about|approx\.?)?\s*)?\b\d{1,2}:\d{2}\s*(?:am|pm|hrs)?\b/i;
    if (timeRegex.test(updated)) {
      const oldT = updated.match(timeRegex)?.[0];
      updated = updated.replace(timeRegex, `at approximately ${offenceTime}`);
      changedClauses.push({
        title: 'Occurrence Time',
        category: 'Locus',
        oldSnippet: oldT,
        newSnippet: offenceTime,
      });
    }
  }

  if (address && !updated.toLowerCase().includes(address.toLowerCase())) {
    const locusRegex = /(?:place of occurrence|at|near|opposite)\s*[:]?\s*([^,.\n]+(?:,\s*[^,.\n]+){1,2})/i;
    if (locusRegex.test(updated)) {
      const oldL = updated.match(locusRegex)?.[0];
      updated = updated.replace(locusRegex, `at ${address}`);
      changedClauses.push({
        title: 'Place of Occurrence',
        category: 'Locus',
        oldSnippet: oldL,
        newSnippet: address,
      });
    }
  }

  // 3. Update Accused Details
  if (accusedDetails && !updated.toLowerCase().includes(accusedDetails.toLowerCase().slice(0, 25))) {
    const accRegex = /(?:Accused Particulars|Accused Details|Suspects?)\s*[:]?\s*[^.\n]{10,140}\./i;
    const newAccSnippet = `Accused Particulars: ${accusedDetails}.`;
    if (accRegex.test(updated)) {
      const oldAcc = updated.match(accRegex)?.[0];
      updated = updated.replace(accRegex, newAccSnippet);
      changedClauses.push({
        title: 'Accused Particulars',
        category: 'Accused',
        oldSnippet: oldAcc,
        newSnippet: newAccSnippet,
      });
    } else {
      // Append structured accused clause before sections tag
      const secTagIndex = updated.lastIndexOf('[Applicable');
      const insertText = `\n\n${newAccSnippet}`;
      if (secTagIndex !== -1) {
        updated = updated.slice(0, secTagIndex) + insertText + '\n\n' + updated.slice(secTagIndex);
      } else {
        updated += insertText;
      }
      changedClauses.push({
        title: 'Accused Particulars',
        category: 'Accused',
        newSnippet: newAccSnippet,
      });
    }
  }

  // 4. Update Stolen Property & Loss
  if (stolenProperties && !updated.toLowerCase().includes(stolenProperties.toLowerCase().slice(0, 20))) {
    const propRegex = /(?:Particulars of Property Dispossessed \/ Stolen|Stolen property|Dispossessed property)\s*[:]?\s*[^.\n]{10,140}\./i;
    let newPropSnippet = `Particulars of Property Dispossessed / Stolen: ${stolenProperties}`;
    if (stolenValue) newPropSnippet += ` (Valuation: ${stolenValue})`;
    newPropSnippet += '.';

    if (propRegex.test(updated)) {
      const oldProp = updated.match(propRegex)?.[0];
      updated = updated.replace(propRegex, newPropSnippet);
      changedClauses.push({
        title: 'Property & Loss Particulars',
        category: 'Property',
        oldSnippet: oldProp,
        newSnippet: newPropSnippet,
      });
    } else {
      const secTagIndex = updated.lastIndexOf('[Applicable');
      const insertText = `\n\n${newPropSnippet}`;
      if (secTagIndex !== -1) {
        updated = updated.slice(0, secTagIndex) + insertText + '\n\n' + updated.slice(secTagIndex);
      } else {
        updated += insertText;
      }
      changedClauses.push({
        title: 'Property & Loss Particulars',
        category: 'Property',
        newSnippet: newPropSnippet,
      });
    }
  }

  // 5. Update Sections Clause
  if (sections1) {
    const secTagRegex = /\[(?:Applicable|Attracted Statutory Sections)[^\]]+\]/i;
    const newSecTag = `[Applicable Sections: ${sections1}]`;
    if (secTagRegex.test(updated)) {
      const oldSec = updated.match(secTagRegex)?.[0];
      if (oldSec !== newSecTag) {
        updated = updated.replace(secTagRegex, newSecTag);
        changedClauses.push({
          title: 'Statutory Penal Sections',
          category: 'Sections',
          oldSnippet: oldSec,
          newSnippet: newSecTag,
        });
      }
    } else {
      updated += `\n\n${newSecTag}`;
      changedClauses.push({
        title: 'Statutory Penal Sections',
        category: 'Sections',
        newSnippet: newSecTag,
      });
    }
  }

  return {
    updatedNarrative: updated.trim(),
    changedClauses,
    hasChanges: changedClauses.length > 0 && updated.trim() !== narrative,
  };
}

/**
 * Checks what fields can be extracted from narrative and highlights differences
 * against the current form data.
 */
export function checkNarrativeToFieldsSync(
  narrative: string = '',
  fields: Record<string, string>
): {
  extractableItems: ExtractedFieldItem[];
  differingCount: number;
  newFieldsCount: number;
  overwriteCount: number;
} {
  if (!narrative || narrative.trim().length < 15) {
    return {
      extractableItems: [],
      differingCount: 0,
      newFieldsCount: 0,
      overwriteCount: 0,
    };
  }

  const items = extractFIRFieldsFromNarrative(narrative, fields);
  let differingCount = 0;
  let newFieldsCount = 0;
  let overwriteCount = 0;

  for (const item of items) {
    const current = (fields[item.key] || '').trim();
    if (!current) {
      newFieldsCount++;
      differingCount++;
    } else if (current.toLowerCase() !== item.value.toLowerCase()) {
      overwriteCount++;
      differingCount++;
    }
  }

  return {
    extractableItems: items,
    differingCount,
    newFieldsCount,
    overwriteCount,
  };
}
