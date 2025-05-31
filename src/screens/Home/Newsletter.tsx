import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, TextInput, Button, Text } from 'react-native-paper';

const NewsletterCard = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email) {
      console.log(`Subscribed with: ${email}`);
      setEmail('');
    } else {
      console.log('Please enter a valid email');
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Subscribe to Our Newsletter</Text>
        <Text style={styles.description}>
          Get the latest updates, offers, and exclusive content delivered right to your inbox.
        </Text>
        {/* <TextInput
          label="Enter your email"
          mode="outlined"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
          keyboardType="email-address"
        /> */}
        <Button
          mode="contained"
          onPress={handleSubscribe}
          style={styles.subscribeButton}
          labelStyle={styles.buttonLabel}
        >
          Subscribe
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFAEB',
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  subscribeButton: {
    backgroundColor: '#F7A500',
    borderRadius: 8,
    marginTop: 4,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NewsletterCard;
