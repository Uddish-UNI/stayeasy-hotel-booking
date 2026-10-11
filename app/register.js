import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import AuthInput, { PasswordChecklist } from '../components/AuthInput';
import {
  cleanEmail, cleanName, getEmailError, getPasswordError, getNameError, friendlyAuthError,
} from '../utils/authRules';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const newErrors = {
      name: getNameError(name),
      email: getEmailError(email),
      password: getPasswordError(password),
      confirm: confirm !== password ? 'Passwords do not match.' : null,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail(email), password);
      await updateProfile(credential.user, { displayName: cleanName(name) });
      router.replace('/home');
    } catch (error) {
      Alert.alert('Registration failed', friendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Join StayEasy</Text>
        <Text style={styles.subtitle}>Create an account to book your stay</Text>

        <View style={styles.card}>
          <AuthInput
            icon="person-outline"
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
          />
          <AuthInput
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            error={errors.email}
          />
          <AuthInput
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secure
            error={errors.password}
          />
          <PasswordChecklist password={password} />
          <AuthInput
            icon="shield-checkmark-outline"
            placeholder="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secure
            error={errors.confirm}
          />

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#EAF4FF' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#0F172A' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#64748B', marginBottom: 20, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  button: { backgroundColor: '#2563EB', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});