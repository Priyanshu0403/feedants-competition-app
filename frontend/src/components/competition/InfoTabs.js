import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const TABS = [
  { key: 'about', label: 'About Competition' },
  { key: 'judgingParameters', label: 'Judging Parameters' },
  { key: 'rulesAndEligibility', label: 'Rules & Eligibility' },
];

export default function InfoTabs({ description }) {
  const [active, setActive] = useState('about');
  const [expanded, setExpanded] = useState(false);
  const text = description?.[active] || 'No details provided yet.';
  const isLong = text.length > 140;
  const displayText = expanded || !isLong ? text : `${text.slice(0, 140)}…`;

  return (
    <View style={styles.card}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              setActive(tab.key);
              setExpanded(false);
            }}
            style={styles.tabButton}
          >
            <Text style={[styles.tabLabel, active === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
            {active === tab.key ? <View style={styles.tabIndicator} /> : null}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.body}>{displayText}</Text>
      {isLong ? (
        <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
          <Text style={styles.viewMore}>{expanded ? 'View less' : 'View more'}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  tabRow: { flexDirection: 'row', gap: 20, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 12, paddingBottom: 10 },
  tabButton: { paddingBottom: 4 },
  tabLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  tabLabelActive: { color: colors.primary, fontWeight: '800' },
  tabIndicator: { height: 2, backgroundColor: colors.primary, marginTop: 6, borderRadius: 1 },
  body: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  viewMore: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 8 },
});
