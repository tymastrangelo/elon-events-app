import React, { useState, useEffect } from 'react';
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
import { Event, Club } from '../data/mockData';
import { COLORS, SIZES } from '../theme';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

export default function EventDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const { event } = route.params;
  const { rsvpdEvents, toggleRsvp, savedEvents, toggleSavedEvent } = useUser();
  const [hostClubId, setHostClubId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<{ avatar_url: string | null }[]>([]);
  const isRsvpd = rsvpdEvents.includes(String(event.id));
  const isBookmarked = savedEvents.includes(String(event.id));
  const insets = useSafeAreaInsets();

  const handleRsvp = () => {
    if (isRsvpd) {
      Alert.alert(
        'Cancel RSVP',
        'Are you sure you want to cancel your RSVP for this event?',
        [
          {
            text: 'Keep RSVP',
            style: 'cancel',
          },
          {
            text: 'Yes, Cancel',
            onPress: () => toggleRsvp(String(event.id)),
            style: 'destructive',
          },
        ]
      );
    } else {
      toggleRsvp(String(event.id));
    }
  };

  const handleBookmark = () => {
    if (isBookmarked) {
      // If the event is already saved, show a confirmation alert
      Alert.alert(
        'Unsave Event', // Title of the alert
        'Are you sure you want to remove this event from your saved list?', // Message
        [
          // Array of buttons
          {
            text: 'Cancel',
            style: 'cancel', // This makes it a "cancel" action (e.g., on iOS, it's bold)
          },
          {
            text: 'Unsave',
            onPress: () => toggleSavedEvent(String(event.id)), // The action to perform
            style: 'destructive', // This colors the text red on iOS to indicate a destructive action
          },
        ]
      );
    } else {
      // If the event is not saved, save it immediately without a prompt
      toggleSavedEvent(String(event.id));
    }
  };


  const handleMapOpen = () => {
    let url = '';
    const locationName = encodeURIComponent(event.location || '');

    // Prioritize using coordinates for a precise location pin.
    if (event.coordinates?.latitude && event.coordinates?.longitude) {
      const { latitude, longitude } = event.coordinates;
      // Platform-specific URL schemes to open the map app with a pin and a label.
      url = Platform.select({
        ios: `maps:0,0?q=${locationName}@${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${locationName}`,
      }) || `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } else {
      // Fallback to searching by the location name if no coordinates are present.
      url = `https://www.google.com/maps/search/?api=1&query=${locationName}`;
    }
    Linking.canOpenURL(url).then(supported => { if (supported) Linking.openURL(url); });
  };

  // Fetch the host club's ID when the component mounts
  useEffect(() => {
    const fetchHostClubId = async () => {
      if (!event.host) return;
      const { data, error } = await supabase
        .from('clubs')
        .select('id')
        .eq('name', event.host)
        .single();
      if (data) {
        setHostClubId(data.id);
      }
    };
    fetchHostClubId();
  }, [event.host]);

  // Fetch attendee avatars and count for the RSVP section
  useEffect(() => {
    const fetchAttendees = async () => {
      if (!event.rsvps_enabled) return;

      const { data, error } = await supabase
        .from('rsvps_with_profiles')
        .select('avatar_url')
        .eq('event_id', event.id);

      if (data) {
        setAttendees(data);
      }
    };
    fetchAttendees();
  }, [event.id, event.rsvps_enabled, rsvpdEvents]); // re-fetch if rsvp status changes

  const handleHostPress = async () => {
    if (hostClubId) {
      navigation.navigate('ClubDetail', { clubId: hostClubId });
    } else {
      Alert.alert('Error', 'Could not find club details.');
    }
  };

  const handleAddToCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant calendar permissions in your settings to add this event.');
      return;
    }

    const createCalendarEvent = async () => {
      const startDate = new Date(event.date);
      let endDate: Date;

      if (event.end_date) {
        endDate = new Date(event.end_date);
        // If start date is in the past, but end date isn't, something is wrong.
        // For simplicity, we won't try to adjust recurring/past events with end dates.
        // This logic primarily helps for single events without an end_date.
      } else {
        // If no end_date, assume a default duration (e.g., 2 hours)
        endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      }



      const eventDetails = {
        title: event.title,
        startDate,
        endDate, 
        location: event.location || '',
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
  const formatEventDate = (startString: string, endString: string | null): { day: string, time: string } => {
    const startDate = new Date(startString);
    const day = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    const endTime = endString 
      ? new Date(endString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : null;

    const time = endTime ? `${startTime} - ${endTime}` : startTime;
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
        <Image source={{ uri: event.image || 'https://placekitten.com/400/240' }} style={styles.image} />

        {/* Floating Attendee Card */}
        {event.rsvps_enabled && attendees.length > 0 && (
          <View style={styles.floatingAttendeeCard}>
            <View style={styles.avatarGroup}>
              {attendees.slice(0, 3).map((attendee, index) => (
                <Image
                  key={index}
                  source={{ uri: attendee.avatar_url || 'https://placekitten.com/100/100' }}
                  style={[styles.avatar, { zIndex: 3 - index }]}
                />
              ))}
            </View>
            <Text style={styles.attendeeText}>{attendees.length} Going</Text>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => navigation.navigate('InviteUsers', { eventId: event.id, eventName: event.title })}
            >
              <Text style={styles.inviteButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>
        )}

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
                  <Text style={styles.infoTitle}>{formatEventDate(event.date, event.end_date).day}</Text>
                  <Text style={styles.infoSubtitle}>{formatEventDate(event.date, event.end_date).time}</Text>
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
                <Text style={styles.infoTitle}>{event.location || 'No location specified'}</Text>
                <Text style={styles.infoSubtitle}>{event.room ? `Room: ${event.room}` : 'View on map'}</Text>
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
      {event.rsvps_enabled && (
        <View style={[styles.rsvpWrapper, { bottom: insets.bottom + 10 }]}>
          <TouchableOpacity
            onPress={handleRsvp}
            style={[styles.rsvpButton, isRsvpd && styles.rsvpdButton]}
          >
            <Text style={[styles.rsvpButtonText, isRsvpd && styles.rsvpdButtonText]}>
              {isRsvpd ? 'Going' : 'RSVP'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
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
    position: 'absolute',
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
    top: 210,
    left: '50%',
    transform: [{ translateX: -147.5 }],
    width: 295,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: 30,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
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
    paddingTop: 40,
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
    backgroundColor: `${COLORS.primary}1A`,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  rsvpButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  rsvpdButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  rsvpdButtonText: {
    color: COLORS.primary,
  },
});