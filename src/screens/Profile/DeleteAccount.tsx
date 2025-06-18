import { REACT_API_URL } from '@/app-config';
import IndividualHeader from '@/src/components/header/IndividualHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type DeleteAccountTabProps = {
  userId: string;
};

const DeleteAccountTab = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');

  const handleDelete = async () => {
    if (input === 'CONFIRM') {
      setIsLoading(true);
      try {
        await axios.post(`${REACT_API_URL}/deactivate_user`, { userId });
        await AsyncStorage.removeItem('user');
        setError('Account deleted successfully');
        (navigation as any).navigate('Main');
      } catch (err) {
        setError('Failed to delete account. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please type "CONFIRM" correctly to proceed.');
    }
  };

  const handleCancel = () => {
    setError('Account deletion cancelled.');
    navigation.goBack()

  };

  return (
    <SafeAreaView style={styles.container}>
      <IndividualHeader headerName='Delete Account' />
      <Card style={styles.mainCard}>
        <Card.Content>
          <View style={styles.content}>
                <Text style={styles.promptText}>
                  Are you sure you want to delete your account?
                </Text>
                <Text style={styles.promptText}>
                  Please type <Text style={styles.boldText}>"CONFIRM"</Text> to proceed.
                </Text>
                <TextInput
                  placeholder="Type CONFIRM here..."
                  value={input}
                  onChangeText={setInput}
                  style={styles.input}
                  mode="outlined"
                />
                <View style={styles.buttons}>
                  <Button
                    mode="contained"
                    onPress={handleDelete}
                    style={styles.deleteButton}
                    labelStyle={styles.buttonText}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleCancel}
                    style={styles.cancelButton}
                    labelStyle={styles.buttonText}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </View>
          </View>
        </Card.Content>
      </Card>

      {error && (
        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          duration={3000}
          style={styles.snackbar}
        >
          {error}
        </Snackbar>
      )}
    </SafeAreaView>
  );
};
export default DeleteAccountTab
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainCard: {
    margin: 16,
  },
  content: {
    padding: 16,
  },
  promptCard: {
    backgroundColor: '#f8f9fa',
  },
  promptContent: {
    alignItems: 'center',
    padding: 20,
  },
  promptText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    marginVertical: 16,
    backgroundColor: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    color: '#fff',
  },
  snackbar: {
    backgroundColor: '#dc3545',
  },
});