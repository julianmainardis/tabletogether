import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  brownDark: '#6F4E37', // Marrón oscuro
  brown: '#A0522D',     // Marrón medio
  brownLight: '#D2B48C', // Marrón claro
  beige: '#FFF8E1',     // Fondo cálido
  white: '#fff',
  testBlue: '#3A86FF',
};

const Index = () => {
  const router = useRouter();

  const handleScanQR = () => {
    router.push('/ScanQR');
  };

  const handleTestNav = () => {
    router.push('/TestNavigator');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Table Together</Text>
        <Text style={styles.description}>
          🍽️ Escanea el QR de tu mesa para acceder al menú y pedir como un verdadero foodie... ¡o para ver si tus amigos ya pidieron sin ti! 😜
        </Text>
      </View>
      <View style={styles.centerContent}>
        <TouchableOpacity style={styles.button} onPress={handleScanQR}>
          <Ionicons name="qr-code-outline" size={28} color={COLORS.white} />
          <Text style={styles.buttonText}>Escanear QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={handleTestNav}>
          <Ionicons name="bug-outline" size={22} color={COLORS.white} />
          <Text style={styles.testButtonText}>Test Navegador</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
    paddingHorizontal: 24,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 90,
    marginBottom: 32,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: COLORS.brownDark,
    letterSpacing: 1,
    textShadowColor: COLORS.brownLight,
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
    marginBottom: 0,
  },
  description: {
    fontSize: 18,
    color: COLORS.brown,
    textAlign: 'center',
    marginHorizontal: 8,
    fontStyle: 'italic',
    lineHeight: 26,
    marginTop: 80,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brownDark,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 16,
    shadowColor: COLORS.brown,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 24,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    letterSpacing: 1,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.testBlue,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 8,
  },
  testButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 1,
  },
});

export default Index;
