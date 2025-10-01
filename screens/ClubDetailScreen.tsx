// screens/ClubDetailScreen.tsx
import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Linking, Platform } from 'react-native';
import { Club, Event } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../theme';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ', ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export default function ClubDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{ params: { clubId: number } }, 'params'>>();
  const { clubId } = route.params;
  const insets = useSafeAreaInsets();
  const { joinedClubs, toggleJoinedClub } = useUser();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const isJoined = club ? joinedClubs.includes(String(club.id)) : false;

  useEffect(() => {
    const fetchClubData = async () => {
      setLoading(true);
      // Fetch the main club details
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();

      if (clubError) {
        console.error('Error fetching club details:', clubError);
        setLoading(false);
        return;
      }

      setClub(clubData as Club);

      // Fetch the hosted events for this club
      setLoadingEvents(true);
      // Build the query to fetch events
      let eventsQuery = supabase
        .from('events')
        .select('*')
        .eq('host', clubData.name);

      // If the user is NOT a member of this club, add a filter to only show public events.
      // The RLS policy already handles this, but an explicit filter is safer and clearer.
      if (!joinedClubs.includes(String(clubId))) {
        eventsQuery = eventsQuery.eq('members_only', false);
      }

      const { data: eventsData, error: eventsError } = await eventsQuery;

      if (eventsError) {
        console.error('Error fetching hosted events:', eventsError);
      } else {
        setHostedEvents(eventsData as Event[]);
      }
      setLoadingEvents(false);
      setLoading(false);
    };
    fetchClubData();
  }, [clubId, joinedClubs]);

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      if (parent) parent.setOptions({ swipeEnabled: false });
      return () => {
        if (parent) parent.setOptions({ swipeEnabled: true });
      };
    }, [navigation])
  );

  const handleEmail = () => {
    if (club?.contactEmail) {
      const email = club.contactEmail;
      const mailto = `mailto:${email}`;
      Linking.openURL(mailto);
    }
  };

  const handleJoinClub = () => {
    if (!club) return;
    toggleJoinedClub(String(club.id));
  };

  if (loading || !club) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backButton, { top: insets.top + 10 }]}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: club.image || 'https://placekitten.com/400/240' }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{club.name}</Text>
          <Text style={styles.category}>{club.category} Club</Text>

          {/* Meeting Times */}
          {club.meetingTimes && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Feather name="clock" size={24} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.infoTitle}>Meeting Times</Text>
                <Text style={styles.infoSubtitle}>{club.meetingTimes}</Text>
              </View>
            </View>
          )}

          {/* Contact */}
          {club.contactEmail && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Feather name="mail" size={24} color={COLORS.primary} />
              </View>
              <TouchableOpacity onPress={handleEmail}>
                <Text style={styles.infoTitle}>Contact</Text>
                <Text style={[styles.infoSubtitle, { color: COLORS.primary }]}>{club.contactEmail}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* About */}
          <Text style={styles.sectionTitle}>About the Club</Text>
          <Text style={styles.description}>{club.description}</Text>

          {/* Hosted Events */}
          <Text style={[styles.sectionTitle, { marginTop: SIZES.padding * 1.5 }]}>Hosted Events</Text>
          {loadingEvents ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />
          ) : hostedEvents.length > 0 ? (
            hostedEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => navigation.navigate('EventDetail', { event })}
              >
                <Image source={{ uri: event.image || 'https://placekitten.com/144/144' }} style={styles.eventThumbnail} />
                <View style={styles.eventCardContent}>
                  <Text style={styles.eventDate}>{formatEventDate(event.date)}</Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMetaRow}>
                    <Feather name="map-pin" size={14} color={COLORS.textSubtle} />
                    <Text style={styles.eventLocation}>{event.location || 'No location'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventsText}>This club has no upcoming events.</Text>
          )}

          {/* Leave Club Button - Renders inside the scroll view when joined */}
          {isJoined && (
            <TouchableOpacity
              style={[styles.joinButton, styles.joinedButton, { marginTop: SIZES.padding * 2 }]}
              onPress={handleJoinClub}
            >
              <Text style={[styles.joinButtonText, styles.joinedButtonText]}>Leave Club</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Join Button - Renders only when not joined */}
      {!isJoined && (
        <View style={[styles.joinWrapper, { bottom: insets.bottom + 10 }]}>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinClub}>
            <Text style={styles.joinButtonText}>Join Club</Text>
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
    paddingBottom: 80,
  },
  image: {
    width: '100%',
    height: 240,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    padding: SIZES.padding,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  category: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: SIZES.padding,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
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
  // Event Card Styles (copied from EventsScreen for consistency)
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  eventThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 14,
  },
  eventCardContent: {
    flex: 1,
  },
  eventDate: {
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocation: {
    fontSize: 13,
    color: COLORS.textSubtle,
    marginLeft: 4,
    // Allow location text to wrap if it's too long
    flexShrink: 1,
    ...Platform.select({ android: { flex: 1 } }),
  },
  noEventsText: {
    color: COLORS.textMuted,
    marginTop: 10,
    fontStyle: 'italic',
  },
  joinWrapper: {
    position: 'absolute',
    left: SIZES.padding,
    right: SIZES.padding,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    shadowColor: 'rgba(111, 125, 200, 0.25)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 8,
  },
  joinedButton: {
    backgroundColor: 'transparent', // This is intentional for an outline button
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    shadowColor: 'transparent', // Remove shadow for outline button
    elevation: 0,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: COLORS.textMuted,
  },
});