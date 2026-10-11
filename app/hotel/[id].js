import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Linking, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getHotelById } from '../../data/hotels';
import { getCurrentLocation, haversineDistanceKm } from '../../utils/location';
import { colors, spacing, fontSize, radius } from '../../constants/theme';
import { toImageSource } from '../../data/images';

export default function HotelDetailsScreen() {
  const { id } = useLocalSearchParams();
  const hotel = getHotelById(id);
  const [distanceKm, setDistanceKm] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    handleLocate();
  }, []);

  async function handleLocate() {
    setLocating(true);
    setLocationError(null);
    const result = await getCurrentLocation();
    setLocating(false);
    if (!result.granted) {
      setLocationError(result.error || 'Location permission denied.');
      return;
    }
    const km = haversineDistanceKm(result.coords.lat, result.coords.lng, hotel.coords.lat, hotel.coords.lng);
    setDistanceKm(km);
  }

  function openDirections() {
    const { lat, lng } = hotel.coords;
    const label = encodeURIComponent(hotel.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });
    Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`));
  }

  if (!hotel) {
    return <View style={styles.center}><Text>Hotel not found.</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Image source={toImageSource(hotel.image)} style={styles.image} />

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name}>{hotel.name}</Text>
          <Text style={styles.rating}>★ {hotel.rating}</Text>
        </View>
        <Text style={styles.address}>{hotel.address}</Text>

        <View style={styles.locationCard}>
          <Text style={{ fontSize: 18 }}>📍</Text>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            {locating && <Text style={styles.locationText}>Getting your location…</Text>}
            {!locating && distanceKm !== null && (
              <Text style={styles.locationText}>{distanceKm.toFixed(1)} km from your current location</Text>
            )}
            {!locating && locationError && <Text style={styles.locationErrorText}>{locationError}</Text>}
          </View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{hotel.description}</Text>

        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.chipRow}>
          {hotel.amenities.map((a) => (
            <View key={a} style={styles.chip}><Text style={styles.chipText}>{a}</Text></View>
          ))}
        </View>

        <Pressable style={styles.directionsButton} onPress={openDirections}>
          <Text style={styles.directionsText}>Get Directions</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrice}>${hotel.pricePerNight}</Text>
          <Text style={styles.footerPerNight}>per night</Text>
        </View>
        <Pressable style={styles.bookButton} onPress={() => router.back()}>
          <Text style={styles.bookButtonText}>Choose a Room</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 220, backgroundColor: colors.border },
  body: { padding: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, flex: 1, marginRight: spacing.sm },
  rating: { fontSize: fontSize.md, color: colors.secondary, fontWeight: '700' },
  address: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.md },
  locationText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  locationErrorText: { color: colors.danger, fontSize: fontSize.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  description: { fontSize: fontSize.md, color: colors.textMuted, lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: spacing.sm },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  directionsButton: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.sm, paddingVertical: 13, alignItems: 'center', marginTop: spacing.md },
  directionsText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.md },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  footerPrice: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
  footerPerNight: { fontSize: fontSize.sm, color: colors.textMuted },
  bookButton: { flex: 1, marginLeft: spacing.md, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.sm, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});