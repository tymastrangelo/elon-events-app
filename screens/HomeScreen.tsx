import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { ExploreStackParamList } from '../navigation/ExploreStackNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FiltersModal from '../components/FiltersModal';

// Type Definitions
export type Event = {
  id: number;
  title: string;
  location: string;
  attendees: string;
  image: string;
  isLive?: boolean;
};

export type Club = {
  id: string;
  name: string;
  description: string;
  image: string;
};

const myEvents: Event[] = [
  {
    id: 5,
    title: 'Club Soccer Practice',
    location: 'South Campus Fields',
    attendees: '12 going',
    image: 'https://plus.unsplash.com/premium_photo-1685231505282-fd4188e44841?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isLive: true,
  },
  {
    id: 6,
    title: 'Code & Coffee Meetup',
    location: 'Moseley Student Center',
    attendees: '9 going',
    image: 'https://images.unsplash.com/flagged/photo-1556655678-9d4812e3fbe9?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isLive: false,
  },
];

const exploreEvents: Event[] = [
  {
    id: 1,
    title: 'International Band Night',
    location: '36 Guild Street, London',
    attendees: '20 going',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
  },
  {
    id: 2,
    title: "Jo Malone's Art Gala",
    location: 'Radius Gallery, Santa Cruz',
    attendees: '32 going',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
  },
];

const recommendedEvents: Event[] = [
  {
    id: 3,
    title: 'Sustainability Panel',
    location: 'McBride Gathering Space',
    attendees: '15 going',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400',
  },
];

const clubs: Club[] = [
  {
    id: '1',
    name: 'Elon Coding Club',
    description: 'Build projects, attend hackathons, and improve your coding skills.',
    image: 'https://img.icons8.com/fluency/96/code.png',
  },
  {
    id: '2',
    name: 'Black Student Union',
    description: 'Celebrating and supporting the Black community on campus.',
    image: 'https://img.icons8.com/fluency/96/community-grants.png',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ExploreStackParamList>>();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const handleApplyFilters = (filters: any) => {
    console.log('Filters applied:', filters);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Feather name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <View>
          <Text style={styles.locationLabel}>Current Location</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.locationText}>Elon University</Text>
            <Feather name="chevron-down" size={14} color="#666" />
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#888" style={{ marginRight: 6 }} />
        <TextInput placeholder="Search events..." placeholderTextColor="#aaa" style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => setFiltersVisible(true)}>
          <Text style={{ color: '#5669FF', fontWeight: '500' }}>Filters</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Events</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {myEvents.filter(e => e.isLive).map((event: Event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => navigation.navigate('EventDetail', { event })}>
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              {event.isLive && (
                <View style={styles.liveIndicator}><Text style={styles.liveText}>LIVE</Text></View>
              )}
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Feather name="map-pin" size={14} color="#666" />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
                <Text style={styles.attendees}>{event.attendees}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {exploreEvents.map((event: Event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => navigation.navigate('EventDetail', { event })}>
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Feather name="map-pin" size={14} color="#666" />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
                <Text style={styles.attendees}>{event.attendees}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommendedEvents.map((event: Event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => navigation.navigate('EventDetail', { event })}>
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Feather name="map-pin" size={14} color="#666" />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
                <Text style={styles.attendees}>{event.attendees}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Clubs</Text>
        </View>
        {clubs.map((club: Club) => (
          <TouchableOpacity key={club.id} style={styles.clubCard} onPress={() => navigation.navigate('ClubDetail', { club })}>
            <Image source={{ uri: club.image }} style={styles.clubImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.clubName}>{club.name}</Text>
              <Text style={styles.clubDesc}>{club.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <FiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        onApply={handleApplyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  locationLabel: { fontSize: 12, color: '#888' },
  locationText: { fontSize: 14, fontWeight: '600', color: '#333', marginRight: 4 },
  searchBox: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  scrollContent: { paddingBottom: 120 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#222' },
  seeAll: { fontSize: 14, color: '#5669FF' },
  eventCard: {
    width: 220,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  eventImage: { width: '100%', height: 120, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  liveIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'red',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
  },
  eventInfo: { padding: 10 },
  eventTitle: { fontSize: 16, fontWeight: '500', color: '#222', marginBottom: 4 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  eventLocation: { fontSize: 13, color: '#666', marginLeft: 4 },
  attendees: { fontSize: 12, color: '#5669FF', fontWeight: '500' },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  clubImage: { width: 60, height: 60, borderRadius: 10, marginRight: 12 },
  clubName: { fontSize: 16, fontWeight: '600', color: '#222' },
  clubDesc: { fontSize: 13, color: '#555', marginTop: 4 },
});