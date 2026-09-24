import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function PreviousWinnersCarousel({ winners }) {
  if (!winners?.length) return null;
  return (
    <View>
      <Text style={styles.title}>Previous Winners</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {winners.map((winner, index) => (
          <TouchableOpacity
            key={`${winner.name}-${index}`}
            style={styles.item}
            onPress={() => Alert.alert(winner.name, winner.videoUrl || 'Highlight video not available in this demo.')}
          >
            <View>
              <Image source={{ uri: winner.thumbnailUrl || 'https://via.placeholder.com/96' }} style={styles.thumb} />
              <View style={styles.playOverlay}>
                <Ionicons name="play-circle" size={26} color="#fff" />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>{winner.name}</Text>
            <Text style={styles.position}>{winner.position}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  row: { gap: 12 },
  item: { width: 92 },
  thumb: { width: 92, height: 110, borderRadius: 12, backgroundColor: colors.chipBackground },
  playOverlay: { position: 'absolute', top: 36, left: 32 },
  name: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, marginTop: 6 },
  position: { fontSize: 11, color: colors.textSecondary },
});
