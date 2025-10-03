// data/mockData.ts

export interface Post {
  id: number;
  type: 'event' | 'post';
  club: {
    id: string;
    name: string;
    avatar: string;
  };
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string; // ISO date string
  eventDetails?: {
    title: string;
    date: string; // ISO date string
    location: string;
  };
  isLiked: boolean;
}

// Event Type
export type Event = {
  id: number; // from bigint
  created_at: string; // from timestamp with time zone
  title: string; // from text
  description: string | null; // from text
  image: string | null; // from text
  date: string; // from timestamp with time zone
  location: string | null; // from text
  room: string | null; // from text
  host: string | null; // from text
  attendees: number; // from integer
  is_live: boolean; // from boolean
  coordinates: { latitude: number; longitude: number } | null; // from jsonb
  end_date: string | null; // from timestamp with time zone
  is_recurring: boolean; // from boolean
  recurrence_pattern: string | null; // from text
  rsvps_enabled: boolean; // from boolean
  members_only: boolean; // from boolean
};

// Club Type
export type Club = {
  id: number;
  name: string;
  category?: string;
  description: string | null;
  image: string | null;
  joined?: boolean;
  meetingTimes?: string;
  contactEmail?: string;
  member_count?: number; // Add this property
  is_private?: boolean;
};