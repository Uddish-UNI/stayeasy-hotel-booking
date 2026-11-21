// Register screen: creates a new Firebase account, then saves the user's name on it.
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
import PhotoBackground from '../components/PhotoBackground';

export default function RegisterScreen() {
  // One slot per field: what the user typed. errors = red messages, loading = button locked while waiting.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Runs when Sign Up is pressed.
  async function handleRegister() {
    // 1. Check every field on the phone first. Each check gives an error message, or null if OK.
    const newErrors = {
      name: getNameError(name),
      email: getEmailError(email),
      password: getPasswordError(password),
      confirm: confirm !== password ? 'Passwords do not match.' : null,
    };
    setErrors(newErrors);
    // 2. If ANY field has a message, stop here. Firebase is not contacted.
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      // 3. Create the account (Firebase only stores email + password)...
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail(email), password);
      // 4. ...then attach the user's name to it, shown on Home and Profile.
      await updateProfile(credential.user, { displayName: cleanName(name) });
      // Creating an account also logs the user in, so go straight to Home.
      router.replace('/home');
    } catch (error) {
      Alert.alert('Registration failed', friendlyAuthError(error));
    } finally {
      setLoading(false);  // unlock the button whether it worked or failed
    }
  }

  return (
    <View style={styles.root}>
      <PhotoBackground />
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
            {/* Live checklist: each rule turns green as the password meets it */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: {
    fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 },
  },
  subtitle: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.85)', marginBottom: 20, marginTop: 4 },
  card: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 20 },
  button: { backgroundColor: '#2563EB', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});