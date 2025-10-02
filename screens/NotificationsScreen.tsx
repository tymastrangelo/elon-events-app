import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../theme';
import { Event, Club } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

// This type now reflects the structure of our 'notifications' table
interface NotificationItem {
  id: number;
  created_at: string;
  type: string;
  message: string;
  is_read: boolean;
  event_id: number | null;
  club_id: number | null;
  // We'll fetch related data separately or via views if needed
  event?: Event;
  club?: Partial<Club>;
}

export default function NotificationsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { session, allEvents, allClubs, notificationsVersion } = useUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching notifications", error);
      setLoading(false);
      return;
    }

    // Enrich notifications with event and club details from context
    const formattedNotifications = data.map(notif => {
      const event = notif.event_id ? allEvents.find(e => e.id === notif.event_id) : undefined;
      const club = notif.club_id ? allClubs.find(c => c.id === notif.club_id) : undefined;
      return { ...notif, event, club };
    });

    setNotifications(formattedNotifications);
    setLoading(false);
  };

  // Fetch notifications whenever the version changes (or on initial load)
  useEffect(
    () => { fetchNotifications(); },
    [session, allEvents, allClubs, notificationsVersion]
  );

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={styles.notificationCard}
      // Navigate to the event if one is associated with the notification
      onPress={() => {
        if (item.event) {
          navigation.navigate('EventDetail', { event: item.event });
        }
      }}
      disabled={!item.event} // Disable press if there's no event to navigate to
    >
      <Image source={{ uri: item.club?.image || 'https://placekitten.com/80/80' }} style={styles.avatar} />
      <View style={styles.notificationTextContainer}>
        <Text style={styles.notificationText}>{item.message}</Text>
        <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleDateString()}</Text>
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
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <Text style={styles.emptyState}>You have no new notifications.</Text>
            )}
          </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
});