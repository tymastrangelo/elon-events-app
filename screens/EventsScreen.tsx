import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../navigation/EventsStackNavigator';

const events = [
  {
    id: 1,
    title: 'International Band Night',
    location: '36 Guild Street, London',
    attendees: '20',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    description:
      'Come experience the sound of international bands rocking the stage with live music, food trucks, and a dance floor. Open to all students!',
    tag: 'Music',
    date: 'Friday, Sept 20 • 8:00 PM',
    host: 'Elon Music Society',
    capacity: 100,
    contactEmail: 'contact@elonbands.org',
    externalLink: 'https://elonbands.org/international-night',
    category: 'Music & Arts',
  },
  {
    id: 2,
    title: "Jo Malone's Art Gala",
    location: 'Radius Gallery, Santa Cruz',
    attendees: '32',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    description:
      'An elegant evening showcasing Jo Malone’s latest abstract installations. Complimentary wine and hors d’oeuvres served.',
    tag: 'Art',
    date: 'Saturday, Sept 21 • 6:00 PM',
    host: 'Elon Fine Arts Council',
    capacity: 75,
    contactEmail: 'events@elonarts.edu',
    externalLink: 'https://elonarts.edu/malone-gala',
    category: 'Gallery & Exhibits',
  },
];

export default function EventsScreen() {
  type NavigationProp = NativeStackNavigationProp<EventsStackParamList, 'EventsHome'>;
  const navigation = useNavigation<NavigationProp>();

  const renderItem = ({ item }: { item: typeof events[0] }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { event: item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={14} color="#666" />
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <Text style={styles.attendees}>{item.attendees}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>All Events</Text>
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
  },
  eventCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  attendees: {
    fontSize: 13,
    color: '#5669FF',
    fontWeight: '500',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});