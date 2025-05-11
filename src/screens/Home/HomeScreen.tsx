import React from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip, useTheme } from 'react-native-paper';
import NewsletterCard from './Newsletter';

const HomeScreen = () => {
  const color = useTheme()
  // Dummy data for thoughts, e-magazines, and books
  const thoughts = [
    { id: 1, text: '1.கண்களால் காண்பது, பார்வைக்கு எட்டியஅடிகள் வரையிலே !! கண்களை மூடிக்கொண்டுப் பார், மொத்த பிரபஞ்சமும் உனக்கு காட்ட காத்திருக்கிறது !!- நன்றி ஜீவ அமிர்தம்' },
    { id: 2, text: '1.கண்களால் காண்பது, பார்வைக்கு எட்டியஅடிகள் வரையிலே !! கண்களை மூடிக்கொண்டுப் பார், மொத்த பிரபஞ்சமும் உனக்கு காட்ட காத்திருக்கிறது !!- நன்றி ஜீவ அமிர்தம்' },
  ];

  const eMagazines = [
    { id: 1, year: '2025' },
    { id: 2, year: '2024' },
    { id: 3, year: '2023' },
  ];

  const popularBooks = [
    { id: 1, title: 'Gnana Amirtham', description: 'Siddharh Thoughts', price: '₹475.00' },
    { id: 2, title: 'Gnana Amirtham', description: 'Siddharh Thoughts', price: '₹475.00' },
    { id: 3, title: 'Gnana Amirtham', description: 'Siddharh Thoughts', price: '₹475.00' },
    { id: 4, title: 'Gnana Amirtham', description: 'Siddharh Thoughts', price: '₹475.00' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Today Thoughts Section */}
      <Card style={styles.thoughtsCard}>
        <View style={styles.thoughtsHeader}>
          <Title style={styles.thoughtsTitle}>Today Thoughts</Title>
          <Button
            icon="play-circle"
            mode="contained"
            style={styles.playButton}
            onPress={() => console.log('Play Thoughts')}
          >
            Play
          </Button>
        </View>
        <Paragraph style={styles.thoughtsText}>{thoughts[0].text}</Paragraph>
      </Card>

      {/* E-magazine Edition Section */}
      <View style={styles.sectionHeader}>
        <Title style={styles.sectionTitle}>E-magazine Edition</Title>
        <Button
          icon="chevron-right"
          mode="contained"
          compact
          contentStyle={styles.viewAllContent}
          labelStyle={styles.viewAllLabel}
          onPress={() => console.log('Play Thoughts')}
          style={styles.viewAllButton}
        >
          View All
        </Button>
      </View>

      <View style={styles.eMagazineContainer}>
        {eMagazines.map((magazine) => (
          <Card key={magazine.id} style={styles.eMagazineCard}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.eMagazineImage}
            />
            <Button
              mode="text"
              icon="arrow-right-circle"
              style={styles.eMagazineButton}
              onPress={() => console.log(`View ${magazine.year}`)}
            >
              View {magazine.year}
            </Button>
          </Card>
        ))}
      </View>

      {/* Popular Books Section */}
      <View style={styles.sectionHeader}>
        <Title style={styles.sectionTitle}>Popular Books</Title>
        <Button
          icon="chevron-right"
          mode="contained"
          compact
          contentStyle={styles.viewAllContent}
          labelStyle={styles.viewAllLabel}
          onPress={() => console.log('View All Books')}
          style={styles.viewAllButton}
        >
          View All
        </Button>
      </View>
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
      <NewsletterCard />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9e5ab',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  thoughtsCard: {
    backgroundColor: '#FFFAEB',
    padding: 15,
    borderRadius: 10,
    elevation: 4,
  },
  thoughtsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#DC6803',
    borderRadius: 10,
    paddingLeft: 10,
    alignItems: 'center',
  },
  thoughtsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  thoughtsText: {
    fontSize: 14,
    color: '#000000',
    marginTop: 10,
  },
  playButton: {
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  viewAllContent: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 3,
    marginVertical: -3,
  },
  viewAllLabel: {
    fontSize: 12,
  },
  viewAllButton: {
    margin: 0,
    padding: 0,
  },
  eMagazineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eMagazineCard: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#FFFAEB',
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  eMagazineImage: {
    width: 100,
    height: 100,
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignSelf: 'center',
  },
  eMagazineButton: {
    marginTop: 0,
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
});

export default HomeScreen;
