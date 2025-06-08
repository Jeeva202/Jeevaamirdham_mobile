import { REACT_API_URL } from '@/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  Button,
  Divider,
  Text,
  Title,
  useTheme
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/authSlice';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const handleGoogleLogin = async () => {
    const dispatch = useDispatch();

    try {
      // Simulate Google Login (replace this with real Google Auth later)
      const userData = {
        userId: '3152',
        email: 'jeevaganesh.2812@gmail.com',
      };

      // 🔄 Fetch plan from API
      const response = await axios.get(`${REACT_API_URL}/getPlan`, {
        params: { id: userData.userId },
      });

      const userPlan = response.data?.[0]?.plan || 'free'; // fallback plan

      // ✅ Store combined user data in AsyncStorage
      const fullUserData = {
        ...userData,
        plan: userPlan,
      };

      await AsyncStorage.setItem('user', JSON.stringify(fullUserData));

      // ✅ Dispatch login success with full data
      dispatch(loginSuccess(fullUserData));

    } catch (error) {
      console.error('Login failed:', error);
      // optionally show a toast or alert
    }
  };

  return (
    <View style={[styles.container]}>
      <Image
        source={require('../../../assets/images/logo_name_icon.png')}
        style={styles.logo}
      />
      <Title style={[styles.title, { color: '#E68E00' }]}>Welcome to Jeevaamirdham</Title>
      <Button
        mode="text"
        icon="google"
        onPress={handleGoogleLogin}
        style={[{ backgroundColor: "#FFFFFF" }, styles.button]}
        labelStyle={[{ color: "#333" }, styles.buttonLabel]}
      >
        Sign in with Google
      </Button>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Divider style={styles.divider} />
        <Text style={styles.orText}>Or sign in with</Text>
        <Divider style={styles.divider} />
      </View>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('EmailPasswordLoginScreen')}
        style={styles.button} 
        labelStyle={[{ color: "#fff" }, styles.buttonLabel]}
      >
        Continue with Email
      </Button>

      <Text style={styles.orText}>
        by proceeding, you agree to our Privacy Policy and
        Terms of Services
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    marginVertical: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 20,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    color: 'gray',
  },
});

export default LoginScreen;




// import {
//   GoogleSignin,
//   isSuccessResponse
// } from '@react-native-google-signin/google-signin';
// import { useNavigation } from '@react-navigation/native';
// import * as WebBrowser from 'expo-web-browser';
// import React, { useState } from 'react';
// import { Image, StyleSheet, View } from 'react-native'; // Added Alert for user feedback
// import { Button, Divider, Text, Title } from 'react-native-paper';
// import { useDispatch } from 'react-redux';
// // Complete the authentication session if one is in progress
// WebBrowser.maybeCompleteAuthSession();

// // Define a type for the decoded user info for better type safety
// interface DecodedUserInfo {
//   sub: string; // Standard JWT subject claim, often used as user ID
//   email: string;
//   name?: string; // Optional: if you expect name from token
//   picture?: string; // Optional: if you expect picture from token
//   // Add other fields you expect from the ID token
// }

// const LoginScreen: React.FC = () => {
//   const navigation = useNavigation<any>(); // Consider using a more specific navigation type for better type safety
//   const dispatch = useDispatch();
//   const [isAuthenticating, setIsAuthenticating] = useState(false);
// const [auth, setAuth] = useState(null); // State to hold authentication response

//   // IMPORTANT: Ensure your client IDs are correct and do not have leading/trailing spaces.
//   // For webClientId, this is typically used when your backend verifies the token.
//   // For iOS and Android, these are specific to your mobile app configurations in Google Cloud Console.
//   // const [request, response, promptAsync] = Google.useAuthRequest({
//   //   clientId: '622659185789-rue1itvqp2i8numvn6fe60avpmggg481.apps.googleusercontent.com', // CRITICAL: Ensure this matches your Google Cloud Console Web client ID
//   //   // iosClientId: 'YOUR_IOS_CLIENT_ID', // Replace with your actual iOS Client ID if targeting iOS
//   //   androidClientId: '622659185789-nc69h64k48nem80h0coaajimdh6f9jr0.apps.googleusercontent.com', // Replace with your actual Android Client ID
//   //   // If using a custom scheme for standalone apps, uncomment and configure makeRedirectUri:
//   //   // redirectUri: makeRedirectUri({
//   //   //   scheme: 'your-app-scheme', // For standalone apps, you might need a custom scheme.
//   //   //   // useProxy: true, // Set to true if using Expo Go and facing redirect issues, or for web.
//   //   // }),
//   //   // For Expo Go, makeRedirectUri() often works. For standalone builds, ensure the redirect URI
//   //   // (including the scheme) is whitelisted in your Google Cloud Console credentials.
//   //   // Default redirect URI for Expo Go: exp://<host>/--/expo-auth-session
//   //   // Check documentation: https://docs.expo.dev/guides/authentication/#google
//   // });

//   GoogleSignin.configure({
//     webClientId: '622659185789-rue1itvqp2i8numvn6fe60avpmggg481.apps.googleusercontent.com', // Ensure this matches your Google Cloud Console Web client ID
//   })

// const handleGoogleLogin = async () => {
//   try{
//     await GoogleSignin.hasPlayServices(); // Ensure Google Play Services are available
//     const response = await GoogleSignin.signIn();
//     if(isSuccessResponse(response)){
//       console.log('Google Sign-In successful:', response);
//     }
//   }
//   catch (error) {
//     console.error('Google Sign-In error:', error);
//   }
// }


//   return (
//     <View style={styles.container}>
//       <Image
//         source={require('../../../assets/images/logo_name_icon.png')} // Ensure this path is correct
//         style={styles.logo}
//         resizeMode="contain" // Added resizeMode for better image display
//       />
//       <Title style={[styles.title, { color: '#E68E00' }]}>Welcome to Jeevaamirdham</Title>
      
//       <Button
//         mode="contained" // Changed to "contained" for better visual prominence like the email button
//         icon="google"
//         onPress={handleGoogleLogin}
//         loading={isAuthenticating}
//         // disabled={!request || isAuthenticating} // Disable button if request is not ready or already authenticating
//         style={[styles.button, { backgroundColor: "#4285F4" }]} // Google's blue color
//         labelStyle={[{ color: "#fff" }, styles.buttonLabel]} // White text for better contrast
//       >
//         Sign in with Googlell
//       </Button>
      
//       <View style={styles.orDividerContainer}>
//         <Divider style={styles.dividerLine} />
//         <Text style={styles.orText}>Or sign in with</Text>
//         <Divider style={styles.dividerLine} />
//       </View>
      
//       <Button
//         mode="outlined" // Changed to "outlined" to differentiate from Google, or keep "contained" if preferred
//         onPress={() => navigation.navigate('EmailScreen')} // Ensure 'EmailScreen' is a valid route in your navigator
//         style={[styles.button, styles.emailButton]}
//         labelStyle={[{ color: "#E68E00" }, styles.buttonLabel]} // Theme color for email button
//         icon="email" // Added email icon
//       >
//         Continue with Email
//       </Button>
      
//       <Text style={styles.footerText}>
//         By proceeding, you agree to our Privacy Policy and Terms of Services
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//     backgroundColor: '#f5f5f5', // A light background color for the screen
//   },
//   logo: {
//     width: 150, // Specify width for the logo image
//     height: 150, // Specify height for the logo image
//     alignSelf: 'center', // Center the logo horizontally
//     marginBottom: 20, // Space below the logo
//   },
//   title: {
//     fontSize: 26, // Increased font size for prominence
//     marginBottom: 30, // Increased spacing below the title
//     textAlign: 'center', // Center the title text
//     fontWeight: 'bold', // Make the title bold
//   },
//   button: {
//     marginVertical: 10, // Vertical margin for buttons
//     paddingVertical: 8, // Added padding for a taller button
//     borderRadius: 8, // Rounded corners for buttons
//   },
//   emailButton: {
//     borderColor: '#E68E00', // Theme color for the email button's border
//   },
//   buttonLabel: {
//     fontSize: 16, // Font size for button text
//     fontWeight: 'bold', // Bold text for buttons
//   },
//   orDividerContainer: {
//     flexDirection: 'row', // Arrange children in a row
//     alignItems: 'center', // Vertically align items in the center
//     marginVertical: 20, // Vertical margin for the divider section
//   },
//   dividerLine: {
//     flex: 1, // Allow the divider line to take available space
//     height: 1, // Thin line
//     backgroundColor: 'grey', // Color of the divider line
//   },
//   orText: {
//     textAlign: 'center', // Center the "Or sign in with" text
//     marginHorizontal: 10, // Added horizontal margin around the text
//     color: 'gray', // Color of the "Or" text
//     fontSize: 14, // Font size of the "Or" text
//   },
//   footerText: {
//     textAlign: 'center', // Center the footer text
//     marginTop: 30, // Increased top margin for the footer text
//     color: 'grey', // Color of the footer text
//     fontSize: 12, // Font size of the footer text
//   },
// });

// export default LoginScreen;






// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Google from "expo-auth-session/providers/google";
// import * as WebBrowser from "expo-web-browser";
// import { useEffect, useState } from "react";
// import { Button, Image, StyleSheet, Text, View } from "react-native";

// WebBrowser.maybeCompleteAuthSession();

// export default function LoginScreen() {
//   const [token, setToken] = useState("");
//   const [userInfo, setUserInfo] = useState<any>(null);

//   const [request, response, promptAsync] = Google.useAuthRequest({
//     androidClientId: "622659185789-nc69h64k48nem80h0coaajimdh6f9jr0.apps.googleusercontent.com",
//     iosClientId: "",
//     webClientId: "622659185789-rue1itvqp2i8numvn6fe60avpmggg481.apps.googleusercontent.com",
//   });

//   useEffect(() => {
//     handleEffect();
//   }, [response, token]);

//   async function handleEffect() {
//     const user = await getLocalUser();
//     console.log("user", user);
//     if (!user) {
//       if (response?.type === "success") {
//         // setToken(response.authentication.accessToken);
//         if (response.authentication && response.authentication.accessToken) {
//           getUserInfo(response.authentication.accessToken);
//         }
//       }
//     } else {
//       setUserInfo(user);
//       console.log("loaded locally");
//     }
//   }

//   const getLocalUser = async () => {
//     const data = await AsyncStorage.getItem("@user");
//     if (!data) return null;
//     return JSON.parse(data);
//   };

//   const getUserInfo = async (token: string) => {
//     if (!token) return;
//     try {
//       const response = await fetch(
//         "https://www.googleapis.com/userinfo/v2/me",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const user = await response.json();
//       await AsyncStorage.setItem("@user", JSON.stringify(user));
//       setUserInfo(user);
//     } catch (error) {
//       // Add your own error handler here
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {!userInfo ? (
//         <Button
//           title="Sign in with Google"
//           disabled={!request}
//           onPress={() => {
//             promptAsync();
//           }}
//         />
//       ) : (
//         <View style={styles.card}>
//           {userInfo?.picture && (
//             <Image source={{ uri: userInfo?.picture }} style={styles.image} />
//           )}
//           <Text style={styles.text}>Email: {userInfo.email}</Text>
//           <Text style={styles.text}>
//             Verified: {userInfo.verified_email ? "yes" : "no"}
//           </Text>
//           <Text style={styles.text}>Name: {userInfo.name}</Text>
//           {/* <Text style={styles.text}>{JSON.stringify(userInfo, null, 2)}</Text> */}
//         </View>
//       )}
//       <Button
//         title="remove local store"
//         onPress={async () => await AsyncStorage.removeItem("@user")}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   text: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   card: {
//     borderWidth: 1,
//     borderRadius: 15,
//     padding: 15,
//   },
//   image: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//   },
// });