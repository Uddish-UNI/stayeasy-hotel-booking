// TODO: replace the placeholder images and descriptions (hotel + 3 rooms) before submission.
export const hotels = [
  {
    id: 'h1',
    name: 'Azure Bay Resort & Spa',
    city: 'Grand Baie',
    address: 'Coastal Road, Grand Baie, Mauritius',
    pricePerNight: 120,
    rating: 4.7,
    image: 'https://picsum.photos/seed/azure-bay/800/500',
    description: "Set right on the sand in Grand Baie, Azure Bay Resort & Spa pairs a private beach and infinity pool with easy access to the village's restaurants and boat trips.",
    amenities: ['Free Wi-Fi', 'Infinity Pool', 'Private Beach', 'Spa & Wellness', 'Breakfast Included', 'Air Conditioning'],
    coords: { lat: -20.0170, lng: 57.5802 },
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
    beds: '1 double bed',
    description: 'A comfortable room with garden view, ideal for one or two guests.',
    image: 'https://picsum.photos/seed/room-normal/800/500',
  },
  {
    id: 'duo',
    name: 'Duo Room',
    pricePerNight: 185,
    maxGuests: 4,
    beds: '2 double beds',
    description: 'A spacious room with two beds and a lagoon view, ideal for friends or family.',
    image: 'https://picsum.photos/seed/room-duo/800/500',
  },
  {
    id: 'suite',
    name: 'Suite',
    pricePerNight: 320,
    maxGuests: 5,
    beds: '1 king bed + sofa bed',
    description: 'Our top room, with a separate living area, private balcony and direct beach view.',
    image: 'https://picsum.photos/seed/room-suite/800/500',
  },
];

export function getRoomById(id) {
  return rooms.find((r) => r.id === id);
}