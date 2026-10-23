import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/theme';

interface DatePickerFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  placeholder = 'DD/MM/YYYY',
  required = false,
  onChange,
}) => {
  const { isDark, theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Parse current date or default to today for picker dialog
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState(
    value ? value.split('/')[0] : String(now.getDate())
  );
  const [selectedMonth, setSelectedMonth] = useState(
    value ? value.split('/')[1] : String(now.getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(
    value ? value.split('/')[2] : String(now.getFullYear())
  );

  const handleApplyModalDate = () => {
    const dd = selectedDay.padStart(2, '0');
    const mm = selectedMonth.padStart(2, '0');
    const yyyy = selectedYear;
    onChange(`${dd}/${mm}/${yyyy}`);
    setModalVisible(false);
  };

  const displayValue = value || placeholder;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label} {required && '*'}
      </Text>

      <View style={styles.datePickerAnchor}>
        <TouchableOpacity
          style={[
            styles.dateButton,
            { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={value ? (isDark ? '#60A5FA' : COLORS.navyGov) : theme.textMuted}
          />
          <Text
            style={[
              styles.dateButtonText,
              { color: value ? theme.textPrimary : theme.textMuted },
            ]}
          >
            {displayValue}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Native HTML5 date input overlay for Web browser */}
        {Platform.OS === 'web' && (
          <input
            type="date"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            } as any}
            onChange={(e: any) => {
              const val = e.target.value;
              if (val) {
                const parts = val.split('-');
                if (parts.length === 3) {
                  onChange(`${parts[2]}/${parts[1]}/${parts[0]}`);
                }
              }
            }}
          />
        )}
      </View>

      {/* Date Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="calendar" size={20} color={COLORS.navyGov} />
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Date</Text>
            </View>

            <View style={styles.modalBodyRow}>
              {/* Day Picker */}
              <View style={styles.pickerCol}>
                <Text style={[styles.colLabel, { color: theme.textSecondary }]}>Day</Text>
                <View style={[styles.modalPickerWrap, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
                  <Picker
                    selectedValue={selectedDay}
                    onValueChange={(val) => setSelectedDay(String(val))}
                    style={[styles.modalPicker, { color: theme.textPrimary }]}
                  >
                    {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                      <Picker.Item key={d} label={d.padStart(2, '0')} value={d} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Month Picker */}
              <View style={styles.pickerCol}>
                <Text style={[styles.colLabel, { color: theme.textSecondary }]}>Month</Text>
                <View style={[styles.modalPickerWrap, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
                  <Picker
                    selectedValue={selectedMonth}
                    onValueChange={(val) => setSelectedMonth(String(val))}
                    style={[styles.modalPicker, { color: theme.textPrimary }]}
                  >
                    {[
                      'Jan (01)', 'Feb (02)', 'Mar (03)', 'Apr (04)',
                      'May (05)', 'Jun (06)', 'Jul (07)', 'Aug (08)',
                      'Sep (09)', 'Oct (10)', 'Nov (11)', 'Dec (12)',
                    ].map((m, idx) => (
                      <Picker.Item key={m} label={m} value={String(idx + 1)} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Year Picker */}
              <View style={styles.pickerCol}>
                <Text style={[styles.colLabel, { color: theme.textSecondary }]}>Year</Text>
                <View style={[styles.modalPickerWrap, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
                  <Picker
                    selectedValue={selectedYear}
                    onValueChange={(val) => setSelectedYear(String(val))}
                    style={[styles.modalPicker, { color: theme.textPrimary }]}
                  >
                    {Array.from({ length: 10 }, (_, i) => String(now.getFullYear() - i)).map((y) => (
                      <Picker.Item key={y} label={y} value={y} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: theme.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnConfirm}
                onPress={handleApplyModalDate}
              >
                <Text style={styles.modalBtnConfirmText}>Set Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  datePickerAnchor: {
    position: 'relative',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBodyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  pickerCol: {
    flex: 1,
  },
  colLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalPickerWrap: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalPicker: {
    height: 44,
    width: '100%',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnConfirm: {
    backgroundColor: COLORS.navyGov,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DatePickerField;
