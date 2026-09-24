import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';

export default function PrimaryButton({ label, onPress, disabled, loading, variant = 'solid' }) {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, isOutline ? styles.outline : styles.solid, (disabled || loading) && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.label, isOutline ? { color: colors.primary } : { color: '#fff' }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  solid: { backgroundColor: colors.primaryDark },
  outline: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.primary },
  disabled: { opacity: 0.5 },
  label: { fontSize: 14, fontWeight: '700' },
});
