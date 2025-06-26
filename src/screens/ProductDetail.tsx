import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView, TouchableOpacity, ToastAndroid, Image, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { socketService } from '../services/socket';

const ProductDetail = () => {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const prod = await productService.getProduct(String(productId));
        setProduct(prod);
      } catch (e) {
        // Manejar error
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleToggleCustomization = (id: string) => {
    setSelectedCustomizations((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      const cartId = await AsyncStorage.getItem('cartId');
      const userId = await AsyncStorage.getItem('userId');
      const tableId = await AsyncStorage.getItem('tableId');
      const userName = await AsyncStorage.getItem('userName');
      if (!cartId || !userId || !tableId || !userName) throw new Error('Faltan datos de sesión');
      await cartService.addToCart(cartId, product.id, quantity, selectedCustomizations, userId, tableId, userName);
      socketService.emitAddItem({
        productId: product.id,
        quantity,
        customizations: selectedCustomizations,
        userId,
        tableId,
        userName,
      });
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.replace({ pathname: '../src/screens/Menu' });
      }, 1200);
    } catch (e: any) {
      ToastAndroid.show(e.message || 'Error al agregar al carrito', ToastAndroid.LONG);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!product) return <Text>Producto no encontrado</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.image_url && (
        <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
      )}
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      {product.customizations && product.customizations.length > 0 && (
        <View style={styles.customSection}>
          <Text style={styles.customTitle}>Customizaciones:</Text>
          {product.customizations.map((custom: any) => (
            <TouchableOpacity
              key={custom.id}
              style={[styles.customOption, selectedCustomizations.includes(custom.id) && styles.customOptionSelected]}
              onPress={() => handleToggleCustomization(custom.id)}
            >
              <Text style={styles.customText}>{custom.name} {custom.price_adjustment ? `(+${custom.price_adjustment})` : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.qtyRow}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
          <Ionicons name="remove-circle-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{quantity}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
          <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart} disabled={adding}>
        {adding ? (
          <Ionicons name="hourglass-outline" size={20} color="#fff" />
        ) : (
          <>
            <Ionicons name="cart-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addBtnText}>Agregar al Carrito</Text>
          </>
        )}
      </TouchableOpacity>
      <Button title="Volver" onPress={() => router.back()} />
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>¡Producto agregado al carrito!</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: '#007AFF',
    marginBottom: 8,
  },
  desc: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    textAlign: 'center',
  },
  customSection: {
    width: '100%',
    marginBottom: 16,
  },
  customTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  customOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  customOptionSelected: {
    backgroundColor: '#007AFF',
  },
  customText: {
    color: '#333',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  qtyBtn: {
    padding: 8,
  },
  qtyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    color: '#222',
    fontFamily: 'System',
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
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

export default ProductDetail; 