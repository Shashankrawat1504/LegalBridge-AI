import React from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TagList from './TagList';
import StatusBadge from './StatusBadge';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, RADIUS } from '../../constants/theme';

interface CaseItem {
  id: number;
  caseHeading: string;
  query: string;
  applicableArticle?: string;
  description: string;
  status: string;
  tags?: string;
}

interface CaseModalProps {
  visible: boolean;
  caseItem: CaseItem | null;
  isEditing: boolean;
  editedData: Partial<CaseItem>;
  onClose: () => void;
  onEditToggle: () => void;
  onSave: () => void;
  onInputChange: (name: string, value: string) => void;
  onRemoveTag: (index: number) => void;
}

const CaseModal: React.FC<CaseModalProps> = ({
  visible,
  caseItem,
  isEditing,
  editedData,
  onClose,
  onEditToggle,
  onSave,
  onInputChange,
  onRemoveTag,
}) => {
  const { theme, isDark } = useTheme();

  if (!caseItem) return null;

  /** Render article list — handles both comma-separated plain text and **bold** markdown */
  const renderApplicableArticles = () => {
    if (!caseItem.applicableArticle) return null;

    const raw = caseItem.applicableArticle;
    // Try markdown bold format first (** wrapped)
    const boldParts = raw.split('**').filter((_, i) => i % 2 !== 0);
    const articles = boldParts.length > 0
      ? boldParts
      : raw.split(/[,，]/).map((a) => a.trim()).filter(Boolean);

    return (
      <View style={[styles.articlesContainer, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
        {articles.map((article, index) => (
          <Text key={index} style={[styles.articleText, { color: theme.textSecondary }]}>
            • {article.trim()}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={[styles.closeIconWrap, { backgroundColor: theme.surfaceMuted }]}>
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={[styles.modalIconWrap, { backgroundColor: isDark ? '#1E3A5F22' : '#EFF6FF' }]}>
                <Ionicons name="library-outline" size={22} color={isDark ? '#60A5FA' : COLORS.navyGov} />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={[styles.modalLabel, { color: theme.textMuted }]}>
                  {isEditing ? 'EDITING CASE' : 'CASE DETAILS'}
                </Text>
                <StatusBadge status={caseItem.status} />
              </View>
            </View>

            {/* Case Heading */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>CASE HEADING</Text>
              {isEditing ? (
                <TextInput
                  value={editedData.caseHeading || ''}
                  onChangeText={(text) => onInputChange('caseHeading', text)}
                  style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  placeholder="Enter case heading"
                  placeholderTextColor={theme.textMuted}
                />
              ) : (
                <Text style={[styles.headingText, { color: theme.textPrimary }]}>{caseItem.caseHeading}</Text>
              )}
            </View>

            {/* Query */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>LEGAL QUESTION</Text>
              {isEditing ? (
                <TextInput
                  value={editedData.query || ''}
                  onChangeText={(text) => onInputChange('query', text)}
                  style={[styles.input, styles.multilineInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  multiline
                  placeholder="Enter case query"
                  placeholderTextColor={theme.textMuted}
                />
              ) : (
                <Text style={[styles.valueText, { color: theme.textSecondary }]}>{caseItem.query}</Text>
              )}
            </View>

            {/* Applicable Articles */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>APPLICABLE ARTICLES / SECTIONS</Text>
              {isEditing ? (
                <TextInput
                  value={editedData.applicableArticle || ''}
                  onChangeText={(text) => onInputChange('applicableArticle', text)}
                  style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  placeholder="E.g. Article 21, Section 377 IPC"
                  placeholderTextColor={theme.textMuted}
                />
              ) : (
                renderApplicableArticles() || (
                  <Text style={[styles.noDataText, { color: theme.textMuted }]}>No articles specified</Text>
                )
              )}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>JUDGMENT SUMMARY</Text>
              <Text style={[styles.valueText, { color: theme.textSecondary }]}>{caseItem.description}</Text>
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>TAGS</Text>
              {isEditing ? (
                <TagList tags={editedData.tags} editable onRemoveTag={onRemoveTag} />
              ) : (
                <TagList tags={caseItem.tags} />
              )}
            </View>

            {/* Status (edit only) */}
            {isEditing && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>STATUS</Text>
                <TextInput
                  value={editedData.status || ''}
                  onChangeText={(text) => onInputChange('status', text)}
                  style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  placeholder="E.g. Decided, Pending"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            )}

            {/* Actions */}
            <View style={[styles.actions, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                onPress={onEditToggle}
                style={[styles.editButton, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
              >
                <Ionicons
                  name={isEditing ? 'close-outline' : 'create-outline'}
                  size={16}
                  color={theme.textSecondary}
                />
                <Text style={[styles.editButtonText, { color: theme.textSecondary }]}>
                  {isEditing ? 'Cancel' : 'Edit Case'}
                </Text>
              </TouchableOpacity>

              {isEditing && (
                <TouchableOpacity onPress={onSave} style={styles.saveButton}>
                  <Ionicons name="checkmark-outline" size={16} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 540,
    borderRadius: RADIUS.xl,
    padding: 24,
    maxHeight: '88%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    paddingRight: 40,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
    gap: 4,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  headingText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  valueText: {
    fontSize: 15,
    lineHeight: 23,
  },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  articlesContainer: {
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 4,
  },
  articleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CaseModal;