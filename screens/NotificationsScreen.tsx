import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../theme';
import { clubs, exploreEvents, myEvents, recommendedEvents, Event } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';

// --- Data Logic ---
// In a real app, this data would come from a backend notification service.

// 1. Find which clubs the user has joined.
const joinedClubs = clubs.filter(club => club.joined);
const joinedClubNames = joinedClubs.map(club => club.name);

// 2. Find all events hosted by those clubs.
const allEvents = [...exploreEvents, ...myEvents, ...recommendedEvents];
const eventNotifications = allEvents
  .filter(event => event.host && joinedClubNames.includes(event.host))
  .map(event => {
    const club = clubs.find(c => c.name === event.host);
    return {
      id: `event-${event.id}`,
      club: {
        id: club?.id || '',
        name: club?.name || 'A Club',
        avatar: club?.image || 'https://img.icons8.com/fluency/96/event-accepted-tentatively.png',
      },
      event: event,
      timestamp: '2h ago' // Mock timestamp for now
    };
  });

export default function NotificationsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const renderNotification = ({ item }: { item: (typeof eventNotifications)[0] }) => (
    <TouchableOpacity 
      style={styles.notificationCard}
      onPress={() => navigation.navigate('EventDetail', { event: item.event })}
    >
      <Image source={{ uri: item.club.avatar }} style={styles.avatar} />
      <View style={styles.notificationTextContainer}>
        <Text style={styles.notificationText}>
          <Text style={{ fontWeight: '600' }}>{item.club.name}</Text> posted a new event: <Text style={{ fontWeight: '600' }}>{item.event.title}</Text>
        </Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Notifications List */}
      <FlatList
        data={eventNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ListEmptyComponent={
          <Text style={styles.emptyState}>You have no new notifications.</Text>
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
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SIZES.base * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.base * 1.5,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 13,
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