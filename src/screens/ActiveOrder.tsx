import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderService } from '../services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ActiveOrder = () => {
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [tip, setTip] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const sessionId = await AsyncStorage.getItem('sessionId');
        if (!sessionId) throw new Error('No hay sesión activa');
        const data = await orderService.getTableOrderBySession(sessionId);
        setOrderData(data);
      } catch (e) {
        setOrderData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, []);

  const handleCallWaiter = () => {
    setModalMsg('Camarero llamado');
    setShowModal(true);
    setTimeout(() => setShowModal(false), 1200);
  };

  const handleAddTip = () => {
    setModalMsg(`Propina de $${tip} agregada`);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 1200);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (!orderData) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No hay pedido activo</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedido Activo</Text>
      <FlatList
        data={orderData.groupedOrders || []}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Ionicons name="fast-food-outline" size={28} color="#007AFF" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemDesc}>{item.customizations?.join(', ')}</Text>
              <Text style={styles.itemQty}>Cantidad: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${item.totalPrice}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
      <View style={styles.breakdownCard}>
        <Ionicons name="person-circle-outline" size={24} color="#007AFF" style={{ marginRight: 8 }} />
        <Text style={styles.breakdownText}>Total por usuario: ${orderData.totals?.individualTotals?.find(t => t.userName === orderData.user)?.total ?? 0}</Text>
      </View>
      <View style={styles.tipBox}>
        <Text style={styles.tipLabel}>Agregar propina:</Text>
        <TextInput
          style={styles.tipInput}
          placeholder="Propina ($)"
          keyboardType="numeric"
          value={tip}
          onChangeText={setTip}
        />
        <TouchableOpacity style={styles.tipBtn} onPress={handleAddTip}>
          <Ionicons name="cash-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.tipBtnText}>Agregar Propina</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.waiterBtn} onPress={handleCallWaiter}>
        <Ionicons name="call-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.waiterBtnText}>Llamar Mozo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace({ pathname: '../src/screens/Menu' })}>
        <Text style={styles.backBtnText}>Volver al Menú</Text>
      </TouchableOpacity>
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>{modalMsg}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 16,
  },
  empty: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    marginLeft: 16,
    fontFamily: 'System',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'System',
  },
  itemDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: 'System',
  },
  itemQty: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
    fontFamily: 'System',
  },
  itemPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  breakdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  breakdownText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  tipBox: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipLabel: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  tipInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    width: 80,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  tipBtn: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  tipBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  waiterBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF9500',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  waiterBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  backBtn: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
});

export default ActiveOrder;
