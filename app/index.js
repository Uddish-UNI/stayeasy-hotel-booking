import { useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { router } from 'expo-router';
import { auth } from '../services/firebaseConfig';
import AuthInput from '../components/AuthInput';
import { cleanEmail, getEmailError, friendlyAuthError } from '../utils/authRules';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { user, initializing } = useAuth();

  // If Firebase already has a saved session, skip the login screen.
  useEffect(() => {
    if (!initializing && user) router.replace('/home');
  }, [user, initializing]); 

  async function handleLogin() {
    const newErrors = {
      email: getEmailError(email),
      password: password ? null : 'Please enter your password.',
    };
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, cleanEmail(email), password);
      router.replace('/home');
    } catch (error) {
      Alert.alert('Login failed', friendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const emailError = getEmailError(email);
    if (emailError) {
      setErrors({ email: 'Type your email above first, then tap "Forgot password?".' });
      return;
    }
    setErrors({});
    try {
      await sendPasswordResetEmail(auth, cleanEmail(email));
    } catch (error) {
      if (error.code === 'auth/network-request-failed') {
        Alert.alert('No connection', friendlyAuthError(error));
        return;
      }
      // For any other error we still show the same message below, so nobody
      // can use this screen to discover which emails have accounts.
    }
    Alert.alert(
      'Check your email',
      'If an account exists for ' + cleanEmail(email) + ', we have sent a password reset link. Check your inbox and spam folder.'
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoCircle}>
          <Ionicons name="bed" size={36} color="#fff" />
        </View>
        <Text style={styles.title}>StayEasy</Text>
        <Text style={styles.subtitle}>Your escape in Mauritius starts here</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>

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

          <Pressable onPress={handleForgotPassword} style={styles.forgot}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.bottomText}>
            Don't have an account? <Text style={styles.link}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#EAF4FF' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12,
  },
  title: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', color: '#0F172A' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#64748B', marginBottom: 24, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  forgot: { alignSelf: 'flex-end', marginBottom: 16 },
  button: { backgroundColor: '#2563EB', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#2563EB', fontWeight: '600', fontSize: 14 },
  bottomText: { textAlign: 'center', color: '#64748B', fontSize: 14 },
});