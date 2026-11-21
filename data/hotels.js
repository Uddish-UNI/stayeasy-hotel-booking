export const hotels = [
  {
    id: 'h1',
    name: 'Azure Bay Resort & Spa',
    city: 'Grand Baie',
    address: 'Coastal Road, Grand Baie, Mauritius',
    pricePerNight: 120,
    rating: 4.7,
    image: require('../assets/images/hotel4.jpg'),
    description: "Set right on the sand in Grand Baie, Azure Bay Resort & Spa pairs a private beach and infinity pool with easy access to the village's restaurants and boat trips.",
    amenities: ['Free Wi-Fi', 'Infinity Pool', 'Private Beach', 'Spa & Wellness', 'Breakfast Included', 'Air Conditioning'],
    coords: { lat: -20.0170, lng: 57.5802 },
  },
  {
    id: 'h2',
    name: 'Coral Reef Lodge',
    city: 'Flic en Flac',
    address: 'Coastal Road, Flic en Flac, Mauritius',
    pricePerNight: 95,
    rating: 4.4,
    image: require('../assets/images/hotel5.jpg'),
    description: 'A relaxed lodge steps from the long white beach of Flic en Flac, with a garden pool and easy access to the village cafes and snorkelling spots.',
    amenities: ['Free Wi-Fi', 'Garden Pool', 'Beach Access', 'Breakfast Included', 'Air Conditioning'],
    roomsComingSoon: true,
    coords: { lat: -20.2753, lng: 57.3640 },
  },
  {
    id: 'h3',
    name: 'Le Morne Heights Villas',
    city: 'Le Morne',
    address: 'Le Morne Peninsula, Le Morne, Mauritius',
    pricePerNight: 210,
    rating: 4.8,
    image: require('../assets/images/hotel6.jpg'),
    description: 'Private villas at the foot of Le Morne mountain, with sea views, a shared infinity pool and quiet beaches nearby.',
    amenities: ['Free Wi-Fi', 'Infinity Pool', 'Private Villas', 'Sea View', 'Air Conditioning', 'Kitchenette'],
    roomsComingSoon: true,
    coords: { lat: -20.4560, lng: 57.3130 },
  },
];

export function getHotelById(id) {
  return hotels.find((h) => h.id === id);
}

export const rooms = [
  {
    id: 'normal',
    name: 'Normal Room',
    pricePerNight: 120,
    maxGuests: 2,
    beds: '2 single beds',
    description: 'A comfortable twin room with a floor-to-ceiling window and warm lighting, ideal for one or two guests.',
    image: require('../assets/images/room-normal.jpg'),
  },
  {
    id: 'duo',
    name: 'Duo Room',
    pricePerNight: 185,
    maxGuests: 4,
    beds: '2 double beds',
    description: 'A spacious room with two double beds, a teal feature wall and a glass door to the garden, ideal for friends or family.',
    image: require('../assets/images/room-duo.jpg'),
  },
  {
    id: 'suite',
    name: 'Suite',
    pricePerNight: 320,
    maxGuests: 3,
    beds: '1 king bed',
    description: 'Our top room, with a king bed, a private seating corner by the window and a writing desk.',
    image: require('../assets/images/room-suite.jpg'),
  },
];

export function getRoomById(id) {
  return rooms.find((r) => r.id === id);
}