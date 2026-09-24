import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function JudgeCard({ judge }) {
  if (!judge) return null;
  return (
    <View style={styles.card}>
      <Image source={{ uri: judge.photoUrl || 'https://via.placeholder.com/64' }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.role}>Judge</Text>
        <Text style={styles.name}>{judge.name}</Text>
        {judge.title ? <Text style={styles.title}>{judge.title}</Text> : null}
      </View>
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => Alert.alert('Intro Video', judge.introVideoUrl || 'Video not available in this demo.')}
      >
        <Ionicons name="play-circle" size={34} color={colors.primary} />
        <Text style={styles.playLabel}>Intro Video</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.chipBackground },
  info: { flex: 1 },
  role: { fontSize: 12, color: colors.textSecondary },
  name: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginTop: 1 },
  title: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  playButton: { alignItems: 'center', gap: 2 },
  playLabel: { fontSize: 11, color: colors.textSecondary },
});
