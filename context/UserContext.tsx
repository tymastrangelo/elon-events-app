import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserContextType {
  savedEvents: string[];
  toggleSavedEvent: (eventId: string) => void;
  joinedClubs: string[];
  toggleJoinedClub: (clubId: string) => void;
  rsvpdEvents: string[];
  toggleRsvp: (eventId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<string[]>([]);
  const [rsvpdEvents, setRsvpdEvents] = useState<string[]>([]);

  const toggleSavedEvent = (eventId: string) => {
    setSavedEvents(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const toggleJoinedClub = (clubId: string) => {
    setJoinedClubs(prev =>
      prev.includes(clubId) ? prev.filter(id => id !== clubId) : [...prev, clubId]
    );
  };

  const toggleRsvp = (eventId: string) => {
    setRsvpdEvents(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <UserContext.Provider
      value={{
        savedEvents,
        toggleSavedEvent,
        joinedClubs,
        toggleJoinedClub,
        rsvpdEvents,
        toggleRsvp,
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
