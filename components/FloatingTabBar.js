import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

// Custom bottom bar: a rounded white "pill" with a rounded highlight on the active tab.
export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const color = focused ? colors.primary : colors.textMuted;

          function onPress() {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          return (
            <Pressable key={route.key} onPress={onPress} style={[styles.item, focused && styles.itemActive]}>
              {options.tabBarIcon ? options.tabBarIcon({ focused, color, size: 24 }) : null}
              <Text style={[styles.label, { color }]}>{options.title ?? route.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 8 },
  pill: {
    flexDirection: 'row',
    height: 68,
    padding: 6,
    borderRadius: 34,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 28 },
  itemActive: { backgroundColor: '#EFF6FF' },
  label: { fontSize: 12, fontWeight: '600', marginTop: 2 },
});