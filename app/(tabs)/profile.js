import { useCallback, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings, MONTHS } from '../../services/bookingQueries';
import BookingCard from '../../components/BookingCard';
import { colors, spacing, fontSize, radius } from '../../constants/theme';

function memberSince(user) {
  const created = user.metadata?.creationTime;
  if (!created) return '';
  const d = new Date(created);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Reload the photo and bookings every time this tab is opened.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      AsyncStorage.getItem(`avatar:${user.uid}`).then((saved) => setPhoto(saved || null));
      getUserBookings(user.uid).then(setBookings).catch(() => setBookings([]));
    }, [user])
  );

  if (!user) return null;

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
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
  const totalNights = bookings.reduce((sum, b) => sum + (Number(b.nights) || 0), 0);
  const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  const recent = [...bookings].sort((a, b) => b.checkIn.localeCompare(a.checkIn)).slice(0, 3);
  const since = memberSince(user);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.hero}>
        <Pressable onPress={handleTakePhoto} style={styles.avatarWrapper}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]}>
              <Text style={styles.initial}>{initial}</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={18} color={colors.primary} />
          </View>
        </Pressable>

        <Text style={styles.name}>{user.displayName || 'Guest'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {since ? <Text style={styles.since}>Member since {since}</Text> : null}

        <View style={styles.photoActions}>
          <Pressable style={styles.smallButton} onPress={handleTakePhoto}>
            <Text style={styles.smallButtonText}>{photo ? 'Retake Photo' : 'Take Profile Photo'}</Text>
          </Pressable>
          {photo ? (
            <Pressable onPress={handleRemovePhoto}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalNights}</Text>
          <Text style={styles.statLabel}>Nights</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalSpent}</Text>
          <Text style={styles.statLabel}>Total spent</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent bookings</Text>
        {bookings.length > 0 ? (
          <Pressable onPress={() => router.push('/bookings')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        ) : null}
      </View>

      {recent.length === 0 ? (
        <Text style={styles.empty}>No bookings yet. Your reservations will appear here.</Text>
      ) : (
        recent.map((b) => <BookingCard key={b.id} booking={b} compact />)
      )}

      <Pressable style={styles.logout} onPress={() => signOut(auth)}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', backgroundColor: colors.card, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatarWrapper: { width: 110, height: 110 },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.border },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  initial: { color: '#fff', fontSize: 44, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  email: { fontSize: fontSize.md, color: colors.textMuted, marginTop: 2 },
  since: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 },
  photoActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  smallButton: { backgroundColor: '#EFF6FF', paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: 20 },
  smallButtonText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.sm },
  remove: { color: colors.danger, fontWeight: '600', fontSize: fontSize.sm },

  stats: { flexDirection: 'row', gap: spacing.sm + 2, padding: spacing.md },
  stat: { flex: 1, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: fontSize.xl, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.md, marginBottom: spacing.sm + 4 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  seeAll: { color: colors.primary, fontWeight: '600' },
  empty: { marginHorizontal: spacing.md, color: colors.textMuted, fontSize: fontSize.md },

  logout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: spacing.md, marginTop: spacing.lg, paddingVertical: 14,
    borderRadius: radius.md, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2',
  },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: fontSize.md },
});