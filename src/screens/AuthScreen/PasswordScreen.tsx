import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, TextInput, Title, useTheme, Appbar } from 'react-native-paper';

const PasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email } = route.params;
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const handleLogin = async () => {
    const userData = { userId: 'user123', email };
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    dispatch(loginSuccess(userData));
  };

  return (
    <SafeAreaView style={[styles.container]}>
      {/* Back Button */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </Appbar.Header>

      {/* Main Content */}
      <View style={styles.content}>
        <Title style={styles.title}>Enter Your Password</Title>
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Login
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent', // Make header transparent
    elevation: 0, // Remove shadow on Android
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  buttonLabel: {
    fontSize: 16,
  },
});

export default PasswordScreen;