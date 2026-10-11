import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Get every booking that belongs to this user.
// We only filter by userId and sort in the app: no Firestore index needed,
// and it matches the security rule (users can only read their own bookings).
export async function getUserBookings(uid) {
  const q = query(collection(db, 'bookings'), where('userId', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Today's date as YYYY-MM-DD in the phone's local time.
export function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

// '2026-10-20' -> '20 Oct 2026'
export function formatDate(value) {
  if (!value) return '';
  const [y, m, d] = String(value).split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

// 'completed' | 'active' | 'upcoming'
export function getStayStatus(booking) {
  const today = todayString();
  if (booking.checkOut < today) return 'completed';
  if (booking.checkIn <= today) return 'active';
  return 'upcoming';
}

// Upcoming (soonest first) and past (most recent first).
export function splitBookings(list) {
  const upcoming = list
    .filter((b) => getStayStatus(b) !== 'completed')
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const past = list
    .filter((b) => getStayStatus(b) === 'completed')
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  return { upcoming, past };
}