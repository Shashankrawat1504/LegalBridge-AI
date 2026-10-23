import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, RADIUS } from '../../constants/theme';
import DatePickerField from './DatePickerField';

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

interface FIRDetailsCardProps {
  formData: {
    state?: string;
    district: string;
    policeStation: string;
    year: string;
    firNo: string;
    date: string;
  };
  onChange: (name: string, value: string) => void;
}

const FIRDetailsCard: React.FC<FIRDetailsCardProps> = ({ formData, onChange }) => {
  const { isDark, theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderWidth: 1, borderColor: theme.border }]}>
      <View style={[styles.cardHeader, { borderBottomColor: theme.border }]}>
        <Ionicons name="shield-checkmark" size={20} color={isDark ? '#D97706' : '#1e3a8a'} />
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>FIR Details</Text>
      </View>

      {/* Row 1: State / UT and District */}
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>State / UT *</Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
            ]}
          >
            <Picker
              selectedValue={formData.state || ''}
              onValueChange={(value) => onChange('state', value)}
              style={[
                styles.picker,
                { color: formData.state ? theme.textPrimary : theme.textMuted },
              ]}
              dropdownIconColor={theme.textPrimary}
            >
              <Picker.Item label="Select State / UT *" value="" color={theme.textMuted} />
              {INDIAN_STATES.map((st) => (
                <Picker.Item key={st} label={st} value={st} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>District *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="Enter district"
            placeholderTextColor={theme.textMuted}
            value={formData.district}
            onChangeText={(value) => onChange('district', value)}
          />
        </View>
      </View>

      {/* Row 2: Police Station and FIR Number */}
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Police Station *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="Enter police station"
            placeholderTextColor={theme.textMuted}
            value={formData.policeStation}
            onChangeText={(value) => onChange('policeStation', value)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>FIR No. *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="Enter FIR number"
            placeholderTextColor={theme.textMuted}
            value={formData.firNo}
            onChangeText={(value) => onChange('firNo', value)}
          />
        </View>
      </View>

      {/* Row 3: Year and Date Picker */}
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Year</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="Enter year"
            placeholderTextColor={theme.textMuted}
            value={formData.year}
            onChangeText={(value) => onChange('year', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <DatePickerField
            label="Date"
            value={formData.date}
            placeholder="DD/MM/YYYY"
            required
            onChange={(value) => onChange('date', value)}
          />
        </View>
      </View>
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
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
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
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#1f2937',
    minHeight: 44,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 44,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    width: '100%',
  },
});

export default FIRDetailsCard;
