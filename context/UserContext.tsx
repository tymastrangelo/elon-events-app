import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
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
      const [eventsRes, clubsRes] = await Promise.all([supabase.from('events').select('*'), supabase.from('clubs').select('*')]);
      if (eventsRes.data) setAllEvents(eventsRes.data as Event[]);
      if (clubsRes.data) setAllClubs(clubsRes.data as Club[]);

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

  const toggleSavedEvent = async (eventId: string) => {
    const isSaved = savedEvents.includes(String(eventId));
    const userId = session?.user?.id;
    if (!userId) return;

    isSaved
      ? await supabase.from('saved_events').delete().match({ user_id: userId, event_id: eventId }) // Await this
      : await supabase.from('saved_events').insert({ user_id: userId, event_id: eventId });
    
    fetchAllUserData(session);
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
      await supabase.from('club_memberships').delete().match({ user_id: userId, club_id: clubId });
    } else {
      await supabase.from('club_memberships').insert({ user_id: userId, club_id: clubId });
    }
    fetchAllUserData(session);
  };

  const toggleRsvp = async (eventId: string) => {
    const isRsvpd = rsvpdEvents.includes(String(eventId));
    const userId = session?.user?.id;
    if (!userId) return;
    
    isRsvpd
      ? await supabase.from('rsvps').delete().match({ user_id: userId, event_id: eventId }) // Await this
      : await supabase.from('rsvps').insert({ user_id: userId, event_id: eventId });
      
    fetchAllUserData(session);
  };

  return (
    <UserContext.Provider
      value={{
        session, loading, isAdmin, managedClubIds, allEvents, allClubs,
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
