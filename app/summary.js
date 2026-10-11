import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getRoomById, hotels } from '../data/hotels';
import { sendTestReminder } from '../utils/notifications';
import { colors, spacing, fontSize, radius } from '../constants/theme';

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SummaryScreen() {
  const { bookingId, roomId, checkIn, checkOut, guests, nights, total, cardLast4, reminders } = useLocalSearchParams();
  const room = getRoomById(roomId);
  const hotel = hotels[0];
  const reminderCount = Number(reminders) || 0;

  async function handlePreview() {
    const ok = await sendTestReminder();
    if (ok) {
      Alert.alert('Preview scheduled', 'A sample reminder will appear in 10 seconds. Press the Home button to see it as a system notification.');
    } else {
      Alert.alert('Notifications are off', 'Allow notifications for StayEasy in your phone settings to receive reminders.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>✓</Text>
      </View>
      <Text style={styles.title}>Booking confirmed!</Text>
      <Text style={styles.reference}>Reference: {String(bookingId).slice(0, 8).toUpperCase()}</Text>

      <View style={styles.card}>
        <Row label="Hotel" value={hotel.name} />
        <Row label="Room" value={room ? room.name : roomId} />
        <Row label="Check-in" value={checkIn} />
        <Row label="Check-out" value={checkOut} />
        <Row label="Nights" value={nights} />
        <Row label="Guests" value={guests} />
        <Row label="Paid with" value={`Card ending ${cardLast4}`} />
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total paid</Text>
          <Text style={styles.totalValue}>${total}</Text>
        </View>
      </View>

      <View style={styles.reminderCard}>
        <Text style={styles.reminderTitle}>Reminders</Text>
        <Text style={styles.reminderText}>
          {reminderCount > 0
            ? `${reminderCount} reminder(s) scheduled at 9:00 AM before your check-in (1 week, 1 day and on the day, where still upcoming).`
            : 'No reminders were scheduled. Notifications may be turned off, or check-in is very soon.'}
        </Text>
        <Pressable onPress={handlePreview}>
          <Text style={styles.previewLink}>Preview a reminder (10 s)</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={() => router.replace('/home')}>
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  badge: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: spacing.md },
  badgeText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: spacing.md },
  reference: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  card: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowLabel: { color: colors.textMuted, fontSize: fontSize.md },
  rowValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: spacing.md },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xs, paddingTop: spacing.md },
  totalLabel: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  totalValue: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '800' },
  reminderCard: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.md },
  reminderTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  reminderText: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 19 },
  previewLink: { color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
  button: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.sm, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});