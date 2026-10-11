import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNuz2NaNRz4JNIZXLTDcUnM9IOBQeY6CU",
  authDomain: "stayeasy-learn.firebaseapp.com",
  projectId: "stayeasy-learn",
  storageBucket: "stayeasy-learn.firebasestorage.app",
  messagingSenderId: "48532247138",
  appId: "1:48532247138:web:3d091d5251d0215546f73b",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);