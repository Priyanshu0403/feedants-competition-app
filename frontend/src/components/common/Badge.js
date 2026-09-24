import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const TONES = {
  neutral: { bg: colors.chipBackground, text: colors.textSecondary },
  primary: { bg: colors.primaryLight, text: colors.primary },
  warning: { bg: colors.warningLight, text: colors.warning },
};

export default function Badge({ label, tone = 'neutral' }) {
  const toneStyle = TONES[tone] || TONES.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.bg }]}>
      <Text style={[styles.text, { color: toneStyle.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600' },
});
