import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9e5ab' }}>
      <View style={styles.headerControls}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Empty state */}
      <View style={styles.emptyContainer}>
        <MaterialIcons name="notifications-none" size={44} color="#ccc" />
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
    headerControls: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
    iconButton: {
    // backgroundColor: '#E68E00',
    backgroundColor: '#F09300',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
    title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 2,
    textAlign: 'center',
  },
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