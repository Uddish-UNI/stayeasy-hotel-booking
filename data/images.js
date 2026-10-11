// Photos for the home-screen carousel.

export const carouselImages = [
  require('../assets/images/hotel1.jpg'),
  require('../assets/images/hotel2.jpg'),
  require('../assets/images/hotel3.jpg'),
  require('../assets/images/hotel4.jpg'),
];

// Accepts a web address (string) or a require() image and returns
// something <Image source={...}> understands.
export function toImageSource(image) {
  return typeof image === 'string' ? { uri: image } : image;
}