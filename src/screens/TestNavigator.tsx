import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const SCREENS = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/Menu' },
  { name: 'Cart', path: '/Cart' },
  { name: 'ActiveOrder', path: '/ActiveOrder' },
  { name: 'ProductDetail', path: '/ProductDetail' },
  { name: 'TableSession', path: '/TableSession' },
  { name: 'NotFound', path: '/NotFound' },
  { name: 'ScanQR', path: '/ScanQR' },
];

const TestNavigator = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Test Navegador de Screens</Text>
      {SCREENS.map((screen) => (
        <TouchableOpacity
          key={screen.name}
          style={styles.button}
          onPress={() => router.push(screen.path)}
        >
          <Text style={styles.buttonText}>{screen.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF8E1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#6F4E37',
  },
  button: {
    backgroundColor: '#A0522D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 18,
    width: 220,
    alignItems: 'center',
    shadowColor: '#6F4E37',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default TestNavigator; 