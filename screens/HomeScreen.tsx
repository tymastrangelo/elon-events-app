// screens/HomeScreen.tsx
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
import { useNavigation, DrawerActions, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackNavigationProp, ExploreStackParamList } from '../navigation/types';
import FiltersModal from '../components/FiltersModal';
import {
  myEvents,
  exploreEvents,
  recommendedEvents,
  clubs,
  Event,
  Club,
} from '../data/mockData';
import { COLORS, SIZES } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<
      StackNavigationProp<ExploreStackParamList, 'ExploreHome'>,
      RootStackNavigationProp
    >
  >();
  const [filtersVisible, setFiltersVisible] = useState(false);

  const handleApplyFilters = (filters: any) => {
    console.log('Filters applied:', filters);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Feather name="menu" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.locationLabel}>Current Location</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.locationText}>Elon University</Text>
            <Feather name="chevron-down" size={14} color={COLORS.textSubtle} />
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Search + Filters */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 6 }} />
        <TextInput placeholder="Search events..." placeholderTextColor={COLORS.textMuted} style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => setFiltersVisible(true)}>
          <Text style={{ color: COLORS.primary, fontWeight: '500' }}>Filters</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* LIVE EVENTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Events</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {myEvents.filter(e => e.isLive).map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { event })}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              {event.isLive && (
                <View style={styles.liveIndicator}>
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Feather name="map-pin" size={14} color={COLORS.textSubtle} />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
                <Text style={styles.attendees}>{event.attendees} going</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* UPCOMING EVENTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {exploreEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { event })}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Feather name="map-pin" size={14} color={COLORS.textSubtle} />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
                <Text style={styles.attendees}>{event.attendees} going</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* RECOMMENDED */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommendedEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { event })}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Feather name="map-pin" size={14} color={COLORS.textSubtle} />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
                <Text style={styles.attendees}>{event.attendees} going</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CLUBS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Clubs</Text>
        </View>
        {clubs.map((club) => (
          <TouchableOpacity
            key={club.id}
            style={styles.clubCard}
            onPress={() => navigation.navigate('ClubDetail', { club })}
          >
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
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.padding },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  locationLabel: { fontSize: 12, color: COLORS.textMuted },
  locationText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginRight: 4 },
  searchBox: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
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
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  eventCard: {
    width: 220,
    marginRight: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  liveIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.live,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 10,
  },
  eventInfo: { padding: 10 },
  eventTitle: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 4 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  eventLocation: { fontSize: 13, color: COLORS.textSubtle, marginLeft: 4 },
  attendees: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    marginBottom: 12,
  },
  clubImage: { width: 60, height: 60, borderRadius: 10, marginRight: 12 },
  clubName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  clubDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});