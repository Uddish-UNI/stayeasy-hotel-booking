import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings, splitBookings } from '../../services/bookingQueries';
import BookingCard from '../../components/BookingCard';
import { colors, spacing, fontSize, radius } from '../../constants/theme';

export default function BookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const list = await getUserBookings(user.uid);
      setBookings(list);
    } catch (e) {
      setError('Could not load your bookings. Check your connection and pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Reload every time the user opens this tab (so a new booking shows up).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const { upcoming, past } = splitBookings(bookings);
  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <View style={styles.container}>
      <View style={styles.segment}>
        <Pressable style={[styles.segBtn, tab === 'upcoming' && styles.segActive]} onPress={() => setTab('upcoming')}>
          <Text style={[styles.segText, tab === 'upcoming' && styles.segTextActive]}>Upcoming ({upcoming.length})</Text>
        </Pressable>
        <Pressable style={[styles.segBtn, tab === 'past' && styles.segActive]} onPress={() => setTab('past')}>
          <Text style={[styles.segText, tab === 'past' && styles.segTextActive]}>Past stays ({past.length})</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BookingCard booking={item} />}
          contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.xl, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name={error ? 'cloud-offline-outline' : 'calendar-outline'} size={56} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>
                {error ? 'Something went wrong' : tab === 'upcoming' ? 'No upcoming stays' : 'No past stays yet'}
              </Text>
              <Text style={styles.emptyText}>
                {error || (tab === 'upcoming' ? 'Book a room and your reservation will appear here.' : 'Completed stays will be listed here.')}
              </Text>
              {!error && tab === 'upcoming' ? (
                <Pressable style={styles.cta} onPress={() => router.push('/home')}>
                  <Text style={styles.ctaText}>Browse rooms</Text>
                </Pressable>
              ) : null}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  segment: {
    flexDirection: 'row', backgroundColor: '#E2E8F0', margin: spacing.md, borderRadius: radius.md, padding: 4,
  },
  segBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm },
  segActive: { backgroundColor: '#fff' },
  segText: { color: colors.textMuted, fontWeight: '600', fontSize: fontSize.sm },
  segTextActive: { color: colors.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
  cta: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: spacing.lg, borderRadius: radius.md, marginTop: spacing.lg },
  ctaText: { color: '#fff', fontWeight: '700' },
});