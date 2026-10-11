import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, fontSize, radius } from '../constants/theme';

export default function RoomCard({ room }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: room.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{room.name}</Text>
        <Text style={styles.meta}>{room.beds} · up to {room.maxGuests} guests</Text>
        <Text style={styles.description}>{room.description}</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.price}>${room.pricePerNight}</Text>
            <Text style={styles.perNight}>per night</Text>
          </View>
          <Pressable style={styles.button} onPress={() => router.push(`/booking/${room.id}`)}>
            <Text style={styles.buttonText}>Select</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md, marginHorizontal: spacing.md, elevation: 2 },
  image: { width: '100%', height: 130 },
  info: { padding: spacing.md },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  description: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 19 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  price: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
  perNight: { fontSize: fontSize.sm, color: colors.textMuted },
  button: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: spacing.lg, borderRadius: radius.sm },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});