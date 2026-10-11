import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getRoomById, hotels } from '../data/hotels';
import { createBooking } from '../services/bookingService';
import { validateCardName, validateCardNumber, validateExpiry, validateCvv } from '../utils/validation';
import { colors, spacing, fontSize, radius } from '../constants/theme';
import { processPayment } from '../services/paymentService';
import { scheduleBookingNotifications } from '../utils/notifications';

export default function PaymentScreen() {
  const { roomId, checkIn, checkOut, guests, nights, total } = useLocalSearchParams();
  const { user } = useAuth();
  const room = getRoomById(roomId);
  const hotel = hotels[0];

  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  function formatNumber(text) {
    const digits = text.replace(/\D/g, '').slice(0, 19);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(text) {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  }

  async function handlePay() {
    const checks = {
      name: validateCardName(name),
      number: validateCardNumber(number),
      expiry: validateExpiry(expiry),
      cvv: validateCvv(cvv),
    };
    const next = {};
    Object.keys(checks).forEach((key) => {
      if (!checks[key].valid) next[key] = checks[key].message;
    });
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setProcessing(true);
    try {
      // Mock gateway: no real money moves.
      const payment = await processPayment({ cardNumber: number, amount: Number(total) });
      if (!payment.success) {
        Alert.alert('Payment declined', payment.message);
        setProcessing(false);
        return;
      }

      // Only the last 4 digits are stored. The full number and CVV never leave this screen.
      const bookingId = await createBooking(user.uid, {
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomId: room.id,
        roomName: room.name,
        checkIn,
        checkOut,
        guests: Number(guests),
        nights: Number(nights),
        pricePerNight: room.pricePerNight,
        totalPrice: Number(total),
        cardLast4: checks.number.last4,
        transactionId: payment.transactionId,
      });

      const reminders = await scheduleBookingNotifications({
        hotelName: hotel.name,
        roomName: room.name,
        checkIn,
      });

      router.replace({
        pathname: '/summary',
        params: { bookingId, roomId, checkIn, checkOut, guests, nights, total, cardLast4: checks.number.last4, reminders: String(reminders.scheduled) },
      });
    } catch (error) {
      Alert.alert('Payment failed', error.message);
      setProcessing(false);
    }
  }

  if (!room) {
    return <View style={styles.center}><Text>Room not found.</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>{room.name} · {nights} night(s)</Text>
        <Text style={styles.totalValue}>${total}</Text>
      </View>

      <Text style={styles.label}>Name on card</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="A. Student" />
      {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}

      <Text style={styles.label}>Card number</Text>
      <TextInput style={styles.input} value={number} onChangeText={(t) => setNumber(formatNumber(t))} placeholder="4242 4242 4242 4242" keyboardType="number-pad" />
      {errors.number ? <Text style={styles.error}>{errors.number}</Text> : null}

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Text style={styles.label}>Expiry (MM/YY)</Text>
          <TextInput style={styles.input} value={expiry} onChangeText={(t) => setExpiry(formatExpiry(t))} placeholder="12/28" keyboardType="number-pad" />
          {errors.expiry ? <Text style={styles.error}>{errors.expiry}</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Security code</Text>
          <TextInput style={styles.input} value={cvv} onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))} placeholder="123" keyboardType="number-pad" secureTextEntry />
          {errors.cvv ? <Text style={styles.error}>{errors.cvv}</Text> : null}
        </View>
      </View>

      <Text style={styles.note}>This is a simulated payment. No real money is charged.</Text>

      <Pressable style={[styles.button, processing && { opacity: 0.6 }]} onPress={handlePay} disabled={processing}>
        {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Pay ${total}</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  totalCard: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  totalLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  totalValue: { color: colors.primary, fontSize: fontSize.xxl, fontWeight: '800', marginTop: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 12, fontSize: fontSize.md },
  row: { flexDirection: 'row' },
  error: { color: colors.danger, fontSize: fontSize.sm, marginTop: spacing.xs },
  note: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.md, textAlign: 'center' },
  button: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.sm, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});