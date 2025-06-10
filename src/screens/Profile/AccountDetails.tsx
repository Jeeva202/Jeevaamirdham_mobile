import { REACT_API_URL } from '@/app-config';
import IndividualHeader from '@/src/components/header/IndividualHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ActivityIndicator, Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormData {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  doorNo: string;
  streetName: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  [key: string]: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface AccountDetailsTabProps {
//   route: {
//     params: {
//       userId: string;
//       setFormData?: (fn: (prev: FormData) => FormData) => void;
//       setMissing?: (missing: boolean) => void;
//     };
//   };
  route: any
}

const AccountDetailsTab: React.FC<AccountDetailsTabProps> = ({ route }) => {
  const { userId, setFormData = () => {}, setMissing = () => {} } = route?.params || {};

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [localFormData, setLocalFormData] = useState<FormData | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user details when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchUserDetails = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`${REACT_API_URL}/getUserDetails`, {
            params: { userId },
          });
          const userDetails = response.data[0]; // Access the first object in the array
          console.log('Fetched User Details:', userDetails); // Debug log
          setLocalFormData(userDetails);
          setFormData(() => userDetails);
          setMissing(false);
        } catch (err) {
          console.error('Error fetching user details:', err);
          setError('Failed to fetch user details. Please try again.');
          setMissing(true);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserDetails();
    }, [userId, setFormData, setMissing])
  );

  // Validation helpers
  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? 'Please enter a valid email address'
          : '';
      case 'phone':
        return !/^\+?[\d\s-]{10,}$/.test(value)
          ? 'Please enter a valid phone number'
          : '';
      case 'zipCode':
        return !/^\d{5,6}$/.test(value)
          ? 'Please enter a valid postal code'
          : '';
      default:
        return !value.trim() ? 'This field is required' : '';
    }
  }, []);

  const handleInputChange = useCallback(
    (name: string, value: string) => {
      setLocalFormData((prev) => {
        if (prev) {
          const updated = { ...prev, [name]: value };
          console.log('Updated localFormData:', updated); // Debug log
          return updated;
        }
        // If prev is null, return null to avoid creating an incomplete FormData object
        return null;
      });
      const error = validateField(name, value);
      setValidationErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField]
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate && localFormData) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleInputChange('dob', formattedDate);
    }
  };

  const validateForm = useCallback((): boolean => {
    if (!localFormData) return false;
    const requiredFields = [
      'firstName',
      'lastName',
      'gender',
      'dob',
      'phone',
      'email',
      'doorNo',
      'streetName',
      'city',
      'state',
      'country',
      'zipCode',
    ];
    const newErrors: ValidationErrors = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      const error = validateField(field, localFormData[field] || '');
      if (error || !localFormData[field]?.trim()) {
        newErrors[field] = error || 'This field is required';
        isValid = false;
      }
    });

    setValidationErrors(newErrors);
    return isValid;
  }, [localFormData, validateField]);

  const handleSubmit = useCallback(async () => {
    if (!localFormData || !validateForm()) {
      setError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${REACT_API_URL}/updateUserDetails`, {
        ...localFormData,
        userId,
      });
      if (response.status === 200) {
        setFormData(() => localFormData);
        setIsEditing(false);
        setError(null);
      }
    } catch (err) {
      setError('Failed to update account details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [localFormData, userId, setFormData, validateForm]);

  const renderField = useCallback(
    (fieldName: string) => {
      if (!localFormData) return null;
      const label = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      const error = validationErrors[fieldName];
      const value = localFormData[fieldName] || '';

      console.log(`Rendering field: ${fieldName}, Value: ${value}`); // Debug log

      if (fieldName === 'dob') {
        return (
          <View style={styles.fieldContainer} key={fieldName}>
            <TextInput
              label={label}
              value={value ? new Date(value).toLocaleDateString() : ''}
              onFocus={() => setShowDatePicker(true)}
              error={!!error}
              disabled={!isEditing}
              mode="outlined"
              style={styles.input}
            />
            {showDatePicker && (
              <DateTimePicker
                value={new Date(value || Date.now())}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );
      }

      return (
        <View style={styles.fieldContainer} key={fieldName}>
          <TextInput
            label={label}
            value={value}
            onChangeText={(text) => handleInputChange(fieldName, text)}
            error={!!error}
            disabled={!isEditing}
            mode="outlined"
            style={styles.input}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      );
    },
    [localFormData, validationErrors, isEditing, showDatePicker, handleInputChange]
  );

  const formSections = useMemo(
    () => [
      {
        title: 'Personal Information',
        fields: ['firstName', 'lastName', 'gender', 'dob', 'phone', 'email'],
      },
      {
        title: 'Address Information',
        fields: ['doorNo', 'streetName', 'city', 'state', 'country', 'zipCode'],
      },
    ],
    []
  );

  if (isLoading) {
    return <ActivityIndicator size="large" color="#F09300" style={styles.loader} />;
  }

  if (!localFormData) {
    return (
      <SafeAreaView style={styles.container}>
        <IndividualHeader headerName="Account Details" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <IndividualHeader headerName="Account Details" />
      {error && (
        <Snackbar
          visible={!!error}
          onDismiss={() => setError(null)}
          duration={3000}
          style={styles.snackbar}
        >
          {error}
        </Snackbar>
      )}
      <ScrollView style={styles.scrollView}>
        {formSections.map(({ title, fields }) => (
          <Card style={styles.sectionCard} key={title}>
            <Card.Title title={title} />
            <Card.Content>{fields.map((field) => renderField(field))}</Card.Content>
          </Card>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.button}
            >
              Update
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                setIsEditing(false);
                setValidationErrors({});
                setError(null);
              }}
              style={styles.button}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button mode="contained" onPress={() => setIsEditing(true)} style={styles.button}>
            Edit Details
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9e5ab',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionCard: {
    marginBottom: 26,
    elevation: 2,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 8,
    marginHorizontal: 16,
    gap: 12,
  },
  button: {
    zIndex: 1,
    paddingVertical: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  snackbar: {
    backgroundColor: '#d32f2f',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccountDetailsTab;