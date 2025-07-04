import { REACT_API_URL } from '@/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { IconButton, Portal, Snackbar, Text } from 'react-native-paper';
import { Loader } from '../Emagazine/EmagazineScreen';

interface RootStackParamList extends ParamListBase {
    BookDetail: { bookId: number };
}

export interface Book {
    id: number;
    title: string;
    subtitle: string;
    author: string;
    shortdesc: string;
    orgPrice: string;
    discount: string;
    offPrice: string;
    imgUrl: string;
    isFavorite?: boolean;
    isInCart?: boolean;
}

const BookListScreen: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [cartItems, setCartItems] = useState<number[]>([]);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const [userId, setUserId] = useState<string | null>(null);

    React.useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userString = await AsyncStorage.getItem('user');
                if (userString) {
                    const userObj = JSON.parse(userString);
                    setUserId(userObj.userId);
                }
            } catch (e) {
                console.log('Failed to load user information.');
            }
        };
        fetchUserId();
    }, []);

    const fetchBooks = useCallback(async () => {
        try {
            setError(null);
            const response = await axios.get(`${REACT_API_URL}/ebooks/books`);
            const booksData = response.data.map((book: Book) => ({
                ...book,
                isFavorite: favorites.includes(book.id),
                isInCart: cartItems.includes(book.id),
            }));
            setBooks(booksData);
            setFilteredBooks(booksData);
            setLoading(false);
            setRefreshing(false);
        } catch (err) {
            console.error('Error fetching books:', err);
            setError('Failed to load books. Pull to refresh.');
            setLoading(false);
            setRefreshing(false);
        }
    }, [favorites, cartItems]);

    const fetchFavorites = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await axios.get(`${REACT_API_URL}/favorites`, {
                params: { userId }
            });
            setFavorites(response.data.favorites || []);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    }, [userId]);

    const fetchCartItems = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await axios.get(`${REACT_API_URL}/ebooks/get_cart?id=${userId}`);
            setCartItems(response.data.cartItems || []);
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchFavorites();
            fetchCartItems();
        }
    }, [userId, fetchFavorites, fetchCartItems]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBooks();
        if (userId) {
            fetchFavorites();
            fetchCartItems();
        }
    }, [fetchBooks, fetchFavorites, fetchCartItems, userId]);

    const addToCart = useCallback(async (book: Book) => {
        if (!userId) {
            setSnackbarMessage('Please log in to add to cart');
            setSnackbarVisible(true);
            return;
        }
        try {
            await axios.post(`${REACT_API_URL}/ebooks/add_to_cart`, {
                userId,
                book: book.id,
                quantity: 1
            });
            setCartItems(prev => [...prev, book.id]);
            setFilteredBooks(prev => prev.map(b =>
                b.id === book.id ? { ...b, isInCart: true } : b
            ));
            setBooks(prev => prev.map(b =>
                b.id === book.id ? { ...b, isInCart: true } : b
            ));
            setSnackbarMessage('Added to cart');
            setSnackbarVisible(true);
        } catch (error) {
            console.error("Error adding to cart:", error);
            setSnackbarMessage('Failed to add to cart');
            setSnackbarVisible(true);
        }
    }, [userId]);

    const toggleFavorite = useCallback(async (book: Book) => {
        if (!userId) {
            setSnackbarMessage('Please log in to manage favorites');
            setSnackbarVisible(true);
            return;
        }
        try {
            if (favorites.includes(book.id)) {
                await axios.post(`${REACT_API_URL}/deleteFavorites`, {
                    userId,
                    bookId: book.id
                });
                setFavorites(prev => prev.filter(id => id !== book.id));
                setSnackbarMessage('Removed from favorites');
            } else {
                await axios.post(`${REACT_API_URL}/addFavorites`, {
                    userId,
                    bookId: book.id
                });
                setFavorites(prev => [...prev, book.id]);
                setSnackbarMessage('Added to favorites');
            }
            setFilteredBooks(prev => prev.map(b =>
                b.id === book.id ? { ...b, isFavorite: !b.isFavorite } : b
            ));
            setBooks(prev => prev.map(b =>
                b.id === book.id ? { ...b, isFavorite: !b.isFavorite } : b
            ));
            setSnackbarVisible(true);
        } catch (error) {
            console.error("Error toggling favorite:", error);
            setSnackbarMessage('Failed to update favorites');
            setSnackbarVisible(true);
        }
    }, [favorites, userId]);

    const renderBookCard = ({ item }: { item: Book }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
            activeOpacity={0.95}
        >
            <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.imgUrl }}
                        style={styles.bookImage}
                    />
                </View>

                <View style={styles.bookInfo}>
                    <View style={styles.bookHeader}>
                        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(item)}
                        >
                            <IconButton
                                icon={item.isFavorite ? "heart" : "heart-outline"}
                                iconColor={item.isFavorite ? "#FF6B6B" : "#FF9500"}
                                size={24}
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.bookSubtitle} numberOfLines={1}>{item.subtitle}</Text>

                    <Text style={styles.bookSubtitle} numberOfLines={1}>Author: ஜீவஅமிர்தம் கோ.திருமுகன், BE.</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.bookPrice}>
                            ₹{item.offPrice}
                        </Text>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={() => addToCart(item)}
                        >
                            <Text style={styles.cartButtonText}>
                                Add to Cart
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>SHOP BOOKS</Text>
        </View>
    );

    if (loading) return <Loader />

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredBooks}
                renderItem={renderBookCard}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.bookList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#FF9500']}
                        tintColor="#FF9500"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No books found</Text>
                    </View>
                }
            />
            <Portal>
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={styles.snackbar}
                >
                    {snackbarMessage}
                </Snackbar>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9e5ab',
    },
    headerContainer: {
        paddingHorizontal: 16
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        letterSpacing: 2,
        padding: 16,
        textAlign: 'center'
    },
    bookList: {
        paddingBottom: 30,
        paddingHorizontal: 12,
    },
    card: {
        marginBottom: 20,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 15,
    },
    imageContainer: {
        position: 'relative',
    },
    bookImage: {
        width: 110,
        height: 160,
        borderRadius: 12,
        marginRight: 16,
    },
    favoriteButton: {
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookInfo: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    bookHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    bookSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '700',
    },
    authorName: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    priceContainer: {
        marginBottom: 12,
    },
    bookPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF6B35',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-end',
    },
    cartButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FF9500',
    },
    cartButtonText: {
        color: '#FF9500',
        fontWeight: 'bold',
    },
    buyButton: {
        borderRadius: 12,
        backgroundColor: '#FF6B35',
        paddingVertical: 12,
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    buyButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#FF6B35',
        marginBottom: 20,
        fontWeight: '600',
    },
    retryButton: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#FF9500',
        fontWeight: '700',
    },
    snackbar: {
        backgroundColor: '#333',
        borderRadius: 4,
    },
});

export default BookListScreen;