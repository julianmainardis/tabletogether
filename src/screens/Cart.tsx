import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ToastAndroid, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartService } from '../services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { socketService } from '../services/socket';

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const fetchCart = async () => {
      setLoading(true);
      try {
        const cartId = await AsyncStorage.getItem('cartId');
        const tableId = await AsyncStorage.getItem('tableId');
        const sessionToken = await AsyncStorage.getItem('sessionToken');
        const sessionId = await AsyncStorage.getItem('sessionId');
        const userName = await AsyncStorage.getItem('userName');
        if (!cartId) throw new Error('No hay carrito activo');
        // Conectar socket si hay datos
        if (tableId && sessionToken && sessionId && userName) {
          socketService.connect(tableId, sessionToken, sessionId, userName);
          socketService.onCartUpdate(async (items) => {
            // Refrescar carrito en tiempo real
            const newItems = await cartService.getCartItems(cartId);
            setCartItems(newItems);
            // Mostrar toast si el cambio viene de otro usuario
            ToastAndroid.show('El carrito fue actualizado por otro usuario', ToastAndroid.SHORT);
          });
          unsubscribe = () => socketService.offCartUpdate(() => {});
        }
        const items = await cartService.getCartItems(cartId);
        setCartItems(items);
      } catch (e) {
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
    return () => {
      if (unsubscribe) unsubscribe();
      socketService.disconnect();
    };
  }, []);

  const getTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  };

  const handleUpdateQuantity = async (item: any, newQty: number) => {
    if (newQty < 1) return;
    try {
      setLoading(true);
      const cartId = await AsyncStorage.getItem('cartId');
      const userId = await AsyncStorage.getItem('userId');
      if (!cartId || !userId) throw new Error('Faltan datos de sesión');
      await cartService.updateCartItem(cartId, item.product_id, newQty, userId);
      // Emitir evento socket para tiempo real
      socketService.emitUpdateItem({
        ...item,
        quantity: newQty,
      });
      const items = await cartService.getCartItems(cartId);
      setCartItems(items);
      setModalMsg('Cantidad actualizada');
      setShowModal(true);
      setTimeout(() => setShowModal(false), 1000);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar la cantidad');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item: any) => {
    try {
      setLoading(true);
      const cartId = await AsyncStorage.getItem('cartId');
      if (!cartId) throw new Error('Faltan datos de sesión');
      await cartService.removeFromCart(cartId, item.product_id);
      // Emitir evento socket para tiempo real
      socketService.emitRemoveItem(item);
      const items = await cartService.getCartItems(cartId);
      setCartItems(items);
      setModalMsg('Producto eliminado');
      setShowModal(true);
      setTimeout(() => setShowModal(false), 1000);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo eliminar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);
      const cartId = await AsyncStorage.getItem('cartId');
      if (!cartId) throw new Error('No hay carrito activo');
      await cartService.createOrder(cartId);
      setModalMsg('¡Pedido confirmado!');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.replace({ pathname: '../src/screens/ActiveOrder' });
      }, 1200);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo confirmar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>El carrito está vacío</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace({ pathname: '../src/screens/Menu' })}>
          <Text style={styles.backBtnText}>Volver al Menú</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu Carrito</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Ionicons name="fast-food-outline" size={28} color="#007AFF" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.product?.name || 'Producto'}</Text>
              <Text style={styles.itemDesc}>{item.customizations?.join(', ')}</Text>
              <Text style={styles.itemQty}>Cantidad: {item.quantity}</Text>
            </View>
            <TouchableOpacity onPress={() => handleUpdateQuantity(item, item.quantity - 1)} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={22} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemove(item)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
      <View style={styles.totalsBox}>
        <Text style={styles.totalsTitle}>Total del carrito: ${getTotal()}</Text>
      </View>
      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmOrder}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.confirmBtnText}>Confirmar Pedido</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    marginLeft: 16,
    fontFamily: 'System',
  },
  empty: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
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
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  totalsBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  totalsTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  confirmBtn: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  confirmBtnText: {
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

export default Cart; 