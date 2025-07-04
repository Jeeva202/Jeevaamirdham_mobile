import { REACT_API_URL } from '@/app-config';
import IndividualHeader from '@/src/components/header/IndividualHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'react-query';

type OrderItem = {
    bookId: string;
    bookImage: string;
    bookTitle: string;
    quantity: number;
    price: number;
};

type Order = {
    orderId: string;
    orderDate: string;
    totalPrice: number;
    shipTo: string;
    shipAt: string;
    status: string;
    items: OrderItem[];
};

type CartItem = {
    book_id: string;
    quantity: number;
};

type CartModalProps = {
    visible: boolean;
    onClose: () => void;
};

type YourOrderProps = {
    route: {
        params: {
            userId: string;
            userEmail?: string;
            userName?: string;
        };
    };
};

// type NavigationProps = StackNavigationProp<RootStackParamList>;


const YourOrder: React.FC = () => {
    // const { userId, userEmail, userName } = route.params;
    const [userId, setUserId] = useState<string | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartModalVisible, setIsCartModalVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation<StackNavigationProp<any>>();

    React.useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userString = await AsyncStorage.getItem('user');
                if (userString) {
                    const userObj = JSON.parse(userString);
                    setUserId(userObj.userId);
                }
            } catch (e) {
                setError('Failed to load user information.');
            }
        };
        fetchUserId();
    }, []);


    // Fetch orders using React Query
    const { data: orders = [], isLoading, isError, error: queryError } = useQuery<Order[], Error>(
        ['orders', userId],
        async () => {
            try {
                const response = await axios.get(`${REACT_API_URL}/getUserOrders`, {
                    params: { userId },
                });
                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error('Invalid order data received.');
                }
                return response.data;
            } catch (err) {
                setError('Failed to fetch orders.');
                throw err;
            }
        },
        {
            enabled: !!userId,
            retry: 1,
        }
    );

    const handleAddToCart = async (bookId: string, quantity: number) => {
        if (userId) {
            try {
                const response = await axios.post(`${REACT_API_URL}/ebooks/add_to_cart`, {
                    userId,
                    book: bookId,
                    quantity,
                });
                setCartItems(response.data.cart_details || []);
            } catch (error) {
                setError('Error adding to cart.');
            }
        } else {
            setCartItems([...cartItems, { book_id: bookId, quantity: quantity || 1 }]);
        }
        setIsCartModalVisible(true);
    };

    const navigateToCart = () => {
        setIsCartModalVisible(false);
        navigation.navigate('Main', {
            screen: 'Cart',
        });
    };

    // Simple Cart Modal Component
    const CartModal: React.FC<CartModalProps> = ({ visible, onClose }) => {
        if (!visible) return null;
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Cart Updated</Text>
                    <View style={styles.cartModal}>
                        <Button mode="outlined" onPress={onClose} style={styles.modalButton}>
                            Close
                        </Button>
                        <Button mode="contained" onPress={navigateToCart} style={styles.modalButton}>
                            View Cart
                        </Button>
                    </View>

                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#f09300" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (isError || error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <IndividualHeader headerName='Your Orders' />

                <Card style={styles.emptyCard}>
                    <Card.Content style={styles.centered}>
                        <Text style={styles.emptyText}>{error || (queryError instanceof Error ? queryError.message : 'Failed to load orders.')}</Text>
                    </Card.Content>
                </Card>
            </SafeAreaView>

        );
    }

    if (!orders || orders.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <IndividualHeader headerName='Your Orders' />
                <View style={styles.emptyCartContainer}>
                    <Text style={styles.emptyText}>Your order is empty</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <ImageBackground
            source={require('@/assets/images/appBackground.png')}
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safeArea}>
                <IndividualHeader headerName='Your Orders' />
                <ScrollView contentContainerStyle={styles.container}>
                    {orders.map((order, index) => (
                        <Card key={order.orderId || index} style={styles.orderCard}>
                            {/* Compact Order Header */}
                            <View style={styles.orderHeader}>
                                <View style={styles.orderInfo}>
                                    <Text style={styles.orderStatus}>{order.status || 'Order Placed'}</Text>
                                    <Text style={styles.orderId}>#{order.orderId}</Text>
                                </View>
                                <View style={styles.orderMeta}>
                                    <Text style={styles.orderTotal}>₹{order.totalPrice}</Text>
                                    <Text style={styles.orderDate}>
                                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: '2-digit'
                                        }) : '-'}
                                    </Text>
                                </View>
                            </View>

                            {/* Compact Shipping Info */}
                            <View style={styles.shippingRow}>
                                <Text style={styles.shippingText} numberOfLines={1}>
                                    Shipping to: {order.shipAt}
                                </Text>
                                <Text style={styles.deliveryText}>5-7 days</Text>
                            </View>

                            <Divider style={styles.divider} />

                            {/* Compact Items List */}
                            <View style={styles.itemsList}>
                                {order.items && order.items.map((item: OrderItem, itemIndex: number) => (
                                    <View key={item.bookId || itemIndex} style={styles.itemRow}>
                                        <Image
                                            source={{ uri: item.bookImage || 'https://via.placeholder.com/40x55' }}
                                            style={styles.bookImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemTitle} numberOfLines={2}>
                                                {item.bookTitle}
                                            </Text>
                                            <View style={styles.itemDetails}>
                                                <Text style={styles.quantityPrice}>
                                                    Qty: {item.quantity} • ₹{item.price * item.quantity}
                                                </Text>
                                            </View>
                                        </View>
                                        <Button
                                            mode="contained"
                                            onPress={() => handleAddToCart(item.bookId, 1)}
                                            style={styles.buyButton}
                                            labelStyle={styles.buttonLabel}
                                            compact
                                        >
                                            Buy Again
                                        </Button>
                                    </View>
                                ))}
                            </View>
                        </Card>
                    ))}
                </ScrollView>

                <CartModal visible={isCartModalVisible} onClose={() => setIsCartModalVisible(false)} />
            </SafeAreaView>
        </ImageBackground>
    );
};

export default YourOrder;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        // backgroundColor: '#f9e5ab',
    },
    container: {
        padding: 16,
    },
    orderCard: {
        marginBottom: 16,
        borderRadius: 6,
        elevation: 2,
        backgroundColor: '#fff',
        overflow: 'hidden',
        paddingHorizontal: 8
    },
    orderHeader: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    orderInfo: {
        flex: 1,
    },
    orderStatus: {
        color: '#f09300',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    orderId: {
        color: '#666',
        fontSize: 14,
    },
    orderMeta: {
        alignItems: 'flex-end',
    },
    orderTotal: {
        fontSize: 16,
        color: '#f09300',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    orderDate: {
        color: '#666',
        fontSize: 14,
    },
    shippingRow: {
        padding: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    shippingText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        marginRight: 8,
    },
    deliveryText: {
        fontSize: 12,
        color: '#f09300',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
    },
    itemsList: {
        padding: 8,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    bookImage: {
        width: 40,
        height: 55,
        borderRadius: 3,
        marginRight: 10,
    },
    itemInfo: {
        flex: 1,
        marginRight: 8,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityPrice: {
        fontSize: 14,
        color: '#666',
    },
    buyButton: {
        backgroundColor: '#f09300',
        borderRadius: 30,
        minWidth: 70,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    buttonLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 2,
        marginVertical: 2,
    },
    modalContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '85%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        // backgroundColor: '#f09300',
        borderRadius: 25,
        width: '40%'
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    emptyCard: {
        margin: 16,
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 3,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#666',
        fontWeight: '600',
    },
    cartModal: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        gap: 20,
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});