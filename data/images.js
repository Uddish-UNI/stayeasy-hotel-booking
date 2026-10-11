// Photos for the both rotating images for index=screen(login/register) and Home carousel. This is done by loading the image that is bundled together with the app so it has offline support.

export const carouselImages = [
  require('../assets/images/hotel1.jpg'),
  require('../assets/images/hotel2.jpg'),
  require('../assets/images/hotel3.jpg'),
  require('../assets/images/hotel4.jpg'),
];

// <Image> needs { uri: '...' } for a web address, but a bundled photo is used as it is.
// This converts either kind into the right form, so every screen can call it the same way.
export function toImageSource(image) {
  return typeof image === 'string' ? { uri: image } : image;
}