import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// The language switch is presentational only in this build (no i18n
// strings are wired up yet) — see README > "What I'd improve".
export default function TopBar({ onBack }) {
  const [lang, setLang] = useState('ENG');
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.backRow} onPress={onBack} hitSlop={8}>
        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backLabel}>Go back</Text>
      </TouchableOpacity>
      <View style={styles.langSwitch}>
        {['ENG', 'हिंदी'].map((option) => (
          <TouchableOpacity key={option} onPress={() => setLang(option)} style={[styles.langOption, lang === option && styles.langOptionActive]}>
            <Text style={[styles.langText, lang === option && styles.langTextActive]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backLabel: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  langSwitch: { flexDirection: 'row', backgroundColor: colors.chipBackground, borderRadius: 20, padding: 3 },
  langOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18 },
  langOptionActive: { backgroundColor: colors.primaryDark },
  langText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  langTextActive: { color: '#fff' },
});
