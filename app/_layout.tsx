import { View, Text, ImageBackground, SafeAreaView } from 'react-native'
import React from 'react'
import { Provider } from "react-redux";
import { store } from "../src/redux/store";
import AppNavigator from '@/src/navigation/AppNavigator'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import customTheme from './theme';
export default function RootLayout() {
  console.log("RootLayout")
  return (
    <Provider store={store}>
      <PaperProvider theme={customTheme}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <AppNavigator />
          </SafeAreaView>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  )
}