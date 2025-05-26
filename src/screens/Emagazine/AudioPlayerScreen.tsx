import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import AudioPlayerComponent from '../../components/audioEbook';
import { useNavigation, useRoute } from '@react-navigation/native';

import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/src/navigation/types';
import { StackScreenProps } from '@react-navigation/stack';

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
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>{month} {year}</Text>
      <AudioPlayerComponent
        audioData={audioData}
        plan={plan}
        onUpgrade={() => navigation.navigate('MagazineDetails', { year, month })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { marginBottom: 16, fontWeight: 'bold', color: '#F09300' },
});