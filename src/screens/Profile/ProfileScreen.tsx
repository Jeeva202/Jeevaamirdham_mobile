import { REACT_API_URL } from '@/app-config';
import IndividualHeader from '@/src/components/header/IndividualHeader';
import { logout } from '@/src/redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Badge, Button, Card, Snackbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface ProfileOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  routeName: string;
  showBadge?: boolean;
  badgeText?: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [missingFields, setMissingFields] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  // Profile menu options
  const profileOptions: ProfileOption[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'View your profile overview',
      icon: 'view-dashboard',
      routeName: 'Dashboard',
      showBadge: missingFields,
      badgeText: 'Complete Profile',
    },
    {
      id: 'account',
      title: 'Account Details',
      subtitle: 'Manage your personal information',
      icon: 'account-edit',
      routeName: 'AccountDetails',
    },
    {
      id: 'orders',
      title: 'Your Orders',
      subtitle: 'View and track your orders',
      icon: 'package-variant-closed',
      routeName: 'YourOrders',
    },
    {
      id: 'lastread',
      title: 'E-Magazine Last Read',
      subtitle: 'Continue reading from where you left',
      icon: 'book-open-page-variant',
      routeName: 'LastRead',
    },
    {
      id: 'favorites',
      title: 'Favorites',
      subtitle: 'Your saved items and preferences',
      icon: 'heart',
      routeName: 'Favorites',
    },
    // {
    //   id: 'settings',
    //   title: 'Settings',
    //   subtitle: 'App preferences and configurations',
    //   icon: 'cog',
    //   routeName: 'Settings',
    // },
    {
      id: 'delete',
      title: 'Delete Account',
      subtitle: 'Permanently delete your account',
      icon: 'account-remove',
      routeName: 'DeleteAccount',
    },
  ];

  // Fetch userId and username from AsyncStorage
  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData.userId || '');
          setUserName(parsedData.username || 'Enter User');
          setUserEmail(parsedData.email || 'Enter email');
        } else {
          setUserId('');
          setUserName('Enter User');
          setUserEmail('Enter email');
        }
      } catch (err) {
        setError('Failed to load user info');
      }
    };
    initialize();
  }, []);

  // Fetch user details
  const { data: userData, isLoading: userDataLoading } = useQuery(
    ['userDetails', userId],
    async () => {
      const response = await axios.get(`${REACT_API_URL}/getUserDetails`, {
        params: { userId },
      });
      return response.data.data;
    },
    { enabled: !!userId },
  );

  // Populate form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData(userData);
    }
  }, [userData]);

  // Validate form fields whenever formData changes
  useEffect(() => {
    const validateFields = (data: any) => {
      if (!data || Object.keys(data).length === 0) return true;
      const requiredFields = [
        'firstName',
        'lastName',
        'gender',
        'dob',
        'phone',
        'email',
        'doorNo',
        'streetName',
        'city',
        'state',
        'country',
        'zipCode',
      ];
      return !requiredFields.every((field) => !!data[field]);
    };
    setMissingFields(validateFields(formData));
  }, [formData]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('email');
      dispatch(logout());
    } catch (err) {
      setError('Logout failed');
    }
  };

  // Handle option press
  const handleOptionPress = (option: ProfileOption) => {
    navigation.navigate(option.routeName as any, {
      userId,
      userData: formData,
      userEmail,
      userName,
      setFormData,
      userDataLoading,
      missingFields,
      setMissing: setMissingFields,
    });
    console.log(`Navigating to ${option.routeName} ${userId} ${userName} ${userEmail}`);
  };


  // Render profile option item
  const renderProfileOption = (option: ProfileOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionCard}
      onPress={() => handleOptionPress(option)}
      activeOpacity={0.7}
    >
      <Card style={styles.optionCardContainer} mode="outlined">
        <Card.Content style={styles.optionContent}>
          <View style={styles.optionLeft}>
            <View style={styles.iconContainer}>
              <Icon name={option.icon} size={24} color="#f09300" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
          </View>
          <View style={styles.optionRight}>
            {option.showBadge && option.badgeText && (
              <Badge style={styles.badge} size={16}>
                !
              </Badge>
            )}
            <Icon name="chevron-right" size={20} color="#666" />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('@/assets/images/appBackground.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <IndividualHeader headerName='Profile' />
        {/* <SafeAreaView style={{ flex: 1 }}> */}
        {error && (
          <Snackbar
            visible={!!error}
            onDismiss={() => setError(null)}
            duration={3000}
            style={styles.snackbar}
          >
            {error}
          </Snackbar>
        )}

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Profile Header */}
          <View style={styles.profileHeaderBox}>
            <View style={styles.profileHeaderRow}>
              <View style={styles.profileAvatarBox}>
                <Text style={styles.profileAvatarText}>
                  {userName ? userName.slice(0, 1).toUpperCase() : 'J'}
                </Text>
              </View>
              <View style={styles.profileHeaderInfo}>
                <View style={styles.profileHeaderNameRow}>
                  <Text style={styles.profileHeaderName}>{userName || 'Enter User'}</Text>
                  {missingFields && <View style={styles.profileHeaderDot}></View>}
                  {/* {missingFields && <Text style={styles.profileHeaderEmail}>Incomplete</Text>} */}
                </View>
                <Text style={styles.profileHeaderEmail} numberOfLines={1}>{userEmail || 'Enter email'}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AccountDetails', {
                userId,
                userData: formData,
                userEmail,
                userName,
                setFormData,
                userDataLoading,
                missingFields,
                setMissing: setMissingFields,
              })}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>Profile Options</Text>
            {profileOptions.map(renderProfileOption)}
          </View>

          {/* Contact Us Link */}
          <TouchableOpacity
            style={{ alignItems: 'center', marginBottom: 16 }}
            onPress={() => {
              // Open contact page in browser
              import('react-native').then(({ Linking }) => {
                Linking.openURL('https://www.jeevaamirdham.org/contact');
              });
            }}
          >
            <Text style={{ color: '#007AFF', fontWeight: '600', fontSize: 16, textDecorationLine: 'underline' }}>
              Contact Us
            </Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonText}
            icon="logout"
          >
            Logout
          </Button>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: isMobile ? 16 : 24,
    paddingBottom: 32,
  },
  profileHeaderBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 12,
    marginBottom: 24,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatarBox: {
    width: 40,
    height: 40,
    backgroundColor: '#f97316',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileHeaderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileHeaderName: {
    fontWeight: '500',
    color: '#111827',
    fontSize: 14,
  },
  profileHeaderDot: {
    width: 8,
    height: 8,
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  profileHeaderEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    maxWidth: 192,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    marginBottom: 12,
  },
  optionCardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderColor: '#ff6b3533',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#ef4444',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  snackbar: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    marginBottom: 16,
    position: 'absolute',
    width: '100%',
    bottom: 0,
    right: 0,
    zIndex: 1000,
  },
  editButton:{
    color: '#f09300',
    fontWeight: 700,
    paddingHorizontal: 16
  }
});

export default ProfileScreen;
