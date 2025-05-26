import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, List } from 'react-native-paper';
import { Audio } from 'expo-av';
import { AudioData } from '../../navigation/types';

interface Props {
  audioData: AudioData[];
  plan: string;
  onUpgrade: () => void;
}

export default function AudioPlayerComponent({ audioData, plan, onUpgrade }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const soundRefs = useRef<(Audio.Sound | null)[]>([]);

  useEffect(() => {
    soundRefs.current = audioData.map(() => new Audio.Sound());
    return () => {
      soundRefs.current.forEach(sound => sound?.unloadAsync());
    };
  }, [audioData]);

  const handleAccordionPress = async (index: number) => {
    if (plan === 'basic' && index !== 0) {
      onUpgrade();
      return;
    }
    setExpanded(expanded === index ? null : index);
    if (expanded !== index) {
      const sound = soundRefs.current[index];
      if (sound) {
        await sound.unloadAsync();
        await sound.loadAsync({ uri: audioData[index].audio });
        await sound.playAsync();
        setCurrentAudioIndex(index);
      }
    }
  };

  const handlePlayAll = async () => {
    if (plan === 'basic') {
      onUpgrade();
      return;
    }
    setIsPlayingAll(true);
    setCurrentAudioIndex(0);
    setExpanded(0);
    const sound = soundRefs.current[0];
    if (sound) {
      await sound.unloadAsync();
      await sound.loadAsync({ uri: audioData[0].audio });
      await sound.playAsync();
    }
  };

  useEffect(() => {
    if (isPlayingAll && currentAudioIndex !== null && currentAudioIndex < audioData.length - 1) {
      soundRefs.current[currentAudioIndex]?.setOnPlaybackStatusUpdate(status => {
        if (
          status.isLoaded &&
          typeof status === 'object' &&
          'didJustFinish' in status &&
          (status as any).didJustFinish
        ) {
          const nextIndex = currentAudioIndex + 1;
          setCurrentAudioIndex(nextIndex);
          setExpanded(nextIndex);
          const nextSound = soundRefs.current[nextIndex];
          if (nextSound) {
            nextSound.loadAsync({ uri: audioData[nextIndex].audio }).then(() => nextSound.playAsync());
          }
        }
      });
    }
  }, [currentAudioIndex, isPlayingAll, audioData]);

  return (
    <View style={styles.container}>
      <Button mode="contained" style={styles.button} onPress={handlePlayAll} disabled={plan === 'basic'}>
        Play All
      </Button>
      {audioData.map((audio, index) => (
        <List.Accordion
          key={index}
          title={`Chapter ${index + 1}: ${audio.title}`}
          expanded={expanded === index}
          onPress={() => handleAccordionPress(index)}
        //   disabled={plan === 'basic' && index !== 0}
          style={styles.accordion}
        >
          <Card>
            <Card.Cover source={{ uri: audio.img || 'https://via.placeholder.com/100' }} style={styles.audioImage} />
            <Card.Content>
              <Text variant="titleMedium">{audio.title}</Text>
              <Text variant="bodySmall">{audio.transcript}</Text>
            </Card.Content>
          </Card>
        </List.Accordion>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  button: { marginVertical: 16, backgroundColor: '#F09300' },
  accordion: { backgroundColor: '#f8f8f8', marginVertical: 8, borderRadius: 8 },
  audioImage: { width: 100, height: 100, borderRadius: 8 },
});