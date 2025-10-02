import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Alert, AppState, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Event, Club } from '../data/mockData';

interface UserContextType {
  // Auth State
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  managedClubIds: number[];

  // User Data
  savedEvents: string[];
  joinedClubs: string[];
  rsvpdEvents: string[];
  // App-wide data
  allEvents: Event[];
  allClubs: Club[];
  // Data versioning for triggering refreshes
  notificationsVersion: number;

  // Actions
  toggleSavedEvent: (eventId: string) => Promise<void>;
  toggleJoinedClub: (clubId: string) => Promise<void>;
  toggleRsvp: (eventId: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [managedClubIds, setManagedClubIds] = useState<number[]>([]);

  // User Data State
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<string[]>([]);
  const [rsvpdEvents, setRsvpdEvents] = useState<string[]>([]);

  // App-wide data state
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  // A simple counter to trigger re-fetches in specific screens
  const [notificationsVersion, setNotificationsVersion] = useState(0);


  // --- Push Notification Setup ---
  const registerForPushNotificationsAsync = async (userId: string) => {
    if (!Device.isDevice) {
      console.log('Push notifications are only available on physical devices.');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      // Optional: Inform the user that they will not receive notifications.
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Get the Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      Alert.alert('Error', 'Missing projectId. Cannot get push token.');
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo Push Token:', token);

    // Save the token to the user's profile in Supabase
    const { error } = await supabase.from('profiles').update({ push_token: token }).eq('id', userId);

    if (error) {
      console.error('Error saving push token:', error);
      Alert.alert('Error', 'Could not save push token.');
    }
  };

  const fetchAllUserData = async (currentSession: Session | null) => {
    console.log("fetchAllUserData called. Current session:", currentSession?.user?.id);
    if (!currentSession?.user) {
      // No user, clear all state and stop loading
      console.log("No user in session. Clearing all user state.");
      setIsAdmin(false);
      setManagedClubIds([]);
      setSavedEvents([]);
      setRsvpdEvents([]);
      setJoinedClubs([]);
      setLoading(false);
      return;
    }

    try {
      const userId = currentSession.user.id;
      // Register for push notifications
      registerForPushNotificationsAsync(userId);

      const [adminRes, savedEventsRes, rsvpsRes, clubsRes] = await Promise.all([
        supabase.from('club_admins').select('club_id').eq('user_id', userId),
        supabase.from('saved_events').select('event_id').eq('user_id', userId),
        supabase.from('rsvps').select('event_id').eq('user_id', userId),
        supabase.from('club_memberships').select('club_id').eq('user_id', userId),
      ]);

      const adminData = adminRes.data;
      const adminError = adminRes.error;
      if (adminError) {
        console.error("Error fetching admin data:", adminError);
      }
      console.log("Admin data fetched:", adminData);
      setIsAdmin(adminData ? adminData.length > 0 : false);
      setManagedClubIds(adminData ? adminData.map(row => row.club_id) : []);
      console.log("isAdmin:", adminData ? adminData.length > 0 : false, "managedClubIds:", adminData ? adminData.map(row => row.club_id) : []);

      if (savedEventsRes.data) setSavedEvents(savedEventsRes.data.map(e => String(e.event_id)));
      if (rsvpsRes.data) setRsvpdEvents(rsvpsRes.data.map(e => String(e.event_id)));
      if (clubsRes.data) setJoinedClubs(clubsRes.data.map(c => String(c.club_id)));
      console.log("User data (saved, rsvpd, joined) fetched.");

    } catch (error) {
      console.error("Error fetching user-specific data:", error);
    } finally {
      // This part runs regardless of user-specific data fetching success
      await refreshAllData();
      setLoading(false);
      console.log("fetchAllUserData completed. Loading set to false.");
    }
  };

  const refreshAllData = async () => {
    try {
      const [eventsRes, clubsRes] = await Promise.all([
        supabase.from('events').select('*'),
        // Fetch clubs and the count of their members in a single query
        supabase.from('clubs').select('*, club_memberships(count)'),
      ]);
      if (eventsRes.data) setAllEvents(eventsRes.data as Event[]);
      if (clubsRes.data) {
        const clubsWithCount = clubsRes.data.map(club => ({
          ...club,
          member_count: club.club_memberships[0]?.count || 0,
        }));
        setAllClubs(clubsWithCount as Club[]);
      }

    } catch (error) {
      console.error("Error fetching user session data:", error);
    } finally {
      setLoading(false);
      console.log("fetchAllUserData completed. Loading set to false.");
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchAllUserData(session);
      console.log("onAuthStateChange event:", _event, "Session:", session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen for incoming notifications to refresh the notifications screen
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received, refreshing data...');
      // Increment the version to signal to the NotificationsScreen that it needs to refetch.
      setNotificationsVersion(v => v + 1);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, [refreshAllData]); // Add refreshAllData to dependency array

  const toggleSavedEvent = async (eventId: string) => {
    const isSaved = savedEvents.includes(String(eventId));
    const userId = session?.user?.id;
    if (!userId) return;

    // Optimistic update
    const newSavedEvents = isSaved
      ? savedEvents.filter(id => id !== eventId)
      : [...savedEvents, eventId];
    setSavedEvents(newSavedEvents);

    try {
      if (isSaved) {
        await supabase.from('saved_events').delete().match({ user_id: userId, event_id: eventId });
      } else {
        await supabase.from('saved_events').insert({ user_id: userId, event_id: eventId });
      }
    } catch (error) {
      console.error("Error toggling saved event:", error);
      // Revert on error
      setSavedEvents(savedEvents);
      Alert.alert("Error", "Could not update saved events. Please try again.");
    }
  };

  const toggleJoinedClub = async (clubId: string) => {
    const isJoined = joinedClubs.includes(String(clubId));
    const userId = session?.user?.id;
    if (!userId) return;
    console.log("toggleJoinedClub called. clubId:", clubId, "isJoined:", isJoined, "managedClubIds (current state):", managedClubIds);
    if (isJoined) {
      if (managedClubIds.includes(Number(clubId))) {
        Alert.alert('Action Not Allowed', 'You cannot leave a club you are an administrator for.');
        return;
      }
      // Optimistic update
      setJoinedClubs(joinedClubs.filter(id => id !== clubId));
      try {
        await supabase.from('club_memberships').delete().match({ user_id: userId, club_id: clubId });
      } catch (error) {
        console.error("Error leaving club:", error);
        setJoinedClubs(joinedClubs); // Revert
        Alert.alert("Error", "Could not leave the club. Please try again.");
      }
    } else {
      // Optimistic update
      setJoinedClubs([...joinedClubs, clubId]);
      try {
        await supabase.from('club_memberships').insert({ user_id: userId, club_id: clubId });
      } catch (error) {
        console.error("Error joining club:", error);
        setJoinedClubs(joinedClubs); // Revert
        Alert.alert("Error", "Could not join the club. Please try again.");
      }
    }
  };

  const toggleRsvp = async (eventId: string) => {
    const isRsvpd = rsvpdEvents.includes(String(eventId));
    const userId = session?.user?.id;
    if (!userId) return;
    
    // Optimistic update
    const newRsvpdEvents = isRsvpd
      ? rsvpdEvents.filter(id => id !== eventId)
      : [...rsvpdEvents, eventId];
    setRsvpdEvents(newRsvpdEvents);

    try {
      if (isRsvpd) {
        await supabase.from('rsvps').delete().match({ user_id: userId, event_id: eventId });
      } else {
        await supabase.from('rsvps').insert({ user_id: userId, event_id: eventId });
      }
    } catch (error) {
      console.error("Error toggling RSVP:", error);
      setRsvpdEvents(rsvpdEvents); // Revert
      Alert.alert("Error", "Could not update your RSVP. Please try again.");
    }
  };

  return (
    <UserContext.Provider
      value={{
        session, loading, isAdmin, managedClubIds, allEvents, allClubs, notificationsVersion,
        savedEvents, joinedClubs, rsvpdEvents,
        toggleSavedEvent, toggleJoinedClub, toggleRsvp, refreshAllData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
