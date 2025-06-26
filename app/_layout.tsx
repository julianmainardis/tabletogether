import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="Home" options={{ title: 'Home' }} />
      <Stack.Screen name="Menu" options={{ title: 'Menu' }} />
      <Stack.Screen name="Cart" options={{ title: 'Carrito' }} />
      <Stack.Screen name="ProductDetail" options={{ title: 'Detalle de Producto' }} />
      <Stack.Screen name="ActiveOrder" options={{ title: 'Pedido Actual' }} />
      <Stack.Screen name="TableSession" options={{ title: 'Table Session' }} />
      <Stack.Screen name="NotFound" options={{ title: 'Not Found' }} />
    </Stack>
  );
}
