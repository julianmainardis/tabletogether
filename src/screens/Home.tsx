import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Home = () => {
  const router = useRouter();

  const handleScanQR = () => {
    router.push('/ScanQR');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Table Together</Text>
      <TouchableOpacity style={styles.button} onPress={handleScanQR}>
        <Ionicons name="qr-code-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Escanear QR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 8,
  },
});

export default Home; 