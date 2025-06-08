import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { useSelector } from "react-redux";
// Auth Screens
import LoginScreen from "../screens/AuthScreen/LoginScreen";
import SignupScreen from "../screens/AuthScreen/SignupScreen";
// App Header
import AppHeader from "../components/header/Appheader";
// Extra Screens
import BookDetailScreen from "../components/bookDetails/BookDetailScreen";
import SubscriptionScreen from "../components/subscription";
import CreatePasswordScreen from "../screens/AuthScreen/CreatePasswordScreen";
import EmailPasswordLoginScreen from "../screens/AuthScreen/Email_Password_login";
import EmailScreen from "../screens/AuthScreen/EmailScreen";
import OTPScreen from "../screens/AuthScreen/OTPScreen";
import PasswordScreen from "../screens/AuthScreen/PasswordScreen";
import CheckoutScreen from "../screens/Cart/CheckoutScreen";
import AudioPlayerScreen from "../screens/Emagazine/AudioPlayerScreen";
import MagazineDetailsScreen from "../screens/Emagazine/MagazineDetailScreen";
import MonthSelectionScreen from "../screens/Emagazine/MonthSelectionScreen";
import NotificationScreen from "../screens/NotificationScreen";
import AccountDetailsTab from "../screens/Profile/AccountDetails";
import DashboardScreen from "../screens/Profile/Dashboard";
import DeleteAccountTab from "../screens/Profile/DeleteAccount";
import FavoritesScreen from "../screens/Profile/Favorites";
import LastReadTab from "../screens/Profile/Lastread";
import YourOrderTab from "../screens/Profile/Orders";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import MainTabs from "./Maintabs";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack (For Login/Signup)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: "#f9e5ab" } }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="EmailScreen" component={EmailScreen} />
    <Stack.Screen name="PasswordScreen" component={PasswordScreen} />
    <Stack.Screen name="OTPScreen" component={OTPScreen} />
    <Stack.Screen name="CreatePasswordScreen" component={CreatePasswordScreen} />
    <Stack.Screen name="EmailPasswordLoginScreen" component={EmailPasswordLoginScreen} />
  </Stack.Navigator>
);

// Profile Stack (For Profile-related screens)
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: "#f9e5ab" } }}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="Dashboard" component={DashboardScreen}  />
    <Stack.Screen name="AccountDetails" component={AccountDetailsTab} />
    <Stack.Screen name="YourOrders" component={YourOrderTab} />
    <Stack.Screen name="LastRead" component={LastReadTab} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} />
    <Stack.Screen name="DeleteAccount" component={DeleteAccountTab} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  // Get auth state from Redux
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  return (
    <Stack.Navigator screenOptions={{ cardStyle: { backgroundColor: "#f9e5ab" } }}>
      {isAuthenticated ? (
        <>
          {/* Main Tabs with AppHeader */}
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{
              header: () => <AppHeader />,
            }}
          />
          {/* Profile Stack */}
          <Stack.Screen
            name="Profile"
            component={ProfileStack}
            options={{ headerShown: false }}
          />
          {/* Other Screens */}
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MonthSelection" component={MonthSelectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MagazineDetails" component={MagazineDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={{ headerShown: false }} />
        </>
      ) : (
        // Show Auth Stack if not authenticated
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;