import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export type RootStackParamList = {
  Main: undefined;
  NotificationScreen: undefined;
  DashboardScreen: undefined;
  Login: undefined;
  Home: undefined;
  'E-Magazine': undefined;
  Books: undefined;
  Media: undefined;
  Cart: undefined;
  MonthSelection: { year: number };
  MagazineDetails: { year: number; month: string };
  AudioPlayer: { year: number; month: string; audioData: any[] };
};

type NavigationProps = StackNavigationProp<RootStackParamList>;

const AppHeader: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <View style={{paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}}>
    <View style={styles.header}>
      {/* Left Section: Logo & Greeting */}
      <View style={styles.leftSection}>
        <Image
          source={require('../../../assets/images/jeevaamirdhamLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View> 

      {/* Right Section: Icons */} 
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('NotificationScreen')}
        >
          <MaterialIcons name="notifications" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('DashboardScreen')}
        >
          <MaterialIcons name="person" size={24} color="#fff"/>
        </TouchableOpacity>
      </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 42,
    marginRight: 12,
  },
  greetingContainer: {
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  greeting: {
    fontSize: 16,
    color: '#777',
    fontWeight: '600',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    // backgroundColor: '#E68E00',
    backgroundColor: '#F09300',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppHeader;
