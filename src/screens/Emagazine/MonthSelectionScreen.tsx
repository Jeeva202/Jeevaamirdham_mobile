import { REACT_API_URL } from '@/app-config';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Magazine, RootStackParamList } from '../../navigation/types';
import { RootState } from '../../redux/store';
import { setAccountExpired, setUserId } from '../../redux/userSlice';
import { getItem } from '../../utils/storage';
import { Loader } from './EmagazineScreen';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

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
  if (error) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Unable to load months</Text>
      <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" /> */}
      {/* Header Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>E-MAGAZINE {year}</Text>
        <View style={{ width: 40 }}></View>
      </View>
      {/* Grid */}
      <FlatList
        data={months}
        keyExtractor={(item) => item.month.toString()}
        numColumns={2}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handleMonthClick(item.month_eng)}
            activeOpacity={0.9}
            style={[
              styles.cardContainer,
              { marginTop: index < 2 ? 0 : 20 },
            ]}
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
                    <View style={styles.monthBadge}>
                      <Text style={styles.monthText}>{item.month_eng}</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>Tap to explore</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
              <View style={styles.cardBorder} />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9e5ab',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F09300',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#DC6803',
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: '800',
    marginLeft: 4,
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
  monthBadge: {
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  monthText: {
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
  headerControls: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },

  controlButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },

  blurButton: {
    borderRadius: 25,
    padding: 4,
    backgroundColor: 'rgba(255,107,53,0.90)'
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

});

export default MonthSelectionScreen;
