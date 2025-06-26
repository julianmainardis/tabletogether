import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { tableService, TableSessionResponse } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const TableSession = () => {
  const { tableId } = useLocalSearchParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    try {
      setLoading(true);
      const response: TableSessionResponse = await tableService.startTableSession(String(tableId), name.trim());
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
      setError(error.message || 'No se pudo iniciar la sesión en la mesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unirse a la Mesa</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={20} color="#FF3B30" style={{ marginRight: 6 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.joinBtn} onPress={handleSubmit} disabled={loading || !name.trim()}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.joinBtnText}>Unirse</Text>
          </>
        )}
      </TouchableOpacity>
      {tableId && <Text style={styles.tableId}>Mesa: {tableId}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 24,
    fontFamily: 'System',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    fontFamily: 'System',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    fontFamily: 'System',
  },
  joinBtn: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  tableId: {
    marginTop: 20,
    fontSize: 20,
    color: '#007AFF',
  },
});

export default TableSession;
