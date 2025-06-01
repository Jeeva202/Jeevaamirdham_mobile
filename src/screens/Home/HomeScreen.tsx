import { REACT_API_URL } from '@/app-config';
import PopularBooks from '@/src/components/popularBooks/PopularBooks';
import TodayThoughts from '@/src/components/todaysThought/TodaysThought';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { FlatList, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from 'react-query';
import { Book } from '../books/BookScreen';

const HomeScreen = () => {
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);

  useEffect(() => {
    // Fetch popular books from your API
    const fetchPopularBooks = async () => {
      const response = await axios.get(`${REACT_API_URL}/ebooks/books`);
      setPopularBooks(response.data);
    };
    fetchPopularBooks();
  }, []);

  const fetchYears = async () => {
    const { data } = await axios.get(`${REACT_API_URL}/emagazine-page/magazine-yearwise`);
    return data.reverse(); // latest years first
  };
  const navigation = useNavigation<any>();
  const { data: years, isLoading, error } = useQuery('years', fetchYears);

  if (isLoading || !years) return null;
  const latestYears = years.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Today's Thoughts Section */}
      <TodayThoughts />
      {/* Banner Section */}
      <ImageBackground
        source={require('../../../assets/images/Banner_mobile.png')}
        style={styles.banner}
        imageStyle={styles.bannerImage}
        resizeMode="cover"
      >
        {/* <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)"]}
          style={styles.bannerOverlay}
        >
        </LinearGradient> */}
      </ImageBackground>
      {/* E-magazine Edition Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>E-magazine Edition</Text>

        <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('E-Magazine')}>
          <Text style={styles.viewAllText}>View All</Text>
          <MaterialIcons name="keyboard-arrow-right" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={{marginVertical: 16}}>
        <FlatList
          data={latestYears}
          keyExtractor={(item) => item.year.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('MonthSelection', { year: item.year })}
              style={styles.card}
            >
              <ImageBackground source={{ uri: item.imgUrl }} style={styles.image}>
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.gradient}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.yearBadge}>
                      <Text style={styles.yearText}>{item.year}</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>Magazine Collection</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          )}
        />
      </View>


      {/* Popular Books Section */}
      <PopularBooks
        books={popularBooks.map((book) => ({
          ...book,
          subtitle: book.subtitle ?? '', // Provide a default value if missing
          offPrice: book.offPrice !== undefined && book.offPrice !== null ? String(book.offPrice) : '', // Ensure string type
          imgUrl: book.imgUrl ?? '',     // Provide a default value if missing
        }))}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9e5ab',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  thoughtsCard: {
    backgroundColor: '#FFFAEB',
    padding: 15,
    borderRadius: 10,
    elevation: 4,
  },
  thoughtsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#DC6803',
    borderRadius: 10,
    paddingLeft: 10,
    alignItems: 'center',
  },
  thoughtsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  thoughtsText: {
    fontSize: 14,
    color: '#000000',
    marginTop: 10,
  },
  playButton: {
    backgroundColor: 'transparent',
  },
  cardContent: {
    alignItems: 'flex-start',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: -0.5,
  },
  viewAllContent: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 3,
    marginVertical: -3,
  },
  viewAllLabel: {
    fontSize: 12,
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
    fontWeight: '700',
    color: '#fff',
    marginRight: 4,
  },
  eMagazineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eMagazineCard: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#FFFAEB',
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  eMagazineImage: {
    width: 100,
    height: 100,
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignSelf: 'center',
  },
  eMagazineButton: {
    marginTop: 0,
  },
  yearBadge: {
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
    backdropFilter: 'blur(10px)',
  },
  booksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookCard: {
    width: '48%', // Two cards per row with a small gap
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 4,
  },
  bookImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
  },
  bookDescription: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 5,
  },
  bookPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7A500',
    marginBottom: 10,
  },
  buyButton: {
    backgroundColor: '#F7A500',
    borderRadius: 5,
  },
  buyButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    width: 150,
    height: 200,
    marginRight: 12,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradient: {
    // height: 60,
    justifyContent: 'center',
    padding: 10,
  },
  yearText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  banner: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 18,
    alignSelf: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});

export default HomeScreen;
