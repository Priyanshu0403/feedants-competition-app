import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../theme/colors';

export default function ReferralCard({ referralCode }) {
  const link = referralCode ? `https://feedants.com/r/${referralCode}` : 'https://feedants.com/r/guest';

  const copyLink = async () => {
    await Clipboard.setStringAsync(link);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="megaphone-outline" size={20} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Refer & Earn more discount</Text>
          <Text style={styles.subtitle}>You earn ₹10 for every signup</Text>
        </View>
      </View>
      <View style={styles.linkRow}>
        <Text style={styles.link} numberOfLines={1}>{link}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={copyLink}>
          <Text style={styles.copyLabel}>Copy Link</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.referButton} onPress={() => Share.share({ message: `Join me on Feedants! ${link}` })}>
        <Text style={styles.referLabel}>Refer Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primaryLight, borderRadius: 16, padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingLeft: 12, paddingRight: 4, paddingVertical: 4 },
  link: { flex: 1, fontSize: 12, color: colors.textSecondary },
  copyButton: { paddingHorizontal: 10, paddingVertical: 8 },
  copyLabel: { fontSize: 12, fontWeight: '700', color: colors.primary },
  referButton: { backgroundColor: colors.primaryDark, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  referLabel: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
