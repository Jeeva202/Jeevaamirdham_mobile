import { REACT_API_URL } from '@/app-config';
import IndividualHeader from '@/src/components/header/IndividualHeader';
import { RootStackParamList } from '@/src/navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Loader } from './EmagazineScreen';

const { width, height } = Dimensions.get('window');

type MonthName = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
type Props = StackScreenProps<RootStackParamList, 'MagazineDetails'>;
type MagazineDetailsRouteProp = RouteProp<RootStackParamList, 'MagazineDetails'>;

const fetchMagazineDetails = async (year: number, month: MonthName) => {
    const monthMapping: Record<MonthName, number> = {
        January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
        July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
    };
    const monthNumber = monthMapping[month];
    const { data } = await axios.get(`${REACT_API_URL}/emagazine-page/magazine-details`, {
        params: { year, month: monthNumber },
    });
    return data;
};


export default function MagazineDetailsScreen() {
    const route = useRoute<MagazineDetailsRouteProp>();
    const navigation = useNavigation<Props['navigation']>();
    const { year, month } = route.params;
    const dispatch = useDispatch();

    // Ensure month is of type MonthName
    const monthNames: MonthName[] = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const safeMonth = monthNames.includes(month as MonthName) ? (month as MonthName) : 'January';

    const { data: magazine, isLoading, error, refetch, isRefetching } = useQuery(
        ['magazine', year, safeMonth],
        () => fetchMagazineDetails(year, safeMonth)
    );

    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
    const isAccountExpired = useSelector((state: RootState) => state.user.isAccountExpired);
    const [modalVisible, setModalVisible] = useState(false);
      const [plan, setPlan] = useState('')
      const [userId, setUserId] = useState('')

    const monthMapping: Record<MonthName, number> = {
        January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
        July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
    };

    // Memoize processed description and summary to avoid recalculating on every render
    const processedDescription = useMemo(() =>
        magazine?.description ? magazine.description.replace(/\n/g, ' ') : 'No description available at the moment.',
        [magazine?.description]
    );
    const processedSummary = useMemo(() =>
        magazine?.shortDesc || '',
        [magazine?.shortDesc]
    );

          React.useEffect(() => {
            const fetchUserId = async () => {
                try {
                    const userString = await AsyncStorage.getItem('user');
                    if (userString) {
                        const userObj = JSON.parse(userString);
                        const response = await axios.get(
                        REACT_API_URL + `/getPlan`,
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

    // Fetch audio data with useQuery for better loading state and caching
    const {
        data: audioData,
        isLoading: isAudioLoading,
        error: audioError,
        refetch: refetchAudio,
        isRefetching: isAudioRefetching
    } = useQuery(
        ['emagazine-audio', year, safeMonth, userId],
        async () => {
            const { data } = await axios.get(`${REACT_API_URL}/emagazine-page/audiofile`, {
                params: { uid: userId, year, month: monthMapping[safeMonth] },
            });
            return data;
        },
        { enabled: !!userId && !!year && !!safeMonth }
    );

    if (isLoading) return <Loader />;
    if (error || !magazine) return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load magazine</Text>
            <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
        </View>
    );

    const handleListen = () => {
        // Navigate immediately, let AudioPlayerScreen handle loading
        navigation.navigate('AudioPlayer', { year, month: safeMonth, audioData: [] });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Hero Section with Magazine Cover */}
            <View style={styles.heroSection}>
                <ImageBackground
                    source={{ uri: magazine.imgUrl }}
                    style={styles.heroImage}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.heroGradient}
                    >
                        <IndividualHeader headerName = {''} />
                        {/* Magazine Info Overlay */}
                        <View style={styles.heroContent}>
                            <View style={styles.metadataContainer}>
                                <View style={styles.yearMonthBadge}>
                                    <Text style={styles.yearMonthText}>{safeMonth} {year}</Text>
                                </View>
                            </View>
                            <Text style={styles.heroTitle}>{magazine.title}</Text>
                            <Text style={styles.heroAuthor}>by {magazine.author}</Text>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </View>
            {/* Content Section */}
            <ScrollView
                style={styles.contentSection}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isAudioRefetching}
                        onRefresh={refetchAudio}
                        colors={["#F09300"]}
                        tintColor="#F09300"
                    />
                }
            >
                {/* Action Button */}
                <TouchableOpacity style={styles.listenButton} onPress={handleListen} activeOpacity={0.9} disabled={isAudioLoading || isAudioRefetching}>
                    <LinearGradient
                        colors={['#FF6B35', '#F7931E', '#FFD700']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <View style={styles.buttonContent}>
                            {(isAudioLoading || isAudioRefetching) ? (
                                <IconButton icon="loading" iconColor="#FFFFFF" size={28} />
                            ) : (
                                <IconButton icon="play-circle" iconColor="#FFFFFF" size={28} />
                            )}
                            <Text style={styles.buttonText}>{(isAudioLoading || isAudioRefetching) ? 'LOADING...' : 'LISTEN NOW'}</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
                {/* Quick Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.sectionTitle}>Summary</Text>
                    <Text style={styles.shortDescription}>{processedSummary}</Text>
                </View>
                {/* Full Description */}
                <View style={styles.descriptionCard}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.fullDescription}>{processedDescription}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9e5ab',
    },

    heroSection: {
        height: height * 0.6,
        position: 'relative',
    },

    heroImage: {
        flex: 1,
        width: '100%',
    },

    heroGradient: {
        flex: 1,
        justifyContent: 'space-between',
    },

    headerControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    controlButton: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    iconButton: {
        // backgroundColor: '#E68E00',
        backgroundColor: '#F09300',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    blurButton: {
        borderRadius: 25,
        padding: 4,
    },

    heroContent: {
        alignItems: 'flex-start',
        paddingBottom: 32,
        paddingHorizontal: 24,
    },

    metadataContainer: {
        marginBottom: 16,
    },

    yearMonthBadge: {
        backgroundColor: 'rgba(255, 107, 53, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backdropFilter: 'blur(10px)',
    },

    yearMonthText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
        lineHeight: 38,
        letterSpacing: -0.5,
    },

    heroAuthor: {
        fontSize: 18,
        color: '#FFFFFF',
        opacity: 0.8,
        fontWeight: '500',
        fontStyle: 'italic',
    },

    contentSection: {
        flex: 1,
        backgroundColor: '#f9e5ab',
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },

    scrollContent: {
        paddingTop: 32,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },

    summaryCard: {
        backgroundColor: 'rgb(255, 255, 255)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 53, 0.1)',
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#DC6803',
        marginBottom: 12,
        letterSpacing: 0.5,
    },

    shortDescription: {
        fontSize: 16,
        color: '#oafoaf',
        opacity: 0.8,
        lineHeight: 24,
        fontWeight: '400',
    },

    listenButton: {
        borderRadius: 30,
        marginBottom: 32,
        elevation: 8,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },

    buttonGradient: {
        borderRadius: 30,
        padding: 8,
    },

    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        marginLeft: 8,
        letterSpacing: 1,
    },

    descriptionCard: {
        backgroundColor: 'rgb(255, 255, 255)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },

    fullDescription: {
        fontSize: 16,
        color: '#oafoaf',
        opacity: 0.8,
        // lineHeight: 26,
        fontWeight: '400',
        textAlign: 'justify',
    },

    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A0A0A',
        padding: 32,
    },

    errorText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FF6B35',
        marginBottom: 8,
        textAlign: 'center',
    },

    errorSubtext: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 24,
    },
});