import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Calendar from 'expo-calendar';
import { RootStackParamList } from '../navigation/types';
import { Event, myEvents, exploreEvents, recommendedEvents, clubs } from '../data/mockData';
import { COLORS, SIZES } from '../theme';

export default function EventDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const { event } = route.params;
  const [isBookmarked, setIsBookmarked] = useState(event.saved || false);
  const insets = useSafeAreaInsets();

  const handleBookmark = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);

    // In a real app, this would be an API call.
    // For now, we find the event in our mock data arrays and update it.
    const allEventArrays = [myEvents, exploreEvents, recommendedEvents];
    for (const eventArray of allEventArrays) {
      const eventIndex = eventArray.findIndex((e) => e.id === event.id);
      if (eventIndex !== -1) {
        eventArray[eventIndex].saved = newBookmarkState;
        break; // Stop searching once found and updated
      }
    }
  };

  const handleMapOpen = () => {
    const encodedLocation = encodeURIComponent(event.location);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    Linking.openURL(url);
  };

  const handleHostPress = () => {
    const hostClub = clubs.find((club) => club.name === event.host);
    if (hostClub) {
      navigation.navigate('ClubDetail', { club: hostClub });
    }
  };

  const handleAddToCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant calendar permissions in your settings to add this event.');
      return;
    }

    const createCalendarEvent = async () => {
      const now = new Date();
      let startDate = new Date(event.date);

      // If the hardcoded event date is in the past, intelligently adjust it for the future.
      if (startDate < now) {
        // Set the event to the same month/day but for the current year.
        startDate.setFullYear(now.getFullYear());
        // If that date has *still* passed this year, set it for next year.
        if (startDate < now) {
          startDate.setFullYear(now.getFullYear() + 1);
        }
      }

      // Assume a default duration of 2 hours if no end time is specified
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

      const eventDetails = {
        title: event.title,
        startDate,
        endDate,
        location: event.location,
        notes: event.description || `Event hosted by ${event.host}.`,
      };

      let calendarId: string | null = null;

      try {
        if (Platform.OS === 'ios') {
          const defaultCalendar = await Calendar.getDefaultCalendarAsync();
          calendarId = defaultCalendar.id;
        } else {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const writableCalendars = calendars.filter(cal => cal.allowsModifications);
          if (writableCalendars.length > 0) {
            calendarId = writableCalendars[0].id;
          }
        }

        if (!calendarId) {
          Alert.alert('Error', 'No writable calendar found on this device.');
          return;
        }

        await Calendar.createEventAsync(calendarId, eventDetails);
        Alert.alert('Success', 'Event added to your calendar!');
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Could not add event to calendar.');
      }
    };

    // Prompt the user before adding the event
    Alert.alert(
      'Add to Calendar',
      `Add "${event.title}" to your device's calendar?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add Event', onPress: createCalendarEvent },
      ]
    );
  };

  // This function formats the ISO date string into a readable format for the UI.
  const formatEventDate = (dateString: string): { day: string, time: string } => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { day, time };
  };

  return (
    <View style={styles.pageContainer}>
        {/* Back Button */}
        <TouchableOpacity // No style changes needed, but keeping for context
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { top: insets.top + 10 }]}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Bookmark Button */}
        <TouchableOpacity
          onPress={handleBookmark}
          style={[styles.bookmarkButton, { top: insets.top + 10 }]}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isBookmarked ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Event Image */}
        <Image source={{ uri: event.image }} style={styles.image} />

        {/* Floating Attendee Card */}
        <View style={styles.floatingAttendeeCard}>
          <View style={styles.avatarGroup}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }}
              style={styles.avatar}
            />
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/2.jpg' }}
              style={[styles.avatar, { zIndex: 2 }]}
            />
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/3.jpg' }}
              style={[styles.avatar, { zIndex: 1 }]}
            />
          </View>
          <Text style={styles.attendeeText}>+{event.attendees} Going</Text>
          <TouchableOpacity style={styles.inviteButton}>
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Hosted by */}
          {event.host && (
            <TouchableOpacity onPress={handleHostPress}>
              <Text style={styles.hostText}>Hosted by {event.host}</Text>
            </TouchableOpacity>
          )}

          {/* Date & Time Info */}
          {event.date && (
            <TouchableOpacity onPress={handleAddToCalendar}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Feather name="calendar" size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.infoTitle}>{formatEventDate(event.date).day}</Text>
                  <Text style={styles.infoSubtitle}>{formatEventDate(event.date).time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Location Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Feather name="map-pin" size={24} color={COLORS.primary} />
            </View>
            <TouchableOpacity onPress={handleMapOpen}>
              <View>
                <Text style={styles.infoTitle}>{event.location}</Text>
                <Text style={styles.infoSubtitle}>{event.room || 'View on map'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* About */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.description}>
              {event.description ||
                'Join us for a fun and engaging event featuring music, food, and great people!'}
            </Text>
          </View>

          {/* Map Section */}
          {event.coordinates && (
            <>
              <Text style={styles.sectionTitle}>Location</Text>
              <TouchableOpacity onPress={handleMapOpen} activeOpacity={0.9}>
                <View pointerEvents="none" style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      ...event.coordinates,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker coordinate={event.coordinates} />
                  </MapView>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Spacer so the RSVP doesn't overlap last content */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating RSVP Button */}
      <View style={[styles.rsvpWrapper, { bottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.rsvpButton}>
          <Text style={styles.rsvpButtonText}>RSVP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1, // Use constants for colors
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  image: { width: '100%', height: 240 },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bookmarkButton: {
    position: 'absolute', // Use constants for colors
    right: 20,
    zIndex: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingAttendeeCard: {
    position: 'absolute',
    top: 210, // Positioned to straddle the image bottom edge
    left: '50%',
    transform: [{ translateX: -147.5 }], // Half of width 295
    width: 295,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: 30,
    shadowColor: 'rgba(89, 89, 89, 0.1)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    marginLeft: -10,
  },
  attendeeText: {
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 6,
    fontSize: 15,
  },
  inviteButton: {
    marginLeft: 'auto',
    backgroundColor: COLORS.primary,
    borderRadius: 7,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  inviteButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 40, // Space for the floating card
  },
  title: {
    fontSize: 35,
    fontWeight: '500',
    color: COLORS.textPrimary,
    lineHeight: 40,
    marginBottom: 8,
  },
  hostText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}1A`, // primary with ~10% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  infoSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  aboutSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  mapContainer: {
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginTop: 4,
  },
  map: {
    width: '100%',
    height: 180,
  },
  rsvpWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  rsvpButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignItems: 'center',
    shadowColor: 'rgba(111, 125, 200, 0.25)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 8,
  },
  rsvpButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});