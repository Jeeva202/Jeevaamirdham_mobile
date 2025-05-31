import { useNavigation, useRoute } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import AudioPlayerComponent from '../../components/audioEbook';
import { RootState } from '../../redux/store';

import { RootStackParamList } from '@/src/navigation/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { RouteProp } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

type AudioPlayerScreenRouteParams = {
  year: string;
  month: string;
  audioData: any;
};

type AudioPlayerScreenRouteProp = RouteProp<RootStackParamList, 'AudioPlayer'>;
type Props = StackScreenProps<RootStackParamList, 'AudioPlayer'>;

export default function AudioPlayerScreen() {
  const route = useRoute<AudioPlayerScreenRouteProp>();
  const navigation = useNavigation<Props['navigation']>();
  const { year, month, audioData } = route.params;
  const plan = useSelector((state: RootState) => state.user.plan);

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
      <ScrollView>
        <AudioPlayerComponent
          audioData={audioData}
          plan={plan}
          onUpgrade={() => navigation.navigate('MagazineDetails', { year, month })}
        />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F09300',
    letterSpacing: 2,
    textAlign: 'center',
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
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});