import { MaterialIcons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export type CelebrityReviewItem = {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
};

interface CelebrityReviewProps {
  data: CelebrityReviewItem[];
}

const CARD_WIDTH = width * 0.38;

const CelebrityReview: React.FC<CelebrityReviewProps> = ({ data }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<CelebrityReviewItem | null>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const flatListRef = React.useRef<FlatList>(null);

  const openModal = (item: CelebrityReviewItem) => {
    setSelectedVideo(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedVideo(null);
  };

  const scrollToIndex = (index: number) => {
    setScrollIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  return (
    <View style={styles.sectionContainer}>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingVertical: 6 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openModal(item)}
            activeOpacity={0.85}
          >
            <View style={styles.cardImageWrapper}>
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.85)"]}
                style={styles.gradientOverlay}
              />
              <View style={styles.playButtonOverlay}>
                <MaterialIcons name="play-circle-filled" size={44} color="#FFF" style={{ textShadowColor: '#FF6B35', textShadowRadius: 8 }} />
              </View>
            </View>
            <View style={styles.cardTitleWrapper}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            </View>
            <View style={styles.cardBorder} />
          </TouchableOpacity>
        )}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
          setScrollIndex(idx);
        }}
        style={{ marginLeft: 2 }}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedVideo?.title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <MaterialIcons name="close" size={28} color="#EA580C" />
            </TouchableOpacity>
            {selectedVideo && (
              <Video
                source={{ uri: selectedVideo.videoUrl }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode={"contain" as any}
                shouldPlay
                useNativeControls
                style={styles.videoPlayer}
              />
            )}
            
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 8,
  },
  card: {
    width: CARD_WIDTH,
    height: 240,
    marginRight: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 2,
    position: 'relative',
  },
  cardImageWrapper: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: 160,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -22 }, { translateY: -22 }],
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingBottom: 12,
    zIndex: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: 'transparent',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 4,
    elevation: 2,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
    zIndex: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.92,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 8,
    zIndex: 2,
  },
  videoPlayer: {
    width: '100%',
    height: width * 1.5,
    borderRadius: 12,
    backgroundColor: '#000',
    marginTop: 24,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
});

export default CelebrityReview;
