import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Event = {
  id: number;
  title: string;
  location: string;
  attendees: string;
  image: string;
  description?: string;
  tag?: string;
  date?: string;
  host?: string;
};

export default function EventDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { event: Event } }, 'params'>>();
  const { event } = route.params;
  const insets = useSafeAreaInsets();

  // ✅ Disable drawer swipe gesture while on this screen
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent(); // get DrawerNavigator
      if (parent) parent.setOptions({ swipeEnabled: false });

      return () => {
        if (parent) parent.setOptions({ swipeEnabled: true });
      };
    }, [navigation])
  );

  const handleMapOpen = () => {
    const encodedLocation = encodeURIComponent(event.location);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.pageContainer}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { top: insets.top + 10 }]}
        >
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Event Image */}
        <Image source={{ uri: event.image }} style={styles.image} />

        <View style={styles.content}>
          {/* Attendees Row */}
          <View style={styles.attendeeRow}>
            <View style={styles.avatarGroup}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }}
                style={styles.avatar}
              />
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/2.jpg' }}
                style={styles.avatar}
              />
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/3.jpg' }}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.attendeeText}>+{event.attendees} Going</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Date */}
          {event.date && (
            <View style={styles.row}>
              <Feather name="calendar" size={16} color="#888" />
              <Text style={styles.metaText}>{event.date}</Text>
            </View>
          )}

          {/* Host */}
          {event.host && (
            <View style={styles.organizerCard}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
                style={styles.organizerAvatar}
              />
              <View>
                <Text style={styles.organizerName}>{event.host}</Text>
                <Text style={styles.organizerLabel}>Organizer</Text>
              </View>
            </View>
          )}

          {/* About */}
          <Text style={styles.sectionTitle}>About Event</Text>
          <Text style={styles.description}>
            {event.description ||
              'Join us for a fun and engaging event featuring music, food, and great people!'}
          </Text>

          {/* Map */}
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity onPress={handleMapOpen} activeOpacity={0.9}>
            <Image
              source={{
                uri: `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
                  event.location
                )}&zoom=15&size=600x300&maptype=roadmap
                &markers=color:red%7C${encodeURIComponent(event.location)}&key=YOUR_GOOGLE_MAPS_API_KEY`,
              }}
              style={styles.map}
            />
          </TouchableOpacity>
        </View>

        {/* Spacer so the RSVP doesn't overlap last content */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating RSVP Button */}
      <View style={[styles.rsvpWrapper, { bottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.rsvpButton}>
          <Text style={styles.rsvpText}>RSVP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  image: { width: '100%', height: 240 },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: { padding: 20 },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarGroup: { flexDirection: 'row', marginRight: 10 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fff',
    marginRight: -8,
  },
  attendeeText: { fontWeight: '500', color: '#5669FF' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: { marginLeft: 8, color: '#666', fontSize: 14 },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 10,
  },
  organizerAvatar: { width: 40, height: 40, borderRadius: 20 },
  organizerName: { fontWeight: '600', fontSize: 15 },
  organizerLabel: { color: '#999', fontSize: 13 },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  map: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 10,
  },
  rsvpWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  rsvpButton: {
    backgroundColor: '#5669FF',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 12,
    alignItems: 'center',
  },
  rsvpText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});