import { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, router } from 'expo-router';
import { getRoomById } from '../../data/hotels';
import { validateDateRange, validateGuests } from '../../utils/validation';
import { colors, spacing, fontSize, radius } from '../../constants/theme';
import { toImageSource } from '../../data/images';
import { Ionicons } from '@expo/vector-icons';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Date -> "YYYY-MM-DD" using the phone's local date (toISOString would use UTC and can be off by a day).
function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// "YYYY-MM-DD" -> Date
function fromDateString(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// "2026-11-20" -> "20 Nov 2026"
function formatDisplay(s) {
  const [y, m, d] = s.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export default function BookingScreen() {
  const { roomId } = useLocalSearchParams();
  const room = getRoomById(roomId);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [errors, setErrors] = useState({});

  if (!room) {
    return <View style={styles.center}><Text>Room not found.</Text></View>;
  }

  const range = validateDateRange(checkIn, checkOut);
  const nights = range.valid ? range.nights : 0;
  const total = nights * room.pricePerNight;

  // Opens Android's native calendar pop-up. which = 'in' or 'out'.
  function openPicker(which) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check-out must be at least one day after check-in; check-in can't be in the past.
    let minimumDate = today;
    if (which === 'out' && checkIn) {
      minimumDate = fromDateString(checkIn);
      minimumDate.setDate(minimumDate.getDate() + 1);
    }

    const current = which === 'in' ? checkIn : checkOut;

    DateTimePickerAndroid.open({
      value: current ? fromDateString(current) : minimumDate,
      mode: 'date',
      minimumDate,
      onChange: (event, selected) => {
        if (event.type !== 'set' || !selected) return; // user cancelled
        const str = toDateString(selected);
        if (which === 'in') {
          setCheckIn(str);
          // If the old check-out is no longer after the new check-in, clear it.
          if (checkOut && checkOut <= str) setCheckOut('');
        } else {
          setCheckOut(str);
        }
      },
    });
  }

  // Plus/minus buttons: keep guests between 1 and the room's maximum.
  function changeGuests(delta) {
    const current = Number(guests) || 1;
    const next = Math.min(room.maxGuests, Math.max(1, current + delta));
    setGuests(String(next));
  }

  function handleContinue() {
    const guestsCheck = validateGuests(guests, room.maxGuests);
    const next = {};
    if (!range.valid) next.dates = range.message;
    if (!guestsCheck.valid) next.guests = guestsCheck.message;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    router.push({
      pathname: '/payment',
      params: { roomId: room.id, checkIn, checkOut, guests: String(guestsCheck.value), nights: String(nights), total: String(total) },
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
      <Image source={toImageSource(room.image)} style={styles.image} />
      <Text style={styles.name}>{room.name}</Text>
      <Text style={styles.meta}>{room.beds} · up to {room.maxGuests} guests · ${room.pricePerNight} per night</Text>

      <Text style={styles.label}>Check-in</Text>
      <Pressable style={styles.input} onPress={() => openPicker('in')}>
        <Text style={checkIn ? styles.dateText : styles.placeholder}>
          {checkIn ? formatDisplay(checkIn) : 'Select check-in date'}
        </Text>
      </Pressable>

      <Text style={styles.label}>Check-out</Text>
      <Pressable style={styles.input} onPress={() => openPicker('out')}>
        <Text style={checkOut ? styles.dateText : styles.placeholder}>
          {checkOut ? formatDisplay(checkOut) : 'Select check-out date'}
        </Text>
      </Pressable>
      {errors.dates ? <Text style={styles.error}>{errors.dates}</Text> : null}

      <Text style={styles.label}>Guests</Text>
      <View style={styles.stepper}>
        <Pressable
          style={[styles.stepButton, Number(guests) <= 1 && styles.stepDisabled]}
          onPress={() => changeGuests(-1)}
          disabled={Number(guests) <= 1}
        >
          <Ionicons name="remove" size={22} color={colors.primary} />
        </Pressable>

        <Text style={styles.guestCount}>{guests}</Text>

        <Pressable
          style={[styles.stepButton, Number(guests) >= room.maxGuests && styles.stepDisabled]}
          onPress={() => changeGuests(1)}
          disabled={Number(guests) >= room.maxGuests}
        >
          <Ionicons name="add" size={22} color={colors.primary} />
        </Pressable>
      </View>
      <Text style={styles.hint}>This room fits up to {room.maxGuests} guests</Text>
      {errors.guests ? <Text style={styles.error}>{errors.guests}</Text> : null}

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Nights</Text>
          <Text style={styles.summaryValue}>{nights > 0 ? nights : '—'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price per night</Text>
          <Text style={styles.summaryValue}>${room.pricePerNight}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total}</Text>
        </View>
      </View>

      <Pressable style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue to Payment</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 150, borderRadius: radius.md, marginBottom: spacing.md },
  name: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 12, fontSize: fontSize.md },
  dateText: { fontSize: fontSize.md, color: colors.text },
  placeholder: { fontSize: fontSize.md, color: colors.textMuted },
  error: { color: colors.danger, fontSize: fontSize.sm, marginTop: spacing.xs },
  summary: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryLabel: { color: colors.textMuted, fontSize: fontSize.md },
  summaryValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xs, paddingTop: spacing.sm },
  totalLabel: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  totalValue: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '800' },
  button: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.sm, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm },
  stepButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  stepDisabled: { opacity: 0.35 },
  guestCount: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  hint: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
});