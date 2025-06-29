import { Stack } from 'expo-router';
import { TableUsersProvider } from '../src/contexts/TableUsersContext';

export default function RootLayout() {
  return (
    <TableUsersProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Inicio' }} />
        <Stack.Screen name="Menu" options={{ title: 'Menu' }} />
        <Stack.Screen name="Cart" options={{ title: 'Carrito' }} />
        <Stack.Screen name="ProductDetail" options={{ title: 'Detalle de Producto' }} />
        <Stack.Screen name="ActiveOrder" options={{ title: 'Pedido Actual' }} />
        <Stack.Screen name="TableSession" options={{ title: 'Table Session' }} />
        <Stack.Screen name="NotFound" options={{ title: 'Not Found' }} />
        <Stack.Screen name="ScanQR" options={{ title: 'Escanear QR' }} />
        <Stack.Screen name="TestNavigator" options={{ title: 'Test Navegador' }} />
      </Stack>
    </TableUsersProvider>
  );
}
