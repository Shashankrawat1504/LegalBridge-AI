import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
}

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  decided:              { bg: '#DCFCE7', text: '#166534', label: 'Decided' },
  assigned:             { bg: '#DBEAFE', text: '#1E40AF', label: 'Assigned' },
  closed:               { bg: '#FEE2E2', text: '#991B1B', label: 'Closed' },
  'under-investigation':{ bg: '#FEF3C7', text: '#92400E', label: 'Under Investigation' },
  pending:              { bg: '#F3F4F6', text: '#374151', label: 'Pending' },
  appealed:             { bg: '#EDE9FE', text: '#5B21B6', label: 'Appealed' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const key = status.toLowerCase().trim();
  const config = STATUS_MAP[key] ?? {
    bg: '#F1F5F9',
    text: '#334155',
    label: status.charAt(0).toUpperCase() + status.slice(1),
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.text + '33' }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default StatusBadge;