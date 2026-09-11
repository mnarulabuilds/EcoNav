import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f766e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'EcoNav Planner' }} />
        <Stack.Screen name="results" options={{ title: 'Route Results' }} />
        <Stack.Screen name="simulation" options={{ title: 'Simulation' }} />
      </Stack>
    </>
  );
}
