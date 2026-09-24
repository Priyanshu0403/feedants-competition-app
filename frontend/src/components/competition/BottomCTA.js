import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';

export default function BottomCTA({ userState, onPress, loading }) {
  const disabled = userState.ctaDisabled || loading;
  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.85} style={[styles.button, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.label}>{userState.ctaLabel}</Text>
            {userState.statusPill ? <Text style={styles.subLabel}>{userState.statusPill}</Text> : null}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
  button: { backgroundColor: colors.primaryDark, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  label: { color: '#fff', fontSize: 15, fontWeight: '800' },
  subLabel: { color: '#DDEEE9', fontSize: 11, marginTop: 2 },
});
