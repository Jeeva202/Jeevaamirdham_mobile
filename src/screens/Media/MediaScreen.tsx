
// ============================
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   ActivityIndicator,
//   Image,
//   Platform,
// } from 'react-native';
// import {
//   TabView,
//   SceneMap,
//   TabBar,
//   Route,
//   SceneRendererProps,
//   NavigationState,
// } from 'react-native-tab-view';
// import {
//   Card,
//   Title,
//   Text,
//   IconButton,
//   Chip,
//   useTheme,
//   List,
//   MD3Theme, // Assuming this is the correct type from your setup
//   Avatar,
//   Paragraph,
//   Surface,
// } from 'react-native-paper';
// import axios from 'axios';
// import { Video, Audio, AVPlaybackStatusSuccess, AVPlaybackStatusError, AVPlaybackStatus, ResizeMode } from 'expo-av'; // Imported AVPlaybackStatus
// import Slider from '@react-native-community/slider';

// import { REACT_API_URL } from '@/app-config';
// import VideoPlayerTab_1 from './Video';

// // --- Helper Function (remains the same) ---
// const formatTime = (millis: number | undefined) => {
//   if (millis === undefined) return '0:00';
//   const totalSeconds = Math.floor(millis / 1000);
//   const minutes = Math.floor(totalSeconds / 60);
//   const seconds = totalSeconds % 60;
//   return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
// };

// // --- Types (remain the same) ---
// type AudioItem = {
//   id: string;
//   title: string;
//   subtitle: string;
//   audiofile_url: string;
//   coverImage_url: string;
//   category: string;
// };

// type VideoItem = {
//   id: string;
//   title: string;
//   subtitle: string;
//   videofile_url: string;
//   coverImage_url: string;
//   category: string;
// };

// type MediaTabProps = {
//   isActive: boolean;
//   isUserLoggedIn: boolean;
//   userPlan: string | null;
// };

// // --- Audio Player Tab (remains the same as your working version) ---
// const AudioPlayerTab: React.FC<MediaTabProps> = ({ isActive, isUserLoggedIn = true, userPlan = 'elite' }) => {
//   const [audioData, setAudioData] = useState<AudioItem[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [isPlaying, setIsPlaying] = useState<boolean>(false);
//   const [currentAudio, setCurrentAudio] = useState<AudioItem | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatusSuccess | null>(null);

//   const theme = useTheme();
//   const styles = useStyles(theme);

  
//   useEffect(() => {
//     const fetchAudioData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get<AudioItem[]>(
//           `${REACT_API_URL}/audio-video-page/all_audio_data`
//         );
//         setAudioData(response.data);
//         const uniqueCategories = [...new Set(response.data.map((audio) => audio.category))];
//         setCategories(uniqueCategories);
//         if (uniqueCategories.length > 0) {
//           setSelectedCategory(uniqueCategories[0]);
//         } else {
//           setSelectedCategory(null);
//         }
//       } catch (err) {
//         console.error("Error fetching audio data:", err);
//         setError("Failed to load audio data. Please try again later.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAudioData();

//     return () => {
//       sound?.unloadAsync();
//     };
//   }, []);

//   const playAudio = async (audio: AudioItem) => {
//     if (!isUserLoggedIn && audio.id !== audioData[0]?.id) {
//       alert("Please log in to play this audio.");
//       return;
//     }
//     if (userPlan === "basic" && audio.id !== audioData[0]?.id) {
//       alert("Upgrade to Elite plan to access this audio.");
//       return;
//     }

//     try {
//       if (sound) {
//         await sound.unloadAsync();
//         setPlaybackStatus(null);
//       }

//       const { sound: newSound, status } = await Audio.Sound.createAsync(
//         { uri: audio.audiofile_url },
//         { shouldPlay: true },
//         (updateStatus) => {
//           if (updateStatus.isLoaded) {
//             setPlaybackStatus(updateStatus);
//             setIsPlaying(updateStatus.isPlaying); // Sync isPlaying state
//             if (updateStatus.didJustFinish) {
//               setIsPlaying(false);
//               // Optionally reset or play next
//             }
//           } else if ((updateStatus as AVPlaybackStatusError).error) {
//             console.error(`Error during playback: ${(updateStatus as AVPlaybackStatusError).error}`);
//             setIsPlaying(false);
//             // No need to set currentAudio to null here if we want to show the item as selected but failed
//             alert(`Playback error for "${audio.title}".`);
//           }
//         }
//       );
//       setSound(newSound);
//       setCurrentAudio(audio);
//       // setIsPlaying(true); // Handled by onPlaybackStatusUpdate -> updateStatus.isPlaying
//       if (status.isLoaded) {
//         setPlaybackStatus(status);
//         setIsPlaying(status.isPlaying);
//       }

//     } catch (err) {
//       console.error('Error creating sound:', err);
//       alert(`Could not load "${audio.title}". The file might be unavailable or corrupted.`);
//       setIsPlaying(false);
//       setCurrentAudio(null); // Reset current audio if creation fails
//     }
//   };

//   const togglePlayPause = async () => {
//     if (!sound || !currentAudio) return;

//     if (isPlaying) {
//       await sound.pauseAsync();
//       // isPlaying will be updated by onPlaybackStatusUpdate
//     } else {
//       if (!isUserLoggedIn && currentAudio.id !== audioData[0]?.id) {
//         alert("Please log in to play this audio."); return;
//       }
//       if (userPlan === "basic" && currentAudio.id !== audioData[0]?.id) {
//         alert("Upgrade to Elite plan to access this audio."); return;
//       }
//       await sound.playAsync();
//       // isPlaying will be updated by onPlaybackStatusUpdate
//     }
//   };

//   const onSeek = async (value: number) => {
//     if (sound && playbackStatus?.durationMillis) {
//       const seekPosition = value * playbackStatus.durationMillis;
//       await sound.setPositionAsync(seekPosition);
//     }
//   };

//   if (isLoading) {
//     return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Loading Audios...</Text></View>;
//   }
//   if (error) {
//     return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
//   }
//   if (audioData.length === 0) {
//     return <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>No audio content available.</Text></View>;
//   }

//   const filteredAudios = selectedCategory ? audioData.filter((audio) => audio.category === selectedCategory) : audioData;

//   return (
//     <ScrollView style={styles.tabContainer} contentContainerStyle={{ paddingBottom: 20 }}>
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.categoryScroll}
//       >
//         {categories.map((category) => (
//           <Chip
//             key={category}
//             selected={selectedCategory === category}
//             onPress={() => setSelectedCategory(category)}
//             style={[
//               styles.categoryChip,
//               selectedCategory === category && { backgroundColor: theme.colors.primary }
//             ]}
//             textStyle={[
//               styles.categoryText,
//               selectedCategory === category && { color: theme.colors.onPrimary }
//             ]}
//           >
//             {category}
//           </Chip>
//         ))}
//       </ScrollView>

//       {filteredAudios.length === 0 && selectedCategory && (
//         <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>No audios in "{selectedCategory}".</Text></View>
//       )}

//       <List.Section style={styles.listSection}>
//         {filteredAudios.map((item) => {
//           const isLocked = (userPlan === "basic" || !isUserLoggedIn) && item.id !== audioData[0]?.id;
//           const isCurrentlyPlayingItem = currentAudio?.id === item.id;

//           return (
//             <Card
//               key={item.id}
//               style={[
//                 styles.audioCard,
//                 isCurrentlyPlayingItem && styles.currentAudioCard,
//                 isLocked && styles.lockedItem
//               ]}
//               onPress={() => {
//                 if (isLocked && !isCurrentlyPlayingItem) { // Prevent playing locked item unless it's the first free one
//                   if (userPlan === "basic") alert("Upgrade to Elite plan to access this audio.");
//                   else alert("Please log in to play this audio.");
//                   return;
//                 }
//                 if (isCurrentlyPlayingItem) {
//                   togglePlayPause();
//                 } else {
//                   playAudio(item);
//                 }
//               }}
//             >
//               <Card.Content style={styles.cardContent}>
//                 <Avatar.Image
//                   source={{ uri: item.coverImage_url }}
//                   size={60}
//                   style={styles.audioCover}
//                 />
//                 <View style={styles.audioInfo}>
//                   <Title style={styles.audioTitle} numberOfLines={1}>{item.title}</Title>
//                   <Paragraph style={styles.audioSubtitle} numberOfLines={1}>{item.subtitle}</Paragraph>
//                   {isCurrentlyPlayingItem && playbackStatus && (
//                     <View style={styles.playbackControlsContainer}>
//                       <Text style={styles.timeText}>{formatTime(playbackStatus.positionMillis)}</Text>
//                       <Slider
//                         style={styles.slider}
//                         minimumValue={0}
//                         maximumValue={1}
//                         value={
//                           playbackStatus.durationMillis && playbackStatus.durationMillis > 0
//                             ? playbackStatus.positionMillis / playbackStatus.durationMillis
//                             : 0
//                         }
//                         minimumTrackTintColor={theme.colors.primary}
//                         maximumTrackTintColor='#6c6c6c'
//                         thumbTintColor={theme.colors.primary}
//                         onSlidingComplete={onSeek}
//                       />
//                       <Text style={styles.timeText}>{formatTime(playbackStatus.durationMillis)}</Text>
//                     </View>
//                   )}
//                 </View>
//                 <IconButton
//                   icon={
//                     isLocked ? 'lock' :
//                       (isCurrentlyPlayingItem && isPlaying ? 'pause-circle' : 'play-circle')
//                   }
//                   iconColor={isLocked ? theme.colors.onSurfaceDisabled : theme.colors.primary}
//                   size={36}
//                   onPress={() => { // Ensure IconButton also respects lock
//                     if (isLocked && !isCurrentlyPlayingItem) {
//                       if (userPlan === "basic") alert("Upgrade to Elite plan to access this audio.");
//                       else alert("Please log in to play this audio.");
//                       return;
//                     }
//                     if (isCurrentlyPlayingItem) {
//                       togglePlayPause();
//                     } else {
//                       playAudio(item);
//                     }
//                   }}
//                 />
//               </Card.Content>
//             </Card>
//           );
//         })}
//       </List.Section>
//     </ScrollView>
//   );
// };


// // --- Video Player Tab (Corrected) ---
// const VideoPlayerTab: React.FC<MediaTabProps> = ({ isActive, isUserLoggedIn, userPlan }) => {
//   const [videoData, setVideoData] = useState<VideoItem[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isVideoLoading, setIsVideoLoading] = useState(false);
//   const [isVideoPlaying, setIsVideoPlaying] = useState(false); // To track video play state

//   const theme = useTheme();
//   const styles = useStyles(theme);
//   const videoRef = useRef<Video>(null);
//   const screenWidth = Dimensions.get('window').width;

//   // Fetch initial video data
//   useEffect(() => {
//     const fetchVideoData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get<VideoItem[]>(
//           `${REACT_API_URL}/audio-video-page/all_video_data`
//         );
//         const fetchedData = response.data;
//         setVideoData(fetchedData);
//         const uniqueCategories = [...new Set(fetchedData.map(video => video.category))];
//         setCategories(uniqueCategories);

//         if (uniqueCategories.length > 0) {
//           const firstCategory = uniqueCategories[0];
//           setSelectedCategory(firstCategory);
//           const videosInFirstCategory = fetchedData.filter(v => v.category === firstCategory);
//           if (videosInFirstCategory.length > 0) {
//             setCurrentVideo(videosInFirstCategory[0]); // This will trigger the effect below to load/play
//           } else {
//             setCurrentVideo(null);
//           }
//         } else if (fetchedData.length > 0) {
//           setSelectedCategory(null); // No categories, but data exists
//           setCurrentVideo(fetchedData[0]); // Play first available video
//         } else {
//           setSelectedCategory(null);
//           setCurrentVideo(null);
//         }
//       } catch (err) {
//         console.error("Error fetching video data:", err);
//         setError("Failed to load video data. Please try again later.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchVideoData();
//   }, []);

//   // Effect to load and play video when currentVideo changes
//   useEffect(() => {
//     const loadAndPlay = async () => {
//       if (currentVideo && videoRef.current) {
//         setIsVideoLoading(true);
//         setIsVideoPlaying(false); // Assume it's not playing until loaded
//         try {
//           await videoRef.current.unloadAsync(); // Ensure previous instance is cleared
//           console.log(`Attempting to load video: ${currentVideo.title} (${currentVideo.videofile_url})`);
//           const status = await videoRef.current.loadAsync(
//             { uri: currentVideo.videofile_url },
//             { shouldPlay: true } // Command to play after loading
//           );
//           // setIsVideoLoading(false); // onLoad on Video component will handle this
//           // if (status.isLoaded && status.shouldPlay) {
//           //   setIsVideoPlaying(true);
//           // }
//         } catch (e) {
//           console.error("Error loading/playing video in useEffect:", e);
//           alert(`Could not load video: ${currentVideo.title}. Please check the URL or network.`);
//           setIsVideoLoading(false);
//         }
//       } else if (!currentVideo && videoRef.current) {
//         await videoRef.current.unloadAsync(); // Unload if currentVideo becomes null
//       }
//     };
//     loadAndPlay();
//   }, [currentVideo]); // Re-run when currentVideo (the object reference) changes

//   // Function to select a video to play
//   const selectVideoToPlay = (video: VideoItem) => {
//     if (!isUserLoggedIn && video.id !== videoData[0]?.id) {
//       alert("Please log in to play this video.");
//       return;
//     }
//     if (userPlan === "basic" && video.id !== videoData[0]?.id) {
//       alert("Upgrade to Elite plan to access this video.");
//       return;
//     }
//     setCurrentVideo(video); // Triggers the useEffect to load and play
//   };

//   const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
//     if (status.isLoaded) {
//       setIsVideoLoading(false); // Ensure loading is false once truly loaded
//       setIsVideoPlaying(status.isPlaying);
//       if (status.didJustFinish) {
//         setIsVideoPlaying(false);
//         // Handle video end, e.g., play next, show replay button, etc.
//       }
//     } else {
//       // If error occurs during playback
//       if (status.error) {
//         console.error(`Video Playback Error: ${status.error}`);
//         setIsVideoLoading(false);
//         setIsVideoPlaying(false);
//         alert(`An error occurred while playing ${currentVideo?.title}.`);
//       }
//     }
//   };


//   if (isLoading) {
//     return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Loading Videos...</Text></View>;
//   }
//   if (error) {
//     return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
//   }
//   if (videoData.length === 0) {
//     return <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>No video content available.</Text></View>;
//   }

//   const filteredVideos = selectedCategory ? videoData.filter(video => video.category === selectedCategory) : videoData;
//   const nextVideos = filteredVideos.filter(v => v.id !== currentVideo?.id);

//   return (
//     <ScrollView style={styles.tabContainer} contentContainerStyle={{ paddingBottom: 20 }}>
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.categoryScroll}
//       >
//         {categories.map((category) => (
//           <Chip
//             key={category}
//             selected={selectedCategory === category}
//             onPress={() => {
//               setSelectedCategory(category);
//               const videosInNewCategory = videoData.filter(v => v.category === category);
//               if (videosInNewCategory.length > 0) {
//                 if (currentVideo?.id !== videosInNewCategory[0].id) { // Only change if it's a different video
//                   setCurrentVideo(videosInNewCategory[0]);
//                 } else if (!isVideoPlaying && videoRef.current) { // If same video and not playing, try to play
//                   videoRef.current.playAsync();
//                 }
//               } else {
//                 setCurrentVideo(null);
//               }
//             }}
//             style={[styles.categoryChip, selectedCategory === category && { backgroundColor: theme.colors.primary }]}
//             textStyle={[styles.categoryText, selectedCategory === category && { color: theme.colors.onPrimary }]}
//           >
//             {category}
//           </Chip>
//         ))}
//       </ScrollView>

//       {currentVideo ? (
//         <Surface style={styles.mainVideoSurface}>
//           <View style={styles.videoContainer}>

//             <Video
//               ref={videoRef}
//               source={{ uri: currentVideo.videofile_url }} // ✅ Add this back
//               style={styles.video}
//               useNativeControls
//               resizeMode={ResizeMode.CONTAIN} // Use 'contain' to fit video within the screen
//               onLoadStart={() => setIsVideoLoading(true)}
//               onPlaybackStatusUpdate={onPlaybackStatusUpdate}
//               onError={(errMessage) => {
//                 setIsVideoLoading(false);
//                 setIsVideoPlaying(false);
//                 console.error("Video Component Error:", errMessage);
//                 alert(`Error loading video player for: ${currentVideo.title}`);
//               }}
//             />

//             {isVideoLoading && ( /* Show overlay only if video is loading and not yet playing */
//               <View style={styles.videoLoadingOverlay}>
//                 <ActivityIndicator size="large" color={theme.colors.onPrimary} />
//               </View>
//             )}
//           </View>

//           <Card.Content style={styles.mainVideoInfo}>
//             <Title style={styles.videoTitleMain} numberOfLines={1}>{currentVideo.title}</Title>
//             <Paragraph style={styles.videoSubtitleMain} numberOfLines={2}>{currentVideo.subtitle}</Paragraph>
//           </Card.Content>
//         </Surface>
//       ) : (
//         filteredVideos.length > 0 && !currentVideo ?
//           <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>Select a video to play.</Text></View> :
//           <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>No videos {selectedCategory ? `in "${selectedCategory}"` : "available"}.</Text></View>
//       )}

//       {nextVideos.length > 0 && (
//         <>
//           <Title style={styles.nextVideosTitle}>Up Next</Title>
//           {nextVideos.map((item) => {
//             const isLocked = (userPlan === "basic" || !isUserLoggedIn) && item.id !== videoData[0]?.id;
//             return (
//               <TouchableOpacity key={item.id} onPress={() => selectVideoToPlay(item)} disabled={isLocked}>
//                 <Card style={[styles.videoCard, isLocked && styles.lockedItem]}>
//                   <Card.Content style={styles.videoCardContent}>
//                     <Image
//                       source={{ uri: item.coverImage_url }}
//                       style={styles.videoThumbnail}
//                       onError={() => console.warn(`Failed to load thumbnail: ${item.coverImage_url}`)}
//                     />
//                     {isLocked && (
//                       <View style={styles.lockIconOverlayVideo}>
//                         <IconButton icon="lock" iconColor={theme.colors.surface} size={20} style={{ margin: 0 }} />
//                       </View>
//                     )}
//                     <View style={styles.videoItemInfo}>
//                       <Title style={styles.videoItemTitle} numberOfLines={1}>{item.title}</Title>
//                       <Paragraph style={styles.videoItemSubtitle} numberOfLines={1}>{item.subtitle}</Paragraph>
//                     </View>
//                     {!isLocked && <IconButton icon="play-circle-outline" size={28} iconColor={theme.colors.primary} style={styles.videoPlayIconSmall} />}
//                   </Card.Content>
//                 </Card>
//               </TouchableOpacity>
//             );
//           })}
//         </>
//       )}
//     </ScrollView>
//   );
// };


// // --- Main Media Page (remains largely the same) ---
// const MediaPage: React.FC = () => {
//   const [index, setIndex] = useState<number>(0);
//   const [routes] = useState<TabRoute[]>([
//     { key: 'audio', title: 'Audios' },
//     { key: 'video', title: 'Videos' },
//   ]);
//   const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(true);
//   const [userPlan, setUserPlan] = useState<string | null>('elite');
//   const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

//   const theme = useTheme(); // Correct: useTheme must be called within a component that is a descendant of Provider
//   const styles = useStyles(theme);

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       setIsLoadingAuth(true);
//       await new Promise(resolve => setTimeout(resolve, 500));
//       const loggedIn = true;
//       setIsUserLoggedIn(loggedIn);
//       if (loggedIn) {
//         try {
//           const response = await axios.get<{ plan: string }[]>(
//             `${REACT_API_URL}/getPlan`,
//             { params: { id: "user-id-from-auth" } }
//           );
//           setUserPlan(response.data[0]?.plan || 'basic');
//         } catch (error) {
//           console.error("Error fetching user plan:", error);
//           setUserPlan('basic');
//         }
//       } else {
//         setUserPlan(null);
//       }
//       setIsLoadingAuth(false);
//     };
//     // checkLoginStatus(); // Keep commented if not implementing full auth yet
//   }, []);

//   const renderScene = ({ route }: { route: TabRoute }) => {
//     if (isLoadingAuth) {
//       return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Checking access...</Text></View>;
//     }
//     switch (route.key) {
//       case 'audio':
//         return <AudioPlayerTab isActive={index === 0} isUserLoggedIn={isUserLoggedIn} userPlan={userPlan} />;
//       case 'video':
//         return <VideoPlayerTab isActive={index === 1} isUserLoggedIn={isUserLoggedIn} userPlan={userPlan} />;
//       default:
//         return null;
//     }
//   };

//   const renderTabBar = (
//     props: SceneRendererProps & { navigationState: NavigationState<TabRoute> }
//   ) => (
//     <TabBar
//       {...props}
//       indicatorStyle={{ backgroundColor: theme.colors.primary }}
//       style={{ backgroundColor: theme.colors.elevation.level2 }}
//       // labelStyle={{ fontWeight: '600' }}
//       // Made it a bit bolder
//       activeColor={theme.colors.primary}
//       inactiveColor={theme.colors.onSurfaceVariant}
//     />
//   );

//   return (
//     <View style={styles.container}>
//       <TabView
//         navigationState={{ index, routes }}
//         renderScene={renderScene}
//         onIndexChange={setIndex}
//         initialLayout={{ width: Dimensions.get('window').width }}
//         renderTabBar={renderTabBar}
//         lazy={({ route }) => route.key !== routes[index].key} // Basic lazy loading
//         renderLazyPlaceholder={() => ( // Placeholder for lazy loaded tabs
//           <View style={styles.centered}>
//             <ActivityIndicator color={theme.colors.primary} />
//           </View>
//         )}
//       />
//     </View>
//   );
// };


// // --- Styles (ensure theme type matches your PaperProvider, e.g., MD3Theme or ReactNativePaper.Theme) ---
// const useStyles = (theme: MD3Theme) => StyleSheet.create({ // Using MD3Theme as per your latest
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.background,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     color: theme.colors.error,
//     textAlign: 'center',
//     fontSize: 16,
//   },
//   tabContainer: {
//     flex: 1,
//   },
//   categoryScroll: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     marginBottom: 8, // Added margin
//   },
//   categoryChip: {
//     marginRight: 8,
//     backgroundColor: theme.colors.elevation.level3, // Default chip background
//     // borderRadius: 16, // More rounded chips
//   },
//   categoryText: {
//     fontSize: 14,
//     // fontWeight: '500', // Slightly bolder text for chips
//     color: theme.colors.onSurfaceVariant, // Default chip text color
//   },
//   listSection: {
//     paddingHorizontal: 16,
//   },
//   audioCard: {
//     marginBottom: 16, // Increased margin
//     backgroundColor: theme.colors.elevation.level1,
//     borderRadius: theme.roundness * 3, // More pronounced rounding
//     elevation: 2, // Subtle shadow for Android
//   },
//   currentAudioCard: {
//     borderColor: theme.colors.primary,
//     borderWidth: 1.5,
//     backgroundColor: theme.colors.primaryContainer,
//   },
//   lockedItem: {
//     opacity: 0.6, // Make it more clear it's locked
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   audioCover: {
//     marginRight: 16,
//     borderRadius: theme.roundness * 1.5, // Slightly rounded avatar
//     backgroundColor: 'none'
//   },
//   audioInfo: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   audioTitle: {
//     fontSize: 17, // Slightly larger
//     fontWeight: '600', // Medium weight
//     color: theme.colors.onSurface,
//     marginBottom: 2,
//   },
//   audioSubtitle: {
//     fontSize: 13,
//     color: theme.colors.onSurfaceVariant,
//   },
//   playbackControlsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6, // Increased spacing
//   },
//   slider: {
//     flex: 1,
//     height: 40, // Increased touchable area for slider
//     marginHorizontal: 8,
//   },
//   timeText: {
//     fontSize: 12,
//     color: theme.colors.onSurfaceVariant,
//     width: 45, // Adjusted width
//     textAlign: 'center',
//   },
//   mainVideoSurface: {
//     marginHorizontal: 16,
//     marginTop: 8, // Reduced top margin slightly
//     marginBottom: 20, // Increased bottom margin
//     elevation: 4,
//     borderRadius: theme.roundness * 3, // Consistent rounding
//     backgroundColor: theme.colors.surface,
//     overflow: 'hidden',
//   },
//   videoContainer: {
//     width: '100%',
//     aspectRatio: 16 / 9, // Ensures consistent responsive layout
//     backgroundColor: '#000',
//   },
//   video: {
//     width: '100%',
//     height: '100%',
//   },
//   videoLoadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.7)', // Darker overlay
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   mainVideoInfo: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   videoTitleMain: {
//     fontSize: 19, // Larger title for main video
//     fontWeight: 'bold',
//     color: theme.colors.onSurface,
//     marginBottom: 4,
//   },
//   videoSubtitleMain: {
//     fontSize: 14,
//     color: theme.colors.onSurfaceVariant,
//     lineHeight: 20, // Improved readability
//   },
//   nextVideosTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 0, // Adjusted as main video has more bottom margin
//     marginBottom: 12,
//     marginLeft: 16,
//     color: theme.colors.onSurface,
//   },
//   videoCard: {
//     marginBottom: 16, // Consistent margin
//     marginHorizontal: 16,
//     backgroundColor: theme.colors.elevation.level1,
//     borderRadius: theme.roundness * 3, // Consistent rounding
//     elevation: 2,
//   },
//   videoCardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12, // Consistent padding
//   },
//   videoThumbnail: {
//     width: 110, // Slightly larger thumbnail
//     height: 66, // Maintain aspect ratio (110 * 9/15 ~ 66)
//     borderRadius: theme.roundness * 1.5, // Consistent rounding
//     marginRight: 16, // Increased spacing
//     backgroundColor: theme.colors.onSurfaceDisabled,
//   },
//   videoItemInfo: {
//     flex: 1,
//     justifyContent: 'center', // Better vertical alignment
//   },
//   videoItemTitle: {
//     fontSize: 16, // Slightly larger
//     fontWeight: '600',
//     color: theme.colors.onSurface,
//     marginBottom: 2,
//   },
//   videoItemSubtitle: {
//     fontSize: 12,
//     color: theme.colors.onSurfaceVariant,
//   },
//   lockIconOverlayVideo: {
//     position: 'absolute', // Ensure it overlays correctly
//     left: 0,
//     top: 0,
//     width: 110, // Match thumbnail width
//     height: 66, // Match thumbnail height
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)', // Slightly darker overlay for better contrast
//     borderRadius: theme.roundness * 1.5,
//   },
//   videoPlayIconSmall: {
//     marginLeft: 8, // Added some margin
//   },
// });

// // Ensure TabRoute is defined or imported if used across files
// type TabRoute = Route & {
//   key: string;
//   title: string;
// };

// export default MediaPage;

// =======================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import {
  TabView,
  SceneMap,
  TabBar,
  Route,
  SceneRendererProps,
  NavigationState,
} from 'react-native-tab-view';
import {
  Card,
  Title,
  Text,
  IconButton,
  Chip,
  useTheme,
  List,
  MD3Theme,
  Avatar,
  Paragraph,
  Surface,
} from 'react-native-paper';
import axios from 'axios';
import { Video, Audio, AVPlaybackStatusSuccess, AVPlaybackStatusError, AVPlaybackStatus, ResizeMode } from 'expo-av';
import Slider from '@react-native-community/slider';

import { REACT_API_URL } from '@/app-config'; // Ensure this path is correct

// --- Helper Function ---
const formatTime = (millis: number | undefined): string => {
  if (millis === undefined || isNaN(millis) || millis < 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// --- Types ---
type AudioItem = {
  id: string;
  title: string;
  subtitle: string;
  audiofile_url: string;
  coverImage_url: string;
  category: string;
};

type VideoItem = {
  id: string;
  title: string;
  subtitle: string;
  videofile_url: string;
  coverImage_url: string;
  category: string;
};

type MediaTabProps = {
  isActive: boolean;
  isUserLoggedIn: boolean;
  userPlan: string | null;
};

// --- Audio Player Tab ---
const AudioPlayerTab: React.FC<MediaTabProps> = ({ isActive, isUserLoggedIn = true, userPlan = 'elite' }) => {
  const [audioData, setAudioData] = useState<AudioItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null); // Use ref for sound object
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<AudioItem | null>(null);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true); // For fetching list
  const [isProcessingAudio, setIsProcessingAudio] = useState(false); // For loading/buffering individual audio
  const [error, setError] = useState<string | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatusSuccess | null>(null);

  const theme = useTheme();
  const styles = useStyles(theme);

  // Fetch audio data
  useEffect(() => {
    const fetchAudioData = async () => {
      setIsLoadingList(true);
      setError(null);
      try {
        const response = await axios.get<AudioItem[]>(
          `${REACT_API_URL}/audio-video-page/all_audio_data`
        );
        setAudioData(response.data);
        const uniqueCategories = [...new Set(response.data.map((audio) => audio.category))];
        setCategories(uniqueCategories);
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0]);
        } else {
          setSelectedCategory(null);
        }
      } catch (err) {
        console.error("Error fetching audio data:", err);
        setError("Failed to load audio data. Please try again later.");
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchAudioData();
  }, []);

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(e => console.error("Error unloading sound on unmount:", e));
    };
  }, []);

  // Effect to pause audio when tab becomes inactive
  useEffect(() => {
    if (!isActive && soundRef.current && isPlaying) {
      console.log("AudioTab is now INACTIVE, pausing audio.");
      soundRef.current.pauseAsync().catch(e => console.error("Error pausing audio on tab switch:", e));
      // isPlaying state will be updated by onPlaybackStatusUpdate
    }
  }, [isActive, isPlaying]);


  const playAudio = async (audio: AudioItem) => {
    if (isProcessingAudio && currentAudio?.id === audio.id) return; // Prevent re-processing same audio if already busy
    
    setIsProcessingAudio(true);
    setPlaybackStatus(null); // Reset status for new audio

    if (!isUserLoggedIn && audio.id !== audioData[0]?.id) {
      alert("Please log in to play this audio.");
      setIsProcessingAudio(false);
      return;
    }
    if (userPlan === "basic" && audio.id !== audioData[0]?.id) {
      alert("Upgrade to Elite plan to access this audio.");
      setIsProcessingAudio(false);
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      console.log(`Loading audio: ${audio.title}`);
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: audio.audiofile_url },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        (updateStatus) => { // onPlaybackStatusUpdate
          if (!updateStatus.isLoaded) {
            if ((updateStatus as AVPlaybackStatusError).error) {
              console.error(`Error during playback setup: ${(updateStatus as AVPlaybackStatusError).error}`);
              setIsPlaying(false);
              setIsProcessingAudio(false);
              // Only show alert if it's the currently selected audio
              if (currentAudio?.id === audio.id) {
                alert(`Playback error for "${audio.title}".`);
              }
            }
            return;
          }
          setPlaybackStatus(updateStatus);
          setIsPlaying(updateStatus.isPlaying);
          
          // Determine if processing is finished
          if (updateStatus.isPlaying || !updateStatus.isBuffering || updateStatus.didJustFinish) {
            if (currentAudio?.id === audio.id) { // Ensure this status is for the intended audio
              setIsProcessingAudio(false);
            }
          }
          if (updateStatus.didJustFinish) {
            setIsPlaying(false);
            // Optionally: setPlaybackStatus(null) or reset position for re-play
          }
        }
      );
      soundRef.current = newSound;
      setCurrentAudio(audio);

      if (status.isLoaded) {
        setPlaybackStatus(status);
        setIsPlaying(status.isPlaying);
        if (status.isPlaying || !status.isBuffering) {
          setIsProcessingAudio(false);
        }
      } else {
         // This case should ideally be handled by the error part of onPlaybackStatusUpdate
        setIsProcessingAudio(false);
      }
    } catch (err) {
      console.error('Error creating sound for:', audio.title, err);
      alert(`Could not load "${audio.title}".`);
      setIsPlaying(false);
      if (currentAudio?.id === audio.id) { // Only reset currentAudio if it's the one that failed
          setCurrentAudio(null);
      }
      setIsProcessingAudio(false);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current || !currentAudio) return;
    if (isProcessingAudio && currentAudio?.id === currentAudio?.id) return; // Check against currentAudio for toggle

    setIsProcessingAudio(true);
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        if (!isUserLoggedIn && currentAudio.id !== audioData[0]?.id) {
          alert("Please log in to play this audio."); setIsProcessingAudio(false); return;
        }
        if (userPlan === "basic" && currentAudio.id !== audioData[0]?.id) {
          alert("Upgrade to Elite plan to access this audio."); setIsProcessingAudio(false); return;
        }
        await soundRef.current.playAsync();
      }
      // isPlaying & isProcessingAudio are now primarily managed by onPlaybackStatusUpdate
      // Adding a small failsafe timeout for setIsProcessingAudio if status update is delayed for simple pause/play
      setTimeout(() => {
          if (currentAudio?.id === currentAudio?.id) setIsProcessingAudio(false);
      }, 300);

    } catch (error) {
        console.error("Error in togglePlayPause:", error);
        setIsProcessingAudio(false);
    }
  };

  const onSeek = async (value: number) => {
    if (soundRef.current && playbackStatus?.isLoaded && playbackStatus.durationMillis) {
      const seekPosition = value * playbackStatus.durationMillis;
      setIsProcessingAudio(true); // Indicate processing during seek
      try {
        await soundRef.current.setPositionAsync(seekPosition);
      } catch (error) {
        console.error("Error seeking audio:", error);
      } finally {
        // Allow onPlaybackStatusUpdate to confirm new state before resetting isProcessingAudio
        // Or use a small timeout
         setTimeout(() => setIsProcessingAudio(false), 200);
      }
    }
  };

  if (isLoadingList) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Loading Audios...</Text></View>;
  }
  if (error) {
    return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
  }
  if (audioData.length === 0) {
    return <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>No audio content available.</Text></View>;
  }

  const filteredAudios = selectedCategory ? audioData.filter((audio) => audio.category === selectedCategory) : audioData;

  return (
    <ScrollView style={styles.tabContainer} contentContainerStyle={{ paddingBottom: 20 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[ styles.categoryChip, selectedCategory === category && { backgroundColor: theme.colors.primary }]}
            textStyle={[ styles.categoryText, selectedCategory === category && { color: theme.colors.onPrimary }]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      {filteredAudios.length === 0 && selectedCategory && (
        <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>No audios in "{selectedCategory}".</Text></View>
      )}

      <List.Section style={styles.listSection}>
        {filteredAudios.map((item) => {
          const isLocked = (userPlan === "basic" || !isUserLoggedIn) && item.id !== audioData[0]?.id;
          const isCurrentlySelectedItem = currentAudio?.id === item.id;
          const itemIsCurrentlyProcessing = isProcessingAudio && isCurrentlySelectedItem;

          return (
            <Card
              key={item.id}
              style={[
                styles.audioCard,
                isCurrentlySelectedItem && styles.currentAudioCard,
                isLocked && styles.lockedItem,
                itemIsCurrentlyProcessing && styles.processingItem, // Visual cue for processing
              ]}
              onPress={() => {
                if (itemIsCurrentlyProcessing) return; 

                if (isLocked && !isCurrentlySelectedItem) { 
                  if (userPlan === "basic") alert("Upgrade to Elite plan to access this audio.");
                  else alert("Please log in to play this audio.");
                  return;
                }
                if (isCurrentlySelectedItem) {
                  togglePlayPause();
                } else {
                  playAudio(item);
                }
              }}
            >
              <Card.Content style={styles.cardContent}>
                <Avatar.Image
                  source={{ uri: item.coverImage_url }}
                  size={60}
                  style={styles.audioCover}
                />
                <View style={styles.audioInfo}>
                  <Title style={styles.audioTitle} numberOfLines={1}>{item.title}</Title>
                  <Paragraph style={styles.audioSubtitle} numberOfLines={1}>{item.subtitle}</Paragraph>
                  {isCurrentlySelectedItem && playbackStatus?.isLoaded && (
                    <View style={styles.playbackControlsContainer}>
                      <Text style={styles.timeText}>{formatTime(playbackStatus.positionMillis)}</Text>
                      <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={1}
                        disabled={itemIsCurrentlyProcessing || !playbackStatus.durationMillis}
                        value={
                          playbackStatus.durationMillis && playbackStatus.durationMillis > 0
                            ? playbackStatus.positionMillis / playbackStatus.durationMillis
                            : 0
                        }
                        minimumTrackTintColor={theme.colors.primary}
                        maximumTrackTintColor='#6c6c6c'
                        thumbTintColor={theme.colors.primary}
                        onSlidingComplete={onSeek}
                      />
                      <Text style={styles.timeText}>{formatTime(playbackStatus.durationMillis)}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.iconButtonContainer}>
                    {itemIsCurrentlyProcessing ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <IconButton
                            icon={ isLocked ? 'lock' : (isCurrentlySelectedItem && isPlaying ? 'pause-circle' : 'play-circle')}
                            disabled={isLocked && !isCurrentlySelectedItem}
                            iconColor={isLocked && !isCurrentlySelectedItem ? theme.colors.onSurfaceDisabled : theme.colors.primary}
                            size={36}
                            onPress={() => { // Re-check conditions for direct button press
                                if (itemIsCurrentlyProcessing) return;
                                if (isLocked && !isCurrentlySelectedItem) {
                                    if (userPlan === "basic") alert("Upgrade to Elite plan."); else alert("Please log in.");
                                    return;
                                }
                                if (isCurrentlySelectedItem) togglePlayPause(); else playAudio(item);
                            }}
                        />
                    )}
                </View>
              </Card.Content>
            </Card>
          );
        })}
      </List.Section>
    </ScrollView>
  );
};


// --- Video Player Tab ---
const VideoPlayerTab: React.FC<MediaTabProps> = ({ isActive, isUserLoggedIn, userPlan }) => {
  const [videoData, setVideoData] = useState<VideoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true); // For fetching list
  const [error, setError] = useState<string | null>(null);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false); // Renamed from isVideoLoading
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); 

  const theme = useTheme();
  const styles = useStyles(theme);
  const videoRef = useRef<Video>(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchVideoData = async () => {
      setIsLoadingList(true);
      setError(null);
      try {
        const response = await axios.get<VideoItem[]>(
          `${REACT_API_URL}/audio-video-page/all_video_data`
        );
        const fetchedData = response.data;
        setVideoData(fetchedData);
        const uniqueCategories = [...new Set(fetchedData.map(video => video.category))];
        setCategories(uniqueCategories);

        if (uniqueCategories.length > 0) {
          const firstCategory = uniqueCategories[0];
          setSelectedCategory(firstCategory);
          const videosInFirstCategory = fetchedData.filter(v => v.category === firstCategory);
          if (videosInFirstCategory.length > 0) {
            setCurrentVideo(videosInFirstCategory[0]);
          } else {
            setCurrentVideo(null);
          }
        } else if (fetchedData.length > 0) {
          setSelectedCategory(null);
          setCurrentVideo(fetchedData[0]);
        } else {
          setSelectedCategory(null);
          setCurrentVideo(null);
        }
      } catch (err) {
        console.error("Error fetching video data:", err);
        setError("Failed to load video data. Please try again later.");
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchVideoData();
  }, []);

  // Effect to load/unload video when currentVideo changes
  useEffect(() => {
    const manageVideoPlayback = async () => {
      if (currentVideo && videoRef.current) {
        setIsVideoBuffering(true); // Indicate start of process
        try {
          console.log(`VideoTab: Unloading previous, then loading: ${currentVideo.title}`);
          await videoRef.current.unloadAsync(); // Unload previous first
          if (isActive) { // Only load and play if the tab is active
            await videoRef.current.loadAsync({ uri: currentVideo.videofile_url }, { shouldPlay: true });
            // onPlaybackStatusUpdate will handle isVideoBuffering and isVideoPlaying
          } else {
            // If tab is not active, just prepare it (load without playing) or simply set source for later
            await videoRef.current.loadAsync({ uri: currentVideo.videofile_url }, { shouldPlay: false });
            setIsVideoBuffering(false); // Loaded but not playing
          }
        } catch (e) {
          console.error("Error loading/playing video:", e);
          alert(`Could not load video: ${currentVideo.title}.`);
          setIsVideoBuffering(false);
        }
      } else if (!currentVideo && videoRef.current) {
        await videoRef.current.unloadAsync();
        setIsVideoPlaying(false);
        setIsVideoBuffering(false);
      }
    };
    manageVideoPlayback();
  }, [currentVideo, isActive]); // Re-run when currentVideo or isActive status changes

  // Effect to pause video when tab becomes inactive
  useEffect(() => {
    if (!isActive && videoRef.current && isVideoPlaying) {
      console.log("VideoTab is now INACTIVE, pausing video.");
      videoRef.current.pauseAsync().catch(e => console.error("Error pausing video on tab switch:", e));
    }
  }, [isActive, isVideoPlaying]);


  const selectVideoToPlay = (video: VideoItem) => {
    if (!isUserLoggedIn && video.id !== videoData[0]?.id) {
      alert("Please log in to play this video."); return;
    }
    if (userPlan === "basic" && video.id !== videoData[0]?.id) {
      alert("Upgrade to Elite plan to access this video."); return;
    }
    
    if (currentVideo?.id === video.id && videoRef.current) {
      // If same video is selected, toggle play or restart if needed (native controls might handle this)
      videoRef.current.getStatusAsync().then(status => {
        if(status.isLoaded && !status.isPlaying) {
          videoRef.current?.playAsync();
        } else if (status.isLoaded && status.isPlaying) {
           // videoRef.current?.pauseAsync(); // Or let user use controls
        }
      });
    } else {
      setCurrentVideo(video); // Triggers the useEffect to load and play
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Video Playback Error: ${status.error}`);
        setIsVideoBuffering(false);
        setIsVideoPlaying(false);
        // Only alert if it's the current video and the tab is active
        if (currentVideo && isActive) {
             alert(`An error occurred while playing ${currentVideo?.title}.`);
        }
      }
      return;
    }
    setIsVideoBuffering(status.isBuffering);
    setIsVideoPlaying(status.isPlaying);
    if (status.didJustFinish) {
      setIsVideoPlaying(false);
    }
  };

  if (isLoadingList) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Loading Videos...</Text></View>;
  }
  if (error) {
    return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
  }
  if (videoData.length === 0) {
    return <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>No video content available.</Text></View>;
  }

  const filteredVideos = selectedCategory ? videoData.filter(video => video.category === selectedCategory) : videoData;
  const nextVideos = filteredVideos.filter(v => v.id !== currentVideo?.id);

  return (
    <ScrollView style={styles.tabContainer} contentContainerStyle={{ paddingBottom: 20 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => {
                setSelectedCategory(category);
                const videosInNewCategory = videoData.filter(v => v.category === category);
                if (videosInNewCategory.length > 0) {
                  if (currentVideo?.id !== videosInNewCategory[0].id) {
                    setCurrentVideo(videosInNewCategory[0]);
                  }
                } else {
                  setCurrentVideo(null);
                }
            }}
            style={[styles.categoryChip, selectedCategory === category && { backgroundColor: theme.colors.primary }]}
            textStyle={[styles.categoryText, selectedCategory === category && { color: theme.colors.onPrimary }]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      {currentVideo ? (
        <Surface style={styles.mainVideoSurface}>
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              style={styles.video} // Make sure this style is {width: '100%', height: '100%'}
              source={ currentVideo ? { uri: currentVideo.videofile_url } : undefined } // Set source directly
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              onError={(errorMessage) => { // This is for player setup errors mainly
                console.error("Video Player Instance Error:", errorMessage);
                setIsVideoBuffering(false);
                setIsVideoPlaying(false);
                if (isActive) alert(`Error initializing video player for: ${currentVideo.title}`);
              }}
            />
            {isVideoBuffering && (
              <View style={styles.videoLoadingOverlay}>
                <ActivityIndicator size="large" color={theme.colors.onPrimary} />
              </View>
            )}
          </View>
          <Card.Content style={styles.mainVideoInfo}>
            <Title style={styles.videoTitleMain} numberOfLines={1}>{currentVideo.title}</Title>
            <Paragraph style={styles.videoSubtitleMain} numberOfLines={2}>{currentVideo.subtitle}</Paragraph>
          </Card.Content>
        </Surface>
      ) : (
         filteredVideos.length > 0 && !currentVideo ?
         <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>Select a video to play.</Text></View> :
         <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>No videos {selectedCategory ? `in "${selectedCategory}"` : "available"}.</Text></View>
      )}

      {nextVideos.length > 0 && (
        <>
          <Title style={styles.nextVideosTitle}>Up Next</Title>
          {nextVideos.map((item) => {
            const isLocked = (userPlan === "basic" || !isUserLoggedIn) && item.id !== videoData[0]?.id;
            return (
              <TouchableOpacity key={item.id} onPress={() => selectVideoToPlay(item)} disabled={isLocked}>
                <Card style={[styles.videoCard, isLocked && styles.lockedItem]}>
                  <Card.Content style={styles.videoCardContent}>
                    <Image
                      source={{ uri: item.coverImage_url }}
                      style={styles.videoThumbnail}
                      onError={() => console.warn(`Failed to load thumbnail: ${item.coverImage_url}`)}
                    />
                    {isLocked && (
                      <View style={styles.lockIconOverlayVideo}>
                        <IconButton icon="lock" iconColor={theme.colors.surface} size={20} style={{ margin: 0 }} />
                      </View>
                    )}
                    <View style={styles.videoItemInfo}>
                      <Title style={styles.videoItemTitle} numberOfLines={1}>{item.title}</Title>
                      <Paragraph style={styles.videoItemSubtitle} numberOfLines={1}>{item.subtitle}</Paragraph>
                    </View>
                    {!isLocked && <IconButton icon="play-circle-outline" size={28} iconColor={theme.colors.primary} style={styles.videoPlayIconSmall} />}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </ScrollView>
  );
};

// --- Main Media Page ---
const MediaPage: React.FC = () => {
  const [index, setIndex] = useState<number>(0);
  const [routes] = useState<TabRoute[]>([
    { key: 'audio', title: 'Audios' },
    { key: 'video', title: 'Videos' },
  ]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(true);
  const [userPlan, setUserPlan] = useState<string | null>('elite');
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  const theme = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoadingAuth(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const loggedIn = true;
      setIsUserLoggedIn(loggedIn);
      if (loggedIn) {
        try {
          const response = await axios.get<{ plan: string }[]>(
            `${REACT_API_URL}/getPlan`,
            { params: { id: "user-id-from-auth" } } // Replace with actual user ID
          );
          setUserPlan(response.data[0]?.plan || 'basic');
        } catch (error) {
          console.error("Error fetching user plan:", error);
          setUserPlan('basic');
        }
      } else {
        setUserPlan(null);
      }
      setIsLoadingAuth(false);
    };
    // checkLoginStatus(); 
  }, []);

  const renderScene = ({ route }: { route: TabRoute }) => {
    if (isLoadingAuth) {
      return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Checking access...</Text></View>;
    }
    switch (route.key) {
      case 'audio':
        return <AudioPlayerTab isActive={index === 0} isUserLoggedIn={isUserLoggedIn} userPlan={userPlan} />;
      case 'video':
        return <VideoPlayerTab isActive={index === 1} isUserLoggedIn={isUserLoggedIn} userPlan={userPlan} />;
      default:
        return null;
    }
  };

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<TabRoute> }
  ) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary }}
      style={{ backgroundColor: theme.colors.elevation.level2 }}
      // labelStyle={{ fontWeight: '600' }}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.onSurfaceVariant}
    />
  );

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
        lazy={({ route }) => route.key !== routes[index].key}
        renderLazyPlaceholder={() => (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}
      />
    </View>
  );
};

// --- Styles ---
const useStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontSize: 16,
  },
  tabContainer: {
    flex: 1,
  },
  categoryScroll: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: theme.colors.elevation.level3,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  listSection: {
    paddingHorizontal: 16,
  },
  audioCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.elevation.level1,
    borderRadius: theme.roundness * 3,
    elevation: 2,
  },
  currentAudioCard: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    backgroundColor: theme.colors.primaryContainer,
  },
  lockedItem: {
    opacity: 0.6,
  },
  processingItem: { // Style to indicate an item is being processed (e.g., loading audio)
    opacity: 0.8, 
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  audioCover: {
    marginRight: 16,
    borderRadius: theme.roundness * 1.5,
    backgroundColor: 'transparent', // Placeholder while image loads
  },
  audioInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  audioTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  audioSubtitle: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  playbackControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    width: 45,
    textAlign: 'center',
  },
  iconButtonContainer: { // Wrapper for IconButton or ActivityIndicator
    width: 48, // Standard touch target size
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 8, // If needed for spacing from audioInfo
  },
  mainVideoSurface: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    elevation: 4,
    borderRadius: theme.roundness * 3,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
   videoContainer: { // Added this
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000', // Placeholder while video loads
  },
  video: { // Style for the Video component itself
    width: '100%',
    height: '100%',
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainVideoInfo: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  videoTitleMain: {
    fontSize: 19,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  videoSubtitleMain: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  nextVideosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 12,
    marginLeft: 16,
    color: theme.colors.onSurface,
  },
  videoCard: {
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: theme.colors.elevation.level1,
    borderRadius: theme.roundness * 3,
    elevation: 2,
  },
  videoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  videoThumbnail: {
    width: 110,
    height: 66,
    borderRadius: theme.roundness * 1.5,
    marginRight: 16,
    backgroundColor: theme.colors.onSurfaceDisabled,
  },
  videoItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  videoItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  videoItemSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  lockIconOverlayVideo: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 110,
    height: 66,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: theme.roundness * 1.5,
  },
  videoPlayIconSmall: {
    marginLeft: 8,
  },
});

type TabRoute = Route & {
  key: string;
  title: string;
};

export default MediaPage;