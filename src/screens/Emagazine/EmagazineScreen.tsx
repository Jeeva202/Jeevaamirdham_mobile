import { REACT_API_URL } from '@/app-config';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from 'react-query';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export function Loader() {
  return (
    <View style={loaderStyles.container}>
      <View style={loaderStyles.loaderWrapper}>
        <ActivityIndicator size="large" color="#DC6803" />
        <Text style={loaderStyles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const loaderStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f9e5ab'
  },
  loaderWrapper: {
    alignItems: 'center',
    backgroundColor: '#f9e5ab',
    padding: 20,
    borderRadius: 7,
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#DC6803',
    opacity: 0.8,
    fontWeight: '700',
  }
});

const fetchYears = async () => {
  const { data } = await axios.get(`${REACT_API_URL}/emagazine-page/magazine-yearwise`);
  return data.reverse();
};

export default function EmagazineScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const { data: years, isLoading, error, refetch } = useQuery('years', fetchYears);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) return <Loader />;
  if (error) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Unable to load magazines</Text>
      <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
    </View>
  );

  const renderYearCard = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity
      style={[styles.cardContainer, { 
        marginTop: index < 2 ? 0 : 20,
        transform: [{ scale: 1 }] 
      }]}
      onPress={() => navigation.navigate('MonthSelection', { year: item.year })}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        <ImageBackground
          source={{ uri: item.imgUrl }}
          style={styles.cardBackground}
          imageStyle={styles.cardImage}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.yearBadge}>
                <Text style={styles.yearText}>{item.year}</Text>
              </View>
              <Text style={styles.cardSubtitle}>Magazine Collection</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
        
        {/* Animated border effect */}
        <View style={styles.cardBorder} />
      </View>
    </TouchableOpacity>
  );
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>E-MAGAZINES</Text>
    </View>
  );
  return (
    <View style={styles.container}>      
      <FlatList
        data={years}
        keyExtractor={item => item.year.toString()}
        numColumns={2}
        renderItem={renderYearCard}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9e5ab',
  },
  
  headerContainer: {
    // marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 2,
    padding: 16,
    textAlign: 'center'
  },
  
  subtitle: {
    fontSize: 16,
    color: '#DC6803',
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: '800',
    marginLeft: 4
  },
  
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  
  row: {
    justifyContent: 'space-between',
  },
  
  cardContainer: {
    width: CARD_WIDTH,
    height: 240,
  },
  
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  cardBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  cardImage: {
    borderRadius: 20,
  },
  
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  
  cardContent: {
    alignItems: 'flex-start',
  },
  
  yearBadge: {
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
    backdropFilter: 'blur(10px)',
  },
  
  yearText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  
  cardSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 32,
  },
  
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  errorSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 24,
  },
});