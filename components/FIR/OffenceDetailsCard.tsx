import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, RADIUS } from '../../constants/theme';
import DraftingCoPilot from '../DraftingCoPilot';
import VoiceDictation from '../VoiceDictation';
import {
  generateNarrativeFromFields,
  checkNarrativeToFieldsSync,
} from './FIRBidirectionalSync';
import { UpdateNarrativeModal } from './UpdateNarrativeModal';

interface OffenceDetailsCardProps {
  formData: {
    offenceDate: string;
    offenceTime: string;
    address: string;
    narrative?: string;
    accusedDetails?: string;
    stolenProperties?: string;
    stolenValue?: string;
    inquestReportNo?: string;
  };
  allFormData?: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onRequestAutoFill?: () => void;
  onUndoAutoFill?: () => void;
  canUndoAutoFill?: boolean;
}

const OffenceDetailsCard: React.FC<OffenceDetailsCardProps> = ({
  formData,
  allFormData,
  onChange,
  onRequestAutoFill,
  onUndoAutoFill,
  canUndoAutoFill = false,
}) => {
  const { theme, isDark } = useTheme();

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [previousNarrative, setPreviousNarrative] = useState<string | null>(null);

  // Combine local formData and allFormData for full context
  const fullContextFields: Record<string, string> = {
    ...formData,
    ...(allFormData || {}),
  };

  // Evaluate sync from fields to narrative
  const syncToNarrativeResult = generateNarrativeFromFields(
    formData.narrative || '',
    fullContextFields
  );

  // Evaluate sync from narrative to fields
  const syncToFieldsResult = checkNarrativeToFieldsSync(
    formData.narrative || '',
    fullContextFields
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderWidth: 1, borderColor: theme.border }]}>
      <View style={[styles.cardHeader, { borderBottomColor: theme.border }]}>
        <Ionicons name="warning" size={20} color="#dc2626" />
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Offence Details & Narrative</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Offence Date</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={theme.textMuted}
            value={formData.offenceDate}
            onChangeText={(value) => onChange('offenceDate', value)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Offence Time</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="HH:MM"
            placeholderTextColor={theme.textMuted}
            value={formData.offenceTime}
            onChangeText={(value) => onChange('offenceTime', value)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Place of Occurrence *</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
          placeholder="Enter detailed address of the offence"
          placeholderTextColor={theme.textMuted}
          value={formData.address}
          onChangeText={(value) => onChange('address', value)}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Bidirectional Sync Bar */}
      <View style={[styles.syncBar, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
        <View style={styles.syncBarHeader}>
          <View style={styles.syncBarTitleWrap}>
            <Ionicons name="swap-horizontal" size={15} color={COLORS.navyGov} />
            <Text style={[styles.syncBarTitle, { color: theme.textPrimary }]}>
              Bidirectional Field ↔ Narrative Sync
            </Text>
          </View>

          {/* Undo Action Buttons */}
          <View style={styles.undoRow}>
            {previousNarrative !== null && (
              <TouchableOpacity
                style={[styles.undoBtn, { backgroundColor: isDark ? '#334155' : '#ffffff', borderColor: theme.border }]}
                onPress={() => {
                  onChange('narrative', previousNarrative);
                  setPreviousNarrative(null);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-undo" size={12} color={COLORS.navyGov} />
                <Text style={[styles.undoBtnText, { color: COLORS.navyGov }]}>Undo Narrative</Text>
              </TouchableOpacity>
            )}

            {canUndoAutoFill && onUndoAutoFill && (
              <TouchableOpacity
                style={[styles.undoBtn, { backgroundColor: isDark ? '#334155' : '#ffffff', borderColor: theme.border }]}
                onPress={onUndoAutoFill}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-undo" size={12} color="#d97706" />
                <Text style={[styles.undoBtnText, { color: '#d97706' }]}>Undo Form Fields</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sync Actions Row */}
        <View style={styles.syncBtnRow}>
          {/* Action 1: Fields -> Narrative */}
          <TouchableOpacity
            style={[
              styles.syncActionBtn,
              syncToNarrativeResult.hasChanges
                ? { backgroundColor: isDark ? '#1e3a8a' : '#eff6ff', borderColor: '#3b82f6' }
                : { backgroundColor: theme.surface, borderColor: theme.border, opacity: 0.65 },
            ]}
            onPress={() => {
              if (syncToNarrativeResult.hasChanges) {
                setUpdateModalVisible(true);
              }
            }}
            disabled={!syncToNarrativeResult.hasChanges}
            activeOpacity={0.7}
          >
            <Ionicons
              name="create-outline"
              size={14}
              color={syncToNarrativeResult.hasChanges ? '#2563eb' : theme.textMuted}
            />
            <Text
              style={[
                styles.syncActionBtnText,
                { color: syncToNarrativeResult.hasChanges ? '#1d4ed8' : theme.textMuted },
              ]}
            >
              Update Narrative from Fields
            </Text>
            {syncToNarrativeResult.changedClauses.length > 0 && (
              <View style={[styles.syncCountBadge, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.syncCountText}>
                  {syncToNarrativeResult.changedClauses.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Action 2: Narrative -> Fields */}
          <TouchableOpacity
            style={[
              styles.syncActionBtn,
              syncToFieldsResult.differingCount > 0
                ? { backgroundColor: isDark ? '#064e3b' : '#f0fdf4', borderColor: '#10b981' }
                : { backgroundColor: theme.surface, borderColor: theme.border, opacity: 0.65 },
            ]}
            onPress={onRequestAutoFill}
            disabled={!formData.narrative || formData.narrative.length < 15}
            activeOpacity={0.7}
          >
            <Ionicons
              name="flash-outline"
              size={14}
              color={syncToFieldsResult.differingCount > 0 ? '#16a34a' : theme.textMuted}
            />
            <Text
              style={[
                styles.syncActionBtnText,
                { color: syncToFieldsResult.differingCount > 0 ? '#15803d' : theme.textMuted },
              ]}
            >
              Sync Fields from Narrative
            </Text>
            {syncToFieldsResult.differingCount > 0 && (
              <View style={[styles.syncCountBadge, { backgroundColor: '#16a34a' }]}>
                <Text style={styles.syncCountText}>
                  {syncToFieldsResult.differingCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Incident Description & Narrative of Offence *</Text>
        <TextInput
          style={[styles.input, styles.textAreaLarge, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
          placeholder="Describe detailed sequence of events, specific overt acts of the accused, weapon/mode used, and damages/injuries..."
          placeholderTextColor={theme.textMuted}
          value={formData.narrative || ''}
          onChangeText={(value) => onChange('narrative', value)}
          multiline
          numberOfLines={4}
        />

        <DraftingCoPilot
          text={formData.narrative || ''}
          onApplySuggestion={(improved) => onChange('narrative', improved)}
          onInsertSection={(sec) => {
            const current = formData.narrative || '';
            onChange('narrative', current ? `${current}\n\n[Applicable: ${sec}]` : sec);
          }}
          mode="fir"
          metadata={{
            date: formData.offenceDate,
            time: formData.offenceTime,
            location: formData.address,
          }}
          onRequestAutoFill={onRequestAutoFill}
        />

        {/* Voice Dictation */}
        <VoiceDictation
          onTranscript={(text, isFinal) => {
            if (isFinal) {
              // Append final speech to existing narrative with a space
              const current = (formData.narrative || '').trimEnd();
              onChange('narrative', current ? `${current} ${text}` : text);
            }
            // Partial results are shown in the VoiceDictation UI itself
          }}
        />
      </View>

      {/* Structured Particulars (Accused, Property, MLC) */}
      <View style={[styles.subSectionBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
        <Text style={[styles.subSectionTitle, { color: theme.textPrimary }]}>
          Structured Accused & Evidentiary Particulars
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Accused Details & Modus Operandi</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="Suspect count, physical description, weapons, vehicle registration..."
            placeholderTextColor={theme.textMuted}
            value={formData.accusedDetails || ''}
            onChangeText={(value) => onChange('accusedDetails', value)}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Stolen / Dispossessed Property</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="Articles, brand, serial/IMEI..."
              placeholderTextColor={theme.textMuted}
              value={formData.stolenProperties || ''}
              onChangeText={(value) => onChange('stolenProperties', value)}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Estimated Value / Loss</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="e.g. Rs. 2,50,000"
              placeholderTextColor={theme.textMuted}
              value={formData.stolenValue || ''}
              onChangeText={(value) => onChange('stolenValue', value)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Medical / MLC / Inquest Ref</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="Hospital MLC No., medical injury reference..."
            placeholderTextColor={theme.textMuted}
            value={formData.inquestReportNo || ''}
            onChangeText={(value) => onChange('inquestReportNo', value)}
          />
        </View>
      </View>

      {/* Update Narrative Confirmation Modal */}
      <UpdateNarrativeModal
        visible={updateModalVisible}
        onClose={() => setUpdateModalVisible(false)}
        currentNarrative={formData.narrative || ''}
        proposedNarrative={syncToNarrativeResult.updatedNarrative}
        changedClauses={syncToNarrativeResult.changedClauses}
        onConfirmApply={(newNarrative) => {
          setPreviousNarrative(formData.narrative || '');
          onChange('narrative', newNarrative);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    height: 110,
    textAlignVertical: 'top',
  },
  subSectionBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  syncBar: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  syncBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncBarTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncBarTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  undoRow: {
    flexDirection: 'row',
    gap: 6,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  undoBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  syncBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  syncActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  syncActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  syncCountBadge: {
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  syncCountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});

export default OffenceDetailsCard;