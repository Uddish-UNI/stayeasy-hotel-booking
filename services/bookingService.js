import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

// The only place that writes bookings. Screens call this and never touch Firestore directly.
export async function createBooking(userId, data) {
  const ref = await addDoc(collection(db, 'bookings'), {
    userId,
    ...data,
    status: 'confirmed',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}