// Imports: the Firebase tools we need, plus AsyncStorage (a small local storage space that saves key-values (login & profile picture) as text)
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Project details that tells the app WHICH Firebase project to connect to.
// These are identifiers, not passwords. Our data is protected by the Firestore security rules.
const firebaseConfig = {
  apiKey: "AIzaSyDNuz2NaNRz4JNIZXLTDcUnM9IOBQeY6CU",
  authDomain: "stayeasy-learn.firebaseapp.com",
  projectId: "stayeasy-learn",
  storageBucket: "stayeasy-learn.firebasestorage.app",
  messagingSenderId: "48532247138",
  appId: "1:48532247138:web:3d091d5251d0215546f73b",
};

// Create the connection to Firebase, but only once.
// getApps() = list of connections already made. If one exists, reuse it with getApp().
// This stops an "already exists" error when Expo hot-reloads after a file save.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Login system. AsyncStorage saves the login on the phone,
// so the user stays logged in after closing the app.
// Exported so every screen shares the same one and agrees on who is logged in.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Database handle (Firestore). On its own it does not read or write anything:
// bookingService.js writes bookings and bookingQueries.js reads them, both using this.
export const db = getFirestore(app);