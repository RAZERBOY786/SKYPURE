import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true); // Track Firebase load state
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Prevent running navigation logic until Firebase has initialized
    if (initializing) return;

    const inAuthGroup = segments[0] === '(tabs)';

    // Use a small timeout or wrap in a check to ensure the router is ready
    const timeout = setTimeout(() => {
      if (!user && inAuthGroup) {
        // Not logged in -> Redirect to login
        router.replace('/login');
      } else if (user && (segments[0] === 'login' || segments[0] === 'index')) {
        // Logged in -> Redirect to home if on login or splash
        router.replace('/(tabs)/home');
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [user, segments, initializing]);

  // Show a loading spinner while checking the login session
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#2dd4bf" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* The order of screens matters here */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}