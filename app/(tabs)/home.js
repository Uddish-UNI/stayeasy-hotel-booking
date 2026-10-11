import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { hotels, rooms } from '../../data/hotels';
import { carouselImages, toImageSource } from '../../data/images';
import RoomCard from '../../components/RoomCard';
import { colors, spacing, fontSize } from '../../constants/theme';

// Photo slider that moves to the next picture every 4 seconds.
function HotelCarousel({ hotel }) {
  const { width } = useWindowDimensions();
  const listRef = useRef(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % carouselImages.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      indexRef.current = next;
      setIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // When the user swipes by hand, remember which slide we landed on.
  function handleScrollEnd(e) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    indexRef.current = i;
    setIndex(i);
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={carouselImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <Pressable style={{ width }} onPress={() => router.push(`/hotel/${hotel.id}`)}>
            <View style={styles.slide}>
              <Image source={toImageSource(item)} style={styles.slideImage} />
              <View style={styles.slideOverlay}>
                <Text style={styles.slideTitle}>{hotel.name}</Text>
                <Text style={styles.slideSub}>★ {hotel.rating}  ·  Grand Baie, Mauritius</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
      <View style={styles.dots}>
        {carouselImages.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// One card in the "Our hotels" row. Hotels flagged comingSoon can't be opened.
function HotelListItem({ item }) {
  const soon = item.comingSoon;
  return (
    <Pressable
      disabled={soon}
      style={[styles.hotelItem, soon && styles.hotelItemSoon]}
      onPress={() => router.push(`/hotel/${item.id}`)}
    >
      {item.image ? (
        <Image source={toImageSource(item.image)} style={styles.hotelItemImage} />
      ) : (
        <View style={[styles.hotelItemImage, styles.hotelItemPlaceholder]}>
          <Ionicons name="business-outline" size={32} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.hotelItemBody}>
        <Text style={styles.hotelItemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.hotelItemMeta}>{item.city} · ★ {item.rating}</Text>
        {soon ? (
          <Text style={styles.soonBadge}>Coming soon</Text>
        ) : (
          <Text style={styles.fromText}>From ${item.pricePerNight} / night</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const hotel = hotels[0];
  const [photo, setPhoto] = useState(null);

  // Small profile picture in the corner (reloaded each time this tab opens).
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      AsyncStorage.getItem(`avatar:${user.uid}`).then((saved) => setPhoto(saved || null));
    }, [user])
  );

  if (!user) return null;

  const fullName = user.displayName || user.email || 'Guest';
  const firstName = fullName.split(' ')[0];

  const header = (
    <View>
      <View style={[styles.topRow, { paddingTop: insets.top + spacing.sm }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.name} numberOfLines={1}>{firstName}</Text>
        </View>
        <Pressable onPress={() => router.push('/profile')}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <HotelCarousel hotel={hotel} />

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={() => router.push(`/hotel/${hotel.id}`)}>
          <Ionicons name="location" size={22} color={colors.primary} />
          <Text style={styles.actionText}>Hotel & Map</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={() => router.push('/bookings')}>
          <Ionicons name="calendar" size={22} color={colors.primary} />
          <Text style={styles.actionText}>My Bookings</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={() => router.push('/profile')}>
          <Ionicons name="person" size={22} color={colors.primary} />
          <Text style={styles.actionText}>Profile</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Our hotels</Text>
      <Text style={styles.sectionSub}>More destinations opening soon</Text>
      <FlatList
        horizontal
        data={hotels}
        keyExtractor={(h) => h.id}
        renderItem={({ item }) => <HotelListItem item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm + 2 }}
      />

      <Text style={styles.sectionTitle}>Rooms at {hotel.name}</Text>
      <Text style={styles.sectionSub}>From ${hotel.pricePerNight} per night</Text>
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
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  welcome: { fontSize: fontSize.md, color: colors.textMuted },
  name: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.border },
  avatarPlaceholder: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontWeight: '800', fontSize: fontSize.lg },

  slide: { marginHorizontal: spacing.md, height: 220, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.border },
  slideImage: { width: '100%', height: '100%' },
  slideOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.md, backgroundColor: 'rgba(0,0,0,0.35)' },
  slideTitle: { color: '#fff', fontSize: fontSize.lg, fontWeight: '800' },
  slideSub: { color: '#F1F5F9', fontSize: fontSize.sm, marginTop: 2 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.sm + 2 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#CBD5E1' },
  dotActive: { width: 20, backgroundColor: colors.primary },

  actions: { flexDirection: 'row', gap: spacing.sm + 2, paddingHorizontal: spacing.md, marginTop: spacing.md },
  action: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, backgroundColor: colors.card,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
  },
  actionText: { fontSize: 12, fontWeight: '600', color: colors.text },

  sectionTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginHorizontal: spacing.md, marginTop: spacing.lg },
  sectionSub: { fontSize: fontSize.md, color: colors.textMuted, marginHorizontal: spacing.md, marginBottom: spacing.md, marginTop: 2 },

  hotelItem: {
    width: 200, backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  hotelItemSoon: { opacity: 0.6 },
  hotelItemImage: { width: '100%', height: 100, backgroundColor: colors.border },
  hotelItemPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  hotelItemBody: { padding: spacing.sm + 2 },
  hotelItemName: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  hotelItemMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  fromText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary, marginTop: 6 },
  soonBadge: { fontSize: fontSize.sm, fontWeight: '700', color: colors.secondary, marginTop: 6 },
});