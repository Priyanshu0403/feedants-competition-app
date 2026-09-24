import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { formatDateTime } from '../../utils/format';

const ITEMS = [
  { key: 'registrationEnd', label: 'Register Before', icon: (c) => <Ionicons name="calendar-outline" size={16} color={c} /> },
  { key: 'submissionStart', label: 'Submission Starts', icon: (c) => <Feather name="send" size={15} color={c} /> },
  { key: 'submissionEnd', label: 'Submission Ends', icon: (c) => <Feather name="upload" size={15} color={c} /> },
  { key: 'resultDate', label: 'Result Date', icon: (c) => <MaterialCommunityIcons name="trophy-outline" size={16} color={c} /> },
];

export default function ImportantDatesGrid({ dates }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Important Dates</Text>
      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <View key={item.key} style={styles.cell}>
            {item.icon(colors.primary)}
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{formatDateTime(dates[item.key])}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { flexDirection: 'row', alignItems: 'flex-start', width: '50%', marginBottom: 16, paddingRight: 8 },
  label: { fontSize: 12, color: colors.textSecondary },
  value: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
});
