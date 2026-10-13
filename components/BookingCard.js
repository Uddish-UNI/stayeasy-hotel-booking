import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, getStayStatus } from '../services/bookingQueries';
import { colors, spacing, fontSize, radius } from '../constants/theme';

const STATUS = {
  active: { label: 'Staying now', color: '#16A34A', bg: '#DCFCE7' },
  upcoming: { label: 'Upcoming', color: '#2563EB', bg: '#DBEAFE' },
  completed: { label: 'Completed', color: '#64748B', bg: '#F1F5F9' },
};

export default function BookingCard({ booking, compact }) {
  const status = STATUS[getStayStatus(booking)];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons name="bed" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.room}>{booking.roomName}</Text>
          <Text style={styles.hotel} numberOfLines={1}>{booking.hotelName}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
        <Text style={styles.dates}>
          {formatDate(booking.checkIn)}  →  {formatDate(booking.checkOut)}
        </Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.meta}>
          {booking.nights} night{Number(booking.nights) === 1 ? '' : 's'} · {booking.guests} guest{Number(booking.guests) === 1 ? '' : 's'}
        </Text>
        <Text style={styles.price}>${booking.totalPrice}</Text>
      </View>

      {!compact && booking.id ? (
        <Text style={styles.ref}>Ref: {String(booking.id).slice(0, 8).toUpperCase()}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md,
    marginHorizontal: spacing.md, marginBottom: spacing.sm + 4,
    borderWidth: 1, borderColor: colors.border,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm + 4,
  },
  room: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  hotel: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: spacing.sm },
  badgeText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm + 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dates: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  meta: { fontSize: fontSize.sm, color: colors.textMuted },
  price: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
  ref: { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm },
});