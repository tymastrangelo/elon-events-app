import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';
import { RootStackParamList, RootStackNavigationProp } from '../navigation/types';
import { supabase } from '../lib/supabase';

type Attendee = {
  user_id: string;
  // These now come directly from the view
  full_name: string | null;
  avatar_url: string | null;
};

export default function RsvpListScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'RsvpList'>>();
  const { eventId, eventName } = route.params;

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendees = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('rsvps_with_profiles') // Query the new view
        .select('user_id, full_name, avatar_url')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching RSVP list:', error);
      } else {
        setAttendees(data as Attendee[]);
      }
      setLoading(false);
    };

    fetchAttendees();
  }, [eventId]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText} numberOfLines={1}>
          RSVP List
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.subHeaderText} numberOfLines={1}>{eventName}</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={attendees}
          keyExtractor={(item) => item.user_id}
          ListHeaderComponent={
            <Text style={styles.listHeaderInfo}>
              {attendees.length} {attendees.length === 1 ? 'person' : 'people'} have RSVP'd
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.attendeeCard}>
              <Image
                source={{ uri: item.avatar_url || 'https://placekitten.com/100/100' }}
                style={styles.attendeeAvatar}
              />
              <Text style={styles.attendeeName}>{item.full_name || 'Unnamed User'}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyState}>No one has RSVP'd to this event yet.</Text>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subHeaderText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 40,
  },
  listHeaderInfo: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginBottom: 20,
    fontSize: 14,
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base * 1.5,
  },
  attendeeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  emptyState: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 50,
  },
});