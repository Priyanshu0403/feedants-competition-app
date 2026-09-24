import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import PrimaryButton from './PrimaryButton';

export default function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && <PrimaryButton label="Try Again" onPress={onRetry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 24, gap: 12 },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  message: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 8 },
});
