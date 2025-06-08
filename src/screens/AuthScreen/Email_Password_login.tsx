import { REACT_API_URL } from '@/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/authSlice';

const EmailPasswordLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const loginResponse = await axios.post(`${REACT_API_URL}/login/login`, {
        email,
        password,
      });
      console.log(loginResponse)
      // Destructure user object
      const {
        id: userId,
        email: userEmail,
        username,
        plan = 'free', // Default to 'free' if plan is missing
      } = loginResponse.data.user;

      const fullUserData = {
        userId,
        email: userEmail,
        username,
        plan,
      }; 

      // Store in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(fullUserData));

      // Dispatch to Redux
      dispatch(loginSuccess(fullUserData));
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/logo_name_icon.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Continue with Email</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading || !email || !password}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Log In
      </Button>
      <Text style={styles.agreementText}>
        By proceeding, you agree to our Privacy Policy and Terms of Services
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
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    marginVertical: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#E68E00',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
    backgroundColor: '#F09300',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  agreementText: {
    textAlign: 'center',
    marginVertical: 10,
    color: 'gray',
  },
});

export default EmailPasswordLoginScreen;
