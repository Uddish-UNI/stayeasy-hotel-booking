import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import '../utils/notifications';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Create Account' }} />
        <Stack.Screen name="home" options={{ title: 'StayEasy', headerBackVisible: false, gestureEnabled: false }} />
        <Stack.Screen name="hotel/[id]" options={{ title: 'Hotel Details' }} />
        <Stack.Screen name="booking/[roomId]" options={{ title: 'Book Your Stay' }} />
        <Stack.Screen name="payment" options={{ title: 'Payment' }} />
        <Stack.Screen name="summary" options={{ title: 'Booking Summary', headerBackVisible: false, gestureEnabled: false }} />
        <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
      </Stack>
    </AuthProvider>
  );
}