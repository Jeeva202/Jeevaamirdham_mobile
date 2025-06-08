import { REACT_API_URL } from '@/app-config';
import IndividualHeader from '@/src/components/header/IndividualHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
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
    [key: string]: string; // Index signature for dynamic access
}

interface ValidationErrors {
    [key: string]: string;
}

interface AccountDetailsTabProps {
    route: {
        params: {
            formData: FormData;
            setFormData: (fn: (prev: FormData) => FormData) => void;
            isLoading: boolean;
            userId: string;
            setMissing: (missing: boolean) => void;
        };
    };
}

const AccountDetailsTab: React.FC<any> = ({ route }) => {
    const {
        formData = {} as FormData,
        setFormData = () => { },
        isLoading = false,
        userId = '',
        setMissing = () => { },
    } = route?.params || {};

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [localFormData, setLocalFormData] = useState<FormData>(formData);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

    // Form field groups for better organization
    const formSections = useMemo(() => [
        {
            title: 'Personal Information',
            fields: ['firstName', 'lastName', 'gender', 'dob', 'phone', 'email'],
        },
        {
            title: 'Address Information',
            fields: ['doorNo', 'streetName', 'city', 'state', 'country', 'zipCode'],
        },
    ], []);

    const handleInputChange = useCallback((name: string, value: string) => {
        setLocalFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setValidationErrors(prev => ({
            ...prev,
            [name]: error,
        }));
    }, [validateField]);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setLocalFormData((prev: any) => ({ ...prev, dob: selectedDate.toISOString() }));
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const validateForm = useCallback((): boolean => {
        const requiredFields = [
            "firstName", "lastName", "gender", "dob",
            "phone", "email", "doorNo", "streetName",
            "city", "state", "country", "zipCode"
        ];
        const newErrors: ValidationErrors = {};
        let isValid = true;

        requiredFields.forEach(field => {
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
        if (!validateForm()) {
            setError('Please fill all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(`${REACT_API_URL}/updateUserDetails`, { ...localFormData, userId });
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

    const renderField = useCallback((fieldName: string) => {
        const label = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const error = validationErrors[fieldName];

        if (fieldName === 'dob') {
            return (
                <View style={styles.fieldContainer} key={fieldName}>
                    <TextInput
                        label={label}
                        value={localFormData[fieldName] ? new Date(localFormData[fieldName]).toLocaleDateString() : ''}
                        onFocus={() => setShowDatePicker(true)}
                        error={!!error}
                        disabled={!isEditing}
                        mode="outlined"
                        style={styles.input}
                    />
                    {showDatePicker && (
                        <DateTimePicker
                            value={new Date(localFormData.dob || Date.now())}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    handleInputChange('dob', selectedDate.toISOString().split('T')[0]);
                                }
                            }}
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
                    value={localFormData[fieldName] || ''}
                    onChangeText={(value) => handleInputChange(fieldName, value)}
                    error={!!error}
                    disabled={!isEditing}
                    mode="outlined"
                    style={styles.input}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
        );
    }, [localFormData, validationErrors, isEditing, showDatePicker, handleInputChange]);

    const renderFormSection = useCallback(({ title, fields }: { title: string, fields: string[] }) => (
        <Card style={styles.sectionCard} key={title}>
            <Card.Title title={title} />
            <Card.Content>
                {fields.map(field => renderField(field))}
            </Card.Content>
        </Card>
    ), [renderField]);

    if (isLoading) {
        return <ActivityIndicator size="large" color="#F09300" style={styles.loader} />;
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
                {formSections.map(renderFormSection)}
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
                                setLocalFormData(formData);
                                setValidationErrors({});
                                setError(null);
                            }}
                            style={styles.button}
                        >
                            Cancel
                        </Button>
                    </>
                ) : (
                    <Button
                        mode="contained"
                        onPress={handleEditClick}
                        style={styles.button}
                    >
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
});

export default AccountDetailsTab;