import { Stack } from "expo-router";

export default function DistractionBlockerLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen name="app-selection" options={{ headerShown: false }} />
    </Stack>
  );
} 