import React from 'react';
import { View, Text, Button } from 'react-native';

import type { StackNavigationProp } from '@react-navigation/stack';

type SignupScreenNavigationProp = StackNavigationProp<any>;

const SignupScreen = ({ navigation }: { navigation: SignupScreenNavigationProp }) => {
  return (
    <View>
      <Text>Signup Screen</Text>
      <Button title="Signup" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

export default SignupScreen;
