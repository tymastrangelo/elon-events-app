import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../theme';
import { myEvents, exploreEvents, recommendedEvents, Event } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { useUser } from '../context/UserContext';

const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ', ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export default function MyRsvpdEventsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const { rsvpdEvents } = useUser();
  const allEvents = [...myEvents, ...exploreEvents, ...recommendedEvents];

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const rsvpdEventsList = allEvents.filter((event) => rsvpdEvents.includes(String(event.id)));

    const upcoming = rsvpdEventsList
      .filter((event) => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const past = rsvpdEventsList
      .filter((event) => new Date(event.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [rsvpdEvents]);

  const displayedEvents = activeTab === 'Upcoming' ? upcomingEvents : pastEvents;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>My RSVP'd Events</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Toggle Bar */}
      <View style={styles.toggleWrapper}>
        {(['Upcoming', 'Past'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.toggleButton, activeTab === tab && styles.activeToggleButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.toggleText, activeTab === tab && styles.activeToggleText]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RSVP'd Events List */}
      <FlatList
        data={displayedEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => navigation.navigate('EventDetail', { event: item })}
          >
            <Image source={{ uri: item.image }} style={styles.thumbnail} />
            <View style={styles.cardContent}>
              <Text style={styles.date}>{formatEventDate(item.date)}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.metaRow}>
                <Feather name="map-pin" size={14} color={COLORS.textSubtle} />
                <Text style={styles.location}>{item.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyState}>
            {activeTab === 'Upcoming'
              ? "You haven't RSVP'd to any upcoming events."
              : 'No past RSVP\'d events.'}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  toggleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.input,
    borderRadius: 50,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 50,
  },
  activeToggleButton: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.border,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  activeToggleText: {
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyState: {
    fontSize: SIZES.font,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 80,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    color: COLORS.textSubtle,
    marginLeft: 4,
  },
});
