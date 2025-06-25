import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="../src/screens/Home" options={{ title: 'Home' }} />
      <Stack.Screen name="../src/screens/ScanQR" options={{ title: 'Escanear QR' }} />
      <Stack.Screen name="../src/screens/Index" options={{ title: 'Inicio' }} />
      <Stack.Screen name="../src/screens/KitchenLogin" options={{ title: 'Kitchen Login' }} />
      <Stack.Screen name="../src/screens/AdminUsers" options={{ title: 'Admin Users' }} />
      <Stack.Screen name="../src/screens/Kitchen" options={{ title: 'Kitchen' }} />
      <Stack.Screen name="../src/screens/ActiveOrder" options={{ title: 'Active Order' }} />
      <Stack.Screen name="../src/screens/TableSession" options={{ title: 'Table Session' }} />
      <Stack.Screen name="../src/screens/Menu" options={{ title: 'Menu' }} />
      <Stack.Screen name="../src/screens/NotFound" options={{ title: 'Not Found' }} />
    </Stack>
  );
}
