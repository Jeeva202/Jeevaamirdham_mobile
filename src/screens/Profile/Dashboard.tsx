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
import { useQuery, useQueryClient } from 'react-query';

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
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const queryClient = useQueryClient();
  const navigation = useNavigation<any>();

  useEffect(() => {
    const getUserId = async () => {
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
      } catch (err) {
        console.error('Error getting userId:', err);
        setError('Failed to load user data. Please log in again.');
      } finally {
        setIsMounted(true);
      }
    };
    getUserId();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMMM D, YYYY');
  };

  const { data: planData, isLoading: planIsLoading, error: planError } = useQuery({
    queryFn: async () => {
      const { data } = await axios.get(`${REACT_API_URL}/getPlanEvenItisExpired`, {
        params: { id: userId },
      });
      if (!data || !data[0]) {
        throw new Error('No plan data received');
      }
      setIsExpired(data[0].is_expired === 'not expired' ? false : true);
      const matchedPlan = plans.find((e) => e.name === data[0].plan);
      if (!matchedPlan) {
        throw new Error('No matching plan found');
      }
      return matchedPlan;
    },
    queryKey: ['plan-detail', userId],
    enabled: Boolean(userId) && isMounted,
    retry: 3,
  });

  const { data: expiryData, isLoading: expiryIsLoading, error: expiryError } = useQuery({
    queryFn: async () => {
      const { data } = await axios.get(`${REACT_API_URL}/getExpiry`, {
        params: { id: userId },
      });
      if (!data || !data[0]) {
        throw new Error('No expiry data received');
      }
      return data[0];
    },
    queryKey: ['expiry-detail', userId],
    enabled: Boolean(userId) && isMounted,
    retry: 3,
  });

  useEffect(() => {
    if (planError || expiryError) {
      const getErrorMessage = (err: unknown) => {
        if (err instanceof Error) return err.message;
        if (typeof err === 'string') return err;
        return 'Error loading subscription details';
      };
      setError(getErrorMessage(planError) || getErrorMessage(expiryError));
    }
  }, [planError, expiryError]);

  const handleRetry = () => {
    setError(null);
    queryClient.invalidateQueries(['plan-detail', userId]);
    queryClient.invalidateQueries(['expiry-detail', userId]);
  };

  if (!isMounted || planIsLoading || expiryIsLoading) {
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
                  <Text style={styles.alertTitle}>
                    <Icon name="warning" size={24} color="#721c24" /> Your {planData.name.toUpperCase()} Plan has Expired
                  </Text>
                  <Text style={styles.alertText}>
                    Your Magazine Subscription period:{'\n'}
                    <Text style={styles.dateText}>From: {formatDate(expiryData.created_dt)}</Text>{'\n'}
                    <Text style={styles.dateText}>To: {formatDate(expiryData.expiry_dt)}</Text>
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() =>{navigation.navigate('SubscriptionScreen')}}
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
                      onPress={() =>{navigation.navigate('SubscriptionScreen')}}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  planTitle: {
    fontSize: 22,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 8,
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
});

export default DashboardScreen;