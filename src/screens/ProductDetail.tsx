import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { socketService } from '../services/socket';
import { useTableUsers } from '../contexts/TableUsersContext';

const COLORS = {
  brownDark: '#6F4E37',
  brown: '#A0522D',
  brownLight: '#D2B48C',
  beige: '#FFF8E1',
  white: '#fff',
  cardBg: '#F9F5F0',
  green: '#28a745',
  red: '#dc3545',
};

interface Customization {
  id: string;
  name: string;
  price_adjustment: number;
  customization_group?: string;
}

interface CustomizationGroup {
  is_required: boolean;
  max_quantity: number;
  customizations: Customization;
  customization_id: string;
}

const ProductDetail = () => {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const { users, currentUser, loading: usersLoading } = useTableUsers();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Estados para compartir
  const [shareType, setShareType] = useState<'none' | 'all' | 'specific'>('none');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const prod = await productService.getProduct(String(productId));
        setProduct(prod);
      } catch (e) {
        Alert.alert('Error', 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Función para agrupar customizaciones
  const groupCustomizations = (customizations: CustomizationGroup[] | undefined) => {
    if (!customizations) return {};
    const groups: Record<string, CustomizationGroup[]> = {};
    customizations.forEach((c) => {
      const group = c.customizations.customization_group || 'Otro';
      if (!groups[group]) groups[group] = [];
      groups[group].push(c);
    });
    return groups;
  };

  const handleCustomizationChange = (group: string, value: string) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [group]: value
    }));
  };

  const handleShareTypeChange = (value: 'none' | 'all' | 'specific') => {
    setShareType(value);
    if (value !== 'specific') {
      setSelectedUsers([]);
    }
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => {
      const newSelection = checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId);
      return newSelection;
    });
  };

  const handleAddToCart = async () => {
    try {
      if (shareType === 'specific' && selectedUsers.length === 0) {
        Alert.alert('Error', 'Por favor selecciona al menos un usuario para compartir');
        return;
      }

      setAdding(true);
      const cartId = await AsyncStorage.getItem('cartId');
      const userId = await AsyncStorage.getItem('userId');
      const tableId = await AsyncStorage.getItem('tableId');
      const userName = await AsyncStorage.getItem('userName');
      
      if (!cartId || !userId || !tableId || !userName) {
        throw new Error('Faltan datos de sesión');
      }

      const groupedCustomizations = groupCustomizations(product.customizations);

      if (!product.customizations || product.customizations.length === 0) {
        // Producto sin customizaciones
        const shareData = {
          isShared: shareType !== 'none',
          sharedWithAll: shareType === 'all',
          sharedWithUsers: shareType === 'specific' ? selectedUsers : undefined
        };

        await cartService.addToCart(cartId, product.id, quantity, [], shareData);
      } else {
        // Producto con customizaciones
        const requiredGroups = Object.entries(groupedCustomizations).filter(([, groupCustoms]) => 
          groupCustoms.some(c => c.is_required)
        );
        const missingRequired = requiredGroups.some(([group]) => !selectedCustomizations[group]);
        
        if (missingRequired) {
          Alert.alert('Error', 'Por favor selecciona todas las opciones requeridas');
          return;
        }

        const customizations = Object.values(selectedCustomizations).filter(Boolean);
        const shareData = {
          isShared: shareType !== 'none',
          sharedWithAll: shareType === 'all',
          sharedWithUsers: shareType === 'specific' ? selectedUsers : undefined
        };

        await cartService.addToCart(cartId, product.id, quantity, customizations, shareData);
      }

      // Emitir evento socket
      socketService.emitAddItem({
        productId: product.id,
        quantity,
        customizations: Object.values(selectedCustomizations).filter(Boolean),
        userId,
        tableId,
        userName,
      });

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.replace({ pathname: '/Menu' });
      }, 1200);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Error al agregar al carrito');
    } finally {
      setAdding(false);
    }
  };

  // Calcular precio total incluyendo customizaciones
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    const groupedCustomizations = groupCustomizations(product.customizations);
    const customizationPrice = Object.entries(selectedCustomizations).reduce((total, [group, customizationId]) => {
      const groupCustoms = groupedCustomizations[group];
      const customization = groupCustoms?.find(c => c.customization_id === customizationId);
      return total + (customization?.customizations.price_adjustment || 0);
    }, 0);

    return (product.price + customizationPrice) * quantity;
  };

  if (loading || usersLoading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!product) return <Text>Producto no encontrado</Text>;

  const groupedCustomizations = groupCustomizations(product.customizations);
  const otherUsers = users.filter(user => user.userId !== currentUser?.userId);
  const totalPrice = calculateTotalPrice();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.image_url && (
        <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
      )}
      
      <View style={styles.card}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.desc}>{product.description}</Text>

        {/* Customizaciones */}
        {Object.entries(groupedCustomizations).map(([group, groupCustoms]) => (
          <View key={group} style={styles.customSection}>
            <Text style={styles.customTitle}>
              {group} {groupCustoms.some(c => c.is_required) && <Text style={styles.required}>*</Text>}
            </Text>
            {groupCustoms.map((customization) => (
              <TouchableOpacity
                key={customization.customization_id}
                style={[
                  styles.customOption,
                  selectedCustomizations[group] === customization.customization_id && styles.customOptionSelected
                ]}
                onPress={() => handleCustomizationChange(group, customization.customization_id)}
              >
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radio,
                    selectedCustomizations[group] === customization.customization_id && styles.radioSelected
                  ]}>
                    {selectedCustomizations[group] === customization.customization_id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.customText,
                    selectedCustomizations[group] === customization.customization_id && styles.customTextSelected
                  ]}>
                    {customization.customizations.name}
                    {customization.customizations.price_adjustment > 0 && (
                      <Text style={styles.priceAdjustment}>
                        {' '}(+${customization.customizations.price_adjustment})
                      </Text>
                    )}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Sección de Compartir */}
        <View style={styles.shareSection}>
          <Text style={styles.shareTitle}>Compartir</Text>
          
          <TouchableOpacity
            style={[styles.shareOption, shareType === 'none' && styles.shareOptionSelected]}
            onPress={() => handleShareTypeChange('none')}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radio, shareType === 'none' && styles.radioSelected]}>
                {shareType === 'none' && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.shareText, shareType === 'none' && styles.shareTextSelected]}>
                Solo para mí
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareOption, shareType === 'all' && styles.shareOptionSelected]}
            onPress={() => handleShareTypeChange('all')}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radio, shareType === 'all' && styles.radioSelected]}>
                {shareType === 'all' && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.shareText, shareType === 'all' && styles.shareTextSelected]}>
                Compartir con toda la mesa
              </Text>
            </View>
          </TouchableOpacity>

          {otherUsers.length > 0 && (
            <TouchableOpacity
              style={[styles.shareOption, shareType === 'specific' && styles.shareOptionSelected]}
              onPress={() => handleShareTypeChange('specific')}
            >
              <View style={styles.radioContainer}>
                <View style={[styles.radio, shareType === 'specific' && styles.radioSelected]}>
                  {shareType === 'specific' && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.shareText, shareType === 'specific' && styles.shareTextSelected]} numberOfLines={2}>
                  Compartir con participantes específicos
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Lista de usuarios cuando se selecciona "specific" */}
          {shareType === 'specific' && otherUsers.length > 0 && (
            <View style={styles.userList}>
              <Text style={styles.userListTitle}>Selecciona con quién compartir:</Text>
              {otherUsers.map((user) => (
                <TouchableOpacity
                  key={user.userId}
                  style={styles.userOption}
                  onPress={() => handleUserSelection(user.userId, !selectedUsers.includes(user.userId))}
                >
                  <View style={styles.checkboxContainer}>
                    <View style={[
                      styles.checkbox,
                      selectedUsers.includes(user.userId) && styles.checkboxSelected
                    ]}>
                      {selectedUsers.includes(user.userId) && (
                        <Ionicons name="checkmark" size={16} color={COLORS.white} />
                      )}
                    </View>
                    <Text style={styles.userName}>
                      {user.userName}
                      {user.isOwner && <Text style={styles.ownerBadge}> (Anfitrión)</Text>}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Cantidad */}
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Ionicons name="remove-circle-outline" size={28} color={COLORS.brownDark} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
            <Ionicons name="add-circle-outline" size={28} color={COLORS.brownDark} />
          </TouchableOpacity>
        </View>

        {/* Precio total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
        </View>

        {/* Botón agregar al carrito */}
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart} disabled={adding}>
          {adding ? (
            <Ionicons name="hourglass-outline" size={20} color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.addBtnText}>Agregar al Carrito</Text>
            </>
          )}
        </TouchableOpacity>

        <Button title="Volver" onPress={() => router.back()} color={COLORS.brownDark} />
      </View>

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
    backgroundColor: COLORS.beige,
    flexGrow: 1,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: COLORS.cardBg,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: COLORS.brown,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brownDark,
    marginBottom: 8,
  },
  desc: {
    fontSize: 16,
    color: COLORS.brown,
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
    color: COLORS.brownDark,
    fontSize: 16,
  },
  required: {
    color: COLORS.red,
  },
  customOption: {
    padding: 4,
    borderRadius: 3,
    backgroundColor: '#F5F5F5',
    marginBottom: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  customOptionSelected: {
    backgroundColor: COLORS.brownLight,
    borderColor: COLORS.brown,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: COLORS.brown,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.white,
  },
  radioInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.white,
  },
  customText: {
    color: COLORS.brown,
    fontSize: 11,
    flex: 1,
    lineHeight: 14,
  },
  customTextSelected: {
    color: COLORS.brownDark,
    fontWeight: '500',
  },
  priceAdjustment: {
    color: COLORS.green,
    fontWeight: 'bold',
  },
  shareSection: {
    width: '100%',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.brownLight,
  },
  shareTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.brownDark,
    fontSize: 16,
  },
  shareOption: {
    padding: 4,
    borderRadius: 3,
    backgroundColor: '#F5F5F5',
    marginBottom: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  shareOptionSelected: {
    backgroundColor: COLORS.brownLight,
    borderColor: COLORS.brown,
  },
  shareText: {
    color: COLORS.brown,
    fontSize: 11,
    flex: 1,
    lineHeight: 14,
  },
  shareTextSelected: {
    color: COLORS.brownDark,
    fontWeight: '500',
  },
  userList: {
    marginTop: 12,
    marginLeft: 16,
  },
  userListTitle: {
    fontSize: 12,
    color: COLORS.brown,
    marginBottom: 8,
  },
  userOption: {
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.brown,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.brownDark,
    borderColor: COLORS.brownDark,
  },
  userName: {
    color: COLORS.brown,
    fontSize: 14,
  },
  ownerBadge: {
    color: COLORS.brownDark,
    fontSize: 12,
    fontStyle: 'italic',
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
    color: COLORS.brownDark,
    fontFamily: 'System',
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brownDark,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.brownDark,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
    shadowColor: COLORS.brown,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  addBtnText: {
    color: COLORS.white,
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
    backgroundColor: COLORS.white,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.green,
  },
});

export default ProductDetail; 