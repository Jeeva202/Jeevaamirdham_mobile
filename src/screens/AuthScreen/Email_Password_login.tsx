// import { REACT_API_URL } from '@/app-config';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import React, { useState } from 'react';
// import { Image, StyleSheet, View } from 'react-native';
// import { Button, Text, TextInput, Title } from 'react-native-paper';
// import { useDispatch } from 'react-redux';
// import { loginSuccess } from '../../redux/authSlice';

// const MultiStepLoginScreen: React.FC = () => {
//     const [step, setStep] = useState<'enterEmail' | 'createPassword' | 'loginPassword' | 'otp' | 'newPassword'>('enterEmail');
//     const [email, setEmail] = useState<string>('');
//     const [username, setUsername] = useState('');
//     const [userId, setUserId] = useState<number | null>(null);
//     const [password, setPassword] = useState('');
//     const [otp, setOtp] = useState('');
//     const [error, setError] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);
//     const dispatch = useDispatch();

//     const handleFindUser = async () => {
//         setError(null);
//         try {

//             if (!email || !email.trim()) {
//                 setError('Please enter your email.');
//                 return;
//             }
//             const response = await axios.post(`${REACT_API_URL}/login/find-user`, { email });
//             const { isExistingUser, isPasswordAvailable, isNewUserCreated, user } = response.data;

//             setUsername(user.username || '');
//             setUserId(user.id);

//             if (!isExistingUser) {
//                 setStep('createPassword');
//             } else if (isPasswordAvailable) {
//                 setStep('loginPassword');
//             } else {
//                 setStep('createPassword');
//             }
//         } catch {
//             setError('Failed to find user.');
//         }
//     };

//     const handleLogin = async () => {
//         try {
//             setLoading(true);
//             const loginRes = await axios.post(`${REACT_API_URL}/login/login`, { email, password });

//             const { id, email: userEmail, username, plan } = loginRes.data.user;

//             const fullUserData = {
//                 userId: id,
//                 email: userEmail,
//                 username,
//                 plan,
//             };

//             await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
//             dispatch(loginSuccess(fullUserData));
//         } catch {
//             setError('Invalid email or password.');
//         } finally {
//             setLoading(false);
//         }
//     };

    // const handleCreatePassword = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await axios.post(`${REACT_API_URL}/login/create-password`, {
    //             email,
    //             password,
    //             username,
    //         });

    //         const { id, email: userEmail, plan, username: name } = response.data.user;

    //         const fullUserData = {
    //             userId: id,
    //             email: userEmail,
    //             username: name,
    //             plan,
    //         };

    //         await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
    //         dispatch(loginSuccess(fullUserData));
    //     } catch {
    //         setError('Failed to set password.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const handleSendOTP = async () => {
    //     try {
    //         setLoading(true);
    //         await axios.post(`${REACT_API_URL}/login/send-otpToEmail`, { email });
    //         setStep('otp');
    //     } catch {
    //         setError('Failed to send OTP.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const handleVerifyOTP = async () => {
    //     try {
    //         setLoading(true);
    //         const res = await axios.post(`${REACT_API_URL}/login/verify-otp`, { email, otp });
    //         if (res.data.success) {
    //             setStep('newPassword');
    //         } else {
    //             setError('Invalid OTP');
    //         }
    //     } catch {
    //         setError('Failed to verify OTP');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

//     const renderContent = () => {
//         switch (step) {
//             case 'enterEmail':
//                 return (
//                     <>
//                         {/* <Title style={styles.title}>Welcome</Title> */}
//                         <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
//                         <Button onPress={handleFindUser} mode="contained" style={styles.button}>Continue</Button>
//                     </>
//                 );

//             case 'loginPassword':
//                 return (
//                     <>
//                         <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
//                         <Button onPress={handleLogin} mode="contained" style={styles.button} loading={loading}>Log In</Button>
//                         <Button onPress={handleSendOTP} mode="text" style={styles.link}>Forgot Password?</Button>
//                     </>
//                 );

//             case 'createPassword':
//                 return (
//                     <>
//                         <TextInput label="Username" value={username} onChangeText={setUsername} style={styles.input} />
//                         <TextInput label="Create Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
//                         <Button onPress={handleCreatePassword} mode="contained" style={styles.button} loading={loading}>Set Password</Button>
//                     </>
//                 );

//             case 'otp':
//                 return (
//                     <>
//                         <TextInput label="Enter OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" style={styles.input} />
//                         <Button onPress={handleVerifyOTP} mode="contained" style={styles.button} loading={loading}>Verify OTP</Button>
//                     </>
//                 );

//             case 'newPassword':
//                 return (
//                     <>
//                         <TextInput label="New Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
//                         <Button onPress={handleCreatePassword} mode="contained" style={styles.button} loading={loading}>Reset Password</Button>
//                     </>
//                 );

//             default:
//                 return null;
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <Image
//                 source={require('../../../assets/images/logo_name_icon.png')}
//                 style={styles.logo}
//             />
//             <Title style={[styles.title, { color: '#E68E00' }]}>Welcome to Jeevaamirdham</Title>
//             {renderContent()}
//             {error && <Text style={styles.error}>{error}</Text>}
//         </View>
//     );
// };

// export default MultiStepLoginScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         padding: 20,
//     },
//     title: {
//         textAlign: 'center',
//         fontSize: 24,
//         marginBottom: 20,
//         color: '#F09300',
//         fontWeight: 'bold',
//     },
//     input: {
//         marginBottom: 15,
//     },
//     button: {
//         marginVertical: 10,
//         backgroundColor: '#F09300',
//     },
//     link: {
//         marginTop: 10,
//     },
//     error: {
//         color: 'red',
//         textAlign: 'center',
//         marginTop: 10,
//     },
//     logo: {
//         alignSelf: 'center',
//         marginBottom: 20,
//     },
// });

// ====================================================================

// import { REACT_API_URL } from '@/app-config';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import React, { useState } from 'react';
// import { Image, StyleSheet, View } from 'react-native';
// import { Button, Text, TextInput, Title } from 'react-native-paper';
// import { useDispatch } from 'react-redux';
// import { loginSuccess } from '../../redux/authSlice'; // Ensure this path is correct

// const MultiStepLoginScreen: React.FC = () => {
//     // 'register' for initial new user data capture
//     // 'otp' will be used for both registration verification and forgot password
//     // 'newPassword' will ONLY be for setting a new password after a FORGOT PASSWORD OTP
//     const [step, setStep] = useState<'enterEmail' | 'register' | 'loginPassword' | 'otp' | 'newPassword'>('enterEmail');
//     const [email, setEmail] = useState<string>('');
//     const [username, setUsername] = useState('');
//     const [userId, setUserId] = useState<number | null>(null);
//     const [password, setPassword] = useState('');
//     const [otp, setOtp] = useState('');
//     const [error, setError] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);
//     const dispatch = useDispatch();

//     // New state to differentiate OTP purpose
//     const [otpPurpose, setOtpPurpose] = useState<'register' | 'forgotPassword' | null>(null);


//     // --- Core Login/Find User Flow ---
//     const handleFindUser = async () => {
//         setError(null);
//         setLoading(true);
//         try {
//             if (!email || !email.trim()) {
//                 setError('Please enter your email.');
//                 setLoading(false);
//                 return;
//             }

//             const response = await axios.post(`${REACT_API_URL}/login/find-user`, { email });
//             const { isExistingUser, isPasswordAvailable, user } = response.data;

//             if (user) {
//                 setUsername(user.username || '');
//                 setUserId(user.id);
//             } else {
//                 setUsername(''); // Ensure username is cleared if no user object
//                 setUserId(null); // Ensure userId is cleared if no user object
//             }

//             if (!isExistingUser) {
//                 // If email is not in DB, directly suggest registration
//                 setError("Email not found. Please register your account.");
//                 setStep('register');
//             } else if (isPasswordAvailable) {
//                 // Existing user with password, go to login
//                 setStep('loginPassword');
//             } else {
//                 // Existing user without password, guide them to Forgot Password flow
//                 setError("Existing account found, but no password set. Please use 'Forgot Password?' to set one.");
//                 setStep('loginPassword'); // Guide them to the login screen, from there they can click forgot password
//             }
//         } catch (err: any) {
//             console.error("Error during handleFindUser:", err);
//             if (axios.isAxiosError(err) && err.response) {
//                 setError(err.response.data.message || `Server error: ${err.response.statusText}`);
//             } else if (axios.isAxiosError(err) && err.request) {
//                 setError('Network error. Please check your internet connection.');
//             } else {
//                 setError('An unexpected error occurred. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleLogin = async () => {
//         setError(null);
//         setLoading(true);
//         try {
//             if (!email || !password) {
//                 setError('Please enter both email and password.');
//                 setLoading(false);
//                 return;
//             }
//             const loginRes = await axios.post(`${REACT_API_URL}/login/login`, { email, password });

//             const { id, email: userEmail, username, plan } = loginRes.data.user;

//             const fullUserData = {
//                 userId: id,
//                 email: userEmail,
//                 username,
//                 plan,
//             };

//             await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
//             dispatch(loginSuccess(fullUserData));
//         } catch (err: any) {
//             console.error("Error logging in:", err);
//             if (axios.isAxiosError(err) && err.response) {
//                 setError(err.response.data.message || 'Invalid email or password.');
//             } else {
//                 setError('Login failed. Please try again later.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --- YOUR EXISTING handleCreatePassword Function (for new user creation after OTP) ---
//     const handleCreatePassword = async () => {
//         setError(null); // Clear previous errors
//         setLoading(true);
//         try {
//             if (!email || !email.trim()) {
//                 setError('Email is required.');
//                 setLoading(false);
//                 return;
//             }
//             if (!username || !username.trim()) {
//                 setError('Username is required.');
//                 setLoading(false);
//                 return;
//             }
//             if (!password || password.length < 6) {
//                 setError('Password must be at least 6 characters long.');
//                 setLoading(false);
//                 return;
//             }

//             const response = await axios.post(`${REACT_API_URL}/login/create-password`, {
//                 email,
//                 password,
//                 username,
//             });

//             // Assuming response.data.user contains the full user data on success
//             const { id, email: userEmail, plan, username: name } = response.data.user;

//             const fullUserData = {
//                 userId: id,
//                 email: userEmail,
//                 username: name,
//                 plan,
//             };

//             await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
//             dispatch(loginSuccess(fullUserData));
//             alert('Account created and logged in successfully!');
//             // No setStep needed as loginSuccess should navigate away
//             setError(null); // Clear error on success
//         } catch (err: any) { // Add error handling for better messages
//             console.error("Error creating account:", err);
//             if (axios.isAxiosError(err) && err.response) {
//                 setError(err.response.data.message || 'Failed to create account. Email might be in use or password too weak.');
//             } else {
//                 setError('Failed to create account. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --- YOUR EXISTING handleSendOTP Function (unified for both purposes) ---
//     // This will send OTP for either new registration or forgot password
//     const handleSendOTP = async () => {
//         setError(null);
//         setLoading(true);
//         try {
//             if (!email || !email.trim()) {
//                 setError('Please enter your email.');
//                 setLoading(false);
//                 return;
//             }

//             // If we are in the 'register' step, we've collected username/password.
//             // The backend's /login/send-otpToEmail should be intelligent enough to know
//             // if this is a new user flow or a forgot password flow.
//             // For new registration, it should create a *pending* user internally before sending OTP.
//             // For forgot password, it should just send OTP to an *existing* user.
//             const payload: { email: string; username?: string; password?: string } = { email };
//             if (otpPurpose === 'register') {
//                 if (!username || !username.trim() || !password || password.length < 6) {
//                      setError('Please fill in Email, Username, and a password (min 6 chars) before sending OTP for registration.');
//                      setLoading(false);
//                      return;
//                 }
//                 payload.username = username;
//                 payload.password = password;
//             }

//             await axios.post(`${REACT_API_URL}/login/send-otpToEmail`, payload);

//             setStep('otp'); // Go to the unified OTP screen
//             alert(`OTP sent to your email for ${otpPurpose === 'register' ? 'registration' : 'password reset'}.`);
//         } catch (err: any) {
//             console.error(`Error sending OTP for ${otpPurpose}:`, err);
//             if (axios.isAxiosError(err) && err.response) {
//                 setError(err.response.data.message || `Failed to send OTP for ${otpPurpose}.`);
//             } else {
//                 setError(`Failed to send OTP for ${otpPurpose}. Please try again.`);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --- YOUR EXISTING handleVerifyOTP Function (unified for both purposes) ---
//     const handleVerifyOTP = async () => {
//         setError(null); // Clear previous errors
//         setLoading(true);
//         try {
//             if (!otp || otp.length !== 6) {
//                 setError('Please enter a valid 6-digit OTP.');
//                 setLoading(false);
//                 return;
//             }

//             const res = await axios.post(`${REACT_API_URL}/login/verify-otp`, { email, otp });

//             console.log('OTP Verification API Response:', res.data); // Keep this for debugging

//             if (res.data.success) {
//                 // OTP verified successfully
//                 if (otpPurpose === 'register') {
//                     // This means the email is verified for a NEW user.
//                     // Now, we proceed to create the account with the collected username/password.
//                     // Call the handleCreatePassword function here
//                     alert('Email verified! Finalizing account creation...');
//                     await handleCreatePassword(); // Call the account creation function
//                     // handleCreatePassword will set loading to false and navigate on success
//                 } else if (otpPurpose === 'forgotPassword') {
//                     // This means the OTP is verified for an EXISTING user who forgot password.
//                     setStep('newPassword'); // Go to step to set new password
//                     setPassword(''); // Clear password field for new entry
//                     alert('OTP verified. Please set your new password.');
//                     setLoading(false); // Manually set loading to false here as handleSetNewPassword will handle its own loading
//                 }
//                 setError(null); // Clear error on success
//             } else {
//                 setError(res.data.message || 'Invalid OTP. Please try again.');
//             }
//         } catch (err: any) {
//             console.error("Error during OTP verification or subsequent action:", err);
//             // If handleCreatePassword fails, its error will be set by itself
//             if (axios.isAxiosError(err) && err.response) {
//                 setError(err.response.data.message || 'Failed to verify OTP.');
//             } else {
//                 // If the error came from handleCreatePassword, it will already be set.
//                 // Only set a generic error if it's an unhandled error here.
//                 if (!error) { // Prevent overwriting a more specific error from handleCreatePassword
//                      setError('An unexpected error occurred during verification or account setup. Please try again.');
//                 }
//             }
//         } finally {
//             // setLoading(false); // handleCreatePassword handles its own loading.
//             // Only set if this function is the final step for a successful path
//             if (otpPurpose !== 'register' || !error) { // If not register purpose, or register purpose but no error from handleCreatePassword
//                 setLoading(false);
//             }
//         }
//     };

//     // --- handleSetNewPassword (for existing user forgot password flow) ---
//     // This is essentially your handleCreatePassword function but for updating an existing user's password
//     const handleSetNewPassword = async () => {
//         setError(null); // Clear previous errors
//         setLoading(true);
//         try {
//             if (!email || !email.trim()) {
//                 setError('Email is required to set new password.');
//                 setLoading(false);
//                 return;
//             }
//             if (!password || password.length < 6) {
//                 setError('Password must be at least 6 characters long.');
//                 setLoading(false);
//                 return;
//             }
//             // This API should just update the password for the existing user (verified by previous OTP)
//             // Assuming your /login/create-password can also handle updating an existing user's password
//             const res = await axios.post(`${REACT_API_URL}/login/create-password`, {
//                 email,
//                 password,
//             });

//             console.log('Set New Password API Response:', res.data); // Log response

//             if (res.data.success) { // Assuming create-password also returns a success flag
//                 alert('Password has been reset successfully. Please log in.');
//                 setStep('loginPassword');
//                 setPassword(''); // Clear password after reset
//                 setError(null); // Clear error on success
//             } else {
//                 setError(res.data.message || 'Failed to reset password.');
//             }
//         } catch (err: any) {
//             console.error("Error during axios call for setting new password:", err);
//             if (axios.isAxiosError(err) && err.response) {
//                 setError(err.response.data.message || 'Failed to reset password.');
//             } else {
//                 setError('Failed to reset password. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };


//     const renderContent = () => {
//         switch (step) {
//             case 'enterEmail':
//                 return (
//                     <>
//                         <TextInput
//                             label="Email"
//                             value={email}
//                             onChangeText={setEmail}
//                             style={styles.input}
//                             autoCapitalize="none"
//                             keyboardType="email-address"
//                             disabled={loading}
//                         />
//                         <Button onPress={handleFindUser} mode="contained" style={styles.button} loading={loading}>
//                             Continue
//                         </Button>
//                         <Text style={styles.orText}>OR</Text>
//                         <Button onPress={() => { setStep('register'); setEmail(''); setUsername(''); setPassword(''); }} mode="outlined" style={styles.createAccountButton} disabled={loading}>
//                             Create New Account
//                         </Button>
//                     </>
//                 );

//             case 'loginPassword':
//                 return (
//                     <>
//                         <Text style={styles.greetingText}>Welcome back, {username || email}!</Text>
//                         <TextInput
//                             label="Password"
//                             value={password}
//                             onChangeText={setPassword}
//                             secureTextEntry
//                             style={styles.input}
//                             disabled={loading}
//                         />
//                         <Button onPress={handleLogin} mode="contained" style={styles.button} loading={loading}>
//                             Log In
//                         </Button>
//                         <Button onPress={() => { setEmail(email); setOtpPurpose('forgotPassword'); handleSendOTP(); }} mode="text" style={styles.link} disabled={loading}>
//                             Forgot Password?
//                         </Button>
//                         <Button onPress={() => { setStep('enterEmail'); setPassword(''); setEmail(''); setUsername(''); }} mode="text" style={styles.link} disabled={loading}>
//                             Back to Email
//                         </Button>
//                     </>
//                 );

//             case 'register': // New user registration screen: Email, Username, Password input
//                 return (
//                     <>
//                         <Text style={styles.greetingText}>Register Your New Account</Text>
//                         <TextInput
//                             label="Email"
//                             value={email}
//                             onChangeText={setEmail}
//                             style={styles.input}
//                             autoCapitalize="none"
//                             keyboardType="email-address"
//                             disabled={loading}
//                         />
//                         <TextInput
//                             label="Username"
//                             value={username}
//                             onChangeText={setUsername}
//                             style={styles.input}
//                             disabled={loading}
//                         />
//                         <TextInput
//                             label="Password"
//                             value={password}
//                             onChangeText={setPassword}
//                             secureTextEntry
//                             style={styles.input}
//                             disabled={loading}
//                         />
//                         <Button onPress={() => { setOtpPurpose('register'); handleSendOTP(); }} mode="contained" style={styles.button} loading={loading}>
//                             Register & Send OTP
//                         </Button>
//                         <Button onPress={() => { setStep('enterEmail'); setEmail(''); setUsername(''); setPassword(''); }} mode="text" style={styles.link} disabled={loading}>
//                             Back to Login
//                         </Button>
//                     </>
//                 );

//             case 'otp': // Unified OTP verification screen for both purposes
//                 return (
//                     <>
//                         <Text style={styles.greetingText}>
//                             Verify your email: OTP sent to {email} {otpPurpose === 'register' ? '(Registration)' : '(Forgot Password)'}
//                         </Text>
//                         <TextInput
//                             label="Enter OTP"
//                             value={otp}
//                             onChangeText={setOtp}
//                             keyboardType="numeric"
//                             style={styles.input}
//                             maxLength={6}
//                             disabled={loading}
//                         />
//                         <Button onPress={handleVerifyOTP} mode="contained" style={styles.button} loading={loading}>
//                             Verify OTP
//                         </Button>
//                         <Button onPress={() => handleSendOTP()} mode="text" style={styles.link} disabled={loading}>
//                             Resend OTP
//                         </Button>
//                         <Button onPress={() => {
//                             if (otpPurpose === 'register') {
//                                 setStep('register');
//                             } else {
//                                 setStep('loginPassword');
//                             }
//                             setOtp(''); // Clear OTP when going back
//                         }} mode="text" style={styles.link} disabled={loading}>
//                             Back
//                         </Button>
//                     </>
//                 );

//             case 'newPassword': // Set new password after Forgot Password OTP
//                 return (
//                     <>
//                         <Text style={styles.greetingText}>Set your new password for {email}</Text>
//                         <TextInput
//                             label="New Password"
//                             value={password}
//                             onChangeText={setPassword}
//                             secureTextEntry
//                             style={styles.input}
//                             disabled={loading}
//                         />
//                         <Button onPress={handleSetNewPassword} mode="contained" style={styles.button} loading={loading}>
//                             Reset Password
//                         </Button>
//                         <Button onPress={() => { setStep('loginPassword'); setPassword(''); }} mode="text" style={styles.link} disabled={loading}>
//                             Back to Login
//                         </Button>
//                     </>
//                 );

//             default:
//                 return null;
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <Image
//                 source={require('../../../assets/images/logo_name_icon.png')}
//                 style={styles.logo}
//             />
//             <Title style={[styles.title, { color: '#E68E00' }]}>Welcome to Jeevaamirdham</Title>
//             {renderContent()}
//             {error && <Text style={styles.error}>{error}</Text>}
//         </View>
//     );
// };

// export default MultiStepLoginScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         padding: 20,
//         backgroundColor: '#f9e5ab',
//     },
//     title: {
//         textAlign: 'center',
//         fontSize: 24,
//         marginBottom: 20,
//         color: '#F09300',
//         fontWeight: 'bold',
//     },
//     greetingText: {
//         textAlign: 'center',
//         fontSize: 16,
//         marginBottom: 20,
//         color: '#555',
//     },
//     input: {
//         marginBottom: 15,
//         backgroundColor: '#fff',
//     },
//     button: {
//         marginVertical: 10,
//         backgroundColor: '#F09300',
//         borderRadius: 8,
//         paddingVertical: 4,
//     },
//     link: {
//         marginTop: 10,
//         color: '#F09300',
//     },
//     error: {
//         color: 'red',
//         textAlign: 'center',
//         marginTop: 10,
//         fontSize: 14,
//     },
//     logo: {
//         alignSelf: 'center',
//         marginBottom: 20,
//         width: 150,
//         height: 150,
//         resizeMode: 'contain',
//     },
//     orText: {
//         textAlign: 'center',
//         marginVertical: 10,
//         color: '#888',
//         fontSize: 16,
//     },
//     createAccountButton: {
//         borderColor: '#F09300',
//         borderWidth: 1,
//         marginVertical: 10,
//         backgroundColor: 'transparent',
//     },
// });
// ======================================================

import { REACT_API_URL } from '@/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput, Title } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/authSlice';

const MultiStepLoginScreen: React.FC = () => {
    const [step, setStep] = useState<'enterEmail' | 'register' | 'loginPassword' | 'otp' | 'newPassword'>('enterEmail');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState<number | null>(null);
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const [otpPurpose, setOtpPurpose] = useState<'register' | 'forgotPassword' | null>(null);

    // --- Core Login/Find User Flow ---
    const handleFindUser = async () => {
        setError(null);
        setLoading(true);
        try {
            if (!email || !email.trim()) {
                setError('Please enter your email.');
                setLoading(false);
                return;
            }

            const response = await axios.post(`${REACT_API_URL}/login/find-user`, { email });
            const { isExistingUser, isPasswordAvailable, user } = response.data;

            if (user) {
                setUsername(user.username || '');
                setUserId(user.id);
            } else {
                setUsername('');
                setUserId(null);
            }

            if (!isExistingUser) {
                setError("Email not found. Please register your account.");
                setStep('register');
            } else if (isPasswordAvailable) {
                setStep('loginPassword');
            } else {
                setError("Existing account found, but no password set. Please use 'Forgot Password?' to set one.");
                setStep('loginPassword');
            }
        } catch (err: any) {
            console.error("Error during handleFindUser:", err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || `Server error: ${err.response.statusText}`);
            } else if (axios.isAxiosError(err) && err.request) {
                setError('Network error. Please check your internet connection.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            if (!email || !password) {
                setError('Please enter both email and password.');
                setLoading(false);
                return;
            }
            const loginRes = await axios.post(`${REACT_API_URL}/login/login`, { email, password });

            const { id, email: userEmail, username, plan } = loginRes.data.user;

            const fullUserData = {
                userId: id,
                email: userEmail,
                username,
                plan,
            };

            await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
            dispatch(loginSuccess(fullUserData));
        } catch (err: any) {
            console.error("Error logging in:", err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Invalid email or password.');
            } else {
                setError('Login failed. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePassword = async () => {
        setError(null);
        setLoading(true);
        try {
            if (!email || !email.trim()) {
                setError('Email is required.');
                setLoading(false);
                return;
            }
            if (!username || !username.trim()) {
                setError('Username is required.');
                setLoading(false);
                return;
            }
            if (!password || password.length < 6) {
                setError('Password must be at least 6 characters long.');
                setLoading(false);
                return;
            }

            const response = await axios.post(`${REACT_API_URL}/login/create-password`, {
                email,
                password,
                username,
            });

            const { id, email: userEmail, plan, username: name } = response.data.user;

            const fullUserData = {
                userId: id,
                email: userEmail,
                username: name,
                plan,
            };

            await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
            dispatch(loginSuccess(fullUserData));
            alert('Account created and logged in successfully!');
            setError(null);
        } catch (err: any) {
            console.error("Error creating account:", err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Failed to create account. Email might be in use or password too weak.');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        setError(null);
        setLoading(true);
        try {
            if (!email || !email.trim()) {
                setError('Please enter your email.');
                setLoading(false);
                return;
            }

            const payload: { email: string; username?: string; password?: string } = { email };
            if (otpPurpose === 'register') {
                if (!username || !username.trim() || !password || password.length < 6) {
                     setError('Please fill in Email, Username, and a password (min 6 chars) before sending OTP for registration.');
                     setLoading(false);
                     return;
                }
                payload.username = username;
                payload.password = password;
            }

            await axios.post(`${REACT_API_URL}/login/send-otpToEmail`, payload);

            setStep('otp');
            alert(`OTP sent to your email for ${otpPurpose === 'register' ? 'registration' : 'password reset'}.`);
        } catch (err: any) {
            console.error(`Error sending OTP for ${otpPurpose}:`, err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || `Failed to send OTP for ${otpPurpose}.`);
            } else {
                setError(`Failed to send OTP for ${otpPurpose}. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError(null);
        setLoading(true);
        try {
            if (!otp || otp.length !== 6) {
                setError('Please enter a valid 6-digit OTP.');
                setLoading(false);
                return;
            }

            const res = await axios.post(`${REACT_API_URL}/login/verify-otp`, { email, otp });

            console.log('OTP Verification API Response:', res.data);

            if (res.data.success) {
                if (otpPurpose === 'register') {
                    alert('Email verified! Finalizing account creation...');
                    await handleCreatePassword();
                } else if (otpPurpose === 'forgotPassword') {
                    setStep('newPassword');
                    setPassword('');
                    alert('OTP verified. Please set your new password.');
                    setLoading(false);
                }
                setError(null);
            } else {
                setError(res.data.message || 'Invalid OTP. Please try again.');
            }
        } catch (err: any) {
            console.error("Error during OTP verification or subsequent action:", err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Failed to verify OTP.');
            } else {
                if (!error) {
                     setError('An unexpected error occurred during verification or account setup. Please try again.');
                }
            }
        } finally {
            if (otpPurpose !== 'register' || !error) {
                setLoading(false);
            }
        }
    };

    const handleSetNewPassword = async () => {
        setError(null);
        setLoading(true);
        try {
            if (!email || !email.trim()) {
                setError('Email is required to set new password.');
                setLoading(false);
                return;
            }
            if (!password || password.length < 6) {
                setError('Password must be at least 6 characters long.');
                setLoading(false);
                return;
            }

            const res = await axios.post(`${REACT_API_URL}/login/create-password`, {
                email,
                password,
            });

            console.log('Set New Password API Response:', res.data);

            if (res.data.success) {
                alert('Password has been reset successfully. Please log in.');
                setStep('loginPassword');
                setPassword('');
                setError(null);
            } else {
                setError(res.data.message || 'Failed to reset password.');
            }
        } catch (err: any) {
            console.error("Error during axios call for setting new password:", err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Failed to reset password.');
            } else {
                setError('Failed to reset password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'enterEmail':
                return (
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            {/* <Text style={styles.stepTitle}>Welcome Back</Text> */}
                            <Text style={styles.stepSubtitle}>Enter your email to continue</Text>
                            
                            <TextInput
                                label="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                                mode="outlined"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                disabled={loading}
                                theme={{ colors: { primary: '#D4A574' } }}
                            />
                            
                            <Button 
                                onPress={handleFindUser} 
                                mode="contained" 
                                style={styles.primaryButton} 
                                loading={loading}
                                labelStyle={styles.buttonLabel}
                            >
                                Continue
                            </Button>
                            
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>
                            
                            <Button 
                                onPress={() => { 
                                    setStep('register'); 
                                    setEmail(''); 
                                    setUsername(''); 
                                    setPassword(''); 
                                }} 
                                mode="outlined" 
                                style={styles.secondaryButton} 
                                disabled={loading}
                                labelStyle={styles.secondaryButtonLabel}
                            >
                                Create New Account
                            </Button>
                        </Card.Content>
                    </Card>
                );

            case 'loginPassword':
                return (
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            {/* <Text style={styles.stepTitle}>Welcome Back!</Text> */}
                            <Text style={styles.stepSubtitle}>Hello {username || email}</Text>
                            
                            <TextInput
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                style={styles.input}
                                mode="outlined"
                                disabled={loading}
                                theme={{ colors: { primary: '#D4A574' } }}
                            />
                            
                            <Button 
                                onPress={handleLogin} 
                                mode="contained" 
                                style={styles.primaryButton} 
                                loading={loading}
                                labelStyle={styles.buttonLabel}
                            >
                                Sign In
                            </Button>
                            
                            <Button 
                                onPress={() => { 
                                    setEmail(email); 
                                    setOtpPurpose('forgotPassword'); 
                                    handleSendOTP(); 
                                }} 
                                mode="text" 
                                style={styles.textButton} 
                                disabled={loading}
                                labelStyle={styles.textButtonLabel}
                            >
                                Forgot Password?
                            </Button>
                            
                            <Button 
                                onPress={() => { 
                                    setStep('enterEmail'); 
                                    setPassword(''); 
                                    setEmail(''); 
                                    setUsername(''); 
                                }} 
                                mode="text" 
                                style={styles.textButton} 
                                disabled={loading}
                                labelStyle={styles.textButtonLabel}
                            >
                                ← Back to Email
                            </Button>
                        </Card.Content>
                    </Card>
                );

            case 'register':
                return (
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.stepTitle}>Create Account</Text>
                            <Text style={styles.stepSubtitle}>Join our community today</Text>
                            
                            <TextInput
                                label="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                                mode="outlined"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                disabled={loading}
                                theme={{ colors: { primary: '#D4A574' } }}
                            />
                            
                            <TextInput
                                label="Username"
                                value={username}
                                onChangeText={setUsername}
                                style={styles.input}
                                mode="outlined"
                                disabled={loading}
                                theme={{ colors: { primary: '#D4A574' } }}
                            />
                            
                            <TextInput
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                style={styles.input}
                                mode="outlined"
                                disabled={loading}
                                theme={{ colors: { primary: '#D4A574' } }}
                            />
                            
                            <Button 
                                onPress={() => { 
                                    setOtpPurpose('register'); 
                                    handleSendOTP(); 
                                }} 
                                mode="contained" 
                                style={styles.primaryButton} 
                                loading={loading}
                                labelStyle={styles.buttonLabel}
                            >
                                Register & Verify Email
                            </Button>
                            
                            <Button 
                                onPress={() => { 
                                    setStep('enterEmail'); 
                                    setEmail(''); 
                                    setUsername(''); 
                                    setPassword(''); 
                                }} 
                                mode="text" 
                                style={styles.textButton} 
                                disabled={loading}
                                labelStyle={styles.textButtonLabel}
                            >
                                ← Back to Login
                            </Button>
                        </Card.Content>
                    </Card>
                );

            case 'otp':
                return (
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.stepTitle}>Verify Your Email</Text>
                            <Text style={styles.stepSubtitle}>
                                We've sent a 6-digit code to {email}
                            </Text>
                            
                            <TextInput
                                label="Enter OTP"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="numeric"
                                style={styles.input}
                                mode="outlined"
                                maxLength={6}
                                disabled={loading}
                                theme={{ colors: { primary: '#D4A574' } }}
                            />
                            
                            <Button 
                                onPress={handleVerifyOTP} 
                                mode="contained" 
                                style={styles.primaryButton} 
                                loading={loading}
                                labelStyle={styles.buttonLabel}
                            >
                                Verify & Continue
                            </Button>
                            
                            <Button 
                                onPress={() => handleSendOTP()} 
                                mode="text" 
                                style={styles.textButton} 
                                disabled={loading}
                                labelStyle={styles.textButtonLabel}
                            >
                                Resend Code
                            </Button>
                            
                            <Button 
                                onPress={() => {
                                    if (otpPurpose === 'register') {
                                        setStep('register');
                                    } else {
                                        setStep('loginPassword');
                                    }
                                    setOtp('');
                                }} 
                                mode="text" 
                                style={styles.textButton} 
                                disabled={loading}
                                labelStyle={styles.textButtonLabel}
                            >
                                ← Back
                            </Button>
                        </Card.Content>
                    </Card>
                );

            case 'newPassword':
                return (
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.stepTitle}>Reset Password</Text>
                            <Text style={styles.stepSubtitle}>Create a new password for {email}</Text>
                            
                            <TextInput
                                label="New Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                style={styles.input}
                                mode="outlined"
                                disabled={loading}
                                theme={{ colors: { primary: '#D4A574' } }}
                            />
                            
                            <Button 
                                onPress={handleSetNewPassword} 
                                mode="contained" 
                                style={styles.primaryButton} 
                                loading={loading}
                                labelStyle={styles.buttonLabel}
                            >
                                Update Password
                            </Button>
                            
                            <Button 
                                onPress={() => { 
                                    setStep('loginPassword'); 
                                    setPassword(''); 
                                }} 
                                mode="text" 
                                style={styles.textButton} 
                                disabled={loading}
                                labelStyle={styles.textButtonLabel}
                            >
                                ← Back to Login
                            </Button>
                        </Card.Content>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9e5ab" />
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Image
                        source={require('../../../assets/images/logo_name_icon.png')}
                        style={styles.logo}
                    />
                    <Title style={styles.title}>Welcome to Jeevaamirdham</Title>
                </View>
                
                {renderContent()}
                
                {error && (
                    <Card style={styles.errorCard}>
                        <Card.Content>
                            <Text style={styles.errorText}>{error}</Text>
                        </Card.Content>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
};

export default MultiStepLoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9e5ab',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        // width: 150,
        // height: 150,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#E68E00',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: 'transparent',
        // borderRadius: 20,
        elevation: 0,
        shadowColor: 'transparent',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.15,
        // shadowRadius: 12,
        // marginBottom: 16,
        // borderWidth: 1,
        // borderColor: '#e6d49a',
    },
    cardContent: {
        padding: 24,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#E68E00',
        textAlign: 'center',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#E68E00',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    input: {
        marginBottom: 20,
        backgroundColor: '#faebd7',
        fontSize: 16,
    },
    primaryButton: {
        // backgroundColor: '#D2691E',
        borderRadius: 12,
        paddingVertical: 8,
        marginBottom: 12,
        // elevation: 3,
        // shadowColor: '#8B4513',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.2,
        // shadowRadius: 4,
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    secondaryButton: {
        borderColor: '#E68E00',
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 4,
        // backgroundColor: 'transparent',
    },
    secondaryButtonLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E68E00',
    },
    textButton: {
        marginTop: 8,
    },
    textButtonLabel: {
        fontSize: 15,
        color: '#D2691E',
        fontWeight: '500',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#D4A574',
        opacity: 0.6,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: '#A0522D',
        fontWeight: '500',
    },
    errorCard: {
        backgroundColor: '#ffe4e1',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ffcccb',
        marginTop: 8,
        elevation: 0
    },
    errorText: {
        color: '#cc0000',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});