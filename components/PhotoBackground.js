import { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { carouselImages } from '../data/images';

const SHOW_MS = 5000; // how long each photo stays on screen
const FADE_MS = 1200; // how long the cross-fade takes

// Horizontal focal point for each photo, same order as carouselImages.
// 0 = keep the left edge, 0.5 = centre, 1 = keep the right edge.
const FOCUS_X = [0.5, 0.62, 0.5, 0.4];

// Works out how big to draw a photo so it covers the screen (like resizeMode "cover"),
// and where to place it so the focal point stays in view.
function coverLayout(source, focusX, screenW, screenH) {
  const { width: imgW, height: imgH } = Image.resolveAssetSource(source);
  const scale = Math.max(screenW / imgW, screenH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  return {
    width: w,
    height: h,
    left: -(w - screenW) * focusX,
    top: -(h - screenH) * 0.5,
  };
}

// Full-screen photo background that slowly cross-fades between the hotel photos.
export default function PhotoBackground() {
  const [size, setSize] = useState(null); // real size of the area we fill
  const [front, setFront] = useState(0);  // which photo sits on top of the stack

  const opacities = useRef(
    carouselImages.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))
  ).current;
  const currentIndex = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const previous = currentIndex.current;
      const next = (previous + 1) % carouselImages.length;
      currentIndex.current = next;

      setFront(next);

      Animated.timing(opacities[next], {
        toValue: 1,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(() => {
        opacities[previous].setValue(0);
      });
    }, SHOW_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
      pointerEvents="none"
      onLayout={(e) => setSize(e.nativeEvent.layout)}
    >
      {size &&
        carouselImages.map((source, i) => (
          <Animated.Image
            key={i}
            source={source}
            style={[
              {
                position: 'absolute',
                ...coverLayout(source, FOCUS_X[i] ?? 0.5, size.width, size.height),
                opacity: opacities[i],
                zIndex: i === front ? 2 : 1,
              },
            ]}
          />
        ))}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 3 },
});