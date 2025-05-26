import { View, Text, ImageBackground, SafeAreaView } from 'react-native'
import React from 'react'
import { Provider } from "react-redux";
import { store } from "../src/redux/store";
import AppNavigator from '@/src/navigation/AppNavigator'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import customTheme from './theme';
import { QueryClient, QueryClientProvider } from 'react-query';
export default function RootLayout() {
  console.log("RootLayout")
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2, // Retry failed queries twice
        staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
      },
    },
  });
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={customTheme}>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
              <AppNavigator />
            </SafeAreaView>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </Provider>
  )
}