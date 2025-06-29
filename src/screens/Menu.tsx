import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { productService } from '../services/api';
import { useRouter } from 'expo-router';

const COLORS = {
  brownDark: '#6F4E37',
  brown: '#A0522D',
  brownLight: '#D2B48C',
  beige: '#FFF8E1',
  white: '#fff',
  tabUnselected: '#F5E6D3',
  cardBg: '#F9F5F0',
};

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
            style={[styles.tab, selectedCategory === cat.id ? styles.tabSelected : styles.tabUnselected]}
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
            <TouchableOpacity onPress={() => router.push({ pathname: '/ProductDetail', params: { productId: item.id } })}>
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
      <TouchableOpacity style={styles.cartButton} onPress={() => router.push({ pathname: '/Cart' })}>
        <Text style={styles.cartButtonText}>Ver Carrito</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
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
    marginRight: 8,
  },
  tabUnselected: {
    backgroundColor: COLORS.tabUnselected,
  },
  tabSelected: {
    backgroundColor: COLORS.brownDark,
  },
  tabText: {
    color: COLORS.brown,
    fontWeight: 'bold',
  },
  tabTextSelected: {
    color: COLORS.white,
  },
  productCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: COLORS.brown,
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brownDark,
  },
  productDesc: {
    fontSize: 14,
    color: COLORS.brown,
    marginTop: 4,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: COLORS.brown,
    marginTop: 4,
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: COLORS.brownDark,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    shadowColor: COLORS.brown,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 32,
  },
  cartButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Menu;
