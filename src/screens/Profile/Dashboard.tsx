import { REACT_API_URL } from '@/app-config';
import IndividualHeader from '@/src/components/header/IndividualHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, List, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

type DashboardScreenProps = {
  route: any;
};

const DashboardScreen = ({ route }: DashboardScreenProps) => {
  const missingFields = route.params?.missingFields || false;
  const [userId, setUserId] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [planData, setPlanData] = useState<typeof plans[0] | null>(null);
  const [expiryData, setExpiryData] = useState<{ created_dt: string; expiry_dt: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
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
        setError('Failed to load user data. Please log in again.');
        setIsLoading(false);
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
          setIsExpired(planResponse[0].is_expired === 'not expired' ? false : true);
          const matchedPlan = plans.find((e) => e.name === planResponse[0].plan);
          if (!matchedPlan) {
            throw new Error('No matching plan found');
          }
          setPlanData(matchedPlan);

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
          setError(getErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    };

    fetchData();
  }, []); // Empty dependency array to run only once on mount

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMMM D, YYYY');
  };

  const handleRetry = () => {
    // Re-trigger the useEffect to fetch data again
    setUserId(null); // Reset userId to ensure useEffect runs again
    setIsLoading(true);
    setError(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F09300" />
        <Text style={styles.loaderText}>Loading subscription details...</Text>
      </View>
    );
  }

  if (error || !userId) {
    return (
      <View style={styles.container}>
        <IndividualHeader headerName='Dashboard' />
        <Surface style={[styles.alertSurface, { backgroundColor: '#ffebee' }]}>
          <Icon name="error" size={24} color="#d32f2f" />
          <Text style={[styles.alertText, { color: '#d32f2f', marginLeft: 8 }]}>
            {error || 'User not authenticated. Please log in.'}
          </Text>
        </Surface>
        <Button
          mode="contained"
          onPress={handleRetry}
          style={{ marginTop: 16, backgroundColor: '#F09300' }}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <IndividualHeader headerName='Dashboard' />

              {/* Expired Subscription Banner - NEW */}
      {isExpired && planData && (
        <Animated.View style={[styles.expiredBanner, { opacity: fadeAnim }]}>
          <View style={styles.bannerContent}>
            <Icon name="info" size={24} color="#721c24" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.bannerTitle}>Your {planData.name.toUpperCase()} Plan Has Expired!</Text>
              {expiryData && (
                <Text style={styles.bannerText}>
                  Expired on: {formatDate(expiryData.expiry_dt)}
                </Text>
              )}
            </View>
            <Button
              mode="text"
              onPress={() => navigation.navigate('SubscriptionScreen')}
              style={styles.bannerButton}
              labelStyle={styles.bannerButtonLabel}
            >
              Renew Now
            </Button>
          </View>
        </Animated.View>
      )}

      {missingFields && (
        <Surface style={styles.alertSurface}>
          <Text style={styles.alertText}>
            <Icon name="info" size={20} color="#0C5460" /> Please update your account details
          </Text>
        </Surface>
      )}

      <Card style={styles.mainCard} mode="elevated">
        <Card.Content>
          <Text style={styles.sectionTitle}>Current Subscription</Text>
          {planData && expiryData ? (
            <>
              {isExpired ? (
                <Surface style={styles.expiredSurface}>
                  <View style={styles.alertTitleContainer}>
                    <Icon name="warning" size={22} color="#721c24" />
                    <Text style={styles.alertTitle}>Your {planData.name.toUpperCase()} Plan has Expired</Text>
                  </View>
                  <Text style={styles.alertText}>
                    Your Magazine Subscription period:{'\n'}
                    <Text style={styles.dateText}>From: {formatDate(expiryData.created_dt)}</Text>{'\n'}
                    <Text style={styles.dateText}>To: {formatDate(expiryData.expiry_dt)}</Text>
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => { navigation.navigate('SubscriptionScreen') }}
                    style={styles.renewButton}
                    icon="autorenew"
                  >
                    Renew / Upgrade now
                  </Button>
                </Surface>
              ) : (
                <Surface style={styles.planSurface} elevation={0}>
                  <Text style={styles.planTitle}>
                    <Icon name="stars" size={24} color="#F09300" /> {planData.name.toUpperCase()} Plan
                  </Text>
                  <List.Section style={styles.featuresList}>
                    {planData.features.map((feature, index) => (
                      <List.Item
                        key={index}
                        title={feature}
                        left={() => <Icon name="check-circle" size={24} color="#4CAF50" />}
                        titleStyle={styles.listItem}
                        style={styles.featureItem}
                      />
                    ))}
                  </List.Section>
                  <Surface style={styles.validitySurface} elevation={0}>
                    <Text style={styles.validityText}>
                      Subscription Period:{'\n'}
                      <Text style={styles.dateText}>From: {formatDate(expiryData.created_dt)}</Text>{'\n'}
                      <Text style={styles.dateText}>To: {formatDate(expiryData.expiry_dt)}</Text>
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => { navigation.navigate('SubscriptionScreen') }}
                      style={styles.upgradeButton}
                      icon="trending-up"
                    >
                      Upgrade Plan
                    </Button>
                  </Surface>
                </Surface>
              )}
            </>
          ) : (
            <Text style={styles.errorText}>Unable to load subscription details</Text>
          )}
        </Card.Content>
      </Card>
    </SafeAreaView>
  );   
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f9e5ab',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loaderText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  mainCard: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listItem: {
    fontSize: 16,
    color: '#555',
  },
  featureItem: {
    paddingVertical: 4,
  },
  featuresList: {
    marginVertical: 8,
  },
  alertSurface: {
    padding: 16,
    marginVertical: 16,
    borderRadius: 8,
    backgroundColor: '#D1ECF1',
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiredSurface: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8d7da',
  },
  planSurface: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  validitySurface: {
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#721c24',
  },
  alertTitleContainer:{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  alertText: {
    fontSize: 16,
    color: '#0C5460',
    lineHeight: 24,
  },
  validityText: {
    fontSize: 16,
    color: '#2e7d32',
    lineHeight: 24,
  },
  dateText: {
    fontWeight: 'bold',
    color: '#333',
  },
  renewButton: {
    marginTop: 16,
    backgroundColor: '#dc3545',
  },
  upgradeButton: {
    marginTop: 16,
    borderColor: '#F09300',
    borderWidth: 2,
  },
  modal: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 24,
    backgroundColor: '#F09300',
    paddingHorizontal: 32,
  },
  planContainer: {
    width: '100%',
    marginBottom: 16,
  },
  planCard: {
    marginVertical: 8,
    elevation: 2,
  },
  planFeature: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  planButton: {
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  // NEW STYLES FOR THE EXPIRED BANNER
  expiredBanner: {
    backgroundColor: '#ffdddd', // Very light red/pink for alert
    padding: 10,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffaaaa',
    shadowColor: '#000',
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
  // END NEW STYLES
});

export default DashboardScreen;