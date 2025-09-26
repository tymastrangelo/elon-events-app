import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackNavigationProp, RootStackParamList } from '../navigation/types';
import { exploreEvents, myEvents, recommendedEvents, Event } from '../data/mockData';
import { COLORS, SIZES } from '../theme';

const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ', ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export default function EventListScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'EventList'>>();
  const { title: headerTitle, filter } = route.params;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    const allEvents = [...myEvents, ...exploreEvents, ...recommendedEvents];
    let baseEvents: Event[];

    switch (filter) {
      case 'live':
        baseEvents = allEvents.filter((event) => event.isLive);
        break;
      case 'upcoming':
        // Using exploreEvents as the source for "Upcoming" from HomeScreen
        baseEvents = exploreEvents;
        break;
      case 'recommended':
        baseEvents = recommendedEvents;
        break;
      default:
        baseEvents = [];
    }

    if (!searchQuery) return baseEvents;

    return baseEvents.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [filter, searchQuery]);

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { event: item })}
    >
      <Image source={{ uri: item.image }} style={styles.thumbnail} />
      <View style={styles.cardContent}>
        <Text style={styles.date}>{formatEventDate(item.date)}</Text>
        <Text style={styles.title}>{item.title}</Text>
        {item.host && <Text style={styles.host}>Hosted by {item.host}</Text>}
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={14} color={COLORS.textSubtle} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <Text style={styles.attendees}>{item.attendees} going</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            placeholder={`Search in ${headerTitle}...`}
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={styles.emptyState}>No events found.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SIZES.padding, backgroundColor: COLORS.background },
  header: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  searchBox: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
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
    color: COLORS.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  host: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    color: COLORS.textSubtle,
    marginLeft: 4,
  },
  attendees: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  emptyState: {
    fontSize: SIZES.font,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 80,
  },
});