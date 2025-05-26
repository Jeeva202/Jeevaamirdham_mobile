import { useQuery } from 'react-query';
import axios from 'axios';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { REACT_API_URL } from '@/app-config';

export function Loader() {
  const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F09300" />
      <Text>Loading...</Text>
    </View>
  );
}


const fetchYears = async () => {
  const { data } = await axios.get(`${REACT_API_URL}/emagazine-page/magazine-yearwise`);
  return data.reverse();
};

export default function EmagazineScreen() {
    const navigation = useNavigation<any>();
  
  const { data: years, isLoading, error } = useQuery('years', fetchYears);

  if (isLoading) return <Loader />;
  if (error) return <Text>Error loading years</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>E-Magazine by Years</Text>
      <FlatList
        data={years}
        keyExtractor={item => item.year.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('MonthSelection', { year: item.year })}
          >
            <Card.Cover source={{ uri: item.imgUrl }} style={styles.cover} />
            <Card.Title title={item.year.toString()} titleStyle={styles.cardTitle} />
          </Card>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { marginBottom: 16, fontWeight: 'bold', color: '#F09300' },
  card: { flex: 1, margin: 8, elevation: 4 },
  cover: { height: 150, borderRadius: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
});