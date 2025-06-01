import { REACT_APP_URL } from '@/app-config';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

type Thought = {
    content: string;
    audioUrl?: string;
};

export default function TodayThoughts() {
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [currentThought, setCurrentThought] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [audioLoading, setAudioLoading] = useState(false);

    // Fetch thoughts from API
    useEffect(() => {
        const fetchThoughts = async () => {
            try {
                const response = await fetch(REACT_APP_URL + '/todays-thoughts');
                const data = await response.json();
                setThoughts(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching thoughts:', error);
                setIsLoading(false);
            }
        };

        fetchThoughts();
    }, []);

    // Handle audio playback
    useEffect(() => {
        const setupAudio = async () => {
            if (!thoughts[currentThought]?.audioUrl) return;

            try {
                setAudioLoading(true);

                // Unload previous sound if exists
                if (sound) {
                    await sound.unloadAsync();
                }

                // Load new sound
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: thoughts[currentThought].audioUrl },
                    { shouldPlay: false }
                );

                setSound(newSound);

                // Set up playback status listener
                newSound.setOnPlaybackStatusUpdate(status => {
                    if ('isLoaded' in status && status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                    }
                });

                setAudioLoading(false);
            } catch (error) {
                console.error('Audio setup error:', error);
                setAudioLoading(false);
            }
        };

        setupAudio();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [currentThought, thoughts]);

    // Auto-rotate thoughts
    useEffect(() => {
        const timer = setInterval(() => {
            if (thoughts.length > 1 && !isPlaying) {
                setCurrentThought(prev => (prev + 1) % thoughts.length);
            }
        }, 20000); // Increased to 20 seconds

        return () => clearInterval(timer);
    }, [thoughts.length, isPlaying]);

    const toggleAudio = async () => {
        if (!sound || audioLoading) return;

        try {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Audio playback error:', error);
        }
    };

    const handleThoughtChange = async (index: number) => {
        if (sound && isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
        }
        setCurrentThought(index);
    };

    const goToPrevious = () => {
        const newIndex = currentThought === 0 ? thoughts.length - 1 : currentThought - 1;
        handleThoughtChange(newIndex);
    };

    const goToNext = () => {
        const newIndex = (currentThought + 1) % thoughts.length;
        handleThoughtChange(newIndex);
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#FFF7ED', '#FFEDD5']} style={styles.gradient}>
                    <View style={styles.loadingContainer}>
                        <MaterialIcons name="psychology" size={20} color="#EA580C" />
                        <Text style={styles.loadingText}>Loading thoughts...</Text>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    if (thoughts.length === 0) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#FFF7ED', '#FFEDD5']} style={styles.gradient}>
                    <View style={styles.loadingContainer}>
                        <MaterialIcons name="lightbulb-outline" size={20} color="#EA580C" />
                        <Text style={styles.loadingText}>No thoughts today</Text>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.gradient}>
                <View style={styles.content}>
                    {/* Compact Header with Audio Button */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <MaterialIcons name="auto-awesome" size={16} color="#FFF" />
                            <Text style={styles.headerTitle}>Today's Thought</Text>
                            {/* <Text style={styles.counter}>({currentThought + 1}/{thoughts.length})</Text> */}
                        </View>
                        {thoughts[currentThought]?.audioUrl && (
                            <TouchableOpacity
                                onPress={toggleAudio}
                                style={[
                                    styles.audioButtonContainer,
                                    (audioLoading || !sound) && styles.audioButtonDisabled
                                ]}
                                disabled={audioLoading || !sound}
                            >
                                {audioLoading ? (
                                    <MaterialIcons name="hourglass-empty" size={16} color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons
                                            name={isPlaying ? 'pause' : 'play-arrow'}
                                            size={16}
                                            color="#DC6803"
                                        />
                                        <Text style={styles.audioButtonText}>Play</Text>
                                        
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                    </View>

                    {/* Thought Text */}
                    <Text
                        style={styles.thoughtText}
                        // numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {thoughts[currentThought]?.content?.replace(/\n+/g, ' ')}
                    </Text>

                    {/* Compact Navigation */}
                    {thoughts.length > 1 && (
                        <View style={styles.navigation}>
                            <TouchableOpacity style={styles.navButton} onPress={goToPrevious}>
                                <MaterialIcons name="chevron-left" size={20} color="#EA580C" />
                            </TouchableOpacity>

                            <View style={styles.progressContainer}>
                                {thoughts.map((_, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.progressDot,
                                            currentThought === index && styles.activeProgressDot
                                        ]}
                                        onPress={() => handleThoughtChange(index)}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity style={styles.navButton} onPress={goToNext}>
                                <MaterialIcons name="chevron-right" size={20} color="#EA580C" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 6,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    gradient: {
        flex: 1,
        backgroundColor: '#fff7ed',
    },
    content: {
        padding: 16,
        justifyContent: 'space-between',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#DC6803',
        padding: 8,
        borderRadius: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
        marginLeft: 6,
    },
    audioButtonDisabled: {
        opacity: 0.5,
    },
    audioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 14,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#fff',
    },
    audioButtonText: {
        color: '#DC6803',
        fontWeight: '700',
        marginLeft: 4,
    },
    thoughtText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#1F2937',
        fontWeight: '500',
        flex: 1,
        marginBottom: 8, // remove extra space by default
    },
    navigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
        maxWidth: width * 0.5,
    },
    progressDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(234, 88, 12, 0.3)',
        marginHorizontal: 2,
    },
    activeProgressDot: {
        backgroundColor: '#EA580C',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    loadingText: {
        fontSize: 14,
        color: '#EA580C',
        marginLeft: 8,
        fontWeight: '500',
    },
});