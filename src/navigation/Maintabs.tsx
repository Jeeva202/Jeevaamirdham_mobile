import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import React from 'react';
import { BottomNavigation, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Importing your screens
import BookListScreen from '../screens/books/BookScreen';
import CartScreen from '../screens/Cart/CartScreen';
import EmagazineScreen from '../screens/Emagazine/EmagazineScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import MediaScreen from '../screens/Media/MediaScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { colors } = useTheme(); // Access the custom theme colors

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Hide the header for all screens
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={{bottom: 0, top: 0, left: insets.left, right: insets.right}}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }
            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            if (typeof options.tabBarLabel === 'string') {
              return options.tabBarLabel;
            }
            if (typeof options.title === 'string') {
              return options.title;
            }
            return undefined;
          }}
          activeColor='#DC6803' // Active tab color (#F7A500)
          inactiveColor='#777' // Inactive tab color (light grey)
          style={{ backgroundColor: colors.surface, paddingBottom:0 }} // Background color of the tab bar
        />
      )}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />

      {/* E-Magazine Tab */}
      <Tab.Screen
        name="E-Magazine"
        component={EmagazineScreen}
        options={{
          tabBarLabel: 'E-Magazine',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book-open" size={size} color={color} />
          ),
        }}
      />

      {/* Books Tab */}
      <Tab.Screen
        name="Books"
        component={BookListScreen}
        options={{
          tabBarLabel: 'Books',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bookshelf" size={size} color={color} />
          ),
        }}
      />

      {/* Media Tab */}
      <Tab.Screen
        name="Media"
        component={MediaScreen}
        options={{
          tabBarLabel: 'Media',
          tabBarIcon: ({ color, size }) => (
            <Icon name="play-circle" size={size} color={color} />
          ),
        }}
      />

      {/* Cart Tab */}
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}