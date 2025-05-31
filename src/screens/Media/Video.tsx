import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Text, Dimensions, StyleSheet, Alert } from 'react-native';
import { Chip, Card, Title, Paragraph, IconButton, Surface } from 'react-native-paper';
import axios from 'axios';
import { useTheme } from 'react-native-paper';
import { useVideoPlayer, VideoView } from 'expo-video';
import { REACT_API_URL } from '@/app-config';

type VideoItem = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  videofile_url: string;
  coverImage_url: string;
};

interface MediaTabProps {
  isUserLoggedIn: boolean;
  userPlan: string | null;
}

const VideoPlayerTab_1: React.FC<MediaTabProps> = ({ isUserLoggedIn, userPlan }) => {
  const [videoData, setVideoData] = useState<VideoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;

  // Video player setup
  const player = useVideoPlayer(currentVideo?.videofile_url ?? '', (player) => {
    player.loop = false;
    player.play();
  });

  // Handle player events
  useEffect(() => {
    if (!player) return;

    const playingListener = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    // const bufferingListener = player.addListener('bufferingChange', (event) => {
    //   setIsBuffering(event.isBuffering);
    // });

    return () => {
      playingListener.remove();
    //   bufferingListener.remove();
    };
  }, [player]);

  // Fetch video data
  useEffect(() => {
    const fetchVideoData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<VideoItem[]>(`${REACT_API_URL}/audio-video-page/all_video_data`);
        const fetchedData = response.data;
        setVideoData(fetchedData);
        
        const uniqueCategories = [...new Set(fetchedData.map(v => v.category))];
        setCategories(uniqueCategories);

        if (uniqueCategories.length > 0) {
          const firstCategory = uniqueCategories[0];
          setSelectedCategory(firstCategory);
          setCurrentVideo(fetchedData.find(v => v.category === firstCategory) || null);
        } else if (fetchedData.length > 0) {
          setCurrentVideo(fetchedData[0]);
        }
      } catch (err) {
        console.error('Error fetching video data:', err);
        setError('Failed to load video data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideoData();
  }, []);

  const selectVideoToPlay = (video: VideoItem) => {
    if (!isUserLoggedIn && video.id !== videoData[0]?.id) {
      Alert.alert('Login Required', 'Please log in to play this video.');
      return;
    }
    if (userPlan === 'basic' && video.id !== videoData[0]?.id) {
      Alert.alert('Upgrade Required', 'Upgrade to Elite plan to access this video.');
      return;
    }
    setCurrentVideo(video);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.onSurface }}>Loading Videos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      </View>
    );
  }

  const filteredVideos = selectedCategory 
    ? videoData.filter(v => v.category === selectedCategory)
    : videoData;
  const nextVideos = filteredVideos.filter(v => v.id !== currentVideo?.id);

  return (
    <ScrollView style={styles.tabContainer} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Category Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {categories.map(category => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => {
              setSelectedCategory(category);
              const categoryVideos = videoData.filter(v => v.category === category);
              setCurrentVideo(categoryVideos[0] || null);
            }}
            style={[styles.categoryChip, selectedCategory === category && { 
              backgroundColor: theme.colors.primary 
            }]}
            textStyle={[styles.categoryText, selectedCategory === category && { 
              color: theme.colors.onPrimary 
            }]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      {/* Main Video Player */}
      {currentVideo ? (
        <Surface style={styles.mainVideoSurface}>
          <VideoView
            player={player}
            style={{ width: '100%', height: screenWidth * (9 / 16), backgroundColor: '#000' }}
            allowsFullscreen
            allowsPictureInPicture
          />
          {(isBuffering || !isPlaying) && (
            <View style={styles.videoLoadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.onPrimary} />
            </View>
          )}
          <Card.Content style={styles.mainVideoInfo}>
            <Title style={styles.videoTitleMain} numberOfLines={1}>
              {currentVideo.title}
            </Title>
            <Paragraph style={styles.videoSubtitleMain} numberOfLines={2}>
              {currentVideo.subtitle}
            </Paragraph>
          </Card.Content>
        </Surface>
      ) : (
        <View style={styles.centered}>
          <Text style={{ color: theme.colors.onSurface }}>
            {filteredVideos.length > 0 ? 'Select a video to play' : 'No videos available'}
          </Text>
        </View>
      )}

      {/* Next Videos List */}
      {nextVideos.length > 0 && (
        <>
          <Title style={styles.nextVideosTitle}>Up Next</Title>
          {nextVideos.map(item => {
            const isLocked = (userPlan === 'basic' || !isUserLoggedIn) && item.id !== videoData[0]?.id;
            return (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => selectVideoToPlay(item)} 
                disabled={isLocked}
              >
                <Card style={[styles.videoCard, isLocked && styles.lockedItem]}>
                  <Card.Content style={styles.videoCardContent}>
                    <View style={{ 
                      width: 120, 
                      height: 68, 
                      backgroundColor: '#ddd',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Text style={{ color: '#666' }}>Thumbnail</Text>
                    </View>
                    {isLocked && (
                      <View style={styles.lockIconOverlayVideo}>
                        <IconButton 
                          icon="lock" 
                          iconColor={theme.colors.surface} 
                          size={20} 
                          style={{ margin: 0 }} 
                        />
                      </View>
                    )}
                    <View style={styles.videoItemInfo}>
                      <Title style={styles.videoItemTitle} numberOfLines={1}>
                        {item.title}
                      </Title>
                      <Paragraph style={styles.videoItemSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Paragraph>
                    </View>
                    {!isLocked && (
                      <IconButton 
                        icon="play-circle-outline" 
                        size={28} 
                        iconColor={theme.colors.primary} 
                        style={styles.videoPlayIconSmall} 
                      />
                    )}
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



const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
  },
  categoryScroll: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  categoryText: {
    fontWeight: '600',
  },
  mainVideoSurface: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mainVideoInfo: {
    paddingVertical: 8,
  },
  videoTitleMain: {
    fontWeight: '700',
    fontSize: 18,
  },
  videoSubtitleMain: {
    fontSize: 14,
    color: '#555',
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontWeight: '700',
    fontSize: 16,
  },
  nextVideosTitle: {
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 16,
  },
  videoCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 6,
    elevation: 2,
  },
  videoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedItem: {
    opacity: 0.5,
  },
  lockIconOverlayVideo: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
  },
  videoItemInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  videoItemTitle: {
    fontWeight: '600',
  },
  videoItemSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  videoPlayIconSmall: {
    marginLeft: 8,
  },
});

export default VideoPlayerTab_1;
