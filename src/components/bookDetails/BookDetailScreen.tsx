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
      <IndividualHeader headerName={''}/>
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