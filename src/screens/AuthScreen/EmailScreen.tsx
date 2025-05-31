import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, TextInput, Title, useTheme, Appbar } from 'react-native-paper';

const EmailScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const handleNext = () => {
    // Check if user exists
    const userExists = email === 'user@gmail.com'; // Mock check
    if (userExists) {
      navigation.navigate('PasswordScreen', { email });
    } else {
      navigation.navigate('OTPScreen', { email });
    }
  };

  return (
    <SafeAreaView style={[styles.container]}>
      {/* Back Button */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </Appbar.Header>

      {/* Main Content */}
      <View style={styles.content}>
        <Title style={styles.title}>Enter Your Email</Title>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Next
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 10,
    // backgroundColor: '#fff', // Fallback background color
  },
  header: {
    backgroundColor: 'transparent', // Make header transparent
    elevation: 0, // Remove shadow on Android
  },
  content: {
    flex: 1,
    // justifyContent: 'center',
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

export default EmailScreen;