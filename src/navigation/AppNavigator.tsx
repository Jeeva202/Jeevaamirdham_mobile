import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { useSelector } from "react-redux";
// Auth Screens
import LoginScreen from "../screens/AuthScreen/LoginScreen";
import SignupScreen from "../screens/AuthScreen/SignupScreen";
// Tab Screens
// App Header
import AppHeader from "../components/header/Appheader";
// Extra Screens
import CreatePasswordScreen from "../screens/AuthScreen/CreatePasswordScreen";
import EmailScreen from "../screens/AuthScreen/EmailScreen";
import OTPScreen from "../screens/AuthScreen/OTPScreen";
import PasswordScreen from "../screens/AuthScreen/PasswordScreen";
import UserDashboard from "../screens/dashboard/Dashboard";
import AudioPlayerScreen from "../screens/Emagazine/AudioPlayerScreen";
import MagazineDetailsScreen from "../screens/Emagazine/MagazineDetailScreen";
import MonthSelectionScreen from "../screens/Emagazine/MonthSelectionScreen";
import NotificationScreen from "../screens/NotificationScreen";
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


const AppNavigator = () => {
  // Get auth state from Redux
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  return (
    <Stack.Navigator screenOptions={{ cardStyle: { backgroundColor: "#f9e5ab" } }}>
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
          <Stack.Screen name="MonthSelection" component={MonthSelectionScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="MagazineDetails" component={MagazineDetailsScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} options={{headerShown: false}}/>
          {/* <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: true }} /> */}
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
