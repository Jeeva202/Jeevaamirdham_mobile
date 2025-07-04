// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { CommonActions } from '@react-navigation/native';
// import React from 'react';
// import { BottomNavigation, useTheme } from 'react-native-paper';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// // Importing your screens
// import BookListScreen from '../screens/books/BookScreen';
// import CartScreen from '../screens/Cart/CartScreen';
// import EmagazineScreen from '../screens/Emagazine/EmagazineScreen';
// import HomeScreen from '../screens/Home/HomeScreen';
// import MediaScreen from '../screens/Media/MediaScreen';

// const Tab = createBottomTabNavigator();

// export default function MainTabs() {
//   const { colors } = useTheme(); // Access the custom theme colors

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false, // Hide the header for all screens
//       }}
//       tabBar={({ navigation, state, descriptors, insets }) => (
//         <BottomNavigation.Bar
//           navigationState={state}
//           safeAreaInsets={insets}
//           onTabPress={({ route, preventDefault }) => {
//             const event = navigation.emit({
//               type: 'tabPress',
//               target: route.key,
//               canPreventDefault: true,
//             });

//             if (event.defaultPrevented) {
//               preventDefault();
//             } else {
//               navigation.dispatch({
//                 ...CommonActions.navigate(route.name, route.params),
//                 target: state.key,
//               });
//             }
//           }}
//           renderIcon={({ route, focused, color }) => {
//             const { options } = descriptors[route.key];
//             if (options.tabBarIcon) {
//               return options.tabBarIcon({ focused, color, size: 24 });
//             }
//             return null;
//           }}
//           getLabelText={({ route }) => {
//             const { options } = descriptors[route.key];
//             if (typeof options.tabBarLabel === 'string') {
//               return options.tabBarLabel;
//             }
//             if (typeof options.title === 'string') {
//               return options.title;
//             }
//             return undefined;
//           }}
//           activeColor='#DC6803' // Active tab color (#F7A500)
//           inactiveColor='#777' // Inactive tab color (light grey)
//           style={{ backgroundColor: colors.surface, paddingBottom:0 }} // Background color of the tab bar
//         />
//       )}
//     >
//       {/* Home Tab */}
//       <Tab.Screen
//         name="Home"
//         component={HomeScreen}
//         options={{
//           tabBarLabel: 'Homeee',
//           tabBarIcon: ({ color, size }) => (
//             <Icon name="home" size={size} color={color} />
//           ),
//         }}
//       />

//       {/* E-Magazine Tab */}
//       <Tab.Screen
//         name="E-Magazine"
//         component={EmagazineScreen}
//         options={{
//           tabBarLabel: 'E-Magazine',
//           tabBarIcon: ({ color, size }) => (
//             <Icon name="book-open" size={size} color={color} />
//           ),
//         }}
//       />

//       {/* Books Tab */}
//       <Tab.Screen
//         name="Books"
//         component={BookListScreen}
//         options={{
//           tabBarLabel: 'Books',
//           tabBarIcon: ({ color, size }) => (
//             <Icon name="bookshelf" size={size} color={color} />
//           ),
//         }}
//       />

//       {/* Media Tab */}
//       <Tab.Screen
//         name="Media"
//         component={MediaScreen}
//         options={{
//           tabBarLabel: 'Media',
//           tabBarIcon: ({ color, size }) => (
//             <Icon name="play-circle" size={size} color={color} />
//           ),
//         }}
//       />

//       {/* Cart Tab */}
//       <Tab.Screen
//         name="Cart"
//         component={CartScreen}
//         options={{
//           tabBarLabel: 'Cart',
//           tabBarIcon: ({ color, size }) => (
//             <Icon name="cart" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }



import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Surface, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import your screens
import BookListScreen from '../screens/books/BookScreen';
import CartScreen from '../screens/Cart/CartScreen';
import EmagazineScreen from '../screens/Emagazine/EmagazineScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import MediaScreen from '../screens/Media/MediaScreen';

const Tab = createBottomTabNavigator();

// Create a custom tab bar component
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets(); // Hook for safe area

  return (
    <Surface style={[styles.container, { backgroundColor: colors.surface, paddingBottom: bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        // Use title as a fallback for the label
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        const activeColor = '#DC6803';
        const inactiveColor = '#777';
        const iconColor = isFocused ? activeColor : inactiveColor;
        // Apply bold font weight if the tab is focused
        const fontWeight = isFocused ? 'bold' : 'normal';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableRipple
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            rippleColor="rgba(0, 0, 0, .15)"
          >
            <View style={styles.tabContent}>
              <Text style={{ color: iconColor, fontSize: 14, marginBottom: 4, fontWeight }}>
                {typeof label === 'string' ? label : typeof label === 'function' ? label({ focused: isFocused, color: iconColor, position: 'below-icon', children: route.name }) : route.name}
              </Text>
              {options.tabBarIcon && options.tabBarIcon({ color: iconColor, size: 24, focused: isFocused })}
            </View>
          </TouchableRipple>
        );
      })}
    </Surface>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      // Use the new custom component for the tab bar
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Your Tab.Screen definitions remain exactly the same */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="E-Magazine"
        component={EmagazineScreen}
        options={{
          tabBarLabel: 'E-Magazine',
          tabBarIcon: ({ color, size }) => <Icon name="book-open" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Books"
        component={BookListScreen}
        options={{
          tabBarLabel: 'Books',
          tabBarIcon: ({ color, size }) => <Icon name="bookshelf" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Media"
        component={MediaScreen}
        options={{
          tabBarLabel: 'Media',
          tabBarIcon: ({ color, size }) => <Icon name="play-circle" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => <Icon name="cart" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Styles for the custom tab bar
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    elevation: 8, // Shadow for Android
    shadowOffset: { width: 0, height: -2 }, // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});