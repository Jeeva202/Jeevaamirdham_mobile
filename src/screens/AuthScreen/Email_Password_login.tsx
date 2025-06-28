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