import { REACT_API_URL } from '@/app-config';
import IndividualHeader from '@/src/components/header/IndividualHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'react-query';

export default function LastReadScreen() {
    const [userId, setUserId] = useState<string | null>(null);
    React.useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userString = await AsyncStorage.getItem('user');
                if (userString) {
                    const userObj = JSON.parse(userString);
                    setUserId(userObj.userId);
                }
            } catch (e) {
                console.log('Failed to load user information.');
            }
        };
        fetchUserId();
    }, []);
    const {
        data: lastReadData,
        isLoading,
        error,
        refetch,
    } = useQuery(
        ['last-read', userId],
        async () => {
            const { data } = await axios.get(`${REACT_API_URL}/emagazine-page/get-last-read`, {
                params: { uid: userId },
            });
            return data;
        },
        {
            enabled: !!userId,
            staleTime: 1000 * 60 * 5,
            refetchOnMount: 'always',
        }
    );

    useEffect(() => {
        if (userId) refetch();
    }, [userId]);

    type LastReadItem = {
        year: number;
        month: number;
        imgUrl?: string;
        title: string;
        shortDesc: string;
    };    const renderItem = ({ item }: { item: LastReadItem }) => {
        const formattedDate = new Date(item.year, item.month - 1).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        });

        return (
            <View style={styles.card}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.imgUrl || 'https://via.placeholder.com/150' }}
                        onError={(e) => console.warn('Image load error', e.nativeEvent.error)}
                        style={styles.image}
                    />
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </View>
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.desc} numberOfLines={3}>{item.shortDesc}</Text>
                    </View>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#f09300" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Failed to load recently read magazines.</Text>
                <Text onPress={() => refetch()} style={styles.retryText}>Tap to retry</Text>
            </View>
        );
    }

    if (!lastReadData || lastReadData.length === 0) {
        return (
            <View style={styles.centered}>
                <Text>You haven't read any magazines yet.</Text>
            </View>
        );
    }    return (
        <SafeAreaView >
            <IndividualHeader headerName='Recently read E-magazine' />
        <FlatList
            contentContainerStyle={{ padding: 16, paddingTop: 20 }}
            data={lastReadData}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.year}-${item.month}`}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
        />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    retryText: {
        color: '#f09300',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 20,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginHorizontal: 2,
    },
    imageContainer: {
        position: 'relative',
        width: 140,
    },
    image: {
        width: '100%',
        height: 160,
        resizeMode: 'cover',
    },
    dateBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(240, 147, 0, 0.9)',
        paddingVertical: 4,
    },
    dateText: {
        color: '#fff',
        fontSize: 11,
        textAlign: 'center',
        fontWeight: '600',
    },
    cardContent: {
        flex: 1,
        padding: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'space-evenly',
    },
    title: {
        fontWeight: 'bold',
        color: '#f09300',
        fontSize: 17,
        marginBottom: 8,
        lineHeight: 22,
    },
    desc: {
        color: '#555',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
});
