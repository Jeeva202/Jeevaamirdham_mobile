import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Audio, AVPlaybackStatus, AVPlaybackStatusError, AVPlaybackStatusSuccess, ResizeMode, Video } from 'expo-av';
import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
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

  // Pause and unload audio when screen loses focus (navigation away)
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        soundRef.current?.pauseAsync().catch(() => {});
        soundRef.current?.unloadAsync().catch(() => {});
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
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  // Debounced setCurrentVideo to reduce lag when switching categories
  const debouncedSetCurrentVideo = useRef(
    debounce((video: VideoItem | null) => {
      setCurrentVideo(video);
    }, 250)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSetCurrentVideo.cancel();
    };
  }, [debouncedSetCurrentVideo]);

  const theme = useTheme();
  const styles = useStyles(theme);
  const videoRef = useRef<Video>(null);
  const screenWidth = Dimensions.get('window').width;

  // Fetch video data
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
            debouncedSetCurrentVideo(videosInFirstCategory[0]);
          } else {
            debouncedSetCurrentVideo(null);
          }
        } else if (fetchedData.length > 0) {
          setSelectedCategory(null);
          debouncedSetCurrentVideo(fetchedData[0]);
        } else {
          setSelectedCategory(null);
          debouncedSetCurrentVideo(null);
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

  // Only auto play after user selects a video, not instantly on tab switch
  useEffect(() => {
    if (isActive && shouldAutoPlay && currentVideo && videoRef.current) {
      videoRef.current.playAsync().catch(() => {});
      setShouldAutoPlay(false);
    }
  }, [isActive, shouldAutoPlay, currentVideo]);

  // Effect to load/unload video when currentVideo changes
  useEffect(() => {
    const manageVideoPlayback = async () => {
      if (currentVideo && videoRef.current) {
        setIsVideoBuffering(true);
        try {
          await videoRef.current.unloadAsync();
          await videoRef.current.loadAsync({ uri: currentVideo.videofile_url }, { shouldPlay: false });
          setIsVideoBuffering(false);
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
  }, [currentVideo, isActive]);

  // Effect to pause video when tab becomes inactive
  useEffect(() => {
    if (!isActive && videoRef.current && isVideoPlaying) {
      console.log("VideoTab is now INACTIVE, pausing video.");
      videoRef.current.pauseAsync().catch(e => console.error("Error pausing video on tab switch:", e));
    }
  }, [isActive, isVideoPlaying]);

  // Pause and unload video when screen loses focus (navigation away)
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (videoRef.current) {
          videoRef.current.pauseAsync().catch(() => {});
          videoRef.current.unloadAsync().catch(() => {});
        }
        setIsVideoPlaying(false);
        setCurrentVideo(null);
      };
    }, [])
  );

  const selectVideoToPlay = (video: VideoItem) => {
    if (!isUserLoggedIn && video.id !== videoData[0]?.id) {
      alert("Please log in to play this video."); return;
    }
    if (userPlan === "basic" && video.id !== videoData[0]?.id) {
      alert("Upgrade to Elite plan to access this video."); return;
    }
    if (currentVideo?.id === video.id && videoRef.current) {
      videoRef.current.getStatusAsync().then(status => {
        if(status.isLoaded && !status.isPlaying) {
          videoRef.current?.playAsync();
        }
      });
    } else {
      setShouldAutoPlay(true);
      debouncedSetCurrentVideo(video);
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
                  debouncedSetCurrentVideo(videosInNewCategory[0]);
                } else {
                  debouncedSetCurrentVideo(null);
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
         <Surface style={styles.mainVideoSurface}>
           <View style={styles.videoContainer}>
             <View style={[styles.video, {backgroundColor: '#000', justifyContent: 'center', alignItems: 'center'}]}>
               <IconButton icon="play-circle-outline" size={64} iconColor={theme.colors.primary} style={{alignSelf: 'center'}} />
             </View>
           </View>
           <Card.Content style={styles.mainVideoInfo}>
             <Title style={styles.videoTitleMain} numberOfLines={1}>No Video Selected</Title>
             <Paragraph style={styles.videoSubtitleMain} numberOfLines={2}>Select a video from the list to start playing.</Paragraph>
           </Card.Content>
         </Surface>
         :
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
      style={{ backgroundColor: '#f9e5ab' }}
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