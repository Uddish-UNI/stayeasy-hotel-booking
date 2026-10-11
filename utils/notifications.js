import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Decides what happens when a notification arrives while the app is open: show it as a banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Android 8+ requires a "channel"; Android 13+ also requires the user's permission.
async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Booking reminders',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

// Builds a Date at 9:00 AM, `daysBefore` days before the given "YYYY-MM-DD" date.
function reminderTime(dateString, daysBefore) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d - daysBefore, 9, 0, 0);
}

export async function scheduleBookingNotifications({ hotelName, roomName, checkIn }) {
  try {
    const allowed = await ensurePermission();
    if (!allowed) return { allowed: false, scheduled: 0 };

    // Instant confirmation (trigger: null means "now").
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Booking confirmed',
        body: `${roomName} at ${hotelName}, check-in ${checkIn}.`,
      },
      trigger: null,
    });

    const reminders = [
      { daysBefore: 7, title: 'One week to go!', body: `Your stay at ${hotelName} starts in 7 days.` },
      { daysBefore: 1, title: 'Your stay is tomorrow', body: `Check-in at ${hotelName} is tomorrow. Safe travels!` },
      { daysBefore: 0, title: 'Check-in day', body: `Today is the day! ${roomName} at ${hotelName} is waiting for you.` },
    ];

    const now = new Date();
    let scheduled = 0;
    for (const r of reminders) {
      const date = reminderTime(checkIn, r.daysBefore);
      if (date <= now) continue; // already in the past, skip it
      await Notifications.scheduleNotificationAsync({
        content: { title: r.title, body: r.body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: 'default' },
      });
      scheduled += 1;
    }
    return { allowed: true, scheduled };
  } catch (error) {
    // A notification problem must never break a booking that already succeeded.
    return { allowed: false, scheduled: 0, error: error.message };
  }
}

// Demo helper: fires a sample reminder after 10 seconds.
export async function sendTestReminder() {
  const allowed = await ensurePermission();
  if (!allowed) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Reminder preview', body: 'This is how your stay reminders will look.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 10, channelId: 'default' },
  });
  return true;
}