import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { productService } from '../services/api';
import { useRouter } from 'expo-router';

const Menu = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const router = useRouter();

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
            <TouchableOpacity onPress={() => router.push({ pathname: '../src/screens/ProductDetail', params: { productId: item.id } })}>
              <View style={styles.productCard}>
                {/* Si tienes imágenes, puedes usar <Image source={{uri: item.image_url}} ... /> */}
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDesc}>{item.description}</Text>
                <Text style={styles.productPrice}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
      <TouchableOpacity style={styles.cartButton} onPress={() => router.push({ pathname: '../src/screens/Cart' })}>
        <Text style={styles.cartButtonText}>Ver Carrito</Text>
      </TouchableOpacity>
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
  productDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 4,
  },
  cartButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Menu;
