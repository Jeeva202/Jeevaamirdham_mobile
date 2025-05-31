import { Modal, View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { updatePlan } from '../../redux/userSlice';
import { Plan } from '../../navigation/types';
import RazorpayCheckout from 'react-native-razorpay';
import { REACT_API_URL } from '@/app-config';

const plans: Plan[] = [
  {
    name: 'basic',
    price: '₹0',
    features: ['Access to one chapter of E-magazine', 'One audio content', 'Shop books'],
    buttonLabel: 'Free',
    buttonStyle: { backgroundColor: '#E6E6E6', color: '#000' },
  },
  {
    name: 'elite',
    price: '₹599/year',
    features: ['All E-magazine content', 'All audio content', 'Shop books'],
    buttonLabel: 'Purchase Now',
    buttonStyle: { backgroundColor: '#F09300', color: '#fff' },
  },
  {
    name: 'premium',
    price: '₹999/year',
    features: ['All content', 'Hard copy subscription'],
    buttonLabel: 'Purchase Now',
    buttonStyle: { backgroundColor: '#F09300', color: '#fff' },
  },
];

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onPlanSelect: (plan: string) => void;
  userId: string | null;
}

export default function SubscriptionModal({ visible, onDismiss, onPlanSelect, userId }: Props) {
  const dispatch = useDispatch();

  const handlePlanSelect = async (plan: Plan) => {
    if (plan.name === 'basic') {
      dispatch(updatePlan('basic'));
      onPlanSelect('basic');
      onDismiss();
      return;
    }

    try {
      const response = await fetch(`${REACT_API_URL}/emagazine-page/get-plan-amount?planName=${plan.name}`);
      const data = await response.json();
      if (response.ok) {
        const orderResponse = await fetch(`${REACT_API_URL}/emagazine-page/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: data.price, user_id: userId, planName: plan.name }),
        });
        const orderData = await orderResponse.json();
        if (orderResponse.ok && orderData.orderId) {
          const options = {
            key: 'rzp_live_OwYWxXYV5JFbXK',
            amount: data.price * 100,
            currency: 'INR',
            order_id: orderData.orderId,
            name: 'Jeevaamirdham',
            description: 'Subscription Payment',
            prefill: { name: 'User', email: 'user@example.com', contact: '' },
            theme: { color: '#F09300' },
          };

          RazorpayCheckout.open(options)
            .then(async (response: any) => {
              const paymentData = {
                razorpay_payment_id: response.razorpay_payment_id,
                plan: plan.name,
                amount: data.price,
                user_id: userId,
              };
              const res = await fetch(`${REACT_API_URL}/emagazine-page/payment-success`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData),
              });
              if (res.ok) {
                dispatch(updatePlan(plan.name));
                onPlanSelect(plan.name);
                onDismiss();
              }
            })
            .catch((error: any) => console.error('Payment failed:', error));
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.modalContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">Choose Your Plan</Text>
            {plans.map(plan => (
              <Card key={plan.name} style={styles.planCard}>
                <Card.Content>
                  <Text variant="titleMedium">{plan.name}</Text>
                  <Text variant="bodyLarge">{plan.price}</Text>
                  {plan.features.map((feature, idx) => (
                    <Text key={idx} variant="bodySmall">{feature}</Text>
                  ))}
                  <Button
                    mode="contained"
                    style={[styles.button, { backgroundColor: plan.buttonStyle.backgroundColor }]}
                    textColor={plan.buttonStyle.color}
                    onPress={() => handlePlanSelect(plan)}
                  >
                    {plan.buttonLabel}
                  </Button>
                </Card.Content>
              </Card>
            ))}
            <Button onPress={onDismiss}>Close</Button>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  card: { width: '90%', maxHeight: '80%', padding: 16 },
  planCard: { marginVertical: 8, elevation: 2 },
  button: { marginTop: 8 },
});