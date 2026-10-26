import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Wrapper' }} />
        <Stack.Screen name="rules" options={{ title: 'My rules' }} />
        <Stack.Screen name="ask/[app]" options={{ title: 'Ask to open' }} />
        <Stack.Screen name="session/[app]" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </StoreProvider>
  );
}
