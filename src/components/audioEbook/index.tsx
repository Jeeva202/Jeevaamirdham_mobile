import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ActivityIndicator, Button, Dialog, IconButton, Text } from 'react-native-paper';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AudioData, RootStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

interface Props {
  audioData: AudioData[];
  plan: string;
  isExpired: boolean;
  onUpgrade: () => void;
}

interface AVPlaybackStatusSuccess {
  isLoaded: true;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis?: number;
  isBuffering: boolean;
  didJustFinish: boolean;
}

interface AVPlaybackStatusError {
  isLoaded: false;
  error?: string;
}

type AVPlaybackStatus = AVPlaybackStatusSuccess | AVPlaybackStatusError;
type NavigationProps = StackNavigationProp<RootStackParamList>;

const formatTime = (millis?: number) => {
  if (!millis) return '0:00';
  const seconds = Math.floor(millis / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const AudioPlayerComponent = memo(({ audioData, plan, isExpired, onUpgrade }: Props) => {
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatusSuccess | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);
  const [transcriptSheetIndex, setTranscriptSheetIndex] = useState<number | null>(null);
  const [isPlayAll, setIsPlayAll] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['60%'], []);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [upgradeDialogVisible, setUpgradeDialogVisible] = useState(false);

  const playButtonScale = useSharedValue(1);
  const waveAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const navigation = useNavigation<NavigationProps>();

  // Add shared values for wave animations
  const wave1Scale = useSharedValue(1);
  const wave2Scale = useSharedValue(1);
  const wave3Scale = useSharedValue(1);
  const wave1Opacity = useSharedValue(0.3);
  const wave2Opacity = useSharedValue(0.2);
  const wave3Opacity = useSharedValue(0.1);

  useEffect(() => {
    if (isPlaying) {
      wave1Scale.value = withRepeat(withSequence(withTiming(1.1, { duration: 700 }), withTiming(1, { duration: 700 })), -1, true);
      wave2Scale.value = withRepeat(withSequence(withTiming(1.15, { duration: 900 }), withTiming(1, { duration: 900 })), -1, true);
      wave3Scale.value = withRepeat(withSequence(withTiming(1.2, { duration: 1100 }), withTiming(1, { duration: 1100 })), -1, true);
      wave1Opacity.value = withRepeat(withSequence(withTiming(0.5, { duration: 700 }), withTiming(0.3, { duration: 700 })), -1, true);
      wave2Opacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 900 }), withTiming(0.2, { duration: 900 })), -1, true);
      wave3Opacity.value = withRepeat(withSequence(withTiming(0.2, { duration: 1100 }), withTiming(0.1, { duration: 1100 })), -1, true);
    } else {
      wave1Scale.value = withTiming(1, { duration: 400 });
      wave2Scale.value = withTiming(1, { duration: 400 });
      wave3Scale.value = withTiming(1, { duration: 400 });
      wave1Opacity.value = withTiming(0.3, { duration: 400 });
      wave2Opacity.value = withTiming(0.2, { duration: 400 });
      wave3Opacity.value = withTiming(0.1, { duration: 400 });
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch((e) => console.error('Error unloading sound:', e));
    };
  }, []);

  const playAudio = async (index: number) => {
    if (isProcessingAudio && currentAudioIndex === index) return;

    if ((isExpired || plan === 'basic') && index !== 0) {
      navigation.navigate('SubscriptionScreen');
      return;
    }

    setIsProcessingAudio(true);
    setPlaybackStatus(null);
    cardScale.value = withSpring(0.98);

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const sound = new Audio.Sound();
      soundRef.current = sound;

      await sound.loadAsync(
        { uri: audioData[index].audio },
        { shouldPlay: true, progressUpdateIntervalMillis: 100 },
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          if ((status as AVPlaybackStatusError).error) {
            console.error('Playback error:', (status as AVPlaybackStatusError).error);
            setIsPlaying(false);
            setIsProcessingAudio(false);
            if (currentAudioIndex === index) {
              alert(`Playback error for "${audioData[index].title}".`);
              setCurrentAudioIndex(null);
            }
          }
          return;
        }

        const loadedStatus = status as AVPlaybackStatusSuccess;
        setPlaybackStatus(loadedStatus);
        setIsPlaying(loadedStatus.isPlaying);

        if (loadedStatus.durationMillis && loadedStatus.durationMillis > 0) {
          const progress = loadedStatus.positionMillis / loadedStatus.durationMillis;
          progressAnimation.value = withTiming(progress, { duration: 100 });
        }

        if (loadedStatus.isPlaying && !loadedStatus.isBuffering) {
          setIsProcessingAudio(false);
          runOnJS(() => {
            cardScale.value = withSpring(1);
          })();
        }

        if (loadedStatus.didJustFinish) {
          setIsPlaying(false);
          setCurrentAudioIndex(null);
          setPlaybackStatus(null);
          setIsProcessingAudio(false);
          runOnJS(() => {
            progressAnimation.value = withTiming(0);
          })();
        }
      });

      setCurrentAudioIndex(index);
    } catch (error) {
      console.error('Error playing audio:', error);
      alert(`Could not load "${audioData[index].title}".`);
      setIsProcessingAudio(false);
      setCurrentAudioIndex(null);
      cardScale.value = withSpring(1);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current || currentAudioIndex === null || isProcessingAudio) return;

    playButtonScale.value = withSpring(0.9, { damping: 15 });
    setTimeout(() => {
      playButtonScale.value = withSpring(1, { damping: 15 });
    }, 150);

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        if ((isExpired || plan === 'basic') && currentAudioIndex !== 0) {
          setModalVisible(true);
          return;
        }
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error in togglePlayPause:', error);
    }
  };

  const onSeek = async (value: number) => {
    if (soundRef.current && playbackStatus?.isLoaded && playbackStatus.durationMillis) {
      setIsProcessingAudio(true);
      try {
        const seekPosition = value * playbackStatus.durationMillis;
        await soundRef.current.setPositionAsync(seekPosition);
        progressAnimation.value = withTiming(value, { duration: 100 });
      } catch (error) {
        console.error('Error seeking audio:', error);
      } finally {
        setTimeout(() => setIsProcessingAudio(false), 200);
      }
    }
  };

  const animatedPlayButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const animatedWaveStyle = useAnimatedStyle(() => {
    const scale = interpolate(waveAnimation.value, [0, 1], [1, 1.1], Extrapolate.CLAMP);
    const opacity = interpolate(waveAnimation.value, [0, 1], [0.3, 1], Extrapolate.CLAMP);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const hideUpgradeDialog = () => {
    setUpgradeDialogVisible(false);
  };

  const openTranscriptSheet = useCallback((index: number) => {
    console.log('Opening transcript sheet for index:', index);
    setTranscriptSheetIndex(index);
    bottomSheetModalRef.current?.present();
  }, []);

  const closeTranscriptSheet = useCallback(() => {
    console.log('Closing transcript sheet');
    bottomSheetModalRef.current?.dismiss();
    setTranscriptSheetIndex(null);
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    if (index === -1) {
      setTranscriptSheetIndex(null);
    }
  }, []);

  // Move these hooks above renderAudioCard so they're in scope
  const animatedWave1 = useAnimatedStyle(() => ({
    transform: [{ scale: wave1Scale.value }],
    opacity: wave1Opacity.value,
  }));
  const animatedWave2 = useAnimatedStyle(() => ({
    transform: [{ scale: wave2Scale.value }],
    opacity: wave2Opacity.value,
  }));
  const animatedWave3 = useAnimatedStyle(() => ({
    transform: [{ scale: wave3Scale.value }],
    opacity: wave3Opacity.value,
  }));

  const renderAudioCard = useCallback(
    (audio: AudioData, index: number) => {
      const isLocked = (isExpired || plan === 'basic') && index !== 0;
      const isCurrentlySelected = currentAudioIndex === index;
      const itemIsProcessing = isProcessingAudio && isCurrentlySelected;

      return (
        <Animated.View key={index} style={[animatedCardStyle, { marginBottom: 16 }]}> 
          <TouchableOpacity
            style={[
              styles.audioCard,
              isCurrentlySelected && styles.activeCard,
              isLocked && styles.lockedCard,
            ]}
            onPress={() => {
              if (itemIsProcessing) return;
              if (isLocked && !isCurrentlySelected) {
                navigation.navigate('SubscriptionScreen');
                return;
              }
              if (isCurrentlySelected) {
                togglePlayPause();
              } else {
                playAudio(index);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
         
              {/* Album art */}
              <View style={styles.albumArtContainer}>
                <Image
                  source={{ uri: audio.img || 'https://placehold.co/100' }}
                  style={[styles.albumArt, isLocked && styles.lockedImage]}
                />
              </View>
          
              {/* Track info */}
              <View style={styles.trackInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  {/* Index number is now in playIndexContainer */}
                   <Text style={[styles.indexNumberText,
                    isCurrentlySelected && styles.activeTrackTitle,
                   ]}>
                     {String(index + 1).padStart(2, '0')}
                   </Text>
                  <Text
                    style={[
                      styles.trackTitle,
                      isCurrentlySelected && styles.activeTrackTitle,
                      isLocked && styles.lockedText,
                    ]}
                    numberOfLines={1}
                  >
                    {audio.title}
                  </Text>
                </View>
                {isCurrentlySelected && playbackStatus?.isLoaded && (
                  <View style={styles.progressContainer}>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>
                        {formatTime(playbackStatus.positionMillis)}
                      </Text>
                      <Text style={styles.timeText}>
                        {formatTime(playbackStatus.durationMillis)}
                      </Text>
                    </View>
                    <View style={styles.sliderContainer}>
                      <Slider
                        style={styles.progressSlider}
                        minimumValue={0}
                        maximumValue={1}
                        disabled={itemIsProcessing || !playbackStatus.durationMillis}
                        value={
                          playbackStatus.durationMillis && playbackStatus.durationMillis > 0
                            ? playbackStatus.positionMillis / playbackStatus.durationMillis
                            : 0
                        }
                        minimumTrackTintColor="#F09300"
                        maximumTrackTintColor="#E0E0E0"
                        thumbTintColor="#F09300"
                        onSlidingComplete={onSeek}
                      />
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => (isLocked ? () => {} : openTranscriptSheet(index))}
                  activeOpacity={0.8}
                  style={styles.transcriptTouchable}
                >
                  {audio.transcript && audio.transcript.length > 100 && (
                    <Text style={styles.readMoreText}>Tap to read more...</Text>
                  )}
                </TouchableOpacity>
              </View>
                       {/* Play button + index number combined at the start */}
              <View style={styles.playIndexContainer}>
                <Animated.View style={animatedPlayButtonStyle}>
                  <TouchableOpacity
                    style={[
                      styles.playIndexButton,
                      isCurrentlySelected && styles.activePlayButton,
                    ]}
                    onPress={() => {
                      if (itemIsProcessing) return;
                      if (isLocked && !isCurrentlySelected) {
                        setModalVisible(true);
                        return;
                      }
                      if (isCurrentlySelected) {
                        togglePlayPause();
                      } else {
                        playAudio(index);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isLocked
                          ? ['#0a0a0a', '#BDBDBD']
                          : ['#F09300', 'rgba(255, 107, 53, 0.9)']
                      }
                      style={styles.playIndexGradient}
                    >
                      {itemIsProcessing ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          {/* <Text
                            style={[
                              styles.indexNumberText,
                              isCurrentlySelected && styles.activeTrackTitle,
                            ]}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </Text> */}
                          <View style={styles.iconCenterWrapper}>
                            <IconButton
                              icon={isLocked ? 'lock' : isCurrentlySelected && isPlaying ? 'pause' : 'play'}
                              iconColor="#FFFFFF"
                              size={32}
                              style={styles.playIconButton}
                            />
                          </View>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
                {isCurrentlySelected && isPlaying && (
                  <Animated.View style={[styles.waveContainer, animatedWaveStyle]}>
                    <Animated.View style={[styles.wave, styles.wave1, animatedWave1]} />
                    <Animated.View style={[styles.wave, styles.wave2, animatedWave2]} />
                    <Animated.View style={[styles.wave, styles.wave3, animatedWave3]} />
                  </Animated.View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [currentAudioIndex, isPlaying, isProcessingAudio, playbackStatus, plan, audioData],
  );

  const renderBackdrop = useCallback((props: Parameters<typeof BottomSheetBackdrop>[0]) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.5}
      pressBehavior="close"
    />
  ), []);

  const playAll = useCallback(() => {
    if (audioData.length === 0) return;
    setIsPlayAll(true);
    playAudio(0);
  }, [audioData]);

  const pauseAll = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
    setIsPlayAll(false);
  }, []);

  useEffect(() => {
    if (!isPlayAll) return;
    if (currentAudioIndex === null) return;
    if (
      playbackStatus?.didJustFinish &&
      currentAudioIndex < audioData.length - 1
    ) {
      playAudio(currentAudioIndex + 1);
    } else if (playbackStatus?.didJustFinish && currentAudioIndex === audioData.length - 1) {
      setIsPlayAll(false);
      setCurrentAudioIndex(null);
    }
  }, [isPlayAll, playbackStatus?.didJustFinish, currentAudioIndex, audioData]);

  return (
    <BottomSheetModalProvider>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>E-Magazine Chapters</Text>
          <Text style={styles.headerSubtitle}>{audioData.length} Chapters available</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button
              mode="contained"
              onPress={isPlayAll && isPlaying ? pauseAll : playAll}
              style={{ backgroundColor: '#F09300' }}
              disabled={audioData.length === 0}
            >
              {isPlayAll && isPlaying ? 'Pause' : isPlayAll ? 'Playing All...' : 'Play All'}
            </Button>
          </View>
        </View>
        <View style={styles.audioList}>
          {audioData.map((audio, index) => renderAudioCard(audio, index))}
        </View>
      </ScrollView>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: '#fff' }}
        handleIndicatorStyle={{ backgroundColor: '#E0E0E0' }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetTitleContainer}>
            <Text style={styles.sheetTitle}>
              {typeof transcriptSheetIndex === 'number' && audioData[transcriptSheetIndex]
                ? audioData[transcriptSheetIndex].title
                : ''}
            </Text>
            <TouchableOpacity onPress={closeTranscriptSheet}>
              <IconButton icon={'close'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            <Text style={styles.sheetTranscript}>
              {typeof transcriptSheetIndex === 'number' && audioData[transcriptSheetIndex]?.transcript
                ? audioData[transcriptSheetIndex].transcript.replace(/\n+/g, '\n')
                : 'No transcript available'}
            </Text>
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>

      <Dialog visible={upgradeDialogVisible} onDismiss={hideUpgradeDialog} style={styles.dialogContainer}>
        <Dialog.Title style={styles.dialogTitle}>Upgrade Required</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.dialogText}>
            This content is only available for PRO members. Upgrade now to access all audio chapters and features.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideUpgradeDialog} textColor="#666">
            Cancel
          </Button>
          <Button
            onPress={() => {
              hideUpgradeDialog();
              onUpgrade();
            }}
            mode="contained"
            style={styles.upgradeButton}
            buttonColor="#007AFF"
          >
            Upgrade
          </Button>
        </Dialog.Actions>
      </Dialog>
    </BottomSheetModalProvider>
  );
});

export default AudioPlayerComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  audioList: {
    // no flex: 1 here
  },
  audioCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#F09300',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F09300',
  },
  activeCard: {
    elevation: 8,
    shadowColor: '#F09300',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderColor: '#F09300',
    borderWidth: 2,
  },
  lockedCard: {
    opacity: 0.8,
    backgroundColor: '#F5F5F5',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 120,
  },
  playIndexContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
    position: 'relative',
  },
  playIndexButton: {
    borderRadius: 50,
    overflow: 'hidden',
    width: 64,
    height: 64,
     marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 0,
    position: 'relative',
  },
  activePlayButton: {
    borderWidth: 2,
    borderColor: '#F09300',
  },
  playIndexGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingHorizontal: 0,
    position: 'relative',
  },
  iconCenterWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  indexNumberText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 0,
    marginLeft: 0,
    zIndex: 1,
    textAlign: 'center',
  },
  playIconButton: {
    margin: 0,
    padding: 0,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
    left: 0,
    top: 0,
  },
  albumArtContainer: {
    position: 'relative',
    marginRight: 16,
  },
  albumArt: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  lockedImage: {
    opacity: 0.6,
  },
  loadingContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  waveContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -35,
    bottom: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.9)',
  },
  wave1: {
    width: 65,
    height: 65,
    opacity: 0.3,
  },
  wave2: {
    width: 75,
    height: 75,
    opacity: 0.2,
  },
  wave3: {
    width: 85,
    height: 85,
    opacity: 0.1,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 24,
    marginLeft: 4,
  },
  activeTrackTitle: {
    color: '#f09300',
  },
  trackTranscript: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: '#F09300',
    fontStyle: 'italic',
    fontWeight: '700',
  },
  lockedText: {
    opacity: 0.6,
  },
  progressContainer: {
    marginTop: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  sliderContainer: {
    height: 30,
  },
  progressSlider: {
    width: '100%',
    height: 30,
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  dialogTitle: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '600',
  },
  dialogText: {
    color: '#666666',
    fontSize: 16,
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: '#F09300',
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F09300',
    marginBottom: 10,
    textAlign: 'center',
  },
  sheetTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sheetTranscript: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    paddingBottom: 16,
  },
  transcriptTouchable: {
    paddingVertical: 4,
  },
});