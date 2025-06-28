import { REACT_API_URL } from '@/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, Snackbar, Text } from 'react-native-paper';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Book {
  id: string;
  title: string;
  offPrice: string;
}

const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const totalAmount = cartItems.reduce((total, item) => total + item.subtotal, 0).toFixed(2);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchCart();
    }
  }, [isFocused]);
  // Fetch cart from API for logged-in user
  const fetchCartFromApi = async (userId: string) => {
    try {
      const response = await axios.get(`${REACT_API_URL}/ebooks/get_cart?id=${userId}`);
      const cartData = response.data.cart_details || [];
      const bookDetails = await Promise.all(
        cartData?.map(async (item: { book_id: string; quantity: number }) => {
          const bookResponse = await axios.get(`${REACT_API_URL}/ebooks/book-info?id=${item.book_id}`);
          const book: Book = bookResponse.data;
          return {
            id: item.book_id,
            name: book.title,
            price: parseFloat(book.offPrice),
            quantity: item.quantity,
            subtotal: parseFloat(book.offPrice) * item.quantity,
          };
        })
      );
      setCartItems(bookDetails);
      await AsyncStorage.setItem('cart', JSON.stringify(bookDetails));
    } catch (error) {
      console.error('Error fetching cart from API:', error);
      throw error;
    }
  };

  // Fetch cart from AsyncStorage for guest user
  const fetchCartFromStorage = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        setCartItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error fetching cart from storage:', error);
    }
  };

  // Fetch cart data
  const fetchCart = async () => {
    try {
      if (isLoggedIn && userId) {
        await fetchCartFromApi(userId);
      } else {
        await fetchCartFromStorage();
      }
    } catch (err) {
      throw err;
    }
  };

  // Initialize user state and cart
  useEffect(() => {
    const initializeCart = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setUserId(user.userId);
          await fetchCartFromApi(user.userId);
        } else {
          await fetchCartFromStorage();
        }
      } catch (err) {
        setError('Failed to load cart items. Please try again.');
        console.error('Initialize cart error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeCart();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCart();
      setSnackbarMessage('Cart refreshed');
    } catch (err) {
      setSnackbarMessage('Failed to refresh cart');
    } finally {
      setIsRefreshing(false);
      setSnackbarVisible(true);
    }
  };

  // Handle item deletion
  const handleDelete = async (id: string) => {
    try {
      if (isLoggedIn && userId) {
        await axios.post(`${REACT_API_URL}/ebooks/remove_from_cart`, { userId, book_id: id });
      }
      const updatedCart = cartItems.filter((item) => item.id !== id);
      setCartItems(updatedCart);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      setSnackbarMessage('Item removed from cart');
    } catch (error) {
      setSnackbarMessage('Failed to remove item from cart');
      console.error('Delete item error:', error);
    } finally {
      setSnackbarVisible(true);
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (bookId: string, newQuantity: number) => {
    try {
      if (isLoggedIn && userId) {
        await axios.post(`${REACT_API_URL}/ebooks/update_quantity`, {
          userId,
          book_id: bookId,
          quantity: newQuantity,
        });
      }
      const updatedCart = cartItems.map((item) => {
        if (item.id === bookId) {
          return { ...item, quantity: newQuantity, subtotal: item.price * newQuantity };
        }
        return item;
      });
      setCartItems(updatedCart);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      setSnackbarMessage('Quantity updated');
    } catch (error) {
      setSnackbarMessage('Failed to update quantity');
      console.error('Quantity change error:', error);
    } finally {
      setSnackbarVisible(true);
    }
  };

  const increase = (bookId: string, quantity: number) => {
    handleQuantityChange(bookId, quantity + 1);
  };

  const decrease = (bookId: string, quantity: number) => {
    if (quantity > 1) {
      handleQuantityChange(bookId, quantity - 1);
    }
  };

  const handleProceedToCheckout = () => {
    navigation.navigate('CheckoutScreen', { totalAmount });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F09300" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={fetchCart}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#F09300']}
            tintColor="#F09300"
          />
        }
      >
        {cartItems.length === 0 || null ? (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Text style={styles.cartTitle}>Shopping Cart</Text>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
                      {item.name}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                      <IconButton icon="delete-outline" size={20} iconColor="#FF5252" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.itemDetails}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>Price:</Text>
                      <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.quantityContainer}>
                      <Text style={styles.quantityLabel}>Quantity:</Text>
                      <View style={styles.quantityController}>
                        <TouchableOpacity
                          onPress={() => decrease(item.id, item.quantity)}
                          disabled={item.quantity === 1}
                          style={[styles.quantityButton, item.quantity === 1 && styles.quantityButtonDisabled]}
                        >
                          <Text style={[styles.quantityButtonText, item.quantity === 1 && styles.quantityButtonTextDisabled]}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          onPress={() => increase(item.id, item.quantity)}
                          style={styles.quantityButton}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.subtotalContainer}>
                      <Text style={styles.subtotalLabel}>Subtotal:</Text>
                      <Text style={styles.itemSubtotal}>₹{item.subtotal.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Cart Summary</Text>
              {cartItems.map((item, index) => (
                <View key={index} style={styles.summaryItem}>
                  <Text style={styles.summaryItemText} numberOfLines={1}>
                    {item.name} × {item.quantity}
                  </Text>
                  <Text style={styles.summaryItemSubtotal}>₹{item.subtotal.toFixed(2)}</Text>
                </View>
              ))}
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalAmount}>₹{totalAmount}</Text>
              </View>
              <Button
                mode="contained"
                onPress={handleProceedToCheckout}
                disabled={cartItems.length === 0}
                style={styles.checkoutButton}
                labelStyle={styles.checkoutButtonText}
              >
                Proceed to checkout
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
      {snackbarVisible && (
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9e5ab',
  },
  cartTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 2,
    padding: 16,
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  itemDetails: {
    gap: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
  },
  quantityController: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F09300',
  },
  quantityButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  quantityButtonTextDisabled: {
    color: '#999',
  },
  quantityText: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  subtotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  itemSubtotal: {
    fontSize: 18,
    color: '#F09300',
    fontWeight: '600',
  },
  itemSeparator: {
    height: 12,
  },
  summaryContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItemText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summaryItemSubtotal: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F09300',
  },
  checkoutButton: {
    marginTop: 16,
    backgroundColor: '#F09300',
    borderRadius: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  snackbar: {
    backgroundColor: '#333',
    borderRadius: 4,
  },
});

export default CartScreen;