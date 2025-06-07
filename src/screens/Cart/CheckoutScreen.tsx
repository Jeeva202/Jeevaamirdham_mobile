import { REACT_API_URL } from '@/app-config';
import IndividualHeader from '@/src/components/header/IndividualHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { City, State } from 'country-state-city';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import RazorpayCheckout from 'react-native-razorpay';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

interface UserDetails {
    firstname: string;
    lastname: string;
    company: string;
    country: string;
    state: string;
    street: string;
    street2: string;
    city: string;
    zipcode: string;
    phone: string;
    email: string;
    notes: string;
}

type StateType = {
    name: string;
    isoCode: string;
    countryCode: string;
};

type CityType = {
    name: string;
    stateCode: string;
    countryCode: string;
};

const CheckoutScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [totalAmount, setTotalAmount] = useState<string>('0.00');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [userDetails, setUserDetails] = useState<UserDetails>({
        firstname: '',
        lastname: '',
        company: '',
        country: 'IN',
        state: '',
        street: '',
        street2: '',
        city: '',
        zipcode: '',
        phone: '',
        email: '',
        notes: '',
    });

    const [states, setStates] = useState<StateType[]>([]);
    const [cities, setCities] = useState<CityType[]>([]);

    // Initialize totalAmount, user, and cart
    useEffect(() => {
        const initializeCheckout = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Set totalAmount from route params
                if (route.params?.totalAmount) {
                    setTotalAmount(route.params.totalAmount);
                }

                // Check login status
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setIsLoggedIn(true);
                    setUserId(user.userId);
                    setUserDetails((prev) => ({
                        ...prev,
                        email: user.email || '',
                    }));
                    // Fetch cart from API
                    await fetchCartFromApi(user.userId);
                } else {
                    // Fetch cart from AsyncStorage
                    await fetchCartFromStorage();
                }

                // Load India's states
                const indiaStates = State.getStatesOfCountry('IN');
                setStates(indiaStates);
            } catch (err) {
                setError('Failed to load checkout data. Please try again.');
                console.error('Initialize checkout error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        initializeCheckout();
    }, [route.params]);

    // Load cities when state changes
    useEffect(() => {
        if (userDetails.state) {
            const stateCities = City.getCitiesOfState('IN', userDetails.state);
            setCities(stateCities);
            setUserDetails((prev) => ({ ...prev, city: '' }));
        } else {
            setCities([]);
        }
    }, [userDetails.state]);

    // Fetch cart from API
    const fetchCartFromApi = async (userId: string) => {
        try {
            const response = await axios.get(`${REACT_API_URL}/ebooks/get_cart?id=${userId}`);
            const cartData = response.data.cart_details;
            const bookDetails = await Promise.all(
                cartData.map(async (item: { book_id: string; quantity: number }) => {
                    const bookResponse = await axios.get(`${REACT_API_URL}/ebooks/book-info?id=${item.book_id}`);
                    const book = bookResponse.data;
                    return {
                        id: item.book_id,
                        name: book.title,
                        price: parseFloat(book.offPrice),
                        quantity: item.quantity,
                        subtotal: parseFloat(book.offPrice) * item.quantity,
                    };
                })
            );
            setCartItems(bookDetails);
            await AsyncStorage.setItem('cart', JSON.stringify(bookDetails));
        } catch (error) {
            console.error('Error fetching cart from API:', error);
            throw error;
        }
    };

    // Fetch cart from AsyncStorage
    const fetchCartFromStorage = async () => {
        try {
            const cartData = await AsyncStorage.getItem('cart');
            if (cartData) {
                setCartItems(JSON.parse(cartData));
            }
        } catch (error) {
            console.error('Error fetching cart from storage:', error);
        }
    };

    // Handle input change
    const handleInputChange = (name: keyof UserDetails, value: string) => {
        setUserDetails((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'state' && { city: '' }),
        }));
    };

    // Handle Razorpay payment
    const handleRazorpayPayment = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // 1. Create Razorpay order on your backend
            const orderResponse = await axios.post(`${REACT_API_URL}/ebooks/create-order`, {
                amount: totalAmount,
                user_id: userId,
            });

            if (!orderResponse.data.orderId) {
                throw new Error('Failed to create Razorpay order');
            }

            const { orderId } = orderResponse.data;

            // 2. Prepare user data
            const userData = await AsyncStorage.getItem('user');
            const parsedUserData = userData ? JSON.parse(userData) : {};
            
            // 3. Razorpay options
            const options = {
                key: 'rzp_live_tjwWB1t6xxjHG1',
                amount: Math.round(parseFloat(totalAmount) * 100), // Convert to paise and ensure it's an integer
                currency: 'INR',
                name: 'Jeevaamirdham',
                image: 'https://i.imgur.com/3g7nmJc.png',
                description: 'Order Payment',
                order_id: orderId,
                prefill: {
                    name: parsedUserData.name || `${userDetails.firstname} ${userDetails.lastname}`,
                    email: parsedUserData.email || userDetails.email,
                    contact: userDetails.phone || '',
                },
                theme: { color: '#F09300' },
                notes: {
                    userId: userId || '',
                    orderType: 'ebook',
                },
            };

            // 4. Open Razorpay checkout with proper error handling
            try {
                const paymentData: RazorpayResponse = await new Promise((resolve, reject) => {
                    RazorpayCheckout.open(options)
                        .then((data: RazorpayResponse) => {
                            console.log('Payment success:', data);
                            resolve(data);
                        })
                        .catch((error: any) => {
                            console.log('Payment error:', error);
                            reject(error);
                        });
                });

                // 5. Verify payment on your backend
                await axios.post(`${REACT_API_URL}/ebooks/payment-success`, {
                    razorpay_payment_id: paymentData.razorpay_payment_id,
                    razorpay_order_id: paymentData.razorpay_order_id,
                    razorpay_signature: paymentData.razorpay_signature,
                    amount: totalAmount,
                    user_id: userId,
                    userDetails,
                    cartDetails: cartItems,
                });

                // 6. Clear cart after successful payment
                if (userId) {
                    await axios.post(`${REACT_API_URL}/ebooks/clear_cart`, { userId });
                    await AsyncStorage.removeItem('cart');
                    setCartItems([]);
                }

                // 7. Navigate to success screen
                navigation.navigate('OrderSuccess', { 
                    orderId: paymentData.razorpay_order_id,
                    paymentId: paymentData.razorpay_payment_id,
                    amount: totalAmount,
                });

            } catch (paymentError: any) {
                console.error('Razorpay error:', paymentError);
                if (paymentError.code === 'PAYMENT_CANCELLED') {
                    setError('Payment was cancelled');
                } else if (paymentError.description) {
                    setError(paymentError.description);
                } else {
                    setError('Payment failed. Please try again.');
                }
            }
        } catch (error: any) {
            console.error('Payment setup error:', error);
            setError(error.message || 'Failed to initialize payment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

      const amount = 100;
      const currency = "INR";

    const handlePayment = () => {
      var options = {
        description: 'Order Payment',
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: currency,
        key: 'rzp_live_tjwWB1t6xxjHG1',
        amount: amount * 100, // Convert to paise
        name: 'test order',
        order_id: "", //Replace this with an order_id created using Orders API. Learn more at https://razorpay.com/docs/api/orders.
        prefill: {
          email: 'xyz@gmail.com',
          contact: '9999999999',
          name: 'User 1'
        },
        theme: { color: '#F37254' }
      }
  
      RazorpayCheckout.open(options).then((data) => {
        // handle success
        alert(`Success: ${data.razorpay_payment_id}`);
      })
        .catch((error) => {
          // handle failure
          console.log(error)
          alert(`Error: ${error.code} | ${error.description}`);
        })
    }

    // Handle form submission
    const handleSubmit = async () => {
        const requiredFields: (keyof UserDetails)[] = [
            'firstname',
            'lastname',
            'country',
            'state',
            'street',
            'city',
            'zipcode',
            'phone',
            'email',
        ];

        const missingFields = requiredFields.filter((field) => !userDetails[field]);

        // if (missingFields.length > 0) {
        //     setError('Please fill in all required fields.');
        //     return;
        // }

        if (cartItems.length === 0) {
            setError('Your cart is empty.');
            return;
        }

        if (isLoggedIn) {
            // await handleRazorpayPayment();
            await handlePayment();
        } else {
            navigation.navigate('Login');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F09300" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <IndividualHeader headerName={'Checkout'} />
            <ScrollView style={{ overflow: 'scroll', height: 1, zIndex: 10 }}>
                {error && (
                    <Snackbar
                        visible={!!error}
                        onDismiss={() => setError(null)}
                        duration={3000}
                        style={styles.errorSnackbar}
                    >
                        {error}
                    </Snackbar>
                )}
                <Card style={styles.orderCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Your Order</Text>
                        <View style={styles.orderHeader}>
                            <Text style={styles.orderHeaderText}>Product</Text>
                            <Text style={styles.orderHeaderText}>Price</Text>
                        </View>
                        {cartItems.map((item, index) => (
                            <View key={index} style={styles.orderItem}>
                                <Text style={styles.orderItemText}>
                                    {item.name} × {item.quantity}
                                </Text>
                                <Text style={styles.orderItemPrice}>₹{item.subtotal.toFixed(2)}</Text>
                                <Text style={styles.orderItemEach}>Each ₹{item.price.toFixed(2)}</Text>
                            </View>
                        ))}
                        <View style={styles.orderTotal}>
                            <Text style={styles.orderTotalText}>Subtotal</Text>
                            <Text style={styles.orderTotalAmount}>₹{totalAmount}</Text>
                        </View>
                        <View style={styles.orderTotal}>
                            <Text style={styles.orderTotalText}>Total</Text>
                            <Text style={styles.orderTotalAmount}>₹{totalAmount}</Text>
                        </View>
                        <Text style={styles.privacyText}>
                            Your personal data will be used to process your order, support your experience throughout this app, and for other purposes described in our privacy policy.
                        </Text>
                        <Text style={styles.shippingNote}>
                            * Note: Shipping charges may vary. Our admin team will contact you to confirm your order and provide details about the shipping costs.
                        </Text>
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            style={styles.placeOrderButton}
                            labelStyle={styles.placeOrderButtonText}
                        >
                            Place Order
                        </Button>
                    </Card.Content>
                </Card>
                <Card style={styles.billingCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Billing Details</Text>
                        <TextInput
                            label="First Name *"
                            value={userDetails.firstname}
                            onChangeText={(text) => handleInputChange('firstname', text)}
                            style={styles.input}
                            mode="outlined"
                        />
                        <TextInput
                            label="Last Name *"
                            value={userDetails.lastname}
                            onChangeText={(text) => handleInputChange('lastname', text)}
                            style={styles.input}
                            mode="outlined"
                        />
                        <TextInput
                            label="Company Name (optional)"
                            value={userDetails.company}
                            onChangeText={(text) => handleInputChange('company', text)}
                            style={styles.input}
                            mode="outlined"
                        />
                        <TextInput
                            label="Country"
                            value="India"
                            disabled
                            style={styles.input}
                            mode="outlined"
                        />
                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>State *</Text>
                            <Picker
                                selectedValue={userDetails.state}
                                onValueChange={(value) => handleInputChange('state', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select State" value="" />
                                {states.map((state) => (
                                    <Picker.Item key={state.isoCode} label={state.name} value={state.isoCode} />
                                ))}
                            </Picker>
                        </View>
                        <TextInput
                            label="Street Address *"
                            value={userDetails.street}
                            onChangeText={(text) => handleInputChange('street', text)}
                            style={styles.input}
                            mode="outlined"
                            placeholder="House number and street name"
                        />
                        <TextInput
                            label="Apartment, suite, etc. (optional)"
                            value={userDetails.street2}
                            onChangeText={(text) => handleInputChange('street2', text)}
                            style={styles.input}
                            mode="outlined"
                        />
                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>Town/City *</Text>
                            <Picker
                                selectedValue={userDetails.city}
                                onValueChange={(value) => handleInputChange('city', value)}
                                style={styles.picker}
                                enabled={!!userDetails.state}
                            >
                                <Picker.Item label="Select City" value="" />
                                {cities.map((city) => (
                                    <Picker.Item key={city.name} label={city.name} value={city.name} />
                                ))}
                            </Picker>
                        </View>
                        <TextInput
                            label="Zipcode/Pincode *"
                            value={userDetails.zipcode}
                            onChangeText={(text) => handleInputChange('zipcode', text)}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="numeric"
                        />
                        <TextInput
                            label="Phone *"
                            value={userDetails.phone}
                            onChangeText={(text) => handleInputChange('phone', text)}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            label="Email *"
                            value={userDetails.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="email-address"
                        />
                        <Text style={styles.subSectionTitle}>Additional Information</Text>
                        <TextInput
                            label="Order Notes (optional)"
                            value={userDetails.notes}
                            onChangeText={(text) => handleInputChange('notes', text)}
                            style={styles.input}
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            placeholder="Notes about your order, e.g. special delivery instructions"
                        />
                    </Card.Content>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        marginVertical: 8,
        backgroundColor: '#f9e5ab',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorSnackbar: {
        backgroundColor: '#d32f2f',
    },
    billingCard: {
        marginBottom: 16,
        elevation: 4,
        marginTop: 8,
    },
    orderCard: {
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        color: '#333',
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 12,
    },
    input: {
        marginBottom: 12,
    },
    pickerContainer: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        overflow: 'hidden',
    },
    pickerLabel: {
        fontSize: 12,
        color: 'gray',
        marginLeft: 10,
        marginTop: 4,
    },
    picker: {
        height: Platform.OS === 'ios' ? 120 : 50,
        color: '#333',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    orderHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    orderItem: {
        marginVertical: 8,
    },
    orderItemText: {
        fontSize: 14,
        color: '#666',
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        color: '#333',
    },
    orderItemEach: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    orderTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    orderTotalText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    orderTotalAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F09300',
    },
    privacyText: {
        fontSize: 14,
        color: '#666',
        marginVertical: 8,
    },
    shippingNote: {
        fontSize: 12,
        color: 'red',
        fontWeight: 'bold',
        marginVertical: 8,
    },
    placeOrderButton: {
        marginTop: 16,
        backgroundColor: '#F09300',
        borderRadius: 8,
    },
    placeOrderButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default CheckoutScreen;