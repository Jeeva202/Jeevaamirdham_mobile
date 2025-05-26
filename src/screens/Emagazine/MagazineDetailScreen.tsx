import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { updatePlan } from '../../redux/userSlice';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Loader } from './EmagazineScreen';
import SubscriptionModal from '@/src/components/subscription';
import { REACT_API_URL } from '@/app-config';
import { RootStackParamList } from '@/src/navigation/types';
import { StackScreenProps } from '@react-navigation/stack';

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
    // const navigation = useNavigation<any>();
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

    const { data: magazine, isLoading, error } = useQuery(
        ['magazine', year, safeMonth],
        () => fetchMagazineDetails(year, safeMonth)
    );
    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
    const userId = useSelector((state: RootState) => state.user.userId) || '3162';
    const plan = useSelector((state: RootState) => state.user.plan);
    const isAccountExpired = useSelector((state: RootState) => state.user.isAccountExpired);
    const [modalVisible, setModalVisible] = useState(false);

    const monthMapping: Record<MonthName, number> = {
        January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
        July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
    };

    if (isLoading) return <Loader />;
    if (error || !magazine) return <Text>Error loading magazine</Text>;

    const handleListen = async () => {
        // if (isLoggedIn) {
        //     setModalVisible(true);
        //     return;
        // }
        // if (isAccountExpired) {
        //     setModalVisible(true);
        //     return;
        // }
        try {
            const response = await axios.get(`${REACT_API_URL}/emagazine-page/audiofile?uid=${userId}&year=${year}&month=${monthMapping[safeMonth]}`);
            navigation.navigate('AudioPlayer', { year, month: safeMonth, audioData: response.data });
        } catch (err) {
            console.error('Error fetching audio data:', err);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Card>
                <Card.Cover source={{ uri: magazine.imgUrl }} style={styles.cover} />
                <Card.Content style={styles.content}>
                    <Text variant="headlineMedium">{magazine.title}</Text>
                    <Text variant="bodyMedium">Author: {magazine.author}</Text>
                    <Text variant="bodySmall" style={styles.description}>{magazine.shortDesc}</Text>
                    <Button
                        mode="contained"
                        style={styles.button}
                        onPress={handleListen}
                        // disabled={!isLoggedIn || isAccountExpired}
                    >
                        {isLoggedIn ? 'Listen Now' : 'Login to Listen'}
                    </Button>
                    <Text variant="bodyMedium" style={styles.description}>{magazine.description}</Text>
                </Card.Content>
            </Card>
            <SubscriptionModal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                onPlanSelect={(selectedPlan) => {
                    dispatch(updatePlan(selectedPlan));
                    setModalVisible(false);
                    if (selectedPlan !== 'basic') {
                        handleListen();
                    }
                }}
                userId={userId}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    cover: { height: 200, borderRadius: 8 },
    content: { padding: 16 },
    description: { marginVertical: 8, lineHeight: 24 },
    button: { marginVertical: 16, backgroundColor: '#F09300' },
});