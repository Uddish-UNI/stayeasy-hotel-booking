import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, fontSize, radius } from '../constants/theme';

export default function HotelCard({ hotel }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/hotel/${hotel.id}`)}>
      <Image source={{ uri: hotel.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.city}>{hotel.city}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>${hotel.pricePerNight} / night</Text>
          <Text style={styles.rating}>★ {hotel.rating}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md, marginHorizontal: spacing.md, elevation: 2 },
  image: { width: '100%', height: 140 },
  info: { padding: spacing.sm + 4 },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  city: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  price: { fontWeight: '600', color: colors.primary },
  rating: { color: colors.secondary, fontWeight: '600' },
});