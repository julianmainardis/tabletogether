import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { tableService, TableSessionResponse } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TableSession = () => {
  const { tableId } = useLocalSearchParams();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }
    try {
      setLoading(true);
      const response: TableSessionResponse = await tableService.startTableSession(String(tableId), userName.trim());
      // Guardar datos en AsyncStorage
      await AsyncStorage.setItem('tableId', response.tableId);
      await AsyncStorage.setItem('sessionId', response.sessionId);
      await AsyncStorage.setItem('sessionToken', response.sessionToken);
      await AsyncStorage.setItem('userName', response.userName);
      await AsyncStorage.setItem('tableNumber', response.tableNumber.toString());
      await AsyncStorage.setItem('isOwner', response.isOwner.toString());
      if (response.cart?.id) {
        await AsyncStorage.setItem('cartId', response.cart.id);
      }
      // Navegar a Menu
      router.replace('/Menu');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo iniciar la sesión en la mesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido a la Mesa</Text>
      <Text style={styles.label}>Ingresa tu nombre para comenzar a ordenar</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        value={userName}
        onChangeText={setUserName}
        editable={!loading}
      />
      <Button title={loading ? 'Iniciando sesión...' : 'Comenzar'} onPress={handleSubmit} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {tableId && <Text style={styles.tableId}>Mesa: {tableId}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  tableId: {
    marginTop: 20,
    fontSize: 20,
    color: '#007AFF',
  },
});

export default TableSession;
