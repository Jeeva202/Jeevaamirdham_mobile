// import { REACT_API_URL } from '@/app-config';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import React, { useState } from 'react';
// import { Image, StyleSheet, View } from 'react-native';
// import { Button, Text, TextInput } from 'react-native-paper';
// import { useDispatch } from 'react-redux';
// import { loginSuccess } from '../../redux/authSlice';

// const EmailPasswordLoginScreen: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const dispatch = useDispatch();

//   const handleLogin = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const loginResponse = await axios.post(`${REACT_API_URL}/login/login`, {
//         email,
//         password,
//       });
//       console.log(loginResponse)
//       // Destructure user object
//       const {
//         id: userId,
//         email: userEmail,
//         username,
//         plan = 'free', // Default to 'free' if plan is missing
//       } = loginResponse.data.user;

//       const fullUserData = {
//         userId,
//         email: userEmail,
//         username,
//         plan,
//       }; 

//       // Store in AsyncStorage
//       await AsyncStorage.setItem('user', JSON.stringify(fullUserData));

//       // Dispatch to Redux
//       dispatch(loginSuccess(fullUserData));
//     } catch (err) {
//       setError('Login failed. Please check your credentials.');
//       console.error('Login error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require('../../../assets/images/logo_name_icon.png')}
//         style={styles.logo}
//       />
//       <Text style={styles.title}>Continue with Email</Text>
//       <TextInput
//         label="Email"
//         value={email}
//         onChangeText={setEmail}
//         style={styles.input}
//         autoCapitalize="none"
//       />
//       <TextInput
//         label="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         style={styles.input}
//       />
//       {error && <Text style={styles.error}>{error}</Text>}
//       <Button
//         mode="contained"
//         onPress={handleLogin}
//         loading={loading}
//         disabled={loading || !email || !password}
//         style={styles.button}
//         labelStyle={styles.buttonLabel}
//       >
//         Log In
//       </Button>
//       <Text style={styles.agreementText}>
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
//   },
//   logo: {
//     alignSelf: 'center',
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 26,
//     marginVertical: 20,
//     textAlign: 'center',
//     fontWeight: 'bold',
//     color: '#E68E00',
//   },
//   input: {
//     marginBottom: 10,
//   },
//   button: {
//     marginVertical: 10,
//     backgroundColor: '#F09300',
//   },
//   buttonLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   error: {
//     color: 'red',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   agreementText: {
//     textAlign: 'center',
//     marginVertical: 10,
//     color: 'gray',
//   },
// });

// export default EmailPasswordLoginScreen;





import { REACT_API_URL } from '@/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Title } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/authSlice';

const MultiStepLoginScreen: React.FC = () => {
    const [step, setStep] = useState<'enterEmail' | 'createPassword' | 'loginPassword' | 'otp' | 'newPassword'>('enterEmail');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState<number | null>(null);
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleFindUser = async () => {
        setError(null);
        try {
            const response = await axios.post(`${REACT_API_URL}/login/find-user`, { email });
            const { isExistingUser, isPasswordAvailable, isNewUserCreated, user } = response.data;

            setUsername(user.username || '');
            setUserId(user.id);

            if (!isExistingUser) {
                setStep('createPassword');
            } else if (isPasswordAvailable) {
                setStep('loginPassword');
            } else {
                setStep('createPassword');
            }
        } catch {
            setError('Failed to find user.');
        }
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
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
        } catch {
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePassword = async () => {
        try {
            setLoading(true);
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
        } catch {
            setError('Failed to set password.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        try {
            setLoading(true);
            await axios.post(`${REACT_API_URL}/login/send-otpToEmail`, { email });
            setStep('otp');
        } catch {
            setError('Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${REACT_API_URL}/login/verify-otp`, { email, otp });
            if (res.data.success) {
                setStep('newPassword');
            } else {
                setError('Invalid OTP');
            }
        } catch {
            setError('Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'enterEmail':
                return (
                    <>
                        {/* <Title style={styles.title}>Welcome</Title> */}
                        <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
                        <Button onPress={handleFindUser} mode="contained" style={styles.button}>Continue</Button>
                    </>
                );

            case 'loginPassword':
                return (
                    <>
                        <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
                        <Button onPress={handleLogin} mode="contained" style={styles.button} loading={loading}>Log In</Button>
                        <Button onPress={handleSendOTP} mode="text" style={styles.link}>Forgot Password?</Button>
                    </>
                );

            case 'createPassword':
                return (
                    <>
                        <TextInput label="Username" value={username} onChangeText={setUsername} style={styles.input} />
                        <TextInput label="Create Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
                        <Button onPress={handleCreatePassword} mode="contained" style={styles.button} loading={loading}>Set Password</Button>
                    </>
                );

            case 'otp':
                return (
                    <>
                        <TextInput label="Enter OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" style={styles.input} />
                        <Button onPress={handleVerifyOTP} mode="contained" style={styles.button} loading={loading}>Verify OTP</Button>
                    </>
                );

            case 'newPassword':
                return (
                    <>
                        <TextInput label="New Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
                        <Button onPress={handleCreatePassword} mode="contained" style={styles.button} loading={loading}>Reset Password</Button>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../../assets/images/logo_name_icon.png')}
                style={styles.logo}
            />
            <Title style={[styles.title, { color: '#E68E00' }]}>Welcome to Jeevaamirdham</Title>
            {renderContent()}
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

export default MultiStepLoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 20,
        color: '#F09300',
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginVertical: 10,
        backgroundColor: '#F09300',
    },
    link: {
        marginTop: 10,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    logo: {
        alignSelf: 'center',
        marginBottom: 20,
    },
});
