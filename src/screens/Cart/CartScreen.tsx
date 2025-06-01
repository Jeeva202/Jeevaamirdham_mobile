import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9e5ab' }}>

      {/* Empty state */}
      <View style={styles.emptyContainer}>
        <MaterialIcons name="add-shopping-cart" size={44} color="#ccc" />
        <Text style={styles.emptyText}>Empty Cart</Text>
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({

  emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
},
emptyText: {
  marginTop: 12,
  fontSize: 16,
  color: '#888',
  textAlign: 'center',
  fontWeight: '600',
},

})