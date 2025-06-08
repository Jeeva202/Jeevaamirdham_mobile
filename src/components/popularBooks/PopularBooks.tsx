// // import { useNavigation } from '@react-navigation/native';
// // import { StackNavigationProp } from '@react-navigation/stack';
// // import React from 'react';
// // import {
// //     Dimensions,
// //     Image,
// //     StyleSheet,
// //     Text,
// //     TouchableOpacity,
// //     View
// // } from 'react-native';

// // interface Book {
// //   id: number;
// //   title: string;
// //   subtitle: string;
// //   offPrice: string;
// //   imgUrl: string;
// // }

// // interface Props {
// //   books: Book[];
// // }

// // const PopularBooks: React.FC<Props> = ({ books }) => {
// //   const navigation = useNavigation<StackNavigationProp<any>>();

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.sectionTitle}>Popular Books</Text>
// //       <View style={styles.booksContainer}>
// //         {books.slice(0, 3).map((book) => (
// //           <TouchableOpacity
// //             key={book.id}
// //             style={styles.bookCard}
// //             onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}
// //           >
// //             <Image
// //               source={{ uri: book.imgUrl }}
// //               style={styles.bookImage}
// //               resizeMode="cover"
// //             />
// //             <View style={styles.bookInfo}>
// //               <Text style={styles.bookTitle} numberOfLines={2}>
// //                 {book.title}
// //               </Text>
// //               <Text style={styles.bookSubtitle} numberOfLines={1}>
// //                 {book.subtitle}
// //               </Text>
// //               <Text style={styles.bookPrice}>₹{book.offPrice}</Text>
// //             </View>
// //           </TouchableOpacity>
// //         ))}
// //       </View>
// //     </View>
// //   );
// // };

// // const { width } = Dimensions.get('window');
// // const CARD_WIDTH = width * 0.6;

// // const styles = StyleSheet.create({
// //   container: {
// //     marginVertical: 16,
// //     paddingHorizontal: 16,
// //   },
// //   sectionTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 12,
// //   },
// //   booksContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //   },
// //   bookCard: {
// //     width: CARD_WIDTH,
// //     marginRight: 16,
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     overflow: 'hidden',
// //     elevation: 3,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //   },
// //   bookImage: {
// //     width: '100%',
// //     height: 180,
// //     borderTopLeftRadius: 8,
// //     borderTopRightRadius: 8,
// //   },
// //   bookInfo: {
// //     padding: 12,
// //   },
// //   bookTitle: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginBottom: 4,
// //   },
// //   bookSubtitle: {
// //     fontSize: 14,
// //     color: '#666',
// //     marginBottom: 8,
// //   },
// //   bookPrice: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#FF6B35',
// //   },
// // });

// // export default PopularBooks;


// import { MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import React from 'react';
// import {
//     Dimensions,
//     Image,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from 'react-native';

// interface Book {
//     id: number;
//     title: string;
//     subtitle: string;
//     offPrice: string;
//     originalPrice?: string;
//     imgUrl: string;
//     rating?: number;
//     discount?: string;
// }

// interface Props {
//     books: Book[];
// }

// const PopularBooks: React.FC<Props> = ({ books }) => {
//     const navigation = useNavigation<StackNavigationProp<any>>();

//     return (
//         <View style={styles.container}>
//             {/* Enhanced Header */}
//             <View style={styles.header}>
//                 <View>
//                     <Text style={styles.sectionTitle}>Popular Books</Text>
//                 </View>
//                 <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Books')}>
//                     <Text style={styles.viewAllText}>View All</Text>
//                     <MaterialIcons name="keyboard-arrow-right" size={16} color="#FFF" />
//                 </TouchableOpacity>

//             </View>

//             {/* Books Container */}
//             <View style={styles.booksContainer}>
//                 {books.slice(0, 2).map((book, index) => (
//                     <TouchableOpacity
//                         key={book.id}
//                         style={[styles.bookCard, index === books.length - 1 && styles.lastCard]}
//                         onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}
//                         activeOpacity={0.9}
//                     >
//                         {/* Book Image with Gradient Overlay */}
//                         <View style={styles.imageContainer}>
//                             <Image
//                                 source={{ uri: book.imgUrl }}
//                                 style={styles.bookImage}
//                                 resizeMode="cover"
//                             />

//                         </View>

//                         {/* Enhanced Book Info */}
//                         <View style={styles.bookInfo}>
//                             <Text style={styles.bookTitle} numberOfLines={2}>
//                                 {book.title}
//                             </Text>

//                             <Text style={styles.bookSubtitle} >
//                                 {book.subtitle}
//                             </Text>

//                             {/* Price Section */}
//                             <View style={styles.priceContainer}>
//                                 <View style={styles.priceRow}>
//                                     <Text style={styles.currentPrice}>₹{book.offPrice}</Text>
//                                 </View>
//                             </View>
//                             <View>
//                                 <TouchableOpacity
//                                     style={styles.cartButton}
//                                 // onPress={() => addToCart(item)}
//                                 >
//                                     <Text style={styles.cartButtonText}>
//                                         Add to Cart
//                                     </Text>
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                     </TouchableOpacity>
//                 ))}
//             </View>
//         </View>
//     );
// };
// export default PopularBooks;
// const { width } = Dimensions.get('window');
// const HORIZONTAL_PADDING = 16; // match container padding
// const CARD_GAP = 12;
// const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

// const styles = StyleSheet.create({
//     container: {
//         marginTop: 20,
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'flex-end',
//         marginBottom: 20,
//     },
//     sectionTitle: {
//         fontSize: 24,
//         fontWeight: '700',
//         color: '#1A1A1A',
//         letterSpacing: -0.5,
//     },
//     sectionSubtitle: {
//         fontSize: 14,
//         color: '#666',
//         marginTop: 2,
//     },
//     viewAllButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 10,
//         paddingVertical: 6,
//         backgroundColor: '#E68E00',
//         borderRadius: 20,
//     },
//     viewAllText: {
//         fontSize: 12,
//         fontWeight: '600',
//         color: '#fff',
//         marginRight: 4,
//     },
//     booksContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },
//     bookCard: {
//         width: CARD_WIDTH,
//         backgroundColor: '#FFF',
//         borderRadius: 12,
//         overflow: 'hidden',
//         marginBottom: 8,
//         flexDirection: 'column',
//         justifyContent: 'space-between',
//         alignItems: 'stretch',
//         minHeight: 280, // ensure enough height for alignment
//         shadowColor: '#EA580C',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 2,
//     },
//     lastCard: {
//         marginRight: 0,
//     },
//     imageContainer: {
//         position: 'relative',
//         height: 170,
//         padding: 10,
//         marginTop: 5
//     },
//     bookImage: {
//         width: '100%',
//         height: '100%',
//     },
//     discountBadge: {
//         position: 'absolute',
//         top: 8,
//         left: 8,
//         backgroundColor: '#FF4444',
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//         borderRadius: 4,
//     },
//     discountText: {
//         color: '#FFF',
//         fontSize: 10,
//         fontWeight: '700',
//     },
//     wishlistButton: {
//         position: 'absolute',
//         top: 8,
//         right: 8,
//         width: 28,
//         height: 28,
//         borderRadius: 14,
//         backgroundColor: 'rgba(0,0,0,0.3)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     imageGradient: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         height: 40,
//     },
//     bookInfo: {
//         flex: 1,
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'space-between',
//         padding: 12,
//     },
//     bookTitle: {
//         fontSize: 15,
//         fontWeight: '700',
//         color: '#1A1A1A',
//         lineHeight: 20,
//         marginBottom: 4,
//     },
//     bookSubtitle: {
//         fontSize: 12,
//         color: '#666',
//         marginBottom: 8,
//         fontStyle: 'italic',
//     },
//     ratingContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     starsContainer: {
//         flexDirection: 'row',
//         marginRight: 6,
//     },
//     ratingText: {
//         fontSize: 11,
//         color: '#888',
//     },
//     priceContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     priceRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     currentPrice: {
//         fontSize: 16,
//         fontWeight: '800',
//         color: '#FF6B35',
//     },
//     originalPrice: {
//         fontSize: 12,
//         color: '#999',
//         textDecorationLine: 'line-through',
//         marginLeft: 6,
//     },

//     addToCartButton: {
//         width: 35,
//         height: 35,
//         borderRadius: 24,
//         backgroundColor: '#FF6B35',
//         justifyContent: 'center',
//         alignItems: 'center',
//         elevation: 2,
//         shadowColor: '#FF6B35',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.3,
//         shadowRadius: 4,
//     },
//     quickActions: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     deliveryInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     deliveryText: {
//         fontSize: 10,
//         color: '#4CAF50',
//         marginLeft: 4,
//         fontWeight: '600',
//     },
//     stockInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     stockDot: {
//         width: 6,
//         height: 6,
//         borderRadius: 3,
//         backgroundColor: '#4CAF50',
//         marginRight: 4,
//     },
//     stockText: {
//         fontSize: 10,
//         color: '#4CAF50',
//         fontWeight: '600',
//     },
//     categoriesContainer: {
//         flexDirection: 'row',
//         marginTop: 16,
//         gap: 8,
//     },
//     categoryPill: {
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         backgroundColor: '#F5F5F5',
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: '#E0E0E0',
//     },
//     categoryText: {
//         fontSize: 12,
//         color: '#666',
//         fontWeight: '500',
//     },
//     cartButton: {
//         backgroundColor: '#fff',
//         paddingVertical: 8,
//         borderRadius: 8,
//         borderWidth: 2,
//         borderColor: '#FF9500',
//         width: '100%',
//         alignItems: 'center',
//         marginTop: 'auto', // push to bottom
//     },
//     cartButtonText: {
//         color: '#FF9500',
//         fontWeight: 'bold',
//         fontSize: 14,
//     },
// });






import { REACT_API_URL } from '@/app-config';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Portal, Snackbar } from 'react-native-paper';

interface Book {
    id: number;
    title: string;
    subtitle: string;
    offPrice: string;
    originalPrice?: string;
    imgUrl: string;
    rating?: number;
    discount?: string;
}

interface Props {
    books: Book[];
}

const PopularBooks: React.FC<Props> = ({ books }) => {
    const navigation = useNavigation<StackNavigationProp<any>>();
    const [userId, setUserId] = useState<string | null>(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Fetch userId from AsyncStorage on mount
    useEffect(() => {
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

    // Add to cart function
    const addToCart = async (bookId: number) => {
        if (!userId) {
            setSnackbarMessage('Please log in to add to cart');
            setSnackbarVisible(true);
            return;
        }
        try {
            await axios.post(`${REACT_API_URL}/ebooks/add_to_cart`, {
                userId,
                book: bookId,
                quantity: 1
            });
            setSnackbarMessage('Added to cart');
            setSnackbarVisible(true);
        } catch (error) {
            console.error("Error adding to cart:", error);
            setSnackbarMessage('Failed to add to cart');
            setSnackbarVisible(true);
        }
    };

    return (
        <View style={styles.container}>
            {/* Enhanced Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.sectionTitle}>Popular Books</Text>
                </View>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Books')}>
                    <Text style={styles.viewAllText}>View All</Text>
                    <MaterialIcons name="keyboard-arrow-right" size={16} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Books Container */}
            <View style={styles.booksContainer}>
                {books.slice(0, 2).map((book, index) => (
                    <TouchableOpacity
                        key={book.id}
                        style={[styles.bookCard, index === books.length - 1 && styles.lastCard]}
                        onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}
                        activeOpacity={0.9}
                    >
                        {/* Book Image with Gradient Overlay */}
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: book.imgUrl }}
                                style={styles.bookImage}
                                resizeMode="cover"
                            />
                        </View>

                        {/* Enhanced Book Info */}
                        <View style={styles.bookInfo}>
                            <Text style={styles.bookTitle} numberOfLines={2}>
                                {book.title}
                            </Text>
                            <Text style={styles.bookSubtitle}>
                                {book.subtitle}
                            </Text>
                            {/* Price Section */}
                            <View style={styles.priceContainer}>
                                <View style={styles.priceRow}>
                                    <Text style={styles.currentPrice}>₹{book.offPrice}</Text>
                                </View>
                            </View>
                            <View>
                                <TouchableOpacity
                                    style={styles.cartButton}
                                    onPress={() => addToCart(book.id)}
                                >
                                    <Text style={styles.cartButtonText}>
                                        Add to Cart
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            {/* Snackbar for feedback */}
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

export default PopularBooks;

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16; // match container padding
const CARD_GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#E68E00',
        borderRadius: 20,
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        marginRight: 4,
    },
    booksContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bookCard: {
        width: CARD_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        minHeight: 280, // ensure enough height for alignment
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lastCard: {
        marginRight: 0,
    },
    imageContainer: {
        position: 'relative',
        height: 170,
        padding: 10,
        marginTop: 5
    },
    bookImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FF4444',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    wishlistButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
    },
    bookInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 12,
    },
    bookTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        lineHeight: 20,
        marginBottom: 4,
    },
    bookSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 6,
    },
    ratingText: {
        fontSize: 11,
        color: '#888',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FF6B35',
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
        marginLeft: 6,
    },
    addToCartButton: {
        width: 35,
        height: 35,
        borderRadius: 24,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliveryText: {
        fontSize: 10,
        color: '#4CAF50',
        marginLeft: 4,
        fontWeight: '600',
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CAF50',
        marginRight: 4,
    },
    stockText: {
        fontSize: 10,
        color: '#4CAF50',
        fontWeight: '600',
    },
    categoriesContainer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 8,
    },
    categoryPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    categoryText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    cartButton: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FF9500',
        width: '100%',
        alignItems: 'center',
        marginTop: 'auto', // push to bottom
    },
    cartButtonText: {
        color: '#FF9500',
        fontWeight: 'bold',
        fontSize: 14,
    },
    snackbar: {
        backgroundColor: '#333',
        borderRadius: 4,
    },
});