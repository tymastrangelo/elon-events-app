import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  UIManager,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../navigation/EventsStackNavigator';

type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  attendees: string;
};

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'International Band Night',
    date: 'Friday, Sept 20 • 8:00 PM',
    location: '36 Guild Street, London',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    attendees: '20',
  },
  {
    id: 2,
    title: "Jo Malone's Art Gala",
    date: 'Saturday, Sept 21 • 6:00 PM',
    location: 'Radius Gallery, Santa Cruz',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    attendees: '32',
  },
  {
    id: 3,
    title: 'Code & Coffee Meetup',
    date: 'Monday, Sept 23 • 9:00 AM',
    location: 'Moseley Student Center',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
    attendees: '12',
  },
];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EventsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const [searchActive, setSearchActive] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Ongoing' | 'Past'>('Upcoming');
  const inputRef = useRef<TextInput>(null);

  const handleSearchToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchActive((prev) => !prev);

    // Focus on search input after animation
    setTimeout(() => {
      if (!searchActive) {
        inputRef.current?.focus();
      } else {
        setSearch('');
      }
    }, 200);
  };

  const filteredEvents = mockEvents.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { event: item })}
    >
      <Image source={{ uri: item.image }} style={styles.thumbnail} />
      <View style={styles.cardContent}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={14} color="#666" />
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <Text style={styles.attendees}>{item.attendees} going</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Events</Text>
          <TouchableOpacity onPress={handleSearchToggle}>
            <Feather name={searchActive ? 'x' : 'search'} size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        {searchActive && (
          <View style={styles.searchWrapper}>
            <Feather name="search" size={16} color="#999" style={{ marginRight: 6 }} />
            <TextInput
              ref={inputRef}
              placeholder="Search events..."
              placeholderTextColor="#aaa"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        )}

        {/* Toggle Bar */}
        <View style={styles.toggleWrapper}>
          {['Upcoming', 'Ongoing', 'Past'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.toggleButton,
                activeTab === tab && styles.activeToggleButton,
              ]}
              onPress={() => setActiveTab(tab as 'Upcoming' | 'Ongoing' | 'Past')}
            >
              <Text
                style={[
                  styles.toggleText,
                  activeTab === tab && styles.activeToggleText,
                ]}
              >
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overlay Blur when searching */}
        {searchActive && <View style={styles.blurOverlay} pointerEvents="none" />}

        {/* Events List */}
        <FlatList
          data={filteredEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#fff' },
  header: {
    marginTop: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  toggleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f3f3f3',
    borderRadius: 50,
    padding: 4,
    marginBottom: 16,
    zIndex: 1,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 50,
  },
  activeToggleButton: {
    backgroundColor: '#fff',
    shadowColor: '#ccc',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
  },
  activeToggleText: {
    color: '#5669FF',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  date: {
    fontSize: 13,
    color: '#5669FF',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  attendees: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  blurOverlay: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250,250,250,0.9)',
    zIndex: 0,
  },
});