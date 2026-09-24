import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const ICONS = {
  1: { name: 'trophy', color: colors.gold },
  2: { name: 'medal', color: colors.silver },
  3: { name: 'medal-outline', color: colors.bronze },
};

export default function RewardsList({ rewards }) {
  if (!rewards?.length) return null;
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Rewards</Text>
        <Text style={styles.subtitle}>(All Positions)</Text>
      </View>
      {rewards.map((reward) => {
        const iconMeta = ICONS[reward.position];
        return (
          <View key={reward.position} style={styles.row}>
            <View style={styles.rowLeft}>
              {iconMeta ? (
                <MaterialCommunityIcons name={iconMeta.name} size={18} color={iconMeta.color} />
              ) : (
                <Ionicons name="star-outline" size={18} color={colors.textMuted} />
              )}
              <Text style={styles.label}>{reward.label}</Text>
            </View>
            <Text style={styles.amount}>₹ {reward.amount.toLocaleString('en-IN')}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 },
  title: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  amount: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
});
