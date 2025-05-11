import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
type RootStackParamList = {
  Main: undefined;
  NotificationScreen: undefined;
  MenuScreen: undefined;
  Login: undefined;
  DashboardScreen: undefined;
};

type NavigationProps = StackNavigationProp<RootStackParamList, 'Main'>;


const AppHeader: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting('Good Morning');
    else if (currentHour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.userIconBackground}
        >
          <Feather name="user" size={25} color="black" />
        </TouchableOpacity>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.username}>Jeeva</Text>
        </View>
      </View>
      {/* <Image source = {require('../../../assets/images/appName.png')} style={{width:'50%', height:'50%'}}/> */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.notificationIconBackground}
          onPress={() => navigation.navigate('NotificationScreen')}
        >
          <MaterialIcons name="notifications-none" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationIconBackground} 
          onPress={() => navigation.navigate('DashboardScreen')}>
          <MaterialCommunityIcons name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIconBackground: {
    backgroundColor: '#F5F5F5',
    borderRadius: 150,
    padding: 2,
    width: 45,
    height: 45,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIconBackground: {
    // backgroundColor: '#F5F5F5',
    borderRadius: 150,
    padding: 3,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    color: '#7E7E7E',
    fontSize: 16,
    fontWeight: '400',
  },
  username: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
  },
  rightSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});

export default AppHeader;
