import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "./Appheader";

type IndividualHeaderRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;
type IndividualHeaderNavigationProp = StackNavigationProp<RootStackParamList>;

export default function IndividualHeader() {
    const route = useRoute<IndividualHeaderRouteProp>();
    const navigation = useNavigation<IndividualHeaderNavigationProp>();
    return (
        <View style={styles.headerControls}>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.goBack()}
            >
                <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Main')}
            >
                <MaterialIcons name="home" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    iconButton: {
        // backgroundColor: '#E68E00',
        backgroundColor: '#F09300',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
})