import { REACT_API_URL } from '@/app-config';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import AudioPlayerComponent from '../../components/audioEbook';
import { RootState } from '../../redux/store';

import { RootStackParamList } from '@/src/navigation/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { RouteProp } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Loader } from './EmagazineScreen';


type AudioPlayerScreenRouteProp = RouteProp<RootStackParamList, 'AudioPlayer'>;
type Props = StackScreenProps<RootStackParamList, 'AudioPlayer'>;

export default function AudioPlayerScreen() {
  const route = useRoute<AudioPlayerScreenRouteProp>();
  const navigation = useNavigation<Props['navigation']>();
  const { year, month, audioData } = route.params;
  const plan = useSelector((state: RootState) => state.user.plan);
  const userId = useSelector((state: RootState) => state.user.userId) || '3152';

  type MonthName = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
  const monthMapping: Record<MonthName, number> = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
  };

  // useQuery for fetching audio data
  const {
    data: fetchedAudio = [],
    isLoading,
    isError,
    error,
  } = useQuery(
    ['audioData', userId, year, month],
    async () => {
      const res = await axios.get(`${REACT_API_URL}/emagazine-page/audiofile`, {
        params: { uid: userId, year, month: monthMapping[month as MonthName] },
      });
      return res.data;
    },
    {
      enabled: !audioData || audioData.length === 0,
      initialData: audioData && audioData.length > 0 ? audioData : undefined,
      retry: 1,
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerControls}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text variant="headlineMedium" style={styles.title}>{month} {year}</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Main')}
        >
          <MaterialIcons name="home" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* {isLoading && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text>Loading audio...</Text>
        </View>
      )} */}
      {isLoading && <Loader />}
      {isError && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: 'red' }}>{error instanceof Error ? error.message : 'Unable to load audio. Please try again.'}</Text>
        </View>
      )}
      {!isLoading && !isError && (
        <AudioPlayerComponent
          audioData={fetchedAudio}
          plan={plan}
          onUpgrade={() => navigation.navigate('MagazineDetails', { year, month })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 2,
    textAlign: 'center',
  },
  iconButton: {
    backgroundColor: '#F09300',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});