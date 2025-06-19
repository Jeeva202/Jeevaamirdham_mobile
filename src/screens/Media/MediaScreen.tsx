import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Audio, AVPlaybackStatus, AVPlaybackStatusError, AVPlaybackStatusSuccess, ResizeMode, Video } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Avatar,
  Card,
  Chip,
  IconButton,
  List,
  MD3Theme,
  Paragraph,
  Surface,
  Text,
  Title,
  useTheme,
} from 'react-native-paper';
import {
  NavigationState,
  Route,
  SceneRendererProps,
  TabBar,
  TabView
} from 'react-native-tab-view';

import { REACT_API_URL } from '@/app-config'; // Ensure this path is correct
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  plan: string | null;
};

type TabRoute = Route & {
  key: string;
  title: string;
};

// --- Audio Player Tab ---
const AudioPlayerTab: React.FC<MediaTabProps> = ({ isActive, isUserLoggedIn = true, plan = 'elite' }) => {
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

  // Pause and unload audio when screen loses focus (navigation away)
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        soundRef.current?.pauseAsync().catch(() => { });
        soundRef.current?.unloadAsync().catch(() => { });
        setIsPlaying(false);
        setCurrentAudio(null);
        setPlaybackStatus(null);
      };
    }, [])
  );

  const playAudio = async (audio: AudioItem) => {
    if (isProcessingAudio && currentAudio?.id === audio.id) return; // Prevent re-processing same audio if already busy

    setIsProcessingAudio(true);
    setPlaybackStatus(null); // Reset status for new audio

    if (!isUserLoggedIn && audio.id !== audioData[0]?.id) {
      alert("Please log in to play this audio.");
      setIsProcessingAudio(false);
      return;
    }
    if (plan === "basic" && audio.id !== audioData[0]?.id) {
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
        if (plan === "basic" && currentAudio.id !== audioData[0]?.id) {
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
            style={[styles.categoryChip, selectedCategory === category && { backgroundColor: theme.colors.primary }]}
            textStyle={[styles.categoryText, selectedCategory === category && { color: theme.colors.onPrimary }]}
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
          const isLocked = (plan === "basic" || !isUserLoggedIn) && item.id !== audioData[0]?.id;
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
                  if (plan === "basic") alert("Upgrade to Elite plan to access this audio.");
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
                      icon={isLocked ? 'lock' : (isCurrentlySelectedItem && isPlaying ? 'pause-circle' : 'play-circle')}
                      disabled={isLocked && !isCurrentlySelectedItem}
                      iconColor={isLocked && !isCurrentlySelectedItem ? theme.colors.onSurfaceDisabled : theme.colors.primary}
                      size={36}
                      onPress={() => { // Re-check conditions for direct button press
                        if (itemIsCurrentlyProcessing) return;
                        if (isLocked && !isCurrentlySelectedItem) {
                          if (plan === "basic") alert("Upgrade to Elite plan."); else alert("Please log in.");
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


// const VideoPlayerTab: React.FC<MediaTabProps> = ({ isActive, isUserLoggedIn, plan }) => {
//   const [videoData, setVideoData] = useState<VideoItem[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
//   const [isLoadingList, setIsLoadingList] = useState<boolean>(true); // For fetching list
//   const [error, setError] = useState<string | null>(null);
//   const [isVideoBuffering, setIsVideoBuffering] = useState(false);
//   const [isVideoPlaying, setIsVideoPlaying] = useState(false);
//   const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

//   const videoRef = useRef<Video>(null);

//   const theme = useTheme();
//   const styles = useStyles(theme);

//   // Debounced setCurrentVideo to reduce lag when switching categories
//   const debouncedSetCurrentVideo = useCallback(
//     debounce((video: VideoItem | null) => {
//       setCurrentVideo(video);
//     }, 250),
//     []
//   );

//   // Clean up debounce on unmount
//   useEffect(() => {
//     return () => {
//       debouncedSetCurrentVideo.cancel();
//     };
//   }, [debouncedSetCurrentVideo]);

//   // --- Data Fetching Effect ---
//   // --- Data Fetching Effect ---
//   useEffect(() => {
//     const fetchVideoData = async () => {
//       setIsLoadingList(true);
//       setError(null);
//       try {
//         const response = await fetch(`${REACT_API_URL}/audio-video-page/all_video_data`);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const fetchedData: VideoItem[] = await response.json();
//         setVideoData(fetchedData);

//         const uniqueCategories = [...new Set(fetchedData.map(video => video.category))];
//         setCategories(uniqueCategories);

//         let initialVideo: VideoItem | null = null;
//         if (uniqueCategories.length > 0) {
//           const firstCategory = uniqueCategories[0];
//           setSelectedCategory(firstCategory);
//           const videosInFirstCategory = fetchedData.filter(v => v.category === firstCategory);
//           if (videosInFirstCategory.length > 0) {
//             initialVideo = videosInFirstCategory[0];
//           }
//         } else if (fetchedData.length > 0) {
//           setSelectedCategory(null);
//           initialVideo = fetchedData[0];
//         } else {
//           setSelectedCategory(null);
//           initialVideo = null;
//         }
//         setCurrentVideo(initialVideo);
//         // REMOVE THIS LINE:
//         // if (initialVideo) {
//         //   setShouldAutoPlay(true);
//         // }
//       } catch (err: any) {
//         console.error("Error fetching video data:", err);
//         setError(`Failed to load video data: ${err.message || "Unknown error"}. Please try again later.`);
//       } finally {
//         setIsLoadingList(false);
//       }
//     };
//     fetchVideoData();
//   }, []);
//   // --- Video Playback Control Effect (now reacts to currentVideo and shouldAutoPlay) ---
//   useEffect(() => {
//     const videoInstance = videoRef.current;

//     if (!videoInstance) {
//       console.warn("videoRef.current is null in playback control effect. This should not happen if Video is always rendered.");
//       return;
//     }

//     const managePlayback = async () => {
//       if (currentVideo) {
//         // If a video is selected, manage its playback state.
//         // Source is now handled by the <Video> component's `source` prop.
//         setIsVideoBuffering(true); // Assume buffering until status update
//         if (shouldAutoPlay) {
//           console.log("Attempting to auto-play due to shouldAutoPlay.");
//           try {
//             await videoInstance.playAsync();
//             setShouldAutoPlay(false); // Reset after attempting to play
//           } catch (e) {
//             console.error("Error auto-playing video:", e);
//             // Error handling for playback already in onPlaybackStatusUpdate
//           }
//         }
//       } else {
//         // If currentVideo is null (no video selected), ensure it's stopped.
//         // This will effectively "unload" the previous video as the source prop will become null.
//         try {
//           const status = await videoInstance.getStatusAsync();
//           if (status.isLoaded) {
//             await videoInstance.stopAsync(); // Stop and unload current media
//           }
//         } catch (e) {
//           console.error("Error stopping video when currentVideo is null:", e);
//         }
//         setIsVideoPlaying(false);
//         setIsVideoBuffering(false);
//       }
//     };

//     managePlayback();

//     // Cleanup: Ensure video is stopped when component unmounts or currentVideo changes.
//     return () => {
//       const cleanupOnUnmountOrChange = async () => {
//         if (videoInstance) {
//           try {
//             const status = await videoInstance.getStatusAsync();
//             if (status.isLoaded && status.isPlaying) {
//               await videoInstance.stopAsync(); // Stop and release resources
//               setIsVideoPlaying(false);
//               setIsVideoBuffering(false);
//             }
//           } catch (e) {
//             console.error("Error stopping video on cleanup:", e);
//           }
//         }
//       };
//       cleanupOnUnmountOrChange();
//     };
//   }, [currentVideo, shouldAutoPlay]); // Re-run when currentVideo or shouldAutoPlay changes


//   // --- Tab Active State Management (Pause/Play) ---
//   useEffect(() => {
//     const handleTabActivity = async () => {
//       const videoInstance = videoRef.current;
//       if (!videoInstance) return; // Should now always be available if component is mounted

//       if (isActive) {
//         // If tab becomes active and a video is selected, attempt to play/resume
//         if (currentVideo) {
//           console.log("VideoTab is now ACTIVE, attempting to play/resume video.");
//           try {
//             const status = await videoInstance.getStatusAsync();
//             if (status.isLoaded && !status.isPlaying) {
//               await videoInstance.playAsync();
//             }
//           } catch (e) {
//             console.error("Error resuming video on tab activation:", e);
//           }
//         }
//       } else {
//         // If tab becomes inactive and video is playing, pause it
//         console.log("VideoTab is now INACTIVE, pausing video.");
//         try {
//           const status = await videoInstance.getStatusAsync();
//           if (status.isLoaded && status.isPlaying) {
//             await videoInstance.pauseAsync();
//           }
//         } catch (e) {
//           console.error("Error pausing video on tab switch:", e);
//         }
//       }
//     };
//     handleTabActivity();
//   }, [isActive, currentVideo]); // Depend on isActive and currentVideo (isVideoPlaying comes from status update)

//   // --- Focus Effect for Navigation Away ---
//   useFocusEffect(
//     useCallback(() => {
//       return async () => {
//         const videoInstance = videoRef.current;
//         if (videoInstance) {
//           // Pause and unload when screen loses focus (e.g., navigating to another screen)
//           console.log("Screen losing focus, stopping video.");
//           try {
//             const status = await videoInstance.getStatusAsync();
//             if (status.isLoaded) {
//               await videoInstance.stopAsync(); // Stop and unload completely
//             }
//           } catch (e) {
//             console.error("Error stopping video on focus loss:", e);
//           }
//         }
//         setIsVideoPlaying(false);
//         setIsVideoBuffering(false);
//         setCurrentVideo(null); // Clear current video when leaving the screen
//         setShouldAutoPlay(false); // Reset auto-play flag
//       };
//     }, [])
//   );

//   // --- Video Selection Logic ---
//   const selectVideoToPlay = (video: VideoItem) => {
//     // Check for login/plan restrictions
//     if (!isUserLoggedIn && video.id !== videoData[0]?.id) {
//       alert("Please log in to play this video.");
//       return;
//     }
//     if (plan === "basic" && video.id !== videoData[0]?.id) {
//       alert("Upgrade to Elite plan to access this video.");
//       return;
//     }

//     // If the same video is selected and it's paused, play it
//     if (currentVideo?.id === video.id && videoRef.current) {
//       videoRef.current.getStatusAsync().then(status => {
//         if (status.isLoaded && !status.isPlaying) {
//           console.log("Playing same video which was paused.");
//           videoRef.current?.playAsync().catch(e => console.error("Error playing same video:", e));
//         }
//       });
//     } else {
//       // If a different video is selected, set it as current and enable auto-play
//       console.log("New video selected, setting to auto-play.");
//       setShouldAutoPlay(true); // <--- KEEP THIS HERE
//       debouncedSetCurrentVideo(video);
//     }
//   };

//   // --- Playback Status Update Handler ---
//   const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
//     if (!status.isLoaded) {
//       if (status.error) {
//         console.error(`Video Playback Error: ${status.error}`);
//         setIsVideoBuffering(false);
//         setIsVideoPlaying(false);
//         // Only alert if it's the current video and the tab is active
//         if (currentVideo && isActive) {
//           alert(`An error occurred while playing ${currentVideo?.title}. Error: ${status.error}`);
//         }
//       }
//       return;
//     }
//     setIsVideoBuffering(status.isBuffering);
//     setIsVideoPlaying(status.isPlaying);
//     if (status.didJustFinish) {
//       setIsVideoPlaying(false);
//       // Optionally, you could automatically play the next video here
//     }
//   }, [currentVideo, isActive]); // Depend on currentVideo and isActive for accurate alerts

//   // --- Render Logic for Loading, Error, No Content ---
//   if (isLoadingList) {
//     return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Loading Videos...</Text></View>;
//   }
//   if (error) {
//     return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
//   }
//   if (videoData.length === 0) {
//     return <View style={styles.centered}><Text style={{ color: theme.colors.onSurface }}>No video content available.</Text></View>;
//   }

//   // Filter videos for display
//   const filteredVideos = selectedCategory ? videoData.filter(video => video.category === selectedCategory) : videoData;
//   const nextVideos = filteredVideos.filter(v => v.id !== currentVideo?.id);

//   return (
//     <ScrollView style={styles.tabContainer} contentContainerStyle={{ paddingBottom: 20 }}>
//       {/* Category Chips */}
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
//                 setShouldAutoPlay(true); // <--- KEEP THIS HERE
//                 debouncedSetCurrentVideo(videosInNewCategory[0]);
//               } else {
//                 debouncedSetCurrentVideo(null); // No videos in this category
//               }
//             }}
//             style={[styles.categoryChip, selectedCategory === category && { backgroundColor: theme.colors.primary }]}
//             textStyle={[styles.categoryText, selectedCategory === category && { color: theme.colors.onPrimary }]}
//           >
//             {category}
//           </Chip>
//         ))}
//       </ScrollView>

//       {/* Main Video Player Section */}
//       <Surface style={styles.mainVideoSurface}>
//         <View style={styles.videoContainer}>
//           {/* Always render the Video component */}
//           <Video
//             ref={videoRef}
//             style={styles.video}
//             // Source is managed by the useEffect now, setting it to null unloads any prior video
//             source={currentVideo ? { uri: currentVideo.videofile_url } : undefined}
//             useNativeControls
//             resizeMode={ResizeMode.CONTAIN}
//             onPlaybackStatusUpdate={onPlaybackStatusUpdate}
//             onError={(errorMessage) => { // This is for player setup errors mainly
//               console.error("Video Player Instance Error:", errorMessage);
//               setIsVideoBuffering(false);
//               setIsVideoPlaying(false);
//               if (isActive && currentVideo) alert(`Error initializing video player for: ${currentVideo.title}`);
//             }}
//           />

//           {isVideoBuffering && (
//             <View style={styles.videoLoadingOverlay}>
//               <ActivityIndicator size="large" color={theme.colors.onPrimary} />
//             </View>
//           )}

//           {/* Placeholder for when no current video is selected */}
//           {!currentVideo && (
//             <View style={[styles.video, { position: 'absolute', backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
//               <IconButton icon="play-circle-outline" size={64} iconColor={theme.colors.primary} style={{ alignSelf: 'center' }} />
//             </View>
//           )}
//         </View>

//         <Card.Content style={styles.mainVideoInfo}>
//           <Title style={styles.videoTitleMain} numberOfLines={1}>
//             {currentVideo ? currentVideo.title : (filteredVideos.length > 0 ? "No Video Selected" : "No videos available")}
//           </Title>
//           <Paragraph style={styles.videoSubtitleMain} numberOfLines={2}>
//             {currentVideo ? currentVideo.subtitle : (filteredVideos.length > 0 ? "Select a video from the list to start playing." : "Try a different category or check back later.")}
//           </Paragraph>
//         </Card.Content>
//       </Surface>

//       {/* Up Next Videos List */}
//       {nextVideos.length > 0 && (
//         <>
//           <Title style={styles.nextVideosTitle}>Up Next</Title>
//           {nextVideos.map((item) => {
//             const isLocked = (plan === "basic" || !isUserLoggedIn) && item.id !== videoData[0]?.id;
//             return (
//               <TouchableOpacity key={item.id} onPress={() => selectVideoToPlay(item)} disabled={isLocked}>
//                 <Card style={[styles.videoCard, isLocked && styles.lockedItem]}>
//                   <Card.Content style={styles.videoCardContent}>
//                     {isLocked ? (
//                       <View style={styles.lockIconOverlayVideo}>
//                         <IconButton icon="lock" iconColor={theme.colors.surface} size={20} style={{ margin: 0 }} />
//                       </View>
//                     ) : (
//                       <Image
//                         source={{ uri: item.coverImage_url }}
//                         style={styles.videoThumbnail}
//                         onError={() => console.warn(`Failed to load thumbnail: ${item.coverImage_url}`)}
//                       />
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

const VideoPlayerTab: React.FC<MediaTabProps> = ({ isActive, isUserLoggedIn, plan }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const videoRef = useRef<Video>(null);
  const shouldPlayRef = useRef<boolean>(false);
  const [videoData, setVideoData] = useState<VideoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Fetch video data
  useEffect(() => {
    const fetchVideoData = async () => {
      setIsLoadingList(true);
      setError(null);
      try {
        const response = await axios.get<VideoItem[]>(`${REACT_API_URL}/audio-video-page/all_video_data`);
        const fetchedData = response.data;
        setVideoData(fetchedData);

        const uniqueCategories = [...new Set(fetchedData.map(video => video.category))];
        setCategories(uniqueCategories);

        let initialVideo: VideoItem | null = null;
        if (uniqueCategories.length > 0) {
          const firstCategory = uniqueCategories[0];
          setSelectedCategory(firstCategory);
          const videosInFirstCategory = fetchedData.filter(v => v.category === firstCategory);
          initialVideo = videosInFirstCategory[0] || null;
        } else if (fetchedData.length > 0) {
          setSelectedCategory(null);
          initialVideo = fetchedData[0];
        } else {
          setSelectedCategory(null);
          initialVideo = null;
        }
        setCurrentVideo(initialVideo);
        shouldPlayRef.current = !!initialVideo; // Autoplay initial video if available
      } catch (err: any) {
        console.error("Error fetching video data:", err);
        setError(`Failed to load video data: ${err.message || "Unknown error"}. Please try again later.`);
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchVideoData();
  }, []);

  // Safe cleanup function
  const safeCleanup = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      const status = await videoRef.current.getStatusAsync();
      if (status.isLoaded) {
        await videoRef.current.stopAsync();
        await videoRef.current.unloadAsync();
      }
    } catch (e: any) {
      if (!e.message.includes("Cannot complete operation because the Video component has not yet loaded")) {
        console.error("Error during safe cleanup:", e);
      }
    }
  }, []);

  // Manage video playback and source
  useEffect(() => {
    const videoInstance = videoRef.current;
    if (!videoInstance) return;

    const manageVideo = async () => {
      try {
        if (currentVideo) {
          setIsVideoBuffering(true);
          await videoInstance.loadAsync({ uri: currentVideo.videofile_url }, { shouldPlay: shouldPlayRef.current && isActive });
          if (shouldPlayRef.current && isActive) {
            await videoInstance.playAsync();
          }
        } else {
          await safeCleanup();
        }
      } catch (e) {
        console.error("Error managing video:", e);
        setIsVideoBuffering(false);
        setIsVideoPlaying(false);
        if (currentVideo && isActive) {
          alert(`Error loading video: ${currentVideo.title}`);
        }
      }
    };

    manageVideo();

    return () => {
      safeCleanup();
    };
  }, [currentVideo, isActive, safeCleanup]);

  // Handle tab active/inactive state
  useEffect(() => {
    const handleTabActivity = async () => {
      if (!videoRef.current || !currentVideo) return;

      try {
        const status = await videoRef.current.getStatusAsync();
        if (isActive && shouldPlayRef.current && status.isLoaded && !status.isPlaying) {
          await videoRef.current.playAsync();
        } else if (!isActive && status.isLoaded && status.isPlaying) {
          await videoRef.current.pauseAsync();
        }
      } catch (e: any) {
        console.error("Error handling tab activity:", e);
      }
    };
    handleTabActivity();
  }, [isActive, currentVideo]);

  // Handle navigation focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        safeCleanup();
        setIsVideoPlaying(false);
        setIsVideoBuffering(false);
        setCurrentVideo(null);
        shouldPlayRef.current = false;
      };
    }, [safeCleanup])
  );

  // Video selection logic
  const selectVideoToPlay = useCallback((video: VideoItem) => {
    if (!isUserLoggedIn && video.id !== videoData[0]?.id) {
      alert("Please log in to play this video.");
      return;
    }
    if (plan === "basic" && video.id !== videoData[0]?.id) {
      alert("Upgrade to Elite plan to access this video.");
      return;
    }

    if (currentVideo?.id === video.id && videoRef.current) {
      videoRef.current.getStatusAsync().then(status => {
        if (status.isLoaded && !status.isPlaying) {
          videoRef.current?.playAsync().catch(e => console.error("Error playing same video:", e));
          setIsVideoPlaying(true);
        }
      });
    } else {
      shouldPlayRef.current = true; // Enable autoplay for new video
      setCurrentVideo(video);
    }
  }, [currentVideo, isUserLoggedIn, plan, videoData]);

  // Playback status update
  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Video Playback Error: ${status.error}`);
        setIsVideoBuffering(false);
        setIsVideoPlaying(false);
        if (currentVideo && isActive) {
          alert(`An error occurred while playing ${currentVideo.title}. Error: ${status.error}`);
        }
      }
      return;
    }
    setIsVideoBuffering(status.isBuffering);
    setIsVideoPlaying(status.isPlaying);
    if (status.didJustFinish) {
      setIsVideoPlaying(false);
      shouldPlayRef.current = false;
    }
  }, [currentVideo, isActive]);

  // Render logic
  if (isLoadingList) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Loading Videos...</Text>
      </View>
    );
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
                shouldPlayRef.current = true; // Autoplay first video in new category
                setCurrentVideo(videosInNewCategory[0]);
              } else {
                setCurrentVideo(null);
                shouldPlayRef.current = false;
              }
            }}
            style={[styles.categoryChip, selectedCategory === category && { backgroundColor: theme.colors.primary }]}
            textStyle={[styles.categoryText, selectedCategory === category && { color: theme.colors.onPrimary }]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      <Surface style={styles.mainVideoSurface}>
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            style={styles.video}
            source={currentVideo ? { uri: currentVideo.videofile_url } : undefined}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            onError={(errorMessage) => {
              console.error("Video Player Instance Error:", errorMessage);
              setIsVideoBuffering(false);
              setIsVideoPlaying(false);
              if (isActive && currentVideo) alert(`Error initializing video player for: ${currentVideo.title}`);
            }}
          />
          {isVideoBuffering && (
            <View style={styles.videoLoadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.onPrimary} />
            </View>
          )}
          {!currentVideo && (
            <View style={[styles.video, { position: 'absolute', backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
              <IconButton icon="play-circle-outline" size={64} iconColor={theme.colors.primary} style={{ alignSelf: 'center' }} />
            </View>
          )}
        </View>
        <Card.Content style={styles.mainVideoInfo}>
          <Title style={styles.videoTitleMain} numberOfLines={1}>
            {currentVideo ? currentVideo.title : (filteredVideos.length > 0 ? "No Video Selected" : "No videos available")}
          </Title>
          <Paragraph style={styles.videoSubtitleMain} numberOfLines={2}>
            {currentVideo ? currentVideo.subtitle : (filteredVideos.length > 0 ? "Select a video from the list to start playing." : "Try a different category or check back later.")}
          </Paragraph>
        </Card.Content>
      </Surface>

      {nextVideos.length > 0 && (
        <>
          <Title style={styles.nextVideosTitle}>Up Next</Title>
          {nextVideos.map((item) => {
            const isLocked = (plan === "basic" || !isUserLoggedIn) && item.id !== videoData[0]?.id;
            return (
              <TouchableOpacity key={item.id} onPress={() => selectVideoToPlay(item)} disabled={isLocked}>
                <Card style={[styles.videoCard, isLocked && styles.lockedItem]}>
                  <Card.Content style={styles.videoCardContent}>
                    {isLocked ? (
                      <View style={styles.lockIconOverlayVideo}>
                        <IconButton icon="lock" iconColor={theme.colors.surface} size={20} style={{ margin: 0 }} />
                      </View>
                    ) : (
                      <Image
                        source={{ uri: item.coverImage_url }}
                        style={styles.videoThumbnail}
                        onError={() => console.warn(`Failed to load thumbnail: ${item.coverImage_url}`)}
                      />
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
  const [userPlan, setplan] = useState<string | null>('elite');
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const [plan, setPlan] = useState('')
  const [userId, setUserId] = useState('')
  const theme = useTheme();
  const styles = useStyles(theme);

  React.useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userObj = JSON.parse(userString);
          const response = await axios.get(
            REACT_API_URL + `/getPlanEvenItisExpired`,

            {
              params: {
                id: userObj.userId
              },
            }
          );
          setUserId(userObj.userId);
          setPlan(response.data[0].plan)
        }
      } catch (e) {
        console.log('Failed to load user information.');
      }
    };
    fetchUserId();
  }, []);

  const renderScene = ({ route }: { route: TabRoute }) => {
    if (isLoadingAuth) {
      return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Checking access...</Text></View>;
    }
    switch (route.key) {
      case 'audio':
        return <AudioPlayerTab isActive={index === 0} isUserLoggedIn={isUserLoggedIn} plan={plan} />;
      case 'video':
        return <VideoPlayerTab isActive={index === 1} isUserLoggedIn={isUserLoggedIn} plan={plan} />;
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
      style={{ backgroundColor: '#f9e5ab' }}
      // labelStyle={{ fontWeight: '600' }}
      activeColor={theme.colors.primary}
      inactiveColor={'#333'}
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
    backgroundColor: '#f9e5ab', // Light yellow background
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
    marginVertical: 8,
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
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    marginRight: 10,
    width: 100,
    height: 66,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: theme.roundness * 1.5,
  },
  videoPlayIconSmall: {
    marginLeft: 8,
  },
});



export default MediaPage;  