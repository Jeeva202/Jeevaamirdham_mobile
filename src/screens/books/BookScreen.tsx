import React from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookScreen() {
    const popularBooks = [
        { id: 1, title: 'Gnana Amirtham', description: 'Siddharh Thoughts', price: '₹475.00' },
        { id: 2, title: 'Gnana Amirtham', description: 'Siddharh Thoughts', price: '₹475.00' },
        { id: 3, title: 'Gnana Amirtham', description: 'Siddharh Thoughts', price: '₹475.00' },
        { id: 4, title: 'Gnana Amirtham', description: 'Siddharh Thoughts', price: '₹475.00' },
    ];
 
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <Title style={styles.sectionTitle}>All Books</Title>
            
            <View style={styles.booksContainer}>
                {popularBooks.map((book, index) => (
                    <Card key={index} style={styles.bookCard}>
                        <Image
                            source={{ uri: 'https://via.placeholder.com/150' }}
                            style={styles.bookImage}
                        />
                        <Card.Content>
                            <Title style={styles.bookTitle}>{book.title}</Title>
                            <Paragraph style={styles.bookDescription}>{book.description}</Paragraph>
                            <Text style={styles.bookPrice}>{book.price}</Text>
                            <Button
                                mode="contained"
                                style={styles.buyButton}
                                labelStyle={styles.buyButtonLabel}
                                onPress={() => console.log(`Buy ${book.title}`)}
                            >
                                Buy Now
                            </Button>
                        </Card.Content>
                    </Card>
                ))}
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9e5ab',
      },
      sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 10,
      },
    booksContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    bookCard: {
        width: '48%', // Two cards per row with a small gap
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        elevation: 4,
    },
    bookImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#f5f5f5',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        marginTop: 10,
    },
    bookDescription: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 5,
    },
    bookPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F7A500',
        marginBottom: 10,
    },
    buyButton: {
        backgroundColor: '#F7A500',
        borderRadius: 5,
    },
    buyButtonLabel: {
        color: '#FFFFFF',
        fontSize: 14,
    },
})