import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import PrimaryButton from '../components/common/PrimaryButton';

// Sign-up UI is intentionally out of scope for this assignment (the brief
// is the Competition Details screen) — the backend fully supports
// POST /api/auth/register though. Two demo accounts are seeded so both the
// "already registered" and "fresh user" flows can be exercised immediately.
export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('registered@feedants.dev');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (overrideEmail) => {
    try {
      setLoading(true);
      await signIn(overrideEmail || email, password);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Feedants</Text>
        <Text style={styles.subtitle}>Sign in to view competitions</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />

        <PrimaryButton label="Sign In" onPress={() => handleLogin()} loading={loading} />

        <Text style={styles.helper}>Demo accounts (password: password123)</Text>
        <PrimaryButton
          variant="outline"
          label="registered@feedants.dev — already registered"
          onPress={() => handleLogin('registered@feedants.dev')}
        />
        <PrimaryButton
          variant="outline"
          label="new@feedants.dev — fresh user"
          onPress={() => handleLogin('new@feedants.dev')}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 12 },
  brand: { fontSize: 28, fontWeight: '900', color: colors.primaryDark, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, height: 50, fontSize: 14, color: colors.textPrimary },
  helper: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 20, marginBottom: 4 },
});
