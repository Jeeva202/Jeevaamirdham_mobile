// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text, Title } from 'react-native-paper';
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
      
      {/* =================for next phase========================== */}
      {/* <Button
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
      </View> */}
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

// ===============login=================================

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import React, { useState } from 'react';
// import { Alert, Image, StyleSheet, View } from 'react-native';
// import { Button, Divider, Text, Title } from 'react-native-paper';
// import { useDispatch } from 'react-redux';
// import { REACT_API_URL } from '../../../app-config';
// import { loginSuccess } from '../../redux/authSlice';

// // Configure Google Sign-In
// GoogleSignin.configure({
//   webClientId: '622659185789-rue1itvqp2i8numvn6fe6oavpmggg481.apps.googleusercontent.com',
//   offlineAccess: true,
// });

// const LoginScreen: React.FC = () => {
//   const navigation = useNavigation<any>();
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);

//   const handleGoogleLogin = async () => {
//     try {
//       setLoading(true);      await GoogleSignin.signOut();
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       const userData = await GoogleSignin.getCurrentUser();
      
//       if (!userData?.user || !userData.user.email || !userData.user.name || !userData.user.id) {
//         throw new Error('Google user information is incomplete.');
//       }

//       const { email, name, id: googleId } = userData.user;

//       // Check if user exists in backend
//       const checkUserResponse = await axios.post(`${REACT_API_URL}/check-user`, { email });
//       let userId;

//       if (checkUserResponse.data.userExists) {
//         userId = checkUserResponse.data.id;
//       } else {
//         // Create new user if they don't exist
//         const createUserResponse = await axios.post(`${REACT_API_URL}/create-user`, { 
//           email, 
//           name,
//           googleId 
//         });
        
//         if (createUserResponse.data.user) {
//           userId = createUserResponse.data.user.id;
//           Alert.alert('Success', `Welcome, ${name}!`);
//         } else {
//           throw new Error('Failed to create user');
//         }
//       }

//       // Fetch user plan
//       const planResponse = await axios.get(`${REACT_API_URL}/getPlan`, {
//         params: { id: userId },
//       });
//       const userPlan = planResponse.data?.[0]?.plan || 'free';

//       // Store user data in AsyncStorage
//       const fullUserData = {
//         userId,
//         email,
//         name,
//         plan: userPlan,
//         googleId,
//       };
//       await AsyncStorage.setItem('user', JSON.stringify(fullUserData));

//       // Dispatch login success
//       dispatch(loginSuccess(fullUserData));
//       navigation.goBack();

//     } catch (error: any) {
//       console.error('Google login failed:', error);
//       if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//         Alert.alert('Cancelled', 'Google login was cancelled.');
//       } else if (error.code === statusCodes.IN_PROGRESS) {
//         Alert.alert('Error', 'Sign-in is in progress, please wait.');
//       } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//         Alert.alert('Error', 'Google Play Services are not available.');
//       } else {
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
//   },
//   card: {
//     padding: 20,
//     borderRadius: 10,
//     elevation: 4,
//   },
//   logo: {
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
//   },
//   buttonLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   divider: {
//     marginVertical: 20,
//   },
//   orText: {
//     textAlign: 'center',
//     marginVertical: 10,
//     color: 'gray',
//   },
// });

// export default LoginScreen;