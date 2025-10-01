import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';
import { RootStackParamList, RootStackNavigationProp } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

type UserProfile = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export default function InviteUsersScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'InviteUsers'>>();
  const { eventId, eventName } = route.params;
  const { session } = useUser();

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [sendingInvites, setSendingInvites] = useState(false);
  const [isOnlyUser, setIsOnlyUser] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      // Fetch all users from the view we created
      const { data, error } = await supabase
        .from('all_users_with_profiles')
        .select('user_id, full_name, avatar_url');

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        // Check if the current user is the only one in the system
        if (data && data.length === 1 && data[0].user_id === session?.user?.id) {
          setIsOnlyUser(true);
        }

        // Filter out the current user from the list
        const filteredData = data.filter(user => user.user_id !== session?.user?.id);
        setAllUsers(filteredData as UserProfile[]);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [session?.user?.id]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) {
      return allUsers;
    }
    return allUsers.filter(user =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchQuery.toLowerCase()) // Allow searching by part of ID if name is not found
    );
  }, [allUsers, searchQuery]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSendInvites = async () => {
    if (selectedUserIds.size === 0) {
      Alert.alert('No Users Selected', 'Please select at least one user to invite.');
      return;
    }

    setSendingInvites(true);
    try {
      // Create a notification record for each invited user.
      const invitesToSend = Array.from(selectedUserIds).map(userId => ({
        recipient_user_id: userId,
        sender_user_id: session?.user?.id,
        type: 'EVENT_INVITE',
        message: `${session?.user?.user_metadata?.full_name || 'Someone'} invited you to the event: ${eventName}`,
        event_id: eventId,
      }));

      const { error } = await supabase.from('notifications').insert(invitesToSend);

      if (error) throw error;

      Alert.alert(
        'Invites Sent!',
        `Successfully invited ${selectedUserIds.size} users to ${eventName}.`
      );
      navigation.goBack();
    } catch (error: any) {
      console.error('Error sending invites:', error);
      Alert.alert('Error', error.message || 'Failed to send invites.');
    } finally {
      setSendingInvites(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText} numberOfLines={1}>
          Invite Users
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.subHeaderText} numberOfLines={1}>to {eventName}</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.user_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => toggleUserSelection(item.user_id)}
            >
              <Image
                source={{ uri: item.avatar_url || 'https://placekitten.com/100/100' }}
                style={styles.userAvatar}
              />
              <Text style={styles.userName}>{item.full_name || 'Unnamed User'}</Text>
              {selectedUserIds.has(item.user_id) ? (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              ) : (
                <Ionicons name="ellipse-outline" size={24} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyState}>
              {isOnlyUser ? "You're the only user in the app right now!" : "No users found."}
            </Text>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {selectedUserIds.size > 0 && (
        <TouchableOpacity
          style={[styles.sendInviteButton, sendingInvites && styles.disabledButton]}
          onPress={handleSendInvites}
          disabled={sendingInvites}
        >
          {sendingInvites ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.sendInviteButtonText}>
              Send Invite ({selectedUserIds.size})
            </Text>
          )}
        </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 100, // Space for the floating button
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base * 1.5,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  emptyState: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 50,
  },
  sendInviteButton: {
    position: 'absolute',
    bottom: SIZES.padding,
    left: SIZES.padding,
    right: SIZES.padding,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  sendInviteButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: COLORS.textMuted,
  },
});