import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Badge from '../common/Badge';

export default function CompetitionHeaderCard({ competition }) {
  const { title, tags, badges, prizePool, entryFee, spots, userState } = competition;
  const spotsPercent = Math.min(spots.percentFilled, 100);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {userState.statusPill ? (
          <View style={styles.pill}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            <Text style={styles.pillText}>{userState.statusPill}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <Badge key={tag} label={tag} tone="neutral" />
        ))}
        {badges.map((badge) => (
          <View key={badge} style={styles.badgeInline}>
            <MaterialCommunityIcons name="trophy-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.badgeInlineText}>{badge}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Prize Pool</Text>
          <Text style={styles.statValuePrimary}>₹ {prizePool.toLocaleString('en-IN')}</Text>
        </View>
        <View>
          <Text style={styles.statLabel}>Entry Fee</Text>
          <Text style={styles.statValue}>₹ {entryFee.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.spotsBlock}>
          <View style={styles.spotsRow}>
            <Ionicons name="people-outline" size={14} color={colors.primary} />
            <Text style={styles.spotsLabel}>{spots.isFull ? 'Competition Full' : `Only ${spots.spotsLeft} spots left`}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(spotsPercent, 4)}%` }]} />
          </View>
          <Text style={styles.spotsSubtext}>
            {spots.registeredCount} / {spots.maxParticipants} Booked
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontSize: 19, fontWeight: '800', color: colors.textPrimary, flex: 1 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  pillText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  badgeInline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeInlineText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', marginTop: 18, gap: 20 },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statValuePrimary: { fontSize: 18, fontWeight: '800', color: colors.primary },
  spotsBlock: { flex: 1 },
  spotsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6, justifyContent: 'flex-end' },
  spotsLabel: { fontSize: 12, fontWeight: '700', color: colors.primary },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: colors.chipBackground, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  spotsSubtext: { fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'right' },
});
