import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../theme';
import { Club } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

export default function NotificationSettingsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { session, joinedClubs: joinedClubIds } = useUser();

  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutedClubIds, setMutedClubIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      if (!session?.user) return;

      const [clubsRes, settingsRes] = await Promise.all([
        supabase.from('clubs').select('*'),
        supabase.from('user_notification_settings').select('club_id').eq('user_id', session.user.id),
      ]);

      if (clubsRes.data) setAllClubs(clubsRes.data as Club[]);
      if (settingsRes.data) {
        const mutedIds = new Set(settingsRes.data.map(s => String(s.club_id)));
        setMutedClubIds(mutedIds);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [session?.user]);

  const togglePreference = async (clubId: string) => {
    if (!session?.user) return;

    const isCurrentlyMuted = mutedClubIds.has(clubId);
    const newMutedSet = new Set(mutedClubIds);

    if (isCurrentlyMuted) {
      // Unmute: delete the setting from the database
      newMutedSet.delete(clubId);
      await supabase.from('user_notification_settings').delete().match({ user_id: session.user.id, club_id: clubId });
    } else {
      // Mute: insert the setting into the database
      newMutedSet.add(clubId);
      await supabase.from('user_notification_settings').insert({ user_id: session.user.id, club_id: clubId });
    }
    setMutedClubIds(newMutedSet);
  };

  const joinedClubs = useMemo(
    () => allClubs.filter(club => joinedClubIds.includes(String(club.id))),
    [allClubs, joinedClubIds]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notification Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={joinedClubs}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{item.name}</Text>
            <Switch
              // The switch is "on" if the club is NOT in the muted list
              value={!mutedClubIds.has(String(item.id))}
              onValueChange={() => togglePreference(String(item.id))}
              thumbColor={
                !mutedClubIds.has(String(item.id)) ? COLORS.primary : COLORS.border
              }
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            />
          </View>
        )}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            Manage notifications for clubs you've joined.
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <Text style={styles.emptyState}>
                You haven't joined any clubs yet. Join a club to manage its notifications.
              </Text>
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
  listContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    color: COLORS.textSubtle,
    marginBottom: 20,
  },
  row: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1, // Allow text to wrap if needed
    marginRight: 10,
  },
  emptyState: {
    fontSize: SIZES.font,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
});