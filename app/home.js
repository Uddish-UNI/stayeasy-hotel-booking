import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { hotels, rooms } from '../data/hotels';
import HotelCard from '../components/HotelCard';
import RoomCard from '../components/RoomCard';
import { colors, spacing, fontSize } from '../constants/theme';

export default function HomeScreen() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const header = (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user.displayName || user.email}!</Text>
        <View style={styles.headerLinks}>
          <Pressable onPress={() => router.push('/profile')}>
            <Text style={styles.link}>My Profile</Text>
          </Pressable>
          <Pressable onPress={() => signOut(auth)}>
            <Text style={styles.logout}>Log Out</Text>
          </Pressable>
        </View>
      </View>
      <HotelCard hotel={hotels[0]} />
      <Text style={styles.sectionTitle}>Choose your room</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => <RoomCard room={item} />}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md },
  headerLinks: { flexDirection: 'row', gap: spacing.lg },
  link: { color: colors.primary, fontWeight: '600' },
  title: { fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.sm, color: colors.text },
  logout: { color: colors.danger, fontWeight: '600' },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginHorizontal: spacing.md, marginBottom: spacing.sm },
});