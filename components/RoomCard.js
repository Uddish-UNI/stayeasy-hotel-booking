import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toImageSource } from '../data/images';
import { colors, spacing, fontSize, radius } from '../constants/theme';

export default function RoomCard({ room }) {
  const bedsText =
    typeof room.beds === 'number' ? `${room.beds} bed${room.beds > 1 ? 's' : ''}` : room.beds;

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/booking/${room.id}`)}>
      <View>
        <Image source={toImageSource(room.image)} style={styles.image} />
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>${room.pricePerNight}</Text>
          <Text style={styles.priceUnit}> / night</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>{room.name}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="bed-outline" size={16} color={colors.textMuted} />
          <Text style={styles.meta}>{bedsText}</Text>
          <Ionicons name="people-outline" size={16} color={colors.textMuted} style={{ marginLeft: spacing.md }} />
          <Text style={styles.meta}>Up to {room.maxGuests} guests</Text>
        </View>

        <Text style={styles.desc} numberOfLines={2}>{room.description}</Text>

        <View style={styles.button}>
          <Text style={styles.buttonText}>Select Room</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: 20, marginHorizontal: spacing.md, marginBottom: spacing.md,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  image: { width: '100%', height: 170, backgroundColor: colors.border },
  priceBadge: {
    position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'baseline',
    backgroundColor: 'rgba(15,23,42,0.75)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  priceText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '800' },
  priceUnit: { color: '#E2E8F0', fontSize: 12 },
  body: { padding: spacing.md },
  name: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  meta: { fontSize: fontSize.sm, color: colors.textMuted },
  desc: { fontSize: fontSize.md, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 21 },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, paddingVertical: 12, borderRadius: radius.md, marginTop: spacing.md,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});