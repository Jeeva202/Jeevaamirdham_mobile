import AppNavigator from '@/src/navigation/AppNavigator';
import React from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from "react-redux";
import { store } from "../src/redux/store";
import customTheme from './theme';

export default function RootLayout() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={customTheme}>
           <StatusBar barStyle="dark-content"  />
            {/* <SafeAreaView style={{flex:1, backgroundColor: '#000' }}> */}
              <AppNavigator />
            {/* </SafeAreaView> */}
        </PaperProvider>
      </QueryClientProvider>
    </Provider>
  );
}
