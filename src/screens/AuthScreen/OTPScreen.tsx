import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, TextInput, Title, useTheme, Appbar } from 'react-native-paper';

const OTPScreen: React.FC = () => {
  const [otp, setOtp] = useState('');
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email } = route.params;
  const { colors } = useTheme();

  const handleVerifyOTP = () => {
    navigation.navigate('CreatePasswordScreen', { email });
  };

  return (
    <SafeAreaView style={[styles.container]}>
      {/* Back Button */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </Appbar.Header>

      {/* Main Content */}
      <View style={styles.content}>
        <Title style={styles.title}>Enter OTP</Title>
        <TextInput
          label="OTP"
          value={otp}
          onChangeText={setOtp}
          mode="outlined"
          style={styles.input}
          keyboardType="number-pad"
        />
        <Button
          mode="contained"
          onPress={handleVerifyOTP}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Verify
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

export default OTPScreen;