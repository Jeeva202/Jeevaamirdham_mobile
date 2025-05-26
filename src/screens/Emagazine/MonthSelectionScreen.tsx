import { useQuery } from 'react-query';
import axios from 'axios';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Magazine } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setAccountExpired, setUserId } from '../../redux/userSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { getItem } from '../../utils/storage';
import { useEffect } from 'react';
import { Loader } from './EmagazineScreen';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { REACT_API_URL } from '@/app-config';
import { ScrollView } from 'react-native-gesture-handler';

const fetchMonths = async (year: number) => {
  const { data } = await axios.get(`${REACT_API_URL}/emagazine-page/magazine-monthwise`, {
    params: { year },
  });

  const monthMapping: Record<number, string> = {
    1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
    7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December',
  };

  return data.map((item: Magazine) => ({
    ...item,
    month_eng: monthMapping[item.month],
  }));
};

type Props = NativeStackScreenProps<RootStackParamList, 'MonthSelection'>;
type MonthSelectionRouteProp = RouteProp<RootStackParamList, 'MonthSelection'>;

const MonthSelectionScreen: React.FC = () => {
  const route = useRoute<MonthSelectionRouteProp>();
  const navigation = useNavigation<Props['navigation']>();
  const { year } = route.params;
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.user.userId);

  const { data: months, isLoading, error } = useQuery(['months', year], () => fetchMonths(year));

  useEffect(() => {
    const loadUserId = async () => {
      if (!userId) {
        const storedUserId = await getItem('userId');
        if (storedUserId) {
          dispatch(setUserId(storedUserId));
        }
      }
    };
    loadUserId();
  }, [dispatch, userId]);

  const handleMonthClick = async (month: string) => {
    if (userId) {
      try {
        const response = await axios.get(`${REACT_API_URL}/account-expiry`, {
          params: { uid: userId },
        });
        dispatch(setAccountExpired(!response.data.isUserActive));
      } catch (err) {
        console.error('Error checking account expiry:', err);
      }
    }

    navigation.navigate('MagazineDetails', { year, month });
  };

  if (isLoading) return <Loader />;
  if (error) return <Text>Error loading months</Text>;

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        E-Magazine by Months - {year}
      </Text>
      <FlatList
        data={months}
        keyExtractor={(item) => item.month.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => handleMonthClick(item.month_eng)}>
            <Card.Cover source={{ uri: item.imgUrl }} style={styles.cover} />
            <Card.Title
              title={`${item.month_eng} ${year}`}
              titleStyle={styles.cardTitle}
            />
          </Card>
        )}
      />
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#F09300',
  },
  card: {
    flex: 1,
    margin: 8,
    elevation: 4,
  },
  cover: {
    height: 150,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MonthSelectionScreen;
