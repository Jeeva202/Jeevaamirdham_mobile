import { REACT_API_URL } from '@/app-config';
import IndividualHeader from '@/src/components/header/IndividualHeader';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type Book = {
    id: string;
    title: string;
    imgUrl: string;
    description?: string;
    price?: number;
    author?: string;
    genre?: string;
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchFavorites();
  }, []);


  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const id = await AsyncStorage.getItem('user');
      const userId = id ? JSON.parse(id).userId : null;
      if (!userId) {
        setError('Please log in to view favorites');
        return;
      }

      const response = await axios.get(`${REACT_API_URL}/favorites`, {
        params: { userId },
      });

      const bookDetails = await Promise.all(
        response.data.favorites.map(async (bookId: string) => {
          const bookResponse = await axios.get(`${REACT_API_URL}/ebooks/book-info`, {
            params: { id: bookId },
          });
          return {
            ...bookResponse.data,
            id: bookId,
          };
        })
      );

      setFavorites(bookDetails);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const confirmDelete = (bookId: string, title: string) => {
    Alert.alert(
      'Remove from Favorites',
      `Remove "${title}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          onPress: () => handleDelete(bookId),
          style: 'destructive'
        },
      ]
    );
  };

  const handleDelete = async (bookId: string) => {
    try {
      const id = await AsyncStorage.getItem('user');
      const userId = id ? JSON.parse(id).userId : null;
      setDeletingIds((prev) => [...prev, bookId]);
      
      await axios.post(`${REACT_API_URL}/deleteFavorites`, {
        userId,
        bookId,
      });
      
      setFavorites((prev) => prev.filter((item) => item.id !== bookId));
    } catch (error) {
      console.error('Error deleting favorite:', error);
      Alert.alert('Error', 'Failed to remove from favorites. Please try again.');
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== bookId));
    }
  };


  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="favorite-border" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Books you mark as favorites will appear here
      </Text>
      <Button 
        mode="contained" 
        onPress={() => {/* Navigate to books */}}
        style={styles.exploreButton}
        labelStyle={styles.exploreButtonText}
      >
        Explore Books
      </Button>
    </View>
  );

  const BookCard = ({ item }: { item: Book }) => {
    const isDeleting = deletingIds.includes(item.id);
    
    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={() => {/* Navigate to book details */}}
          activeOpacity={0.8}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imgUrl }} style={styles.image} />
            <View style={styles.overlay}>
              <IconButton
                icon={() => isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons name="favorite" color="#ff4757" size={20} />
                )}
                onPress={() => confirmDelete(item.id, item.title)}
                style={styles.favoriteButton}
                disabled={isDeleting}
              />
            </View>
            {item.price && (
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>₹{item.price}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.cardInfo}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            {item.author && (
              <Text style={styles.author} numberOfLines={1}>by {item.author}</Text>
            )}
            {item.genre && (
              <Chip 
                style={styles.genreChip} 
                textStyle={styles.genreChipText}
                compact
              >
                {item.genre}
              </Chip>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <IndividualHeader headerName='Favorites' />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#f09300" />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <IndividualHeader headerName='Favorites' />
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={60} color="#ff4757" />
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchFavorites}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <IndividualHeader headerName='Favorites' />


      {favorites.length == 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => <BookCard item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f09300']}
              tintColor="#f09300"
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="search-off" size={50} color="#ccc" />
              <Text style={styles.noResultsText}>No books match your search</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9e5ab',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#f09300',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    backgroundColor: '#f8f9fa',
    elevation: 0,
  },
  genreFilters: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedFilterChip: {
    backgroundColor: '#f09300',
  },
  filterChipText: {
    fontSize: 12,
  },
  list: {
    padding: 12,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 6,
    marginVertical: 8,
  },
  cardContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  favoriteButton: {
    backgroundColor: 'rgba(231, 231, 231, 0.46)',
    margin: 8,
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#f09300',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardInfo: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  author: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  genreChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  genreChipText: {
    fontSize: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#f09300',
    paddingHorizontal: 20,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});