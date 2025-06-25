import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productService } from '../services/api';

const Menu = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
        if (cats.length > 0) setSelectedCategory(cats[0].id);
      } catch (e) {
        // Manejar error
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const allProducts = await productService.getProducts();
        setProducts(allProducts.filter((p: any) => p.category_id === selectedCategory));
      } catch (e) {
        // Manejar error
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.tab, selectedCategory === cat.id && styles.tabSelected]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.tabText, selectedCategory === cat.id && styles.tabTextSelected]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loadingProducts ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
              {/* Aquí irá el botón para ver detalles/agregar al carrito */}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  tabs: {
    flexGrow: 0,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  tabSelected: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  tabTextSelected: {
    color: '#fff',
  },
  productCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 4,
  },
});

export default Menu;
