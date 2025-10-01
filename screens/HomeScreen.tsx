// screens/HomeScreen.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, DrawerActions, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackNavigationProp, ExploreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import FiltersModal from '../components/FiltersModal';
import { Event, Club } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { isToday, isTomorrow, isWithinInterval, addDays } from 'date-fns';
import { COLORS, SIZES } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<
      StackNavigationProp<ExploreStackParamList, 'ExploreHome'>,
      RootStackNavigationProp
    >
  >();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { session, loading, joinedClubs, allEvents, allClubs, refreshAllData } = useUser();
  const [activeFilters, setActiveFilters] = useState<{ time: string | null }>({ time: 'All Time' });

  const handleApplyFilters = (filters: { time: string | null }) => {
    setActiveFilters(filters);
    setFiltersVisible(false); // This was missing, causing the bug.
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAllData(); // Now valid because the function is async
    setRefreshing(false);
  }, [refreshAllData]);

  // Memoized filtering to prevent re-calculation on every render
  const filteredLiveEvents = useMemo(() => {
    const now = new Date();
    // An event is "live" if the current time is between its start and end time.
    const liveEvents = allEvents.filter(e => {
      const startDate = new Date(e.date);
      const endDate = e.end_date ? new Date(e.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2hr duration
      return now >= startDate && now <= endDate;
    });
    if (!searchQuery) return liveEvents;
    return liveEvents.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allEvents, searchQuery]);

  const filteredUpcomingEvents = useMemo(() => {
    const now = new Date();
    // Upcoming events are events that haven't started yet
    let upcoming = allEvents.filter((e) => new Date(e.date) > now);

    // Apply time filters
    if (activeFilters.time && activeFilters.time !== 'All Time') {
      const today = new Date();
      if (activeFilters.time === 'Today') {
        upcoming = upcoming.filter(e => isToday(new Date(e.date)));
      } else if (activeFilters.time === 'Tomorrow') {
        upcoming = upcoming.filter(e => isTomorrow(new Date(e.date)));
      } else if (activeFilters.time === 'This Week') {
        const endOfWeek = addDays(today, 7);
        upcoming = upcoming.filter(e => isWithinInterval(new Date(e.date), { start: today, end: endOfWeek }));
      }
    }

    // Apply search query last
    if (searchQuery) {
      upcoming = upcoming.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return upcoming;
  }, [allEvents, searchQuery, activeFilters]);

  const filteredRecommendedEvents = useMemo(() => {
    const now = new Date();
    const joinedClubNames = allClubs
      .filter(club => joinedClubs.includes(String(club.id)))
      .map(club => club.name);
    
    // We will still filter out live events to avoid showing them twice in prominent positions,
    // but we will allow an event to be in both "Upcoming" and "Recommended" as that is less jarring.
    // This makes the carousel count match the "See All" page.
    const recommended = allEvents.filter(event => event.host && joinedClubNames.includes(event.host) && !filteredLiveEvents.includes(event) && new Date(event.date) >= now);
    
    if (!searchQuery) return recommended;
    return recommended.filter(event => event.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allEvents, allClubs, joinedClubs, searchQuery, filteredLiveEvents]);

  const filteredRecurringEvents = useMemo(() => {
    const recurring = allEvents.filter(event => event.is_recurring);
    if (!searchQuery) return recurring;
    return recurring.filter(event => event.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allEvents, searchQuery]);

  const filteredClubs = useMemo(() => {
    const joined = allClubs.filter((club) => joinedClubs.includes(String(club.id)));
    if (!searchQuery) return joined;
    return joined.filter((club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allClubs, joinedClubs, searchQuery]);

  const firstName = session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Friend';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Feather name="menu" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerNotificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Search + Filters */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 6 }} />
        <TextInput // No style changes needed, but keeping for context
          placeholder="Search events, clubs..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setFiltersVisible(true)}>
          <Text style={{ color: COLORS.primary, fontWeight: '500' }}>Filters</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled"
      >
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeTitle}>Hello, {firstName} 👋</Text>
          <Text style={styles.welcomeSubtitle}>Find events and clubs just for you.</Text>
        </View>

        {/* LIVE EVENTS */}
        {filteredLiveEvents.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Live Events</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('EventList', { title: 'Live Events', filter: 'live' })
                }
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredLiveEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { event })}
            >
              <Image source={{ uri: event.image || 'https://placekitten.com/280/180' }} style={styles.eventImage} />
              <View style={styles.eventCardOverlay} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Feather name="map-pin" size={12} color={COLORS.white} />
                  <Text style={styles.eventLocation}>{event.location || 'Campus'}</Text>
                </View>
              </View>
              {event.is_live && (
                <View style={styles.liveIndicator}>
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* UPCOMING EVENTS */}
        {filteredUpcomingEvents.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('EventList', { title: 'Upcoming Events', filter: 'upcoming' })
                }
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredUpcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { event })}
            >
              <Image source={{ uri: event.image || 'https://placekitten.com/280/180' }} style={styles.eventImage} />
              <View style={styles.eventCardOverlay} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Feather name="map-pin" size={12} color={COLORS.white} />
                  <Text style={styles.eventLocation}>{event.location || 'Campus'}</Text>
                </View>
              </View>
            </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* RECOMMENDED */}
        {filteredRecommendedEvents.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended For You</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('EventList', { title: 'Recommended', filter: 'recommended' })
                }
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredRecommendedEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { event })}
            >
              <Image source={{ uri: event.image || 'https://placekitten.com/280/180' }} style={styles.eventImage} />
              <View style={styles.eventCardOverlay} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Feather name="map-pin" size={12} color={COLORS.white} />
                  <Text style={styles.eventLocation}>{event.location || 'Campus'}</Text>
                </View>
              </View>
            </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* RECURRING EVENTS */}
        {filteredRecurringEvents.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recurring Events</Text>
              {/* Optionally add a "See All" for recurring events */}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredRecurringEvents.map((event) => (
            <TouchableOpacity
              key={`recurring-${event.id}`}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { event })}
            >
              <Image source={{ uri: event.image || 'https://placekitten.com/280/180' }} style={styles.eventImage} />
              <View style={styles.eventCardOverlay} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Feather name="repeat" size={12} color={COLORS.white} />
                  <Text style={styles.eventLocation}>
                    {
                      event.recurrence_pattern === 'weekly' ? 'Every Week' :
                      event.recurrence_pattern === 'bi-weekly' ? 'Every 2 Weeks' :
                      event.recurrence_pattern === 'monthly' ? 'Every Month' :
                      'Recurring'
                    }
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* CLUBS */}
        {filteredClubs.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Clubs</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyClubs')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {filteredClubs.map((club) => (
              <TouchableOpacity
                key={club.id}
                style={styles.clubCard}
                onPress={() => navigation.navigate('ClubDetail', { clubId: club.id })}
              >
                <Image source={{ uri: club.image || 'https://placekitten.com/100/100' }} style={styles.clubImage} />
                <View style={styles.clubInfo}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <Text style={styles.clubDesc} numberOfLines={2}>{club.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Only render the modal after the initial data load is complete */}
      {!loading && (
        <FiltersModal
          visible={filtersVisible}
          onClose={() => setFiltersVisible(false)}
          onApply={handleApplyFilters}
          activeFilters={activeFilters}
        />
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.padding },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerNotificationButton: {},
  searchBox: {
    marginTop: 8,
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
  filterButton: {},
  scrollContent: { paddingBottom: 120 },
  welcomeHeader: {
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.padding,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  eventCard: {
    width: 280,
    height: 180,
    marginRight: 16,
    borderRadius: SIZES.radius * 1.5,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.live,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radius * 0.5,
  },
  liveText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 10,
  },
  eventInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eventMeta: { flexDirection: 'row', alignItems: 'center' },
  eventLocation: {
    fontSize: 13,
    color: COLORS.white,
    marginLeft: 4,
    fontWeight: '500',
    opacity: 0.9,
  },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    marginBottom: 12,
  },
  clubImage: { width: 50, height: 50, borderRadius: SIZES.radius, marginRight: 12 },
  clubInfo: { flex: 1 },
  clubName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  clubDesc: { fontSize: 13, color: COLORS.textSubtle, marginTop: 2 },
});