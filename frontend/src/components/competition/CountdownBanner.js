import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useCountdown } from '../../hooks/useCountdown';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function CountdownBanner({ countdown }) {
  const duration = useCountdown(countdown?.targetDate);
  if (!countdown) return null;

  return (
    <View style={[styles.banner, countdown.urgent && styles.urgent]}>
      <View style={styles.left}>
        <MaterialCommunityIcons name="timer-sand" size={16} color={colors.primary} />
        <Text style={styles.label}>{countdown.label}</Text>
      </View>
      <Text style={styles.time}>
        {duration.isOver ? '00d : 00h : 00m : 00s' : `${pad(duration.days)}d : ${pad(duration.hours)}h : ${pad(duration.minutes)}m : ${pad(duration.seconds)}s`}
      </Text>
      {countdown.urgent ? (
        <View style={styles.hurryRow}>
          <Ionicons name="alarm-outline" size={13} color={colors.warning} />
          <Text style={styles.hurryText}>Hurry up!</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primaryLight, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, flexWrap: 'wrap', rowGap: 6 },
  urgent: { backgroundColor: colors.warningLight },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  time: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  hurryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hurryText: { fontSize: 12, fontWeight: '700', color: colors.warning },
});
