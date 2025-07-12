import { REACT_API_URL } from '@/app-config';
import CelebrityReviewSection from '@/src/components/CelebrityReviewSection';
import PopularBooks from '@/src/components/popularBooks/PopularBooks';
import TodayThoughts from '@/src/components/todaysThought/TodaysThought';
import { useAndroidUpdateCheck } from '@/src/utils/useAndroidUpdateCheck';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import dayjs from 'dayjs'; // Import dayjs
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, ImageBackground, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from 'react-query';

// Define the plans array directly or import it if it's a shared constant
// For this example, I'm defining it here as it's used within this component.
// If it truly comes from another file, ensure the import path is correct.
const plans = [
  {
    name: 'basic',
    price: '₹0',
    priceInt: 0,
    features: [
      'Access to one chapter of E-magazine',
      'One audio content',
      'One video content',
      'Ability to shop for books',
    ],
    buttonLabel: 'Free',
    buttonStyle: { backgroundColor: '#E6E6E6', color: '#000' },
  },
  {
    name: 'elite',
    price: '₹599/year',
    priceInt: 599,
    features: [
      'Access to all E-magazine content',
      'All audio content',
      'All video content',
      'Ability to shop for books',
    ],
    buttonLabel: 'Purchase Now',
    buttonStyle: { backgroundColor: '#F09300', color: '#fff' },
  },
  {
    name: 'premium',
    price: '₹999/year',
    priceInt: 999,
    features: [
      'Access to all E-magazine content',
      'All audio content',
      'All video content',
      'Ability to shop for books',
      'Hard copy subscription of E-magazine',
    ],
    buttonLabel: 'Purchase Now',
    buttonStyle: { backgroundColor: '#F09300', color: '#fff' },
  },
];

type Book = {
  id: number;
  title: string;
  subtitle?: string;
  imgUrl?: string;
  price?: string;
  offPrice?: string;
};

const HomeScreen = () => {
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [planData, setPlanData] = useState<typeof plans[0] | null>(null); // Corrected type
  const [expiryData, setExpiryData] = useState<{ created_dt: string; expiry_dt: string } | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true); // Dedicated loading state for subscription
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null); // Dedicated error state for subscription
  const [fadeAnim] = useState(new Animated.Value(0));

  const navigation = useNavigation<any>();

  // --- API Call for Popular Books ---
  const fetchPopularBooks = async () => {
    try {
      const response = await axios.get(`${REACT_API_URL}/ebooks/books`);
      setPopularBooks(response.data);
    } catch (err) {
      console.error('Error fetching popular books:', err);
      // Optionally handle this error, e.g., show a message to the user
    }
  };

  // --- API Call for E-magazine Years (using react-query) ---
  const fetchYears = async () => {
    const { data } = await axios.get(`${REACT_API_URL}/emagazine-page/magazine-yearwise`);
    return data.reverse(); // latest years first
  };

  const { data: years, isLoading: yearsLoading, error: yearsError, refetch: refetchYears } = useQuery('years', fetchYears);

  // --- Combined Refresh Logic ---
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPopularBooks(),
      refetchYears(),
      fetchSubscriptionData(), // Also refresh subscription data
    ]);
    setRefreshing(false);
  };

  // --- Subscription Data Fetching (direct axios calls) ---
  const fetchSubscriptionData = async () => {
    setIsSubscriptionLoading(true);
    setSubscriptionError(null);
    let fetchedUserId: string | null = null;
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        throw new Error('User data not found. Please log in again.');
      }
      const userObj = JSON.parse(userData);
      if (!userObj?.userId) {
        throw new Error('Invalid user data. Please log in again.');
      }
      setUserId(userObj.userId);
      fetchedUserId = userObj.userId;
    } catch (err) {
      console.error('Error getting userId:', err);
      setSubscriptionError('Failed to load user data. Please log in again.');
      setIsSubscriptionLoading(false);
      return;
    }

    if (fetchedUserId) {
      try {
        // Fetch plan data
        const { data: planResponse } = await axios.get(`${REACT_API_URL}/getPlanEvenItisExpired`, {
          params: { id: fetchedUserId },
        });
        if (!planResponse || !planResponse[0]) {
          throw new Error('No plan data received');
        }
        setIsExpired(planResponse[0].is_expired !== 'not expired'); // Corrected logic: true if expired

        const matchedPlan = plans.find((e) => e.name === planResponse[0].plan);
        if (!matchedPlan) {
          // If a plan from the API doesn't match a local 'plans' entry,
          // create a minimal object to still display the plan name.
          setPlanData({
            name: planResponse[0].plan || 'Unknown',
            price: '', priceInt: 0, features: [],
            buttonLabel: '', buttonStyle: { backgroundColor: '', color: '' }
          });
        } else {
          setPlanData(matchedPlan);
        }

        // Fetch expiry data
        const { data: expiryResponse } = await axios.get(`${REACT_API_URL}/getExpiry`, {
          params: { id: fetchedUserId },
        });
        if (!expiryResponse || !expiryResponse[0]) {
          throw new Error('No expiry data received');
        }
        setExpiryData(expiryResponse[0]);
      } catch (err) {
        console.error('Error fetching plan/expiry data:', err);
        const getErrorMessage = (err: unknown) => {
          if (err instanceof Error) return err.message;
          if (typeof err === 'string') return err;
          return 'Error loading subscription details';
        };
        setSubscriptionError(getErrorMessage(err));
      } finally {
        setIsSubscriptionLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial data fetches
    fetchPopularBooks();
    fetchSubscriptionData();

    // Fade-in animation for the banner
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [userId]); // Dependency on userId to re-fetch if it changes (e.g., after login/logout)

  useAndroidUpdateCheck();

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMMM D, YYYY'); // Added YYYY for complete date
  };

  // --- Expired Banner Component ---
  const ExpiredBanner = () => {
    if (isSubscriptionLoading || subscriptionError || !isExpired || !planData) {
      return null; // Don't render if loading, error, not expired, or no plan data
    }

    return (
      <Animated.View style={[styles.expiredBanner]}>
        <View style={styles.bannerContent}>
          <Icon name="info" size={24} color="#721c24" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bannerTitle}>
              Your {planData.name.toUpperCase()} Plan Has Expired!
            </Text>
            {expiryData && (
              <Text style={styles.bannerText}>
                Expired on: {formatDate(expiryData.expiry_dt)}
              </Text>
            )}
          </View>
          <Button
            mode="text" // Using text mode for a subtle button in the banner
            onPress={() => navigation.navigate('SubscriptionScreen')}
            style={styles.bannerButton}
            labelStyle={styles.bannerButtonLabel}
          >
            Renew Now
          </Button>
        </View>
      </Animated.View>
    );
  };

  return (
    <ImageBackground
      source={require('@/assets/images/appBackground.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* --- Expired Subscription Banner --- */}
          <ExpiredBanner />

          {/* Today's Thoughts Section */}
          <TodayThoughts />

          {/* Banner Section (Image) */}
          <ImageBackground
            source={require('../../../assets/images/Banner_mobile.png')}
            style={styles.banner}
            imageStyle={styles.bannerImage}
            resizeMode="cover"
          >
            {/* You can uncomment and use LinearGradient if you want an overlay on the image */}
            {/* <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)"]}
          style={styles.bannerOverlay}
        >
        </LinearGradient> */}
          </ImageBackground>

          {/* Celebrity Review Section (above E-magazine Edition) */}
          <CelebrityReviewSection />

          {/* E-magazine Edition Section */}
          <View style={{ marginBottom: 20 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>E-magazine Edition</Text>
              <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('E-Magazine')}>
                <Text style={styles.viewAllText}>View All</Text>
                <MaterialIcons name="keyboard-arrow-right" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View>
              <FlatList
                data={years?.slice(0, 3) || []} // Ensure years is not null/undefined here
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
          </View>

          {/* Popular Books Section */}
          <PopularBooks
            books={popularBooks.map((book) => ({
              ...book,
              subtitle: book.subtitle ?? '',
              offPrice: book.offPrice !== undefined && book.offPrice !== null ? String(book.offPrice) : '',
              imgUrl: book.imgUrl ?? '',
            }))}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f9e5ab',
  },
  contentContainer: {
    paddingTop: 0,
    paddingLeft: 16,
    paddingRight: 16,
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
   expiredBanner: {
        backgroundColor: '#ffdddd', // Very light red/pink for alert
        padding: 10,
        borderRadius: 8,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#ffaaaa',
        shadowColor: '#f9e5ab',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bannerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#a00000', // Dark red
    },
    bannerText: {
        fontSize: 13,
        color: '#a00000',
        marginTop: 4,
    },
    bannerButton: {
        paddingVertical: 5,
        borderRadius: 5,
    },
    bannerButtonLabel: {
        fontSize: 14,
        color: '#dc3545',
        fontWeight: 'bold',
    },
});

export default HomeScreen;
