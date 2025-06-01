import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
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
    // Simulate Google login success
    const userData = { userId: 'google123', email: 'user@gmail.com' };
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    dispatch(loginSuccess(userData));
  };

  return (
    <View style={[styles.container]}>
          <Image
            source={require('../../../assets/images/logo_name_icon.png')}
            style={styles.logo}
          />
          <Title style={[styles.title, {color: '#E68E00'}]}>Welcome to Jeevaamirdham</Title>
          <Button
            mode="text"
            icon="google"
            onPress={handleGoogleLogin}
            style={[{ backgroundColor: "#FFFFFF" }, styles.button]}
            labelStyle={[{ color: "#333" }, styles.buttonLabel]}
          >
            Sign in with Google
          </Button>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <Divider style={styles.divider} />
            <Text style={styles.orText}>Or sign in with</Text>
            <Divider style={styles.divider} />
          </View>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('EmailScreen')}
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