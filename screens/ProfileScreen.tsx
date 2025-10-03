import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MainLayout from './MainLayout';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../theme';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import { Event } from '../data/mockData';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { session, savedEvents, joinedClubs, rsvpdEvents, allEvents, loading: userContextLoading, refreshAllData } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  // Refetch user data when the screen is focused to see updates
  // This is good practice to keep session data fresh.
  useFocusEffect(
    React.useCallback(() => {
      const refreshUserData = async () => {
        // This will trigger the onAuthStateChange listener in AuthContext
        await supabase.auth.refreshSession();
      };
      refreshUserData();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshAllData(); // Use the global refresh function from context
    setRefreshing(false);
  }, [refreshAllData]);

  const { upcomingSavedCount, upcomingRsvpdCount } = useMemo(() => {
    const now = new Date();

    const upcomingSaved = allEvents.filter(
      (event) => savedEvents.includes(String(event.id)) && new Date(event.date) >= now
    ).length;

    const upcomingRsvpd = allEvents.filter(
      (event) => rsvpdEvents.includes(String(event.id)) && new Date(event.date) >= now
    ).length;

    return { upcomingSavedCount: upcomingSaved, upcomingRsvpdCount: upcomingRsvpd };
  }, [savedEvents, rsvpdEvents, allEvents]);

  const user = session?.user;
  const name = user?.user_metadata?.full_name || 'Elon Student';
  const handle = user?.email ? `@${user.email.split('@')[0]}` : '';

  return (
    <MainLayout>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + SIZES.padding, paddingBottom: insets.bottom + SIZES.padding * 2 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            // Use the avatar_url from user metadata, with a fallback
            source={{ uri: session?.user?.user_metadata?.avatar_url || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{name}</Text> 
          <Text style={styles.handle}>{user?.email}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <Feather name="edit-2" size={16} color={COLORS.primary} />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {userContextLoading ? (
            <View style={styles.statBox}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            <>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{String(upcomingSavedCount)}</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{String(upcomingRsvpdCount)}</Text>
                <Text style={styles.statLabel}>RSVP’d</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{String(joinedClubs.length)}</Text>
                <Text style={styles.statLabel}>Clubs</Text>
              </View>
            </>
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="bookmark-outline"
            label="My Saved Events"
            onPress={() => navigation.navigate('MySavedEvents')}
          />
          <MenuItem
            icon="calendar-outline"
            label="My RSVP'd Events"
            onPress={() => navigation.navigate('MyRsvpdEvents')}
          />
          <MenuItem
            icon="people-outline"
            label="My Clubs"
            onPress={() => navigation.navigate('MyClubs')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notification Settings"
            onPress={() => navigation.navigate('NotificationSettings')}/>
          <MenuItem icon="help-circle-outline" label="Feedback / Support" onPress={() => Alert.alert('Feedback', 'Link to feedback form/email.')} />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => supabase.auth.signOut()}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </MainLayout>
  );
}

const MenuItem = ({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.menuItem} activeOpacity={0.6} onPress={onPress}>
    <Ionicons name={icon} size={20} color={COLORS.primary} />
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.padding,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  handle: {
    color: COLORS.textSubtle,
    fontSize: 14,
    marginBottom: SIZES.base * 1.5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 2,
    borderRadius: SIZES.radius * 2,
  },
  editText: {
    marginLeft: SIZES.base,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    color: COLORS.textSubtle,
    fontSize: 13,
  },
  menuSection: {
    marginBottom: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  menuLabel: {
    marginLeft: SIZES.padding,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.base,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});