// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import { LinearGradient } from 'expo-linear-gradient';
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//     FlatList,
//     Image,
//     RefreshControl,
//     StyleSheet,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { IconButton, Text } from 'react-native-paper';

// import { REACT_API_URL } from '@/app-config';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { Loader } from '../Emagazine/EmagazineScreen';


// interface RootStackParamList {
//     BookDetail: { bookId: number };
//     [key: string]: object | undefined;
// }

// interface Book {
//     id: number;
//     title: string;
//     subtitle: string;
//     shortdesc: string;
//     orgPrice: string;
//     discount: string;
//     offPrice: string;
//     img: string;
//     imgUrl: string;
//     isFavorite?: boolean;
//     isInCart?: boolean;
// }

// const BookListScreen: React.FC = () => {
//     const [books, setBooks] = useState<Book[]>([]);
//     const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [favorites, setFavorites] = useState<Set<number>>(new Set());
//     const [cartItems, setCartItems] = useState<Set<number>>(new Set());
//     const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

//     const fetchBooks = useCallback(async () => {
//         try {
//             setError(null);
//             const response = await axios.get(`${REACT_API_URL}/ebooks/books`);
//             const booksData = response.data.map((book: Book) => ({
//                 ...book,
//                 isFavorite: favorites.has(book.id),
//                 isInCart: cartItems.has(book.id),
//             }));
//             setBooks(booksData);
//             setFilteredBooks(booksData);
//             setLoading(false);
//             setRefreshing(false);
//         } catch (err) {
//             console.error('Error fetching books:', err);
//             setError('Failed to load books. Pull to refresh.');
//             setLoading(false);
//             setRefreshing(false);
//         }
//     }, [favorites, cartItems]);

//     useEffect(() => {
//         fetchBooks();
//     }, [fetchBooks]);

//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         fetchBooks();
//     }, [fetchBooks]);

//     const addToCart = useCallback((book: Book) => {
//         const newCartItems = new Set(cartItems);
//         if (cartItems.has(book.id)) {
//             newCartItems.delete(book.id);
//         } else {
//             newCartItems.add(book.id);
//         }
//         setCartItems(newCartItems);

//         setFilteredBooks(prev => prev.map(b =>
//             b.id === book.id ? { ...b, isInCart: !b.isInCart } : b
//         ));
//         setBooks(prev => prev.map(b =>
//             b.id === book.id ? { ...b, isInCart: !b.isInCart } : b
//         ));
//     }, [cartItems]);

//     const toggleFavorite = useCallback((book: Book) => {
//         const newFavorites = new Set(favorites);
//         if (favorites.has(book.id)) {
//             newFavorites.delete(book.id);
//         } else {
//             newFavorites.add(book.id);
//         }
//         setFavorites(newFavorites);

//         setFilteredBooks(prev => prev.map(b =>
//             b.id === book.id ? { ...b, isFavorite: !b.isFavorite } : b
//         ));
//         setBooks(prev => prev.map(b =>
//             b.id === book.id ? { ...b, isFavorite: !b.isFavorite } : b
//         ));
//     }, [favorites]);

//     const buyNow = useCallback((book: Book) => {
//         console.log(`Buying ${book.title}`);
//         // Navigate to checkout or payment screen
//     }, []);

//     const renderBookCard = ({ item, index }: { item: Book; index: number }) => (
//         <TouchableOpacity
//             style={[
//                 styles.card,
//                 {
//                     transform: [{ scale: 1 }],
//                     marginTop: index === 0 ? 10 : 0
//                 }
//             ]}
//             onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
//             activeOpacity={0.95}
//         >
//             <LinearGradient
//                 colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
//                 style={styles.cardGradient}
//             >
//                 <View style={styles.cardContent}>
//                     <View style={styles.imageContainer}>
//                         <Image
//                             source={{ uri: item.imgUrl }}
//                             style={styles.bookImage}
//                             onError={() => console.log(`Failed to load image for ${item.title}`)}
//                         />
//                     </View>

//                     <View style={styles.bookInfo}>
//                         <View style={styles.bookHeader}>
//                             <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
//                             <TouchableOpacity
//                                 style={styles.favoriteButton}
//                                 onPress={() => toggleFavorite(item)}
//                             >
//                                 <IconButton
//                                     icon={item.isFavorite ? "heart" : "heart-outline"}
//                                     iconColor={item.isFavorite ? "#FF6B6B" : "#FF9500"}
//                                     size={24}
//                                     style={styles.favoriteIcon}
//                                 />
//                             </TouchableOpacity>
//                         </View>

//                         <Text style={styles.bookSubtitle} numberOfLines={1}>{item.subtitle}</Text>

//                         <View style={styles.priceContainer}>
//                             <Text style={styles.bookPrice}>
//                                 ₹{item.offPrice}
//                             </Text>
//                         </View>

//                         <View style={styles.actionButtons}>
//                             <TouchableOpacity
//                                 style={[styles.cartButton, item.isInCart && styles.cartButtonActive]}
//                                 onPress={() => addToCart(item)}
//                             >
//                                 <Text style={[styles.cartButtonText, item.isInCart && styles.cartButtonTextActive]}>
//                                     {item.isInCart ? 'In Cart' : 'Add to Cart'}
//                                 </Text>
//                             </TouchableOpacity>

//                             <TouchableOpacity
//                                 style={styles.buyButton}
//                                 onPress={() => buyNow(item)}
//                             >
//                                 <Text style={styles.buyButtonText}>Buy Now</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </View>
//             </LinearGradient>
//         </TouchableOpacity>
//     );

//     const renderHeader = () => (
//         <View style={styles.headerContainer}>
//             <Text style={styles.headerTitle}>SHOP BOOKS</Text>
//         </View>
//     );

//     if (loading) return <Loader />

//     if (error) {
//         return (
//             <View style={styles.errorContainer}>
//                 <LinearGradient
//                     colors={['#f9e5ab', '#FFE0B2']}
//                     style={styles.errorGradient}
//                 >
//                     <Text style={styles.errorText}>{error}</Text>
//                     <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
//                         <Text style={styles.retryButtonText}>Failed to fetch, Try Again</Text>
//                     </TouchableOpacity>
//                 </LinearGradient>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             <View style={styles.backgroundGradient}>
//                 <FlatList
//                     data={filteredBooks}
//                     renderItem={renderBookCard}
//                     keyExtractor={(item) => item.id.toString()}
//                     ListHeaderComponent={renderHeader}
//                     contentContainerStyle={styles.bookList}
//                     showsVerticalScrollIndicator={false}
//                     refreshControl={
//                         <RefreshControl
//                             refreshing={refreshing}
//                             onRefresh={onRefresh}
//                             colors={['#FF9500']}
//                             tintColor="#FF9500"
//                         />
//                     }
//                     ListEmptyComponent={
//                         <View style={styles.emptyContainer}>
//                             <Text style={styles.emptyIcon}>🔍</Text>
//                             <Text style={styles.emptyText}>No books found</Text>
//                         </View>
//                     }
//                 />
//             </View>
//         </View>
//     );
// };

// export default BookListScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f9e5ab',
//     },
//     backgroundGradient: {
//         flex: 1,
//     },
//     headerContainer: {
//         marginBottom: 10,
//     },
//     headerTitle: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#F09300',
//         letterSpacing: 2,
//         paddingHorizontal: 16
//     },

//     bookList: {
//         paddingBottom: 30,
//     },
//     card: {
//         marginBottom: 20,
//         marginHorizontal: 16,
//         borderRadius: 20,
//         overflow: 'hidden',
//         elevation: 8,
//         shadowColor: '#FF9500',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.15,
//         shadowRadius: 12,
//     },
//     cardGradient: {
//         flex: 1,
//         backgroundColor: '#fff'
//     },
//     cardContent: {
//         flexDirection: 'row',
//         padding: 20,
//     },
//     imageContainer: {
//         position: 'relative',
//     },
//     bookImage: {
//         width: 110,
//         height: 160,
//         borderRadius: 12,
//         marginRight: 16,
//     },
//     favoriteButton: {
//         borderRadius: 20,
//         width: 40,
//         height: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     favoriteIcon: {
//         margin: 0,
//     },
//     bookInfo: {
//         flex: 1,
//         justifyContent: 'space-between',
//     },
//     bookHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         alignContent: 'center'
//     },
//     bookTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#0a0a0a',
//         flex: 1,
//         marginRight: 8,
//     },
//     bookSubtitle: {
//         fontSize: 14,
//         color: '#666',
//         opacity: 0.7,
//         marginBottom: 8,
//         fontWeight: '700',
//     },
//     priceContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 12,
//     },
//     bookPrice: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#FF6B35',
//         marginRight: 8,
//     },
//     actionButtons: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         gap: 10, // optional, helps maintain spacing
//     },

//     cartButton: {
//         backgroundColor: '#fff',
//         paddingVertical: 12,
//         paddingHorizontal: 20,
//         borderRadius: 12,
//         marginRight: 10,
//         alignItems: 'center',
//         borderWidth: 2,
//         borderColor: '#FF9500',
//     },

//     cartButtonActive: {
//         backgroundColor: 'rgba(76, 175, 80, 0.1)',
//         borderColor: 'rgba(76, 175, 80, 0.3)',
//     },

//     cartButtonText: {
//         color: '#FF9500',
//         fontWeight: 'bold',
//     },

//     cartButtonTextActive: {
//         color: '#4CAF50',
//     },

//     buyButton: {
//         borderRadius: 12,
//         backgroundColor: '#FF6B35', // Solid orange color
//         paddingVertical: 12,
//         paddingHorizontal: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     buyButtonText: {
//         fontSize: 14,
//         fontWeight: '700',
//         color: '#FFFFFF',
//     },

//     loadingContainer: {
//         flex: 1,
//     },
//     loadingGradient: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     loadingText: {
//         fontSize: 16,
//         color: '#FF9500',
//         marginTop: 16,
//         fontWeight: '600',
//     },
//     errorContainer: {
//         flex: 1,
//     },
//     errorGradient: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//     },
//     errorIcon: {
//         fontSize: 48,
//         marginBottom: 16,
//     },
//     errorText: {
//         fontSize: 18,
//         color: '#FF6B35',
//         textAlign: 'center',
//         marginBottom: 20,
//         fontWeight: '600',
//     },
//     retryButton: {
//         backgroundColor: '#FF9500',
//         paddingHorizontal: 24,
//         paddingVertical: 12,
//         borderRadius: 12,
//     },
//     retryButtonText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '700',
//     },
//     emptyContainer: {
//         alignItems: 'center',
//         paddingVertical: 40,
//         paddingHorizontal: 20,
//     },
//     emptyIcon: {
//         fontSize: 48,
//         marginBottom: 16,
//     },
//     emptyText: {
//         fontSize: 18,
//         color: '#FF9500',
//         fontWeight: '700',
//         marginBottom: 8,
//     },
//     emptySubtext: {
//         fontSize: 14,
//         color: '#FF9500',
//         opacity: 0.7,
//         textAlign: 'center',
//     },
// });


import { REACT_API_URL } from '@/app-config';
import { useNavigation } from '@react-navigation/native';
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
import { IconButton, Text } from 'react-native-paper';
import { Loader } from '../Emagazine/EmagazineScreen';

import { ParamListBase } from '@react-navigation/native';

interface RootStackParamList extends ParamListBase {
    BookDetail: { bookId: number };
}

export interface Book {
    id: number;
    title: string;
    subtitle: string;
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
    const [favorites, setFavorites] = useState<Set<number>>(new Set());
    const [cartItems, setCartItems] = useState<Set<number>>(new Set());
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const fetchBooks = useCallback(async () => {
        try {
            setError(null);
            const response = await axios.get(`${REACT_API_URL}/ebooks/books`);
            const booksData = response.data.map((book: Book) => ({
                ...book,
                isFavorite: favorites.has(book.id),
                isInCart: cartItems.has(book.id),
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

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBooks();
    }, [fetchBooks]);

    const addToCart = useCallback((book: Book) => {
        const newCartItems = new Set(cartItems);
        if (cartItems.has(book.id)) {
            newCartItems.delete(book.id);
        } else {
            newCartItems.add(book.id);
        }
        setCartItems(newCartItems);

        setFilteredBooks(prev => prev.map(b =>
            b.id === book.id ? { ...b, isInCart: !b.isInCart } : b
        ));
        setBooks(prev => prev.map(b =>
            b.id === book.id ? { ...b, isInCart: !b.isInCart } : b
        ));
    }, [cartItems]);

    const toggleFavorite = useCallback((book: Book) => {
        const newFavorites = new Set(favorites);
        if (favorites.has(book.id)) {
            newFavorites.delete(book.id);
        } else {
            newFavorites.add(book.id);
        }
        setFavorites(newFavorites);

        setFilteredBooks(prev => prev.map(b =>
            b.id === book.id ? { ...b, isFavorite: !b.isFavorite } : b
        ));
        setBooks(prev => prev.map(b =>
            b.id === book.id ? { ...b, isFavorite: !b.isFavorite } : b
        ));
    }, [favorites]);

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

                        <TouchableOpacity
                            style={styles.buyButton}
                            onPress={() => { }}
                        >
                            <Text style={styles.buyButtonText}>Buy Now</Text>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9e5ab',
    },
    headerContainer: {
        marginBottom: 10,
        paddingHorizontal: 16
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    bookList: {
        paddingBottom: 30,
        paddingHorizontal: 12, // add horizontal padding here
    },
    card: {
        marginBottom: 20,
        // marginHorizontal: 16, // REMOVE this to prevent overflow
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
        padding: 20,
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
        flexDirection: 'column', // ensure column layout
        justifyContent: 'space-between',
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
        marginTop: 'auto', // push buttons to the bottom
        alignItems: 'flex-end',
    },
    cartButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF9500',
    },
    cartButtonActive: {
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    cartButtonText: {
        color: '#FF9500',
        fontWeight: 'bold',
    },
    cartButtonTextActive: {
        color: '#4CAF50',
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
});

export default BookListScreen;