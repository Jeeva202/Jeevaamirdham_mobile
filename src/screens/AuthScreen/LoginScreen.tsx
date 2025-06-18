// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Divider, Text, Title } from 'react-native-paper';
import { useDispatch } from 'react-redux';

// GoogleSignin.configure({
//   webClientId: '622659185789-rue1itvqp2i8numvn6fe6oavpmggg481.apps.googleusercontent.com', // Get this from Google Cloud Console
//   offlineAccess: true,
// });

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    // try {
    //   setLoading(true);
    //   // Ensure user is signed out before attempting login
    //   await GoogleSignin.signOut();
    //   // Check if Google Play services are available
    //   await GoogleSignin.hasPlayServices();
    //   // Sign in with Google
    //   const userInfo = await GoogleSignin.signIn();
    //   const { id, email, name } = userInfo.data?.user ?? {};
    //   if (!id || !email || !name) {
    //     throw new Error('Google user information is incomplete.');
    //   }

    //   // Check if user exists in backend
    //   const checkUserResponse = await axios.post(`${REACT_API_URL}/check-user`, { email });
    //   let userId;

    //   if (checkUserResponse.data.userExists) {
    //     userId = checkUserResponse.data.id;
    //   } else {
    //     // Create new user if they don't exist
    //     const createUserResponse = await axios.post(`${REACT_API_URL}/create-user`, { email, name });
    //     if (createUserResponse.data.user) {
    //       userId = createUserResponse.data.user.id;
    //       Alert.alert('Success', `Welcome, ${name}!`);
    //     } else {
    //       throw new Error('Failed to create user');
    //     }
    //   }

    //   // Fetch user plan
    //   const planResponse = await axios.get(`${REACT_API_URL}/getPlan`, {
    //     params: { id: userId },
    //   });
    //   const userPlan = planResponse.data?.[0]?.plan || 'free';

    //   // Store user data in AsyncStorage
    //   const fullUserData = {
    //     userId,
    //     email,
    //     name,
    //     plan: userPlan,
    //   };
    //   await AsyncStorage.setItem('user', JSON.stringify(fullUserData));

    //   // Dispatch login success
    //   dispatch(loginSuccess(fullUserData));

    //   // Navigate to next screen or close login
    //   navigation.goBack(); // Adjust based on your navigation flow

    // } catch (error: any) {
    //   console.error('Google login failed:', error);
    //   if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    //     Alert.alert('Cancelled', 'Google login was cancelled.');
    //   } else if (error.code === statusCodes.IN_PROGRESS) {
    //     Alert.alert('Error', 'Sign-in is in progress, please wait.');
    //   } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    //     Alert.alert('Error', 'Google Play Services are not available.');
    //   } else {
    //     Alert.alert('Error', 'An error occurred during login. Please try again.');
    //   }
    // } finally {
    //   setLoading(false);
    // }
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
        disabled={loading}
        loading={loading}
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
        disabled={loading}
      >
        Continue with Email
      </Button>
      <Text style={styles.orText}>
        By proceeding, you agree to our
        <Text style={{ color: '#E68E00' }} onPress={() => {
          // @ts-ignore
          navigation.navigate('WebViewScreen', { url: 'https://www.jeevaamirdham.org/privacyPolicy', title: 'Privacy Policy' });
        }}> Privacy Policy </Text>
        and
        <Text style={{ color: '#E68E00' }} onPress={() => {
          // @ts-ignore
          navigation.navigate('WebViewScreen', { url: 'https://www.jeevaamirdham.org/termsAndCondition', title: 'Terms and Conditions' });
        }}> Terms & Conditions</Text>
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

// ===============firebase login=================================

// import { REACT_API_URL } from '@/app-config';
// import { loginSuccess } from '@/src/redux/authSlice';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import React, { useState } from 'react';
// import { Alert, Image, StyleSheet, View } from 'react-native';
// import { Button, Divider, Text, Title } from 'react-native-paper';
// import { useDispatch } from 'react-redux';

// // Import Firebase auth
// import auth from '@react-native-firebase/auth';

// // Configure Google Sign-In for Firebase
// // **IMPORTANT**: Use the webClientId from your google-services.json (client_type 3)
// // This client ID allows your backend (Firebase) to verify the Google token.
// // The one you provided in the google-services.json (68569373638-0oneil6vgpdm15nmis4p53pfq9k5d7jq.apps.googleusercontent.com)
// // is the correct one for Firebase.
// GoogleSignin.configure({
//   webClientId: '68569373638-0oneil6vgpdm15nmis4p53pfq9k5d7jq.apps.googleusercontent.com', // Firebase Web Client ID (from google-services.json, client_type 3)
//   offlineAccess: true, // If you need to refresh tokens later
// });

// const LoginScreen: React.FC = () => {
//   const navigation = useNavigation<any>();
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);

//   const handleGoogleLogin = async () => {
//     try {
//       setLoading(true);

//       // 1. Get the Google ID token from the user
//       // Ensure user is signed out before attempting login if you want to force account selection
//       await GoogleSignin.signOut(); // Optional: forces account selection on subsequent logins
//       await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
//       const googleUser = await GoogleSignin.signIn();
//       const idToken = googleUser.data?.idToken ?? null;

//       // 2. Create a Firebase credential with the Google ID token
//       const googleCredential = auth.GoogleAuthProvider.credential(idToken);

//       // 3. Sign in to Firebase with the credential
//       // This will automatically create a new user in Firebase Auth if they don't exist
//       const firebaseUserCredential = await auth().signInWithCredential(googleCredential);
//       const firebaseUser = firebaseUserCredential.user;

//       // At this point, the user is authenticated with Firebase.
//       // Now, interact with your backend to check/create user in your database
//       // and fetch their specific plan.

//       const email = firebaseUser.email;
//       const name = firebaseUser.displayName;
//       const firebaseUID = firebaseUser.uid; // Firebase's unique user ID

//       if (!email || !name) {
//         throw new Error('Google user information from Firebase is incomplete.');
//       }

//       // Check if user exists in your backend or create them
//       // Pass Firebase UID along with email and name
//       const backendResponse = await axios.post(`${REACT_API_URL}/login-or-signup-with-google`, {
//         email,
//         name,
//         firebaseUID, // Send Firebase UID to your backend
//       });

//       if (!backendResponse.data || !backendResponse.data.userId) {
//         throw new Error('Backend failed to return user ID.');
//       }

//       const { userId, plan } = backendResponse.data; // Expect userId and plan from your backend

//       // Store user data in AsyncStorage
//       const fullUserData = {
//         userId: userId, // Your backend's user ID
//         email,
//         name,
//         plan: plan || 'free', // Default to 'free' if backend doesn't provide
//         firebaseUID, // Store Firebase UID as well if needed later
//       };
//       await AsyncStorage.setItem('user', JSON.stringify(fullUserData));

//       // Dispatch login success
//       dispatch(loginSuccess(fullUserData));

//       Alert.alert('Success', `Welcome, ${name}!`);
//       // Navigate to next screen or close login
//       navigation.goBack(); // Adjust based on your navigation flow

//     } catch (error: any) {
//       console.error('Google login failed:', error);
//       if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//         Alert.alert('Cancelled', 'Google login was cancelled.');
//       } else if (error.code === statusCodes.IN_PROGRESS) {
//         Alert.alert('Error', 'Sign-in is in progress, please wait.');
//       } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//         Alert.alert('Error', 'Google Play Services are not available.');
//       } else if (error.code === 'auth/operation-not-allowed') {
//         Alert.alert('Error', 'Google sign-in is not enabled in Firebase. Please enable it in Firebase console.');
//       }
//       // Specific Firebase auth errors
//       else if (error.code && error.code.startsWith('auth/')) {
//         Alert.alert('Firebase Auth Error', error.message || 'An authentication error occurred.');
//       }
//       else {
//         Alert.alert('Error', 'An error occurred during login. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={[styles.container]}>
//       <Image
//         source={require('../../../assets/images/logo_name_icon.png')}
//         style={styles.logo}
//       />
//       <Title style={[styles.title, { color: '#E68E00' }]}>Welcome to Jeevaamirdham</Title>
//       <Button
//         mode="text"
//         icon="google"
//         onPress={handleGoogleLogin}
//         style={[{ backgroundColor: "#FFFFFF" }, styles.button]}
//         labelStyle={[{ color: "#333" }, styles.buttonLabel]}
//         disabled={loading}
//         loading={loading}
//       >
//         Sign in with Google
//       </Button>
//       <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
//         <Divider style={styles.divider} />
//         <Text style={styles.orText}>Or sign in with</Text>
//         <Divider style={styles.divider} />
//       </View>
//       <Button
//         mode="contained"
//         onPress={() => navigation.navigate('EmailPasswordLoginScreen')}
//         style={styles.button}
//         labelStyle={[{ color: "#fff" }, styles.buttonLabel]}
//         disabled={loading}
//       >
//         Continue with Email
//       </Button>
//       <Text style={styles.orText}>
//         By proceeding, you agree to our
//         <Text style={{ color: '#E68E00' }} onPress={() => {
//           // @ts-ignore
//           navigation.navigate('WebViewScreen', { url: 'https://www.jeevaamirdham.org/privacyPolicy', title: 'Privacy Policy' });
//         }}> Privacy Policy </Text>
//         and
//         <Text style={{ color: '#E68E00' }} onPress={() => {
//           // @ts-ignore
//           navigation.navigate('WebViewScreen', { url: 'https://www.jeevaamirdham.org/termsAndCondition', title: 'Terms and Conditions' });
//         }}> Terms & Conditions</Text>
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//     backgroundColor: '#f5f5f5', // Added a background color for clarity
//   },
//   card: {
//     padding: 20,
//     borderRadius: 10,
//     elevation: 4,
//   },
//   logo: {
//     width: 150, // Added dimensions
//     height: 150, // Added dimensions
//     resizeMode: 'contain',
//     alignSelf: 'center',
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 26,
//     marginBottom: 20,
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   button: {
//     marginVertical: 10,
//     paddingVertical: 8, // Add some padding
//     borderRadius: 8, // Add some border radius
//   },
//   buttonLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   divider: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#ccc',
//     marginHorizontal: 10,
//   },
//   orText: {
//     textAlign: 'center',
//     marginVertical: 10,
//     color: 'gray',
//     fontSize: 12, // Smaller font for terms
//   },
// });

// export default LoginScreen;