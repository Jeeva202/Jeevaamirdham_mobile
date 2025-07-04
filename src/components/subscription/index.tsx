// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   Dimensions,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// const { width, height } = Dimensions.get('window');

// const plans = [
//   {
//     name: "basic",
//     price: "₹0",
//     features: [
//       "Access to one chapter of E-magazine",
//       "One audio content",
//       "One video content",
//       "Ability to shop for books",
//     ],
//     buttonLabel: "Free",
//     buttonStyle: {
//       backgroundColor: "#E6E6E6",
//       color: "#000",
//     },
//   },
//   {
//     name: "elite",
//     price: "₹599/year",
//     features: [
//       "Access to all E-magazine content",
//       "All audio content",
//       "All video content",
//       "Ability to shop for books",
//     ],
//     buttonLabel: "Purchase Now",
//     buttonStyle: {
//       backgroundColor: "#F09300",
//       color: "#fff",
//     },
//   },
//   {
//     name: "premium",
//     price: "₹999/year",
//     features: [
//       "Access to all E-magazine content",
//       "All audio content",
//       "All video content",
//       "Ability to shop for books",
//       "Hard copy subscription of E-magazine",
//     ],
//     buttonLabel: "Purchase Now",
//     buttonStyle: {
//       backgroundColor: "#F09300",
//       color: "#fff",
//     },
//   },
// ];

// import { REACT_API_URL } from '@/app-config';
// import { useNavigation } from '@react-navigation/native';
// import type { StackNavigationProp } from '@react-navigation/stack';
// import RazorpayCheckout from 'react-native-razorpay';
// import IndividualHeader from '../header/IndividualHeader';

// type RootStackParamList = {
//   SubscriptionScreen: undefined;
//   Login: undefined;
//   // Add other routes here as needed
// };

// type NavigationProps = StackNavigationProp<RootStackParamList>;

// export default function SubscriptionScreen(): React.ReactElement {
//   const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const navigation = useNavigation<NavigationProps>();

//   // Check login status on component mount
//   useEffect(() => {
//     checkLoginStatus();
//   }, []);

//   const checkLoginStatus = async () => {
//     try {
//       const userString = await AsyncStorage.getItem('user');
//       if (userString) {
//         const userObj = JSON.parse(userString);
//         setIsUserLoggedIn(userObj.userId);
//       }
//     } catch (error) {
//       console.error('Error checking login status:', error);
//     }
//   };

//   const showMessage = (message: string | undefined, type = 'info') => {
//     Alert.alert(
//       type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
//       message,
//       [{ text: 'OK' }]
//     );
//   };

//   const handlePurchase = async (planName: string) => {
//     setLoading(true);

//     try {
//       const userData = {
//         name: (await AsyncStorage.getItem('username')) || null,
//         email: (await AsyncStorage.getItem('email')) || null,
//         id: (await AsyncStorage.getItem('id')) || null
//       };

//       // Replace with your actual API URL

//       // Fetch the price of the selected plan from the backend
//       const response = await fetch(`${REACT_API_URL}/emagazine-page/get-plan-amount?planName=${planName}`);
//       const data = await response.json();

//       if (response.ok) {
//         const amount = data.price;

//         // Call the backend to create the Razorpay order
//         const orderResponse = await fetch(`${REACT_API_URL}/emagazine-page/create-order`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             amount: amount,
//             user_id: userData?.id,
//             planName: planName
//           }),
//         });

//         const orderData = await orderResponse.json();

//         if (orderResponse.ok && orderData?.orderId) {
//           // For React Native, you'll need to integrate with react-native-razorpay
//           // Here's a placeholder for the payment integration
//           initiatePayment({
//             orderId: orderData.orderId,
//             amount: amount,
//             planName: planName,
//             userData: userData
//           });
//         } else {
//           console.error('Error creating Razorpay order');
//           showMessage("Error creating payment order.", 'error');
//         }
//       } else {
//         console.error('Error fetching plan price');
//         showMessage("Error fetching plan price.", 'error');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       showMessage("An error occurred while fetching plan details.", 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const initiatePayment = ({
//     orderId,
//     amount,
//     planName,
//     userData,
//   }: {
//     orderId: string;
//     amount: number | string;
//     planName: string;
//     userData: {
//       name: string | null;
//       email: string | null;
//       id: string | null;
//       [key: string]: any;
//     };
//   }) => {
//     // This is where you would integrate with react-native-razorpay
//     // For now, showing an alert as placeholder
//     Alert.alert(
//       "Payment Integration",
//       `Ready to process payment for ${planName} plan (₹${amount}).\n\nTo complete this integration, install react-native-razorpay and implement the payment flow.`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel"
//         },
//         {
//           text: "Simulate Success",
//           onPress: () => handlePaymentSuccess(planName, amount, userData)
//         }
//       ]
//     );

//     // Actual Razorpay integration would look like this:

//     const options = {
//       description: 'Subscription Payment',
//       image: 'https://your-logo-url.com/logo.png',
//       currency: 'INR',
//       key: 'rzp_live_OwYWxXYV5JFbXK', // Your Razorpay key
//       amount: Number(amount) * 100, // Amount in paise
//       order_id: orderId,
//       name: 'Jeevaamirdham',
//       prefill: {
//         email: userData?.email || '',
//         contact: userData?.contact || '',
//         name: userData?.name || ''
//       },
//       theme: { color: '#7C3AED' }
//     };

//     RazorpayCheckout.open(options).then((data) => {
//       handlePaymentSuccess(planName, amount, userData, data.razorpay_payment_id);
//     }).catch((error) => {
//       console.log('Payment error:', error);
//       showMessage("Payment was cancelled or failed.", 'error');
//     });
//   };

//   const handlePaymentSuccess = async (planName: any, amount: any, userData: { id: any; }, paymentId = 'sim_payment_123') => {
//     try {

//       const paymentData = {
//         razorpay_payment_id: paymentId,
//         plan: planName,
//         amount: amount,
//         user_id: userData?.id || null,
//       };

//       const res = await fetch(`${REACT_API_URL}/emagazine-page/payment-success`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(paymentData),
//       });

//       if (res.ok) {
//         const data = await res.json();
//         console.log("Payment data saved successfully:", data);
//         showMessage("Payment successful and subscription activated!", 'success');

//         // Navigate back or to success screen
//         setTimeout(() => {
//           navigation.goBack();
//         }, 2000);
//       } else {
//         console.error("Failed to update backend");
//         showMessage("Payment was successful but could not update subscription. Please contact support.", 'error');
//       }
//     } catch (error) {
//       console.error("Error while updating backend:", error);
//       showMessage("An error occurred. Please contact support.", 'error');
//     }
//   };

//   const payNow = (planName: string) => {
//     if (isUserLoggedIn) {
//       if (planName === 'basic') {
//         showMessage("Free plan activated!", 'success');
//         setTimeout(() => {
//           navigation.goBack();
//         }, 1500);
//       } else {
//         handlePurchase(planName);
//       }
//     } else {
//       Alert.alert(
//         "Login Required",
//         "Please login to purchase a subscription plan.",
//         [
//           {
//             text: "Cancel",
//             style: "cancel"
//           },
//           {
//             text: "Login",
//             onPress: () => navigation.navigate('Login') // Adjust route name as needed
//           }
//         ]
//       );
//     }
//   };

//   type Plan = {
//     name: string;
//     price: string;
//     features: string[];
//     buttonLabel: string;
//     buttonStyle: {
//       backgroundColor: string;
//       color: string;
//     };
//   };

//   interface PlanCardProps {
//     plan: Plan;
//     index: number;
//   }

//   const PlanCard: React.FC<PlanCardProps> = ({ plan, index }) => (
//     <View style={styles.planCard} key={index}>
//       <View style={styles.cardContent}>
//         <Text style={styles.planName}>{plan.name}</Text>
//         <Text style={styles.planPrice}>{plan.price}</Text>

//         <View style={styles.featuresList}>
//           {plan.features.map((feature, idx) => (
//             <View key={idx} style={styles.featureItem}>
//               <Text style={styles.checkIcon}>✓</Text>
//               <Text style={styles.featureText}>{feature}</Text>
//             </View>
//           ))}
//         </View>
//       </View>

//       <TouchableOpacity
//         style={[
//           styles.planButton,
//           { backgroundColor: plan.buttonStyle.backgroundColor },
//           loading && styles.disabledButton
//         ]}
//         onPress={() => payNow(plan.name)}
//         disabled={loading}
//       >
//         <Text style={[styles.buttonText, { color: plan.buttonStyle.color }]}>
//           {loading ? 'Processing...' : plan.buttonLabel}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* <StatusBar barStyle="dark-content" backgroundColor="#fff" /> */}
//       <IndividualHeader headerName='Choose Your Plan' />

//       <ScrollView
//         style={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         <View style={styles.header}>
//           <Text style={styles.subtitle}>
//             Select the subscription plan for your needs
//           </Text>
//         </View>

//         <View style={styles.plansContainer}>
//           {plans.map((plan, index) => (
//             <PlanCard key={index} plan={plan} index={index} />
//           ))}
//         </View>

//         {/* Optional note */}
//         <Text style={styles.note}>
//           * All prices are inclusive of applicable taxes
//         </Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }



import { REACT_API_URL } from '@/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { SafeAreaView } from 'react-native-safe-area-context';
import IndividualHeader from '../header/IndividualHeader';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  SubscriptionScreen: undefined;
  Login: undefined;
};

type NavigationProps = StackNavigationProp<RootStackParamList>;

const plans = [
  {
    name: 'basic',
    price: '₹0',
    features: [
      'Access to one chapter of E-magazine',
      'One audio content',
      'One video content',
      'Ability to shop for books',
    ],
    buttonLabel: 'Free',
    buttonStyle: {
      backgroundColor: '#E6E6E6',
      color: '#000',
    },
  },
  {
    name: 'elite',
    price: '₹599/year',
    features: [
      'Access to all E-magazine content',
      'All audio content',
      'All video content',
      'Ability to shop for books',
    ],
    buttonLabel: 'Purchase Now',
    buttonStyle: {
      backgroundColor: '#F09300',
      color: '#fff',
    },
  },
  {
    name: 'premium',
    price: '₹999/year',
    features: [
      'Access to all E-magazine content',
      'All audio content',
      'All video content',
      'Ability to shop for books',
      'Hard copy subscription of E-magazine',
    ],
    buttonLabel: 'Purchase Now',
    buttonStyle: {
      backgroundColor: '#F09300',
      color: '#fff',
    },
  },
];

export default function SubscriptionScreen(): React.ReactElement {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  // Check login status on component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const userObj = JSON.parse(userString);
        setUserId(userObj.userId);
        setIsUserLoggedIn(!!userObj.userId);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const showMessage = (message: string | undefined, type = 'info') => {
    Alert.alert(
      type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
      message,
      [{ text: 'OK' }]
    );
  };

  const handlePurchase = async (planName: string) => {
    if (!userId) {
      showMessage('User not logged in.', 'error');
      return;
    }

    setLoading(true);

    try {
      // Fetch user details from API
      let userData: { name: string | null; email: string | null; id: string | null } = {
        name: null,
        email: null,
        id: userId,
      };
      try {
        const response = await fetch(`${REACT_API_URL}/getUserDetails?userId=${userId}`);
        const data = await response.json();
        if (response.ok && data[0]) {
          const userDetails = data[0];
          console.log('Fetched User Details:', userDetails); // Debug log
          userData = {
            name: `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || null,
            email: userDetails.email || null,
            id: userId,
          };
        } else {
          console.warn('No user details found in API response');
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        // Fallback to AsyncStorage email if available
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userObj = JSON.parse(userString);
          userData.email = userObj.email || null;
        }
      }

      // Fetch the price of the selected plan from the backend
      const response = await fetch(`${REACT_API_URL}/emagazine-page/get-plan-amount?planName=${planName}`);
      const data = await response.json();

      if (response.ok) {
        const amount = data.price;

        // Call the backend to create the Razorpay order
        const orderResponse = await fetch(`${REACT_API_URL}/emagazine-page/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            user_id: userId,
            planName: planName,
          }),
        });

        const orderData = await orderResponse.json();

        if (orderResponse.ok && orderData?.orderId) {
          initiatePayment({
            orderId: orderData.orderId,
            amount: amount,
            planName: planName,
            userData: userData,
          });
        } else {
          console.error('Error creating Razorpay order:', orderData);
          showMessage('Error creating payment order.', 'error');
        }
      } else {
        console.error('Error fetching plan price:', data);
        showMessage('Error fetching plan price.', 'error');
      }
    } catch (error) {
      console.error('Error in handlePurchase:', error);
      showMessage('An error occurred while processing your request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = ({
    orderId,
    amount,
    planName,
    userData,
  }: {
    orderId: string;
    amount: number | string;
    planName: string;
    userData: {
      name: string | null;
      email: string | null;
      id: string | null;
      [key: string]: any;
    };
  }) => {
    const options = {
      description: 'Subscription Payment',
      image: '/appLogo.png', // Use your actual app logo URL here
      currency: 'INR',
      key: 'rzp_live_OwYWxXYV5JFbXK', // Updated to match CheckoutScreen
      amount: Number(amount) * 100, // Amount in paise
      order_id: orderId,
      name: 'Jeevaamirdham',
      prefill: {
        email: userData?.email || '',
        contact: userData?.contact || '',
        name: userData?.name || '',
      },
      theme: { color: '#F09300' }, // Match CheckoutScreen theme
      notes: {
        userId: userId || '',
        planName: planName,
      },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        handlePaymentSuccess(planName, amount, userData, data.razorpay_payment_id);
      })
      .catch((error) => {
        console.error('Payment error:', error);
        showMessage('Payment was cancelled or failed.', 'error');
      });
  };

  const handlePaymentSuccess = async (
    planName: string,
    amount: number | string,
    userData: { id: string | null },
    paymentId = 'sim_payment_123'
  ) => {
    try {
      const paymentData = {
        razorpay_payment_id: paymentId,
        plan: planName,
        amount: amount,
        user_id: userData?.id || null,
      };

      const res = await fetch(`${REACT_API_URL}/emagazine-page/payment-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Payment data saved successfully:', data);
        showMessage('Payment successful and subscription activated!', 'success');

        // Update user plan in AsyncStorage
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userObj = JSON.parse(userString);
          userObj.plan = planName;
          await AsyncStorage.setItem('user', JSON.stringify(userObj));
        }

        // Navigate back or to success screen
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        console.error('Failed to update backend:', await res.text());
        showMessage('Payment was successful but could not update subscription. Please contact support.', 'error');
      }
    } catch (error) {
      console.error('Error while updating backend:', error);
      showMessage('An error occurred. Please contact support.', 'error');
    }
  };

  const payNow = (planName: string) => {
    if (isUserLoggedIn) {
      if (planName === 'basic') {
        showMessage('Free plan activated!', 'success');
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        handlePurchase(planName);
      }
    } else {
      Alert.alert(
        'Login Required',
        'Please login to purchase a subscription plan.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
    }
  };

  type Plan = {
    name: string;
    price: string;
    features: string[];
    buttonLabel: string;
    buttonStyle: {
      backgroundColor: string;
      color: string;
    };
  };

  interface PlanCardProps {
    plan: Plan;
    index: number;
  }

  const PlanCard: React.FC<PlanCardProps> = ({ plan, index }) => (
    <View style={styles.planCard} key={index}>
      <View style={styles.cardContent}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planPrice}>{plan.price}</Text>

        <View style={styles.featuresList}>
          {plan.features.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.planButton, { backgroundColor: plan.buttonStyle.backgroundColor }, loading && styles.disabledButton]}
        onPress={() => payNow(plan.name)}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: plan.buttonStyle.color }]}>
          {loading ? 'Processing...' : plan.buttonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <IndividualHeader headerName="Choose Your Plan" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>Select the subscription plan for your needs</Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} index={index} />
          ))}
        </View>

        <Text style={styles.note}>* All prices are inclusive of applicable taxes</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9e5ab',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F09300',
    letterSpacing: 2,
    textAlign: 'center',
  },
  headerControls: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
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
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    gap: 20,
  },
  planCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardContent: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '600',
    color: '#F09300',
    marginBottom: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  checkIcon: {
    fontSize: 18,
    color: '#22c55e',
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  planButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});