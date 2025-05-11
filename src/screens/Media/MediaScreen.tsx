import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  Image
} from 'react-native';
import { 
  TabView, 
  SceneMap, 
  TabBar,
  Route,
  SceneRendererProps,
  NavigationState
} from 'react-native-tab-view';
import { 
  Card, 
  Title, 
  Text, 
  IconButton, 
  Chip,
  useTheme,
  List,
  Avatar
} from 'react-native-paper';
import axios from 'axios';
import Video from 'react-native-video';
import { Audio } from 'expo-av';
import Config from 'react-native-config';
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
  isUserLoggedIn: boolean;
  userPlan: string | null;
};

const AudioPlayerTab: React.FC<MediaTabProps> = ({ isUserLoggedIn=true, userPlan='elite' }) => {
  const [audioData, setAudioData] = useState<AudioItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<AudioItem | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchAudioData = async () => {
      try {
        const response = await axios.get<AudioItem[]>(
          Config.REACT_API_URL + `/audio-video-page/all_audio_data`
        );
        setAudioData(response.data);
        const uniqueCategories = [...new Set(response.data.map((audio) => audio.category))];
        setCategories(uniqueCategories);                
        setSelectedCategory(uniqueCategories[0]);
      } catch (error) {
        console.error("Error fetching audio data:", error);
      }
    };

    fetchAudioData();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playAudio = async (audio: AudioItem) => {
    if ((userPlan === "basic" || !isUserLoggedIn) && audio !== audioData[0]) {
      // Show upgrade prompt
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audio.audiofile_url },
        { shouldPlay: true }
      );
      setSound(newSound);
      setCurrentAudio(audio);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentAudio(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };
  let myurl = Config.REACT_API_URL + `/audio-video-page/all_audio_data`;
  console.log('envv', `${myurl}`, Config.REACT_API_URL);
  const filteredAudios = audioData.filter((audio) => audio.category === selectedCategory);
  return (
    <View style={styles.tabContainer}>
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
            style={[
              styles.categoryChip,
              selectedCategory === category && { 
                backgroundColor: theme.colors.primary 
              }
            ]}
            textStyle={[
              styles.categoryText,
              selectedCategory === category && { 
                color: theme.colors.onPrimary 
              }
            ]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      <List.Section style={styles.listSection}>
        {filteredAudios.map((item, index) => (
          <Card 
            key={item.id} 
            style={[
              styles.audioCard,
              currentAudio?.id === item.id && styles.currentAudioCard
            ]}
            onPress={() => isPlaying && currentAudio?.id === item.id ? stopAudio() : playAudio(item)}
          >
            <Card.Content style={styles.cardContent}>
              <Avatar.Image 
                source={{ uri: item.coverImage_url }} 
                size={60}
                style={styles.audioCover}
              />
              <View style={styles.audioInfo}>
                <Title style={styles.audioTitle}>{item.title}</Title>
                <Text style={styles.audioSubtitle}>{item.subtitle}</Text>
              </View>
              <IconButton
                icon={
                  currentAudio?.id === item.id && isPlaying ? 
                    'pause' : 
                    ((userPlan === "basic" || !isUserLoggedIn) && index !== 0 ? 'lock' : 'play')
                }
                iconColor={theme.colors.onPrimary}
                style={[
                  styles.playButton,
                  { backgroundColor: theme.colors.primary }
                ]}
                size={24}
                onPress={() => isPlaying && currentAudio?.id === item.id ? stopAudio() : playAudio(item)}
                disabled={(userPlan === "basic" || !isUserLoggedIn) && index !== 0}
              />
            </Card.Content>
          </Card>
        ))}
      </List.Section>
    </View>
  );
};

const VideoPlayerTab: React.FC<MediaTabProps> = ({ isUserLoggedIn, userPlan }) => {
  const [videoData, setVideoData] = useState<VideoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.get<VideoItem[]>(
          Config.REACT_API_URL + `/audio-video-page/all_video_data`
        );
        setVideoData(response.data);
        const uniqueCategories = [...new Set(response.data.map(video => video.category))];
        setCategories(uniqueCategories);
        setSelectedCategory(uniqueCategories[0]);
        setCurrentVideo(response.data[0]);
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    fetchVideoData();
  }, []);

  const filteredVideos = videoData.filter(video => video.category === selectedCategory);

  const playVideo = (video: VideoItem) => {
    if ((userPlan === "basic" || !isUserLoggedIn) && video.id !== videoData[0]?.id) {
      // Show upgrade prompt
      return;
    }
    setCurrentVideo(video);
    setIsPaused(false);
  };

  return (
    <View style={styles.tabContainer}>
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
            style={[
              styles.categoryChip,
              selectedCategory === category && { 
                backgroundColor: theme.colors.primary 
              }
            ]}
            textStyle={[
              styles.categoryText,
              selectedCategory === category && { 
                color: theme.colors.onPrimary 
              }
            ]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      {currentVideo && (
        <Card style={styles.mainVideoCard}>
          <Video
            source={{ uri: currentVideo.videofile_url }}
            style={styles.mainVideo}
            paused={isPaused}
            controls={true}
            resizeMode="contain"
          />
          <Card.Content>
            <Title style={styles.videoTitle}>{currentVideo.title}</Title>
            <Text style={styles.videoSubtitle}>{currentVideo.subtitle}</Text>
          </Card.Content>
        </Card>
      )}

      <Title style={styles.sectionTitle}>Next Videos</Title>
      <ScrollView style={styles.videoList}>
        {filteredVideos.map((item, index) => (
          <Card 
            key={item.id}
            style={styles.videoCard}
            onPress={() => playVideo(item)}
          >
            <View style={styles.videoThumbnailContainer}>
              <Card.Cover 
                source={{ uri: item.coverImage_url }} 
                style={[
                  styles.videoThumbnail,
                  (userPlan === "basic" || !isUserLoggedIn) && index !== 0 && styles.lockedThumbnail
                ]}
              />
              {(userPlan === "basic" || !isUserLoggedIn) && index !== 0 && (
                <View style={styles.lockOverlay}>
                  <IconButton 
                    icon="lock" 
                    iconColor="#fff" 
                    size={24}
                    style={styles.lockIcon}
                  />
                </View>
              )}
              <IconButton 
                icon="play-circle" 
                iconColor="#fff" 
                size={36}
                style={styles.playIcon}
              />
            </View>
            <Card.Content>
              <Title 
                style={[
                  styles.videoItemTitle,
                  (userPlan === "basic" || !isUserLoggedIn) && index !== 0 && styles.lockedText
                ]}
              >
                {item.title}
              </Title>
              <Text 
                style={[
                  styles.videoItemSubtitle,
                  (userPlan === "basic" || !isUserLoggedIn) && index !== 0 && styles.lockedText
                ]}
              >
                {item.subtitle}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

type TabRoute = Route & {
  key: string;
  title: string;
};

const MediaPage: React.FC = () => {
  const [index, setIndex] = useState<number>(0);
  const [routes] = useState<TabRoute[]>([
    { key: 'audio', title: 'Audios' },
    { key: 'video', title: 'Videos' },
  ]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const checkLoginStatus = async () => {
      // Check if user is logged in (from AsyncStorage or your auth system)
      const loggedIn = true; // Replace with actual check
      setIsUserLoggedIn(loggedIn);

      if (loggedIn) {
        try {
          const response = await axios.get<{plan: string}[]>(
            Config.REACT_API_URL + `/getPlan`,
            {
              params: {
                id: "user-id-here", // Replace with actual user ID
              },
            }
          );
          setUserPlan(response.data[0]?.plan || null);
        } catch (error) {
          console.error("Error fetching user plan:", error);
        }
      }
    };

    checkLoginStatus();
  }, []);

  const renderScene = SceneMap({
    audio: () => <AudioPlayerTab isUserLoggedIn={isUserLoggedIn} userPlan={userPlan} />,
    video: () => <VideoPlayerTab isUserLoggedIn={isUserLoggedIn} userPlan={userPlan} />,
  });

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<TabRoute> }
  ) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary }}
      style={{ backgroundColor: theme.colors.background }}
      // tabStyle={{ colo: theme.colors.onSurface }}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.onSurface}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
    padding: 16,
  },
  categoryScroll: {
    paddingBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  listSection: {
    flex: 1,
    marginTop: 8,
  },
  audioCard: {
    marginBottom: 12,
    elevation: 2,
  },
  currentAudioCard: {
    borderWidth: 1,
    borderColor: '#FCCC4D',
    backgroundColor: 'rgba(252, 204, 77, 0.1)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  audioCover: {
    marginRight: 16,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  audioSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  playButton: {
    marginLeft: 8,
  },
  mainVideoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  mainVideo: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
  },
  videoTitle: {
    marginTop: 8,
    fontSize: 18,
  },
  videoSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    marginVertical: 12,
    marginLeft: 4,
  },
  videoList: {
    flex: 1,
  },
  videoCard: {
    marginBottom: 12,
    elevation: 2,
  },
  videoThumbnailContainer: {
    position: 'relative',
  },
  videoThumbnail: {
    height: 180,
  },
  lockedThumbnail: {
    opacity: 0.6,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  videoItemTitle: {
    fontSize: 16,
  },
  videoItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  lockedText: {
    opacity: 0.6,
  },
});

export default MediaPage;