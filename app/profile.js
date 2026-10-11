import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, fontSize, radius } from '../constants/theme';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }
    // Load this user's saved photo (each user has their own storage key).
    AsyncStorage.getItem(`avatar:${user.uid}`).then((saved) => {
      if (saved) setPhoto(saved);
    });
  }, [user]);

  if (!user) {
    return null;
  }

  async function handleTakePhoto() {
    // Runtime permission: Android shows "Allow StayEasy to take pictures?"
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a profile photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2, // small file: this is only an avatar
      base64: true,
    });
    if (result.canceled || !result.assets[0].base64) return;

    const dataUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
    setPhoto(dataUri);
    await AsyncStorage.setItem(`avatar:${user.uid}`, dataUri);
  }

  async function handleRemovePhoto() {
    setPhoto(null);
    await AsyncStorage.removeItem(`avatar:${user.uid}`);
  }

  const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <Pressable onPress={handleTakePhoto} style={styles.avatarWrapper}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}
        <View style={styles.cameraBadge}>
          <Text style={{ fontSize: 16 }}>📷</Text>
        </View>
      </Pressable>

      <Text style={styles.name}>{user.displayName || 'Guest'}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <Pressable style={styles.button} onPress={handleTakePhoto}>
        <Text style={styles.buttonText}>{photo ? 'Retake Photo' : 'Take Profile Photo'}</Text>
      </Pressable>

      {photo ? (
        <Pressable onPress={handleRemovePhoto}>
          <Text style={styles.remove}>Remove photo</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl },
  avatarWrapper: { width: 120, height: 120 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.border },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  initial: { color: '#fff', fontSize: 48, fontWeight: '800' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  email: { fontSize: fontSize.md, color: colors.textMuted, marginBottom: spacing.lg },
  button: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: spacing.xl, borderRadius: radius.sm },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
  remove: { color: colors.danger, fontWeight: '600', marginTop: spacing.md },
});