// import { REACT_API_URL } from '@/app-config';
// import { Loader } from '@/src/screens/Emagazine/EmagazineScreen';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import axios from 'axios';
// import { LinearGradient } from 'expo-linear-gradient';
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//     Dimensions,
//     FlatList,
//     Image,
//     ScrollView,
//     StyleSheet,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { IconButton, Text } from 'react-native-paper';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import IndividualHeader from '../header/IndividualHeader';

// const { width } = Dimensions.get('window');

// interface RootStackParamList {
//   BookDetail: { bookId: number };
//   [key: string]: object | undefined;
// }

// interface Book {
//   id: number;
//   title: string;
//   subtitle: string;
//   shortdesc: string;
//   description: string;
//   orgPrice: string;
//   discount: string;
//   offPrice: string;
//   img: string;
//   imgUrl: string;
//   isFavorite?: boolean;
//   isInCart?: boolean;
// }

// const BookDetailScreen: React.FC = () => {
//   const route = useRoute();
//   const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
//   const { bookId } = route.params as { bookId: number };

//   const [book, setBook] = useState<Book | null>(null);
//   const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [relatedLoading, setRelatedLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [quantity, setQuantity] = useState(1);
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [isInCart, setIsInCart] = useState(false);

//   useEffect(() => {
//     const fetchBook = async () => {
//       try {
//         const { data } = await axios.get(`${REACT_API_URL}/ebooks/book-info?id=${bookId}`);
//         console.log('Book data:', data); // Debug: Log book data
//         setBook(data);
//         setIsFavorite(data.isFavorite || false);
//         setIsInCart(data.isInCart || false);
//         setLoading(false);
//         fetchRelatedBooks();
//       } catch (err) {
//         console.error('Error fetching book:', err);
//         setError('Failed to load book details');
//         setLoading(false);
//       }
//     };
//     fetchBook();
//   }, [bookId]);

//   const fetchRelatedBooks = async () => {
//     try {
//       const { data } = await axios.get(`${REACT_API_URL}/ebooks/books`);
//       console.log('Related books data:', data); // Debug: Log related books data
//       const filtered = data.filter((b: Book) => b.id !== bookId).slice(0, 5);
//       setRelatedBooks(filtered);
//       setRelatedLoading(false);
//     } catch (err) {
//       console.error('Error fetching related books:', err);
//       setRelatedLoading(false);
//     }
//   };

//   const addToCart = useCallback(() => {
//     if (book) {
//       setIsInCart(!isInCart);
//       console.log(`${isInCart ? 'Removed from' : 'Added to'} cart: ${quantity} of ${book.title}`);
//     }
//   }, [book, quantity, isInCart]);

//   const toggleFavorite = useCallback(() => {
//     setIsFavorite(!isFavorite);
//     if (book) {
//       console.log(`${isFavorite ? 'Removed from' : 'Added to'} favorites: ${book.title}`);
//     }
//   }, [book, isFavorite]);

//   const buyNow = useCallback(() => {
//     if (book) {
//       console.log(`Buying ${quantity} of ${book.title}`);
//     }
//   }, [book, quantity]);

//   const adjustQuantity = (delta: number) => {
//     setQuantity((prev) => Math.max(1, prev + delta));
//   };

//   const navigateToBook = (bookId: number) => {
//     navigation.push('BookDetail', { bookId });
//   };

//   const renderRelatedBookCard = ({ item }: { item: Book }) => (
//     <TouchableOpacity
//       style={styles.relatedBookCard}
//       onPress={() => navigateToBook(item.id)}
//       activeOpacity={0.8}
//     >
//       <LinearGradient
//         colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.5)']}
//         style={styles.relatedCardGradient}
//       >
//         <Image
//           source={{ uri: item.imgUrl || 'https://via.placeholder.com/130x180' }}
//           style={styles.relatedBookImage}
//           onError={() => console.log(`Failed to load related book image: ${item.title}`)}
//         />
//         <View style={styles.relatedBookInfo}>
//           <Text style={styles.relatedBookTitle} numberOfLines={2}>
//             {item.title}
//           </Text>
//           <Text style={styles.relatedBookPrice}>
//             ₹{item.offPrice || item.orgPrice}
//           </Text>
//         </View>
//       </LinearGradient>
//     </TouchableOpacity>
//   );

//   if (loading) return <Loader />;

//   if (error || !book) {
//     return (
//       <View style={styles.errorContainer}>
//         <LinearGradient
//           colors={['#f9e5ab', '#FFE0B2']}
//           style={styles.errorGradient}
//         >
//           <Text style={styles.errorIcon}>😞</Text>
//           <Text style={styles.errorText}>{error || 'Book not found'}</Text>
//           <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
//             <Text style={styles.retryButtonText}>Go Back</Text>
//           </TouchableOpacity>
//         </LinearGradient>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//         <IndividualHeader/>
//       <LinearGradient
//         colors={['#f9e5ab', '#FFE0B2', '#FFCC80']}
//         style={styles.backgroundGradient}
//       >
//         <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//           <View style={styles.heroSection}>
//             <View style={styles.imageContainer}>
//               <Image
//                 source={{ uri: book.imgUrl || 'https://via.placeholder.com/200x300' }}
//                 style={styles.bookImage}
//                 onError={() => console.log(`Failed to load image for ${book.title}`)}
//               />
//               <TouchableOpacity style={styles.favoriteButtonLarge} onPress={toggleFavorite}>
//                 <LinearGradient
//                   colors={isFavorite ? ['#FF6B6B', '#FF8E53'] : ['#FF9500', '#FF6B35']}
//                   style={styles.favoriteGradient}
//                 >
//                   <IconButton
//                     icon={isFavorite ? 'heart' : 'heart-outline'}
//                     iconColor="#FFFFFF"
//                     size={30}
//                     style={styles.favoriteIconLarge}
//                   />
//                 </LinearGradient>
//               </TouchableOpacity>
//             </View>
//           </View>

//           <View style={styles.bookInfoSection}>
//             <View
//               style={styles.infoCard}
//             >
//               <Text style={styles.bookTitle}>{book.title}</Text>
//               <Text style={styles.bookSubtitle}>{book.subtitle}</Text>

//               <View style={styles.priceSection}>
//                 <Text style={styles.bookPrice}>₹{book.offPrice || book.orgPrice}</Text>
//               </View>
//                 <Text style={styles.quantityLabel}>Description</Text>
//               <Text style={styles.bookDescription}>
//                 {book.description || 'No description available'}
//               </Text>

//               <View style={styles.quantitySection}>
//                 <Text style={styles.quantityLabel}>Quantity:</Text>
//                 <View style={styles.quantityContainer}>
//                   <TouchableOpacity
//                     style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
//                     onPress={() => adjustQuantity(-1)}
//                     disabled={quantity === 1}
//                   >
//                     <Text
//                       style={[styles.quantityButtonText, quantity === 1 && styles.quantityButtonTextDisabled]}
//                     >
//                       −
//                     </Text>
//                   </TouchableOpacity>
//                   <View style={styles.quantityDisplay}>
//                     <Text style={styles.quantityText}>{quantity}</Text>
//                   </View>
//                   <TouchableOpacity style={styles.quantityButton} onPress={() => adjustQuantity(1)}>
//                     <Text style={styles.quantityButtonText}>+</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               <View style={styles.actionButtonsSection}>
//                 <TouchableOpacity
//                   style={[styles.cartButton, isInCart && styles.cartButtonActive]}
//                   onPress={addToCart}
//                 >
//                   <IconButton
//                     icon={isInCart ? 'cart-check' : 'cart-plus'}
//                     iconColor={isInCart ? '#4CAF50' : '#FF9500'}
//                     size={20}
//                     style={styles.cartIcon}
//                   />
//                   <Text style={[styles.cartButtonText, isInCart && styles.cartButtonTextActive]}>
//                     {isInCart ? 'In Cart' : 'Add to Cart'}
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.buyButton} onPress={buyNow}>
//                   <LinearGradient
//                     colors={['#FF9500', '#FF6B35']}
//                     style={styles.buyButtonGradient}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 0 }}
//                   >
//                     <Text style={styles.buyButtonText}>Buy Now</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>

//           <View style={styles.relatedBooksSection}>
//             <Text style={styles.relatedBooksTitle}>You might also like</Text>
//             {relatedLoading ? (
//               <View style={styles.relatedLoadingContainer}>
//                 <Text style={styles.relatedLoadingText}>Loading related books...</Text>
//               </View>
//             ) : relatedBooks.length === 0 ? (
//               <View style={styles.relatedLoadingContainer}>
//                 <Text style={styles.relatedLoadingText}>No related books found</Text>
//               </View>
//             ) : (
//               <FlatList
//                 data={relatedBooks}
//                 renderItem={renderRelatedBookCard}
//                 keyExtractor={(item) => item.id.toString()}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.relatedBooksList}
//                 ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
//               />
//             )}
//           </View>
//         </ScrollView>
//       </LinearGradient>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   backgroundGradient: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 30,
//   },
//   heroSection: {
//     alignItems: 'center',
//     paddingTop: 20,
//     paddingBottom: 30,
//   },
//   imageContainer: {
//     position: 'relative',
//     shadowColor: '#FF9500',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 15,
//     elevation: 15,
//   },
//   bookImage: {
//     width: width * 0.6,
//     height: width * 0.9,
//     borderRadius: 20,
//   },
//   favoriteButtonLarge: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     borderRadius: 30,
//     overflow: 'hidden',
//   },
//   favoriteGradient: {
//     width: 60,
//     height: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   favoriteIconLarge: {
//     margin: 0,
//   },
//   bookInfoSection: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   infoCard: {
//     backgroundColor: '#fff',
//     borderRadius: 25, 
//     padding: 25,
//     shadowColor: '#FF9500',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   bookTitle: {
//     fontSize: 26,
//     fontWeight: '800',
//     color: '#FF9500',
//     marginBottom: 8,
//     textAlign: 'center',
//     lineHeight: 32,
//   },
//   bookSubtitle: {
//     fontSize: 16,
//     color: '#FF9500',
//     opacity: 0.8,
//     marginBottom: 20,
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   priceSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 20,
//     flexWrap: 'wrap',
//   },
//   bookPrice: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: '#FF6B35',
//     marginRight: 12,
//   },
//   originalPrice: {
//     fontSize: 18,
//     color: '#FF9500',
//     opacity: 0.6,
//     textDecorationLine: 'line-through',
//     fontWeight: '500',
//     marginRight: 12,
//   },
//   discountBadge: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   discountText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   bookDescription: {
//     fontSize: 16,
//     color: '#FF9500',
//     opacity: 0.9,
//     lineHeight: 26,
//     marginBottom: 25,
//     textAlign: 'justify',
//     fontWeight: '500',
//   },
//   quantitySection: {
//     marginBottom: 25,
//   },
//   quantityLabel: {
//     fontSize: 18,
//     color: '#FF9500',
//     fontWeight: '700',
//     marginBottom: 12,
//     // textAlign: 'center',
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   quantityButton: {
//     width: 45,
//     height: 45,
//     borderRadius: 22,
//     backgroundColor: '#FF9500',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#FF9500',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   quantityButtonDisabled: {
//     backgroundColor: 'rgba(255, 149, 0, 0.3)',
//   },
//   quantityButtonText: {
//     fontSize: 22,
//     color: '#FFFFFF',
//     fontWeight: '700',
//   },
//   quantityButtonTextDisabled: {
//     color: 'rgba(255, 255, 255, 0.5)',
//   },
//   quantityDisplay: {
//     backgroundColor: 'rgba(255, 149, 0, 0.1)',
//     borderWidth: 2,
//     borderColor: 'rgba(255, 149, 0, 0.3)',
//     borderRadius: 15,
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     marginHorizontal: 15,
//   },
//   quantityText: {
//     fontSize: 20,
//     color: '#FF9500',
//     fontWeight: '700',
//   },
//   actionButtonsSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: 15,
//   },
//   cartButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 149, 0, 0.1)',
//     borderRadius: 15,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     borderWidth: 2,
//     borderColor: 'rgba(255, 149, 0, 0.3)',
//     flex: 1,
//     justifyContent: 'center',
//   },
//   cartButtonActive: {
//     backgroundColor: 'rgba(76, 175, 80, 0.1)',
//     borderColor: 'rgba(76, 175, 80, 0.3)',
//   },
//   cartIcon: {
//     margin: 0,
//     marginRight: 5,
//   },
//   cartButtonText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FF9500',
//   },
//   cartButtonTextActive: {
//     color: '#4CAF50',
//   },
//   buyButton: {
//     borderRadius: 15,
//     overflow: 'hidden',
//     flex: 1,
//     shadowColor: '#FF9500',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   buyButtonGradient: {
//     paddingVertical: 18,
//     paddingHorizontal: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buyButtonText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     textAlign: 'center',
//   },
//   relatedBooksSection: {
//     paddingHorizontal: 20,
//   },
//   relatedBooksTitle: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: '#FF9500',
//     marginBottom: 20,
//     textAlign: 'center',
//     letterSpacing: 1,
//   },
//   relatedLoadingContainer: {
//     padding: 40,
//     alignItems: 'center',
//   },
//   relatedLoadingText: {
//     fontSize: 16,
//     color: '#FF9500',
//     opacity: 0.7,
//     fontWeight: '600',
//   },
//   relatedBooksList: {
//     paddingLeft: 5,
//     paddingRight: 20,
//   },
//   relatedBookCard: {
//     width: width * 0.4,
//     borderRadius: 15,
//     overflow: 'hidden',
//     shadowColor: '#FF9500',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   relatedCardGradient: {
//     padding: 10,
//     alignItems: 'center',
//   },
//   relatedBookImage: {
//     width: '100%',
//     height: 180,
//     borderRadius: 12,
//     marginBottom: 10,
//   },
//   relatedBookInfo: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   relatedBookTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     textAlign: 'center',
//     marginBottom: 8,
//     lineHeight: 18,
//   },
//   relatedBookPrice: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FF6B35',
//   },
//   errorContainer: {
//     flex: 1,
//   },
//   errorGradient: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorIcon: {
//     fontSize: 48,
//     marginBottom: 16,
//   },
//   errorText: {
//     fontSize: 18,
//     color: '#FF6B35',
//     textAlign: 'center',
//     marginBottom: 20,
//     fontWeight: '600',
//   },
//   retryButton: {
//     backgroundColor: '#FF9500',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
// });

// export default BookDetailScreen;


import { REACT_API_URL } from '@/app-config';
import { Loader } from '@/src/screens/Emagazine/EmagazineScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import IndividualHeader from '../header/IndividualHeader';

const { width } = Dimensions.get('window');

interface RootStackParamList {
  BookDetail: { bookId: number };
  [key: string]: object | undefined;
}

interface Book {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  author: string;
  orgPrice: string;
  offPrice: string;
  imgUrl: string;
  isFavorite?: boolean;
  isInCart?: boolean;
}

const BookDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { bookId } = route.params as { bookId: number };

  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await axios.get(`${REACT_API_URL}/ebooks/book-info?id=${bookId}`);
        setBook(data);
        setIsFavorite(data.isFavorite || false);
        setIsInCart(data.isInCart || false);
        setLoading(false);
        fetchRelatedBooks();
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details');
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  const fetchRelatedBooks = async () => {
    try {
      const { data } = await axios.get(`${REACT_API_URL}/ebooks/books`);
      const filtered = data.filter((b: Book) => b.id !== bookId).slice(0, 5);
      setRelatedBooks(filtered);
      setRelatedLoading(false);
    } catch (err) {
      console.error('Error fetching related books:', err);
      setRelatedLoading(false);
    }
  };

  const addToCart = useCallback(() => {
    if (book) {
      setIsInCart(!isInCart);
    }
  }, [book, isInCart]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  const buyNow = useCallback(() => {
    if (book) {
      console.log(`Buying ${quantity} of ${book.title}`);
    }
  }, [book, quantity]);

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const navigateToBook = (bookId: number) => {
    navigation.push('BookDetail', { bookId });
  };

  const renderRelatedBookCard = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.relatedBookCard}
      onPress={() => navigateToBook(item.id)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imgUrl || 'https://via.placeholder.com/130x180' }}
        style={styles.relatedBookImage}
      />
      <View style={styles.relatedBookInfo}>
        <Text style={styles.relatedBookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.relatedBookFooter}>
          <Text style={styles.relatedBookPrice}>
            ₹{item.offPrice || item.orgPrice}
          </Text>
          <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
            <IconButton
              icon={isFavorite ? 'heart' : 'heart-outline'}
              iconColor="#FF6B35"
              size={20}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <Loader />;

  if (error || !book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Book not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <IndividualHeader/>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Image
            source={{ uri: book.imgUrl || 'https://via.placeholder.com/200x300' }}
            style={styles.bookImage}
          />
        </View>

        <View style={styles.bookInfoSection}>
          <View style={styles.infoCard}>
            <View style={styles.titleRow}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <TouchableOpacity onPress={toggleFavorite}>
                <IconButton
                  icon={isFavorite ? 'heart' : 'heart-outline'}
                  iconColor="#FF6B35"
                  size={24}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.bookSubtitle}>Author: {book.author}</Text>

            <Text style={styles.bookPrice}>₹{book.offPrice}</Text>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.bookDescription}>
              {book.description || 'No description available'}
            </Text>

            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                onPress={() => adjustQuantity(-1)}
                disabled={quantity === 1}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => adjustQuantity(1)}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtonsSection}>
              <TouchableOpacity
                style={[styles.cartButton, isInCart && styles.cartButtonActive]}
                onPress={addToCart}
              >
                <Text style={styles.cartButtonText}>
                  {isInCart ? 'In Cart' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buyButton} onPress={buyNow}>
                <Text style={styles.buyButtonText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.relatedBooksSection}>
          <Text style={styles.sectionTitle}>You might also like</Text>
          {relatedLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : relatedBooks.length === 0 ? (
            <Text style={styles.loadingText}>No related books found</Text>
          ) : (
            <FlatList
              data={relatedBooks}
              renderItem={renderRelatedBookCard}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedBooksList}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  bookImage: {
    width: width * 0.6,
    height: width * 0.8,
    borderRadius: 8,
  },
  bookInfoSection: {
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  bookSubtitle: {
    fontSize: 16,
    color: '#666',
    marginVertical: 4,
    fontStyle: 'italic',
  },
  bookPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  bookDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 20,
  },
  actionButtonsSection: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  cartButtonActive: {
    backgroundColor: '#4CAF50',
  },
  cartButtonText: {
    color: '#FF9500',
    fontWeight: 'bold',
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  relatedBooksSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  relatedBookCard: {
    width: width * 0.4,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  relatedBookImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  relatedBookInfo: {
    padding: 8,
  },
  relatedBookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  relatedBookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relatedBookPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  relatedBooksList: {
    paddingVertical: 8,

  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B35',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
});

export default BookDetailScreen;