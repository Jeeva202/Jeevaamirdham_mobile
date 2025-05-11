import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
// Auth Screens
import LoginScreen from "../screens/AuthScreen/LoginScreen";
import SignupScreen from "../screens/AuthScreen/SignupScreen";
// Tab Screens
import HomeScreen from "../screens/Home/HomeScreen";
import CartScreen from "../screens/Cart/CartScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import OrdersScreen from "../screens/Orders/OrdersScreen";
// App Header
import AppHeader from "../components/header/Appheader";
// Extra Screens
import UserDashboard from "../screens/dashboard/Dashboard";
import NotificationScreen from "../screens/NotificationScreen";
import EmailScreen from "../screens/AuthScreen/EmailScreen";
import PasswordScreen from "../screens/AuthScreen/PasswordScreen";
import OTPScreen from "../screens/AuthScreen/OTPScreen";
import CreatePasswordScreen from "../screens/AuthScreen/CreatePasswordScreen";
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
  </Stack.Navigator>
);

// Main Tab Navigator (For Bottom Tabs)
// const MainTabs = () => (
//   <Tab.Navigator screenOptions={{ headerShown: false }}>
//     <Tab.Screen name="Home" component={HomeScreen} />
//     <Tab.Screen name="Cart" component={CartScreen} />
//     <Tab.Screen name="Orders" component={OrdersScreen} />
//     <Tab.Screen name="Profile" component={ProfileScreen} />
//   </Tab.Navigator>
// );

// Main App Navigator
const AppNavigator = () => {
  // Get auth state from Redux
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  return (
    <Stack.Navigator screenOptions={{cardStyle: { backgroundColor: "#f9e5ab" }}}>
      {isAuthenticated ? (
        <>
          {/* Show AppHeader only when logged in */}
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{
              header: () => <AppHeader />, // Add custom header
            }}
          />
          {/* Additional Screen after login */}
          <Stack.Screen name="MenuScreen" component={UserDashboard} />
          <Stack.Screen name="DashboardScreen" component={UserDashboard} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
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
