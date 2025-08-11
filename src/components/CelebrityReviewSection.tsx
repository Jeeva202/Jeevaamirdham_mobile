import { REACT_APP_URL } from '@/app-config';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CelebrityReview from './CelebrityReview';

interface VideoItem {
  id?: string | number;
  title: string;
  coverImage_url: string;
  videofile_url: string;
}

const CelebrityReviewSection = () => {
  const [videos, setVideos] = useState<Array<{
    id: string;
    title: string;
    thumbnail: string;
    videoUrl: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${REACT_APP_URL}/audio-video-page/all_video_data`);
        const data: VideoItem[] = response.data.filter(
          (item: any) => item.category === 'Review'
        );
        const mapped = data.map((item: VideoItem) => ({
          id: item.id?.toString() || Math.random().toString(),
          title: item.title,
          thumbnail: item.coverImage_url,
          videoUrl: item.videofile_url,
        }));
        setVideos(mapped);
      } catch (err) {
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading || error || !videos.length) return null;

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Jeevaamirdham Book Reviews</Text>
      </View>
      <CelebrityReview data={videos} />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
    direction: 'ltr',
    letterSpacing: -0.5,
  },
});

export default CelebrityReviewSection;
