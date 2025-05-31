// import { Audio } from 'expo-av';
// import { useEffect, useRef, useState } from 'react';
// import { StyleSheet, View } from 'react-native';
// import { Button, Card, List, Text } from 'react-native-paper';
// import { AudioData } from '../../navigation/types';

// interface Props {
//   audioData: AudioData[];
//   plan: string;
//   onUpgrade: () => void;
// }

// export default function AudioPlayerComponent({ audioData, plan, onUpgrade }: Props) {
//   const [expanded, setExpanded] = useState<number | null>(null);
//   const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);
//   const [isPlayingAll, setIsPlayingAll] = useState(false);
//   const soundRefs = useRef<(Audio.Sound | null)[]>([]);

//   useEffect(() => {
//     soundRefs.current = audioData.map(() => new Audio.Sound());
//     return () => {
//       soundRefs.current.forEach(sound => sound?.unloadAsync());
//     };
//   }, [audioData]);

//   const handleAccordionPress = async (index: number) => {
//     // if (plan === 'basic' && index !== 0) {
//     //   onUpgrade();
//     //   return;
//     // }
//     setExpanded(expanded === index ? null : index);
//     if (expanded !== index) {
//       const sound = soundRefs.current[index];
//       if (sound) {
//         await sound.unloadAsync();
//         await sound.loadAsync({ uri: audioData[index].audio });
//         await sound.playAsync();
//         setCurrentAudioIndex(index);
//       }
//     }
//   };

//   const handlePlayAll = async () => {
//     if (plan === 'basic') {
//       onUpgrade();
//       return;
//     }
//     setIsPlayingAll(true);
//     setCurrentAudioIndex(0);
//     setExpanded(0);
//     const sound = soundRefs.current[0];
//     if (sound) {
//       await sound.unloadAsync();
//       await sound.loadAsync({ uri: audioData[0].audio });
//       await sound.playAsync();
//     }
//   };

//   useEffect(() => {
//     if (isPlayingAll && currentAudioIndex !== null && currentAudioIndex < audioData.length - 1) {
//       soundRefs.current[currentAudioIndex]?.setOnPlaybackStatusUpdate(status => {
//         if (
//           status.isLoaded &&
//           typeof status === 'object' &&
//           'didJustFinish' in status &&
//           (status as any).didJustFinish
//         ) {
//           const nextIndex = currentAudioIndex + 1;
//           setCurrentAudioIndex(nextIndex);
//           setExpanded(nextIndex);
//           const nextSound = soundRefs.current[nextIndex];
//           if (nextSound) {
//             nextSound.loadAsync({ uri: audioData[nextIndex].audio }).then(() => nextSound.playAsync());
//           }
//         }
//       });
//     }
//   }, [currentAudioIndex, isPlayingAll, audioData]);

//   return (
//     <View style={styles.container}>
//       <Button mode="contained" style={styles.button} onPress={handlePlayAll} disabled={plan === 'basic'}>
//         Play All
//       </Button>
//       {audioData.map((audio, index) => (
//         <List.Accordion
//           key={index}
//           title={`Chapter ${index + 1}: ${audio.title}`}
//           expanded={expanded === index}
//           onPress={() => handleAccordionPress(index)}
//         //   disabled={plan === 'basic' && index !== 0}
//           style={styles.accordion}
//         >
//           <Card>
//             <Card.Cover source={{ uri: audio.img || 'https://via.placeholder.com/100' }} style={styles.audioImage} />
//             <Card.Content>
//               <Text variant="titleMedium">{audio.title}</Text>
//               <Text variant="bodySmall">{audio.transcript}</Text>
//             </Card.Content>
//           </Card>
//         </List.Accordion>
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16 },
//   button: { marginVertical: 16, backgroundColor: '#F09300' },
//   accordion: { backgroundColor: '#f8f8f8', marginVertical: 8, borderRadius: 8 },
//   audioImage: { width: 100, height: 100, borderRadius: 8 },
// });


// import { Audio } from 'expo-av';
// import { useEffect, useRef, useState } from 'react';
// import { Image, StyleSheet, View } from 'react-native';
// import { ActivityIndicator, Card, IconButton, Text } from 'react-native-paper';
// // import Modal from 'react-native-modal';
// import Slider from '@react-native-community/slider';
// import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
// import { AudioData } from '../../navigation/types';

// interface Props {
//   audioData: AudioData[];
//   plan: string;
//   onUpgrade: () => void;
// }

// interface AVPlaybackStatusSuccess {
//   isLoaded: true;
//   isPlaying: boolean;
//   positionMillis: number;
//   durationMillis?: number;
//   isBuffering: boolean;
//   didJustFinish: boolean;
// }

// interface AVPlaybackStatusError {
//   isLoaded: false;
//   error?: string;
// }

// type AVPlaybackStatus = AVPlaybackStatusSuccess | AVPlaybackStatusError;

// // Toggle this to true to disable plan restrictions for testing
// const disablePlanRestrictions = true;

// const formatTime = (millis?: number) => {
//   if (!millis) return '0:00';
//   const seconds = Math.floor(millis / 1000);
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = seconds % 60;
//   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
// };

// export default function AudioPlayerComponent({ audioData, plan, onUpgrade }: Props) {
//   const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatusSuccess | null>(null);
//   const [isProcessingAudio, setIsProcessingAudio] = useState(false);
//   const soundRef = useRef<Audio.Sound | null>(null);
//   const buttonScale = useSharedValue(1);

//   useEffect(() => {
//     return () => {
//       soundRef.current?.unloadAsync().catch((e) => console.error('Error unloading sound:', e));
//     };
//   }, []);

//   const playAudio = async (index: number) => {
//     if (isProcessingAudio && currentAudioIndex === index) return;

//     if (!disablePlanRestrictions && plan === 'basic' && index !== 0) {
//       setModalVisible(true);
//       return;
//     }

//     setIsProcessingAudio(true);
//     setPlaybackStatus(null);

//     try {
//       if (soundRef.current) {
//         await soundRef.current.stopAsync();
//         await soundRef.current.unloadAsync();
//         soundRef.current = null;
//       }

//       const sound = new Audio.Sound();
//       soundRef.current = sound;

//       await sound.loadAsync(
//         { uri: audioData[index].audio },
//         { shouldPlay: true, progressUpdateIntervalMillis: 500 },
//       );

//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (!status.isLoaded) {
//           if ((status as AVPlaybackStatusError).error) {
//             console.error('Playback error:', (status as AVPlaybackStatusError).error);
//             setIsPlaying(false);
//             setIsProcessingAudio(false);
//             if (currentAudioIndex === index) {
//               alert(`Playback error for "${audioData[index].title}".`);
//               setCurrentAudioIndex(null);
//             }
//           }
//           return;
//         }

//         setPlaybackStatus(status);
//         setIsPlaying(status.isPlaying);

//         if (status.isPlaying || !status.isBuffering || status.didJustFinish) {
//           if (currentAudioIndex === index) {
//             setIsProcessingAudio(false);
//           }
//         }

//         if (status.didJustFinish) {
//           setIsPlaying(false);
//           setCurrentAudioIndex(null);
//           setPlaybackStatus(null);
//         }
//       });

//       setCurrentAudioIndex(index);
//     } catch (error) {
//       console.error('Error playing audio:', error);
//       alert(`Could not load "${audioData[index].title}".`);
//       setIsProcessingAudio(false);
//       setCurrentAudioIndex(null);
//     }
//   };

//   const togglePlayPause = async () => {
//     if (!soundRef.current || currentAudioIndex === null || isProcessingAudio) return;

//     try {
//       if (isPlaying) {
//         await soundRef.current.pauseAsync();
//       } else {
//         if (!disablePlanRestrictions && plan === 'basic' && currentAudioIndex !== 0) {
//           setModalVisible(true);
//           setIsProcessingAudio(false);
//           return;
//         }
//         await soundRef.current.playAsync();
//       }
//     } catch (error) {
//       console.error('Error in togglePlayPause:', error);
//       setIsProcessingAudio(false);
//     }
//   };

//   const onSeek = async (value: number) => {
//     if (soundRef.current && playbackStatus?.isLoaded && playbackStatus.durationMillis) {
//       setIsProcessingAudio(true);
//       try {
//         const seekPosition = value * playbackStatus.durationMillis;
//         await soundRef.current.setPositionAsync(seekPosition);
//       } catch (error) {
//         console.error('Error seeking audio:', error);
//       } finally {
//         setTimeout(() => setIsProcessingAudio(false), 200);
//       }
//     }
//   };

//   const handleButtonPressIn = () => {
//     buttonScale.value = withSpring(0.95, { damping: 20, stiffness: 200 });
//   };

//   const handleButtonPressOut = () => {
//     buttonScale.value = withSpring(1, { damping: 20, stiffness: 200 });
//   };

//   const animatedButtonStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: buttonScale.value }],
//   }));

//   return (
//     <View style={styles.container}>
//       {/* <Modal
//         isVisible={isModalVisible}
//         onBackdropPress={() => setModalVisible(false)}
//         style={styles.modal}
//       >
//         <View style={styles.modalContent}>
//           <Text style={styles.modalTitle}>Upgrade to Premium</Text>
//           <Text style={styles.modalText}>
//             Unlock all chapters with a Premium subscription!
//           </Text>
//           <Button
//             mode="contained"
//             style={styles.modalButton}
//             onPress={() => {
//               setModalVisible(false);
//               onUpgrade();
//             }}
//           >
//             Upgrade Now
//           </Button>
//           <Button
//             mode="outlined"
//             style={styles.modalCancelButton}
//             onPress={() => setModalVisible(false)}
//           >
//             Cancel
//           </Button>
//         </View>
//       </Modal> */}

//       {audioData.map((audio, index) => {
//         const isLocked = !disablePlanRestrictions && plan === 'basic' && index !== 0;
//         const isCurrentlySelected = currentAudioIndex === index;
//         const itemIsProcessing = isProcessingAudio && isCurrentlySelected;

//         return (
//           <Card
//             key={index}
//             style={[
//               styles.card,
//               isCurrentlySelected && styles.currentCard,
//               isLocked && styles.lockedCard,
//               itemIsProcessing && styles.processingCard,
//             ]}
//             onPress={() => {
//               if (itemIsProcessing) return;
//               if (isLocked && !isCurrentlySelected) {
//                 setModalVisible(true);
//                 return;
//               }
//               if (isCurrentlySelected) {
//                 togglePlayPause();
//               } else {
//                 playAudio(index);
//               }
//             }}
//           >
//             <Card.Content style={styles.cardContent}>
//               <Image
//                 source={{ uri: audio.img || 'https://via.placeholder.com/100' }}
//                 style={styles.audioImage}
//               />
//               <View style={styles.textContainer}>
//                 <Text style={styles.cardTitle} numberOfLines={1}>
//                   {audio.title}
//                 </Text>
//                 <Text
//                   style={styles.cardTranscript}
//                   numberOfLines={3}
//                   ellipsizeMode="tail"
//                 >
//                   {audio.transcript || 'No transcript available'}
//                 </Text>
//                 {isCurrentlySelected && playbackStatus?.isLoaded && (
//                   <View style={styles.playbackControlsContainer}>
//                     <Text style={styles.timeText}>
//                       {formatTime(playbackStatus.positionMillis)}
//                     </Text>
//                     <Slider
//                       style={styles.slider}
//                       minimumValue={0}
//                       maximumValue={1}
//                       disabled={itemIsProcessing || !playbackStatus.durationMillis}
//                       value={
//                         playbackStatus.durationMillis && playbackStatus.durationMillis > 0
//                           ? playbackStatus.positionMillis / playbackStatus.durationMillis
//                           : 0
//                       }
//                       minimumTrackTintColor="#F09300"
//                       maximumTrackTintColor="#6c6c6c"
//                       thumbTintColor="#F09300"
//                       onSlidingComplete={onSeek}
//                     />
//                     <Text style={styles.timeText}>
//                       {formatTime(playbackStatus.durationMillis)}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//               <View style={styles.iconButtonContainer}>
//                 {itemIsProcessing ? (
//                   <ActivityIndicator size="small" color="#F09300" />
//                 ) : (
//                   <Animated.View style={animatedButtonStyle}>
//                     <IconButton
//                       icon={isLocked ? 'lock' : (isCurrentlySelected && isPlaying ? 'pause-circle' : 'play-circle')}
//                       disabled={isLocked && !isCurrentlySelected}
//                       iconColor={isLocked && !isCurrentlySelected ? '#999' : '#F09300'}
//                       size={36}
//                       onPress={() => {
//                         if (itemIsProcessing) return;
//                         if (isLocked && !isCurrentlySelected) {
//                           setModalVisible(true);
//                           return;
//                         }
//                         if (isCurrentlySelected) {
//                           togglePlayPause();
//                         } else {
//                           playAudio(index);
//                         }
//                       }}
//                       onPressIn={handleButtonPressIn}
//                       onPressOut={handleButtonPressOut}
//                     />
//                   </Animated.View>
//                 )}
//               </View>
//             </Card.Content>
//           </Card>
//         );
//       })}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: '#1E1E2D',
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     marginVertical: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   currentCard: {
//     borderWidth: 2,
//     borderColor: '#F09300',
//   },
//   lockedCard: {
//     opacity: 0.7,
//   },
//   processingCard: {
//     opacity: 0.9,
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//   },
//   audioImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: 12,
//   },
//   textContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E1E2D',
//     marginBottom: 4,
//   },
//   cardTranscript: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//     marginBottom: 8,
//   },
//   iconButtonContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   playbackControlsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   slider: {
//     flex: 1,
//     height: 40,
//     marginHorizontal: 8,
//   },
//   timeText: {
//     fontSize: 12,
//     color: '#1E1E2D',
//     width: 40,
//     textAlign: 'center',
//   },
//   modal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     padding: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E1E2D',
//     marginBottom: 10,
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   modalButton: {
//     backgroundColor: '#F09300',
//     width: '100%',
//     marginBottom: 10,
//     borderRadius: 8,
//   },
//   modalCancelButton: {
//     borderColor: '#F09300',
//     width: '100%',
//     borderRadius: 8,
//   },
// });

// =====================================

// import Slider from '@react-native-community/slider';
// import { Audio } from 'expo-av';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useEffect, useRef, useState } from 'react';
// import {
//   Dimensions,
//   Image,
//   Modal,
//   Pressable,
//   StyleSheet,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { ActivityIndicator, Button, Dialog, IconButton, Portal, Text } from 'react-native-paper';
// import Animated, {
//   Extrapolate,
//   interpolate,
//   runOnJS,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   withTiming
// } from 'react-native-reanimated';
// import { AudioData } from '../../navigation/types';

// const { width, height } = Dimensions.get('window');

// interface Props {
//   audioData: AudioData[];
//   plan: string;
//   onUpgrade: () => void;
// }

// interface AVPlaybackStatusSuccess {
//   isLoaded: true;
//   isPlaying: boolean;
//   positionMillis: number;
//   durationMillis?: number;
//   isBuffering: boolean;
//   didJustFinish: boolean;
// }

// interface AVPlaybackStatusError {
//   isLoaded: false;
//   error?: string;
// }

// type AVPlaybackStatus = AVPlaybackStatusSuccess | AVPlaybackStatusError;

// // Toggle this to true to disable plan restrictions for testing
// const disablePlanRestrictions = false;

// const formatTime = (millis?: number) => {
//   if (!millis) return '0:00';
//   const seconds = Math.floor(millis / 1000);
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = seconds % 60;
//   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
// };

// export default function AudioPlayerComponent({ audioData, plan, onUpgrade }: Props) {
//   const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatusSuccess | null>(null);
//   const [isProcessingAudio, setIsProcessingAudio] = useState(false);
//   const [expandedTranscript, setExpandedTranscript] = useState<number | null>(null);
//   const soundRef = useRef<Audio.Sound | null>(null);
//   const [dialogVisible, setDialogVisible] = useState(false);
//   const [upgradeDialogVisible, setUpgradeDialogVisible] = useState(false);
//   // Animation values
//   const playButtonScale = useSharedValue(1);
//   const waveAnimation = useSharedValue(0);
//   const progressAnimation = useSharedValue(0);
//   const cardScale = useSharedValue(1);

//   useEffect(() => {
//     // Start wave animation when playing
//     if (isPlaying) {
//       waveAnimation.value = withTiming(1, { duration: 1000 });
//     } else {
//       waveAnimation.value = withTiming(0, { duration: 500 });
//     }
//   }, [isPlaying]);

//   useEffect(() => {
//     return () => {
//       soundRef.current?.unloadAsync().catch((e) => console.error('Error unloading sound:', e));
//     };
//   }, []);

//   const playAudio = async (index: number) => {
//     if (isProcessingAudio && currentAudioIndex === index) return;

//     if (!disablePlanRestrictions && plan === 'basic' && index !== 0) {
//       setUpgradeDialogVisible(true); // Changed from setModalVisible
//       return;
//     }

//     setIsProcessingAudio(true);
//     setPlaybackStatus(null);
//     cardScale.value = withSpring(0.98);

//     try {
//       if (soundRef.current) {
//         await soundRef.current.stopAsync();
//         await soundRef.current.unloadAsync();
//         soundRef.current = null;
//       }

//       const sound = new Audio.Sound();
//       soundRef.current = sound;

//       await sound.loadAsync(
//         { uri: audioData[index].audio },
//         { shouldPlay: true, progressUpdateIntervalMillis: 100 },
//       );

//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (!status.isLoaded) {
//           if ((status as AVPlaybackStatusError).error) {
//             console.error('Playback error:', (status as AVPlaybackStatusError).error);
//             setIsPlaying(false);
//             setIsProcessingAudio(false);
//             if (currentAudioIndex === index) {
//               alert(`Playback error for "${audioData[index].title}".`);
//               setCurrentAudioIndex(null);
//             }
//           }
//           return;
//         }

//         const loadedStatus = status as AVPlaybackStatusSuccess;
//         setPlaybackStatus(loadedStatus);
//         setIsPlaying(loadedStatus.isPlaying);

//         // Update progress animation
//         if (loadedStatus.durationMillis && loadedStatus.durationMillis > 0) {
//           const progress = loadedStatus.positionMillis / loadedStatus.durationMillis;
//           progressAnimation.value = withTiming(progress, { duration: 100 });
//         }

//         // Stop processing indicator when audio is playing and not buffering
//         if (loadedStatus.isPlaying && !loadedStatus.isBuffering) {
//           setIsProcessingAudio(false);
//           runOnJS(() => {
//             cardScale.value = withSpring(1);
//           })();
//         }

//         if (loadedStatus.didJustFinish) {
//           setIsPlaying(false);
//           setCurrentAudioIndex(null);
//           setPlaybackStatus(null);
//           setIsProcessingAudio(false);
//           runOnJS(() => {
//             progressAnimation.value = withTiming(0);
//           })();
//         }
//       });

//       setCurrentAudioIndex(index);
//     } catch (error) {
//       console.error('Error playing audio:', error);
//       alert(`Could not load "${audioData[index].title}".`);
//       setIsProcessingAudio(false);
//       setCurrentAudioIndex(null);
//       cardScale.value = withSpring(1);
//     }
//   };

//   const togglePlayPause = async () => {
//     if (!soundRef.current || currentAudioIndex === null || isProcessingAudio) return;

//     playButtonScale.value = withSpring(0.9, { damping: 15 });
//     setTimeout(() => {
//       playButtonScale.value = withSpring(1, { damping: 15 });
//     }, 150);

//     try {
//       if (isPlaying) {
//         await soundRef.current.pauseAsync();
//       } else {
//         if (!disablePlanRestrictions && plan === 'basic' && currentAudioIndex !== 0) {
//           setModalVisible(true);
//           return;
//         }
//         await soundRef.current.playAsync();
//       }
//     } catch (error) {
//       console.error('Error in togglePlayPause:', error);
//     }
//   };

//   const onSeek = async (value: number) => {
//     if (soundRef.current && playbackStatus?.isLoaded && playbackStatus.durationMillis) {
//       setIsProcessingAudio(true);
//       try {
//         const seekPosition = value * playbackStatus.durationMillis;
//         await soundRef.current.setPositionAsync(seekPosition);
//         progressAnimation.value = withTiming(value, { duration: 100 });
//       } catch (error) {
//         console.error('Error seeking audio:', error);
//       } finally {
//         setTimeout(() => setIsProcessingAudio(false), 200);
//       }
//     }
//   };

//   const animatedPlayButtonStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: playButtonScale.value }],
//   }));

//   const animatedWaveStyle = useAnimatedStyle(() => {
//     const scale = interpolate(waveAnimation.value, [0, 1], [1, 1.1], Extrapolate.CLAMP);
//     const opacity = interpolate(waveAnimation.value, [0, 1], [0.3, 1], Extrapolate.CLAMP);

//     return {
//       transform: [{ scale }],
//       opacity,
//     };
//   });

//   const animatedCardStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: cardScale.value }],
//   }));

//   const showTranscriptDialog = (index: number) => {
//     setExpandedTranscript(index);
//     setDialogVisible(true);
//   };

//   const hideTranscriptDialog = () => {
//     setDialogVisible(false);
//     setExpandedTranscript(null);
//   };

//   const hideUpgradeDialog = () => {
//     setUpgradeDialogVisible(false);
//   };

//   // (Removed misplaced transcriptSection code. The transcript rendering is already handled inside renderAudioCard.)

//   const renderAudioCard = (audio: AudioData, index: number) => {
//     const isLocked = !disablePlanRestrictions && plan === 'basic' && index !== 0;
//     const isCurrentlySelected = currentAudioIndex === index;
//     const itemIsProcessing = isProcessingAudio && isCurrentlySelected;

//     return (
//       <Animated.View
//         key={index}
//         style={[
//           animatedCardStyle,
//           { marginBottom: 20 }
//         ]}
//       >
//         <TouchableOpacity
//           style={[
//             styles.audioCard,
//             isCurrentlySelected && styles.activeCard,
//             isLocked && styles.lockedCard,
//           ]}
//           onPress={() => {
//             if (itemIsProcessing) return;
//             if (isLocked && !isCurrentlySelected) {
//               setUpgradeDialogVisible(true); // Changed from setModalVisible
//               return;
//             }
//             if (isCurrentlySelected) {
//               togglePlayPause();
//             } else {
//               playAudio(index);
//             }
//           }}
//           activeOpacity={0.9}
//         >
//           {/* <LinearGradient
//             colors={isCurrentlySelected 
//               ? ['rgba(255,107,53,0.1)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']
//               : ['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']
//             }
//             style={styles.cardGradient}
//           > */}
//           <Portal>
//             <Dialog
//               visible={dialogVisible}
//               onDismiss={hideTranscriptDialog}
//               style={styles.dialogContainer}
//             >
//               <Dialog.Title style={styles.dialogTitle}>
//                 {expandedTranscript !== null ? audioData[expandedTranscript].title : ''}
//               </Dialog.Title>
//               <Dialog.Content>
//                 <Text style={styles.dialogText}>
//                   {expandedTranscript !== null
//                     ? audioData[expandedTranscript].transcript || 'No transcript available'
//                     : ''
//                   }
//                 </Text>
//               </Dialog.Content>
//               <Dialog.Actions>
//                 <Button onPress={hideTranscriptDialog}>Close</Button>
//               </Dialog.Actions>
//             </Dialog>

//             {/* Upgrade Dialog */}
//             <Dialog
//               visible={upgradeDialogVisible}
//               onDismiss={hideUpgradeDialog}
//               style={styles.dialogContainer}
//             >
//               <Dialog.Title style={styles.dialogTitle}>Upgrade Required</Dialog.Title>
//               <Dialog.Content>
//                 <Text style={styles.dialogText}>
//                   This content is only available for PRO members. Upgrade now to access all audio chapters and features.
//                 </Text>
//               </Dialog.Content>
//               <Dialog.Actions>
//                 <Button onPress={hideUpgradeDialog}>Cancel</Button>
//                 <Button
//                   onPress={() => {
//                     hideUpgradeDialog();
//                     onUpgrade();
//                   }}
//                   mode="contained"
//                   style={styles.upgradeButton}
//                 >
//                   Upgrade
//                 </Button>
//               </Dialog.Actions>
//             </Dialog>
//           </Portal>
//           <View style={styles.cardContent}>
//             {/* Album Art with Play Button Overlay */}
//             <View style={styles.albumArtContainer}>
//               <Image
//                 source={{ uri: audio.img || 'https://via.placeholder.com/100' }}
//                 style={[styles.albumArt, isLocked && styles.lockedImage]}
//               />

//               {/* Play Button Overlay */}
//               <View style={styles.playButtonOverlay}>
//                 {itemIsProcessing ? (
//                   <View style={styles.loadingContainer}>
//                     <ActivityIndicator size="small" color="#FFFFFF" />
//                   </View>
//                 ) : (
//                   <Animated.View style={animatedPlayButtonStyle}>
//                     <TouchableOpacity
//                       style={[
//                         styles.playButtonContainer,
//                         isCurrentlySelected && styles.activePlayButton
//                       ]}
//                       onPress={() => {
//                         if (itemIsProcessing) return;
//                         if (isLocked && !isCurrentlySelected) {
//                           setModalVisible(true);
//                           return;
//                         }
//                         if (isCurrentlySelected) {
//                           togglePlayPause();
//                         } else {
//                           playAudio(index);
//                         }
//                       }}
//                       activeOpacity={0.8}
//                     >
//                       <LinearGradient
//                         colors={isLocked
//                           ? ['#666666', '#444444']
//                           : ['#FF6B35', '#F7931E']
//                         }
//                         style={styles.playButtonGradient}
//                       >
//                         <IconButton
//                           icon={isLocked ? 'lock' : (isCurrentlySelected && isPlaying ? 'pause' : 'play')}
//                           iconColor="#FFFFFF"
//                           size={24}
//                         />
//                       </LinearGradient>
//                     </TouchableOpacity>
//                   </Animated.View>
//                 )}
//               </View>

//               {/* Wave Animation for Active Track */}
//               {isCurrentlySelected && isPlaying && (
//                 <Animated.View style={[styles.waveContainer, animatedWaveStyle]}>
//                   <View style={[styles.wave, styles.wave1]} />
//                   <View style={[styles.wave, styles.wave2]} />
//                   <View style={[styles.wave, styles.wave3]} />
//                 </Animated.View>
//               )}
//             </View>

//             {/* Track Info */}
//             <View style={styles.trackInfo}>
//               <Text style={[
//                 styles.trackTitle,
//                 isCurrentlySelected && styles.activeTrackTitle,
//                 isLocked && styles.lockedText
//               ]} numberOfLines={2}>
//                 {audio.title}
//               </Text>

//               <TouchableOpacity
//                 onPress={() => setExpandedTranscript(index)}
//                 activeOpacity={0.8}
//               >
//                 <Text style={[
//                   styles.trackTranscript,
//                   isLocked && styles.lockedText
//                 ]} numberOfLines={3}>
//                   {audio.transcript || 'No transcript available'}
//                 </Text>
//                 {audio.transcript && audio.transcript.length > 100 && (
//                   <Text style={styles.readMoreText}>Tap to read more...</Text>
//                 )}
//               </TouchableOpacity>

//               {/* Progress Bar for Active Track */}
//               {isCurrentlySelected && playbackStatus?.isLoaded && (
//                 <View style={styles.progressContainer}>
//                   <View style={styles.timeContainer}>
//                     <Text style={styles.timeText}>
//                       {formatTime(playbackStatus.positionMillis)}
//                     </Text>
//                     <Text style={styles.timeText}>
//                       {formatTime(playbackStatus.durationMillis)}
//                     </Text>
//                   </View>

//                   <View style={styles.sliderContainer}>
//                     <Slider
//                       style={styles.progressSlider}
//                       minimumValue={0}
//                       maximumValue={1}
//                       disabled={itemIsProcessing || !playbackStatus.durationMillis}
//                       value={
//                         playbackStatus.durationMillis && playbackStatus.durationMillis > 0
//                           ? playbackStatus.positionMillis / playbackStatus.durationMillis
//                           : 0
//                       }
//                       minimumTrackTintColor="#FF6B35"
//                       maximumTrackTintColor="rgba(255,255,255,0.3)"
//                       thumbTintColor="#FF6B35"
//                       onSlidingComplete={onSeek}
//                     />
//                   </View>
//                 </View>
//               )}
//             </View>

//             {/* Track Number */}
//             <View style={styles.trackNumber}>
//               <Text style={[
//                 styles.trackNumberText,
//                 isCurrentlySelected && styles.activeTrackNumber
//               ]}>
//                 {String(index + 1).padStart(2, '0')}
//               </Text>
//             </View>
//           </View>
//         {/* </LinearGradient> */}

//         {/* Premium Badge for Locked Content */}
//         {isLocked && (
//           <View style={styles.premiumBadge}>
//             <LinearGradient
//               colors={['#FFD700', '#FFA500']}
//               style={styles.badgeGradient}
//             >
//               <Text style={styles.badgeText}>PRO</Text>
//             </LinearGradient>
//           </View>
//         )}
//       </TouchableOpacity>
//       </Animated.View >
//     );
// };

// return (
//   <View style={styles.container}>
//     {/* <LinearGradient
//         colors={['#0A0A0A', '#1A1A2E', '#16213E']}
//         style={styles.backgroundGradient}
//       > */}
//     {/* Header */}
//     <View style={styles.header}>
//       <Text style={styles.headerTitle}>Audio Chapters</Text>
//       <Text style={styles.headerSubtitle}>{audioData.length} episodes available</Text>
//     </View>

//     {/* Audio List */}
//     <View style={styles.audioList}>
//       {audioData.map((audio, index) => renderAudioCard(audio, index))}
//     </View>

//     {/* Upgrade Modal */}
//     <Modal
//       visible={isModalVisible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={() => setModalVisible(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <Pressable
//           style={StyleSheet.absoluteFill}
//           onPress={() => setModalVisible(false)}
//         />
//         <View style={styles.upgradeModal}>
//           <LinearGradient
//             colors={['#1A1A2E', '#16213E', '#0E1A2E']}
//             style={styles.modalGradient}
//           >
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Upgrade Required</Text>
//               <TouchableOpacity
//                 onPress={() => setModalVisible(false)}
//                 style={styles.closeButton}
//               >
//                 <IconButton icon="close" iconColor="#FFFFFF" size={24} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.modalContent}>
//               <Text style={styles.modalText}>
//                 This content is only available for PRO members. Upgrade now to access all audio chapters and features.
//               </Text>
//               <TouchableOpacity
//                 style={styles.upgradeButton}
//                 onPress={() => {
//                   setModalVisible(false);
//                   onUpgrade();
//                 }}
//               >
//                 <LinearGradient
//                   colors={['#FF6B35', '#F7931E']}
//                   style={styles.upgradeButtonGradient}
//                 >
//                   <Text style={styles.upgradeButtonText}>Upgrade to PRO</Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </View>
//           </LinearGradient>
//         </View>
//       </View>
//     </Modal>

//     {/* Transcript Modal */}
//     {/* {renderTranscriptModal()} */}
//     {/* </LinearGradient> */}
//   </View>
// );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   backgroundGradient: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },

//   header: {
//     marginBottom: 32,
//     alignItems: 'center',
//   },

//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: '#FFFFFF',
//     marginBottom: 8,
//     letterSpacing: 0.5,
//   },

//   headerSubtitle: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     opacity: 0.7,
//     fontWeight: '400',
//   },

//   audioList: {
//     flex: 1,
//   },

//   audioCard: {
//     borderRadius: 20,
//     overflow: 'hidden',
//     elevation: 8,
//     shadowColor: '#000000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     minHeight: 140,
//   },

//   activeCard: {
//     elevation: 12,
//     shadowColor: '#FF6B35',
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//   },

//   lockedCard: {
//     opacity: 0.7,
//   },

//   cardGradient: {
//     flex: 1,
//     justifyContent: 'center',
//   },

//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 20,
//     minHeight: 140,
//   },

//   albumArtContainer: {
//     position: 'relative',
//     marginRight: 16,
//   },

//   albumArt: {
//     width: 80,
//     height: 80,
//     borderRadius: 12,
//   },

//   lockedImage: {
//     opacity: 0.5,
//   },

//   playButtonOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   loadingContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   playButtonContainer: {
//     borderRadius: 25,
//     overflow: 'hidden',
//   },

//   activePlayButton: {
//     elevation: 4,
//     shadowColor: '#FF6B35',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.4,
//     shadowRadius: 4,
//   },

//   playButtonGradient: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   waveContainer: {
//     position: 'absolute',
//     top: -10,
//     left: -10,
//     right: -10,
//     bottom: -10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   wave: {
//     position: 'absolute',
//     borderRadius: 50,
//     borderWidth: 2,
//     borderColor: '#FF6B35',
//   },

//   wave1: {
//     width: 100,
//     height: 100,
//     opacity: 0.3,
//   },

//   wave2: {
//     width: 110,
//     height: 110,
//     opacity: 0.2,
//   },

//   wave3: {
//     width: 120,
//     height: 120,
//     opacity: 0.1,
//   },

//   trackInfo: {
//     flex: 1,
//     justifyContent: 'center',
//   },

//   trackTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 8,
//     lineHeight: 24,
//   },

//   activeTrackTitle: {
//     color: '#FF6B35',
//   },

//   trackTranscript: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     opacity: 0.7,
//     lineHeight: 20,
//     marginBottom: 4,
//   },

//   readMoreText: {
//     fontSize: 12,
//     color: '#FF6B35',
//     opacity: 0.8,
//     fontStyle: 'italic',
//     marginBottom: 8,
//   },

//   lockedText: {
//     opacity: 0.5,
//   },

//   progressContainer: {
//     marginTop: 8,
//   },

//   timeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },

//   timeText: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     opacity: 0.8,
//     fontWeight: '500',
//   },

//   sliderContainer: {
//     height: 30,
//   },

//   progressSlider: {
//     width: '100%',
//     height: 30,
//   },

//   trackNumber: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 16,
//   },

//   trackNumberText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     opacity: 0.5,
//   },

//   activeTrackNumber: {
//     color: '#FF6B35',
//     opacity: 1,
//     fontSize: 18,
//     fontWeight: '700',
//   },

//   premiumBadge: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     borderRadius: 12,
//     overflow: 'hidden',
//   },

//   badgeGradient: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },

//   badgeText: {
//     fontSize: 12,
//     fontWeight: '800',
//     color: '#FFFFFF',
//     letterSpacing: 1,
//   },

//   // Modal styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },

//   transcriptModal: {
//     width: '100%',
//     maxHeight: '80%',
//     borderRadius: 20,
//     overflow: 'hidden',
//   },

//   modalGradient: {
//     flex: 1,
//     padding: 0,
//   },

//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },

//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     flex: 1,
//     marginRight: 10,
//   },

//   closeButton: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 20,
//   },

//   modalContent: {
//     flex: 1,
//     padding: 20,
//   },

//   fullTranscript: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     lineHeight: 24,
//     opacity: 0.9,
//   },
//   upgradeModal: {
//     width: width * 0.85,
//     backgroundColor: 'transparent',
//     borderRadius: 15,
//     overflow: 'hidden',
//   },
//   modalText: {
//     color: 'rgba(255,255,255,0.9)',
//     fontSize: 16,
//     lineHeight: 24,
//     marginBottom: 20,
//   },
//   upgradeButtonGradient: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   upgradeButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   upgradeButton: {
//     // height: 50,
//     // borderRadius: 25,
//     // overflow: 'hidden',
//     // marginTop: 10,
//     backgroundColor: '#FF6B35',
//   },
//   dialogContainer: {
//     backgroundColor: '#1A1A2E',
//     borderRadius: 10,
//   },
//   dialogTitle: {
//     color: '#FFFFFF',
//   },
//   dialogText: {
//     color: 'rgba(255,255,255,0.9)',
//     fontSize: 16,
//     lineHeight: 24,
//   },
// });
// ==========================================
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ActivityIndicator, Button, Dialog, IconButton, Portal, Text } from 'react-native-paper';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { AudioData } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

interface Props {
  audioData: AudioData[];
  plan: string;
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

// Toggle this to true to disable plan restrictions for testing
const disablePlanRestrictions = false;

const formatTime = (millis?: number) => {
  if (!millis) return '0:00';
  const seconds = Math.floor(millis / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function AudioPlayerComponent({ audioData, plan, onUpgrade }: Props) {
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatusSuccess | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [expandedTranscript, setExpandedTranscript] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [upgradeDialogVisible, setUpgradeDialogVisible] = useState(false);
  // Animation values
  const playButtonScale = useSharedValue(1);
  const waveAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    // Start wave animation when playing
    if (isPlaying) {
      waveAnimation.value = withTiming(1, { duration: 1000 });
    } else {
      waveAnimation.value = withTiming(0, { duration: 500 });
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch((e) => console.error('Error unloading sound:', e));
    };
  }, []);

  const playAudio = async (index: number) => {
    if (isProcessingAudio && currentAudioIndex === index) return;

    if (!disablePlanRestrictions && plan === 'basic' && index !== 0) {
      setUpgradeDialogVisible(true);
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

        // Update progress animation
        if (loadedStatus.durationMillis && loadedStatus.durationMillis > 0) {
          const progress = loadedStatus.positionMillis / loadedStatus.durationMillis;
          progressAnimation.value = withTiming(progress, { duration: 100 });
        }

        // Stop processing indicator when audio is playing and not buffering
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
        if (!disablePlanRestrictions && plan === 'basic' && currentAudioIndex !== 0) {
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

  const showTranscriptDialog = (index: number) => {
    setExpandedTranscript(index);
    setDialogVisible(true);
  };

  const hideTranscriptDialog = () => {
    setDialogVisible(false);
    setExpandedTranscript(null);
  };

  const hideUpgradeDialog = () => {
    setUpgradeDialogVisible(false);
  };

  const renderAudioCard = (audio: AudioData, index: number) => {
    const isLocked = !disablePlanRestrictions && plan === 'basic' && index !== 0;
    const isCurrentlySelected = currentAudioIndex === index;
    const itemIsProcessing = isProcessingAudio && isCurrentlySelected;

    return (
      <Animated.View
        key={index}
        style={[
          animatedCardStyle,
          { marginBottom: 16 }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.audioCard,
            isCurrentlySelected && styles.activeCard,
            isLocked && styles.lockedCard,
          ]}
          onPress={() => {
            if (itemIsProcessing) return;
            if (isLocked && !isCurrentlySelected) {
              setUpgradeDialogVisible(true);
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
          <Portal>
            <Dialog
              visible={dialogVisible}
              onDismiss={hideTranscriptDialog}
              style={styles.dialogContainer}
            >
              <Dialog.Title style={styles.dialogTitle}>
                {expandedTranscript !== null ? audioData[expandedTranscript].title : ''}
              </Dialog.Title>
              <Dialog.Content>
                <Text style={styles.dialogText}>
                  {expandedTranscript !== null
                    ? audioData[expandedTranscript].transcript || 'No transcript available'
                    : ''
                  }
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hideTranscriptDialog} textColor="#007AFF">Close</Button>
              </Dialog.Actions>
            </Dialog>

            {/* Upgrade Dialog */}
            <Dialog
              visible={upgradeDialogVisible}
              onDismiss={hideUpgradeDialog}
              style={styles.dialogContainer}
            >
              <Dialog.Title style={styles.dialogTitle}>Upgrade Required</Dialog.Title>
              <Dialog.Content>
                <Text style={styles.dialogText}>
                  This content is only available for PRO members. Upgrade now to access all audio chapters and features.
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hideUpgradeDialog} textColor="#666">Cancel</Button>
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
          </Portal>
          
          <View style={styles.cardContent}>
            {/* Album Art with Play Button Overlay */}
            <View style={styles.albumArtContainer}>
              <Image
                source={{ uri: audio.img || 'https://via.placeholder.com/100' }}
                style={[styles.albumArt, isLocked && styles.lockedImage]}
              />

              {/* Play Button Overlay */}
              <View style={styles.playButtonOverlay}>
                {itemIsProcessing ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#F09300" />
                  </View>
                ) : (
                  <Animated.View style={animatedPlayButtonStyle}>
                    <TouchableOpacity
                      style={[
                        styles.playButtonContainer,
                        isCurrentlySelected && styles.activePlayButton
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
                        colors={isLocked
                          ? ['#0a0a0a', '#BDBDBD']
                          : ['#F09300', '#rgba(255, 107, 53, 0.9)']
                        }
                        style={styles.playButtonGradient}
                      >
                        <IconButton
                          icon={isLocked ? 'lock' : (isCurrentlySelected && isPlaying ? 'pause' : 'play')}
                          iconColor="#FFFFFF"
                          size={24}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>

              {/* Wave Animation for Active Track */}
              {isCurrentlySelected && isPlaying && (
                <Animated.View style={[styles.waveContainer, animatedWaveStyle]}>
                  <View style={[styles.wave, styles.wave1]} />
                  <View style={[styles.wave, styles.wave2]} />
                  <View style={[styles.wave, styles.wave3]} />
                </Animated.View>
              )}
            </View>

            {/* Track Info */}
            <View style={styles.trackInfo}>
              <Text style={[
                styles.trackTitle,
                isCurrentlySelected && styles.activeTrackTitle,
                isLocked && styles.lockedText
              ]} numberOfLines={2}>
                {audio.title}
              </Text>

              {/* <TouchableOpacity
                onPress={() => setExpandedTranscript(index)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.trackTranscript,
                  isLocked && styles.lockedText
                ]} numberOfLines={3}>
                  {audio.transcript || 'No transcript available'}
                </Text>
                {audio.transcript && audio.transcript.length > 100 && (
                  <Text style={styles.readMoreText}>Tap to read more...</Text>
                )}
              </TouchableOpacity> */}

              {/* Progress Bar for Active Track */}
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
            </View>

            {/* Track Number */}
            <View style={styles.trackNumber}>
              <Text style={[
                styles.trackNumberText,
                isCurrentlySelected && styles.activeTrackNumber
              ]}>
                {String(index + 1).padStart(2, '0')}
              </Text>
            </View>
          </View>

          {/* Premium Badge for Locked Content */}
          {isLocked && (
            <View style={styles.premiumBadge}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.badgeGradient}
              >
                <Text style={styles.badgeText}>PRO</Text>
              </LinearGradient>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Audio Chapters</Text>
        <Text style={styles.headerSubtitle}>{audioData.length} episodes available</Text>
      </View>

      {/* Audio List */}
      <View style={styles.audioList}>
        {audioData.map((audio, index) => renderAudioCard(audio, index))}
      </View>

      {/* Upgrade Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.upgradeModal}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Upgrade Required</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <IconButton icon="close" iconColor="#666" size={24} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalText}>
                This content is only available for PRO members. Upgrade now to access all audio chapters and features.
              </Text>
              
              <TouchableOpacity
                style={styles.upgradeModalButton}
                onPress={() => {
                  setModalVisible(false);
                  onUpgrade();
                }}
              >
                <LinearGradient
                  colors={['#007AFF', '#0056CC']}
                  style={styles.upgradeButtonGradient}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to PRO</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    // paddingTop: 20,
  },

  header: {
    marginBottom: 32,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F09300',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },

  audioList: {
    flex: 1,
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
    padding: 20,
    minHeight: 120,
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

  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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

  playButtonContainer: {
    borderRadius: 25,
    overflow: 'hidden',
  },

  activePlayButton: {
    elevation: 6,
    shadowColor: '#F09300',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  playButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  waveContainer: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  wave: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#rgba(255, 107, 53, 0.9)',
  },

  wave1: {
    width: 100,
    height: 100,
    opacity: 0.3,
  },

  wave2: {
    width: 110,
    height: 110,
    opacity: 0.2,
  },

  wave3: {
    width: 120,
    height: 120,
    opacity: 0.1,
  },

  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  trackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 24,
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
    fontSize: 12,
    color: '#F09300',
    fontStyle: 'italic',
    marginBottom: 8,
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

  trackNumber: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    backgroundColor: '#F8F9FA',
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  trackNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F09300',
  },

  activeTrackNumber: {
    color: '#F09300',
    fontSize: 18,
    fontWeight: '700',
  },

  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },

  badgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  upgradeModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },

  modalContent: {
    padding: 24,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },

  closeButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
  },

  modalText: {
    color: '#666666',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },

  upgradeModalButton: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },

  upgradeButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  upgradeButton: {
    backgroundColor: '#F09300',
  },

  // Dialog styles
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
});