// data/mockData.ts

// Event Type
export type Event = {
  id: number;
  title: string;
  location: string;
  attendees: string;
  image: string;
  description?: string;
  tag?: string;
  date: string;
  host?: string;
  capacity?: number;
  contactEmail?: string;
  externalLink?: string;
  category?: string;
  isLive?: boolean; // ✅ changed from `live`
};

// Club Type
export type Club = {
  id: string;
  name: string;
  category?: string;
  description: string;
  image: string;
  joined?: boolean;
};

export const myEvents: Event[] = [
  {
    id: 5,
    title: 'Club Soccer Practice',
    location: 'South Campus Fields',
    attendees: '12',
    image: 'https://plus.unsplash.com/premium_photo-1685231505282-fd4188e44841?q=80&w=2671&auto=format&fit=crop',
    date: 'Friday, Sept 20 • 5:00 PM',
    isLive: true,
  },
  {
    id: 6,
    title: 'Code & Coffee Meetup',
    location: 'Moseley Student Center',
    attendees: '9',
    image: 'https://images.unsplash.com/flagged/photo-1556655678-9d4812e3fbe9?q=80&w=2671&auto=format&fit=crop',
    date: 'Saturday, Sept 21 • 10:00 AM',
  },
];

export const exploreEvents: Event[] = [
  {
    id: 1,
    title: 'International Band Night',
    location: '36 Guild Street, London',
    attendees: '20',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    description: 'Come experience the sound of international bands rocking the stage.',
    tag: 'Music',
    date: 'Friday, Sept 20 • 8:00 PM',
    host: 'Elon Music Society',
    capacity: 100,
    contactEmail: 'contact@elonbands.org',
    externalLink: 'https://elonbands.org/international-night',
    category: 'Music & Arts',
    isLive: false,
  },
  {
    id: 2,
    title: "Jo Malone's Art Gala",
    location: 'Radius Gallery, Santa Cruz',
    attendees: '32',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    description: 'An elegant evening showcasing Jo Malone’s latest installations.',
    tag: 'Art',
    date: 'Saturday, Sept 21 • 6:00 PM',
    host: 'Elon Fine Arts Council',
    capacity: 75,
    contactEmail: 'events@elonarts.edu',
    externalLink: 'https://elonarts.edu/malone-gala',
    category: 'Gallery & Exhibits',
  },
];

export const recommendedEvents: Event[] = [ // ✅ ADDED THIS EXPORT
  {
    id: 3,
    title: 'Sustainability Panel',
    location: 'McBride Gathering Space',
    attendees: '15',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400',
    date: 'Tuesday, Sept 24 • 7:00 PM',
    tag: 'Sustainability',
    category: 'Discussion',
  },
];

export const clubs: Club[] = [
  {
    id: '1',
    name: 'Elon Coding Club',
    category: 'Academic',
    description: 'Build projects, attend hackathons, and improve your coding skills.',
    image: 'https://img.icons8.com/fluency/96/code.png',
    joined: true,
  },
  {
    id: '2',
    name: 'Black Student Union',
    category: 'Cultural',
    description: 'Celebrating and supporting the Black community on campus.',
    image: 'https://img.icons8.com/fluency/96/community-grants.png',
    joined: false,
  },
  {
    id: '3',
    name: 'Club Soccer',
    category: 'Sports',
    description: 'Join weekly practices and compete against other universities.',
    image: 'https://img.icons8.com/fluency/96/soccer-ball.png',
  },
  {
    id: '4',
    name: 'Music Ensemble',
    category: 'Music',
    description: 'Perform, rehearse, and jam with other student musicians.',
    image: 'https://img.icons8.com/fluency/96/musical-notes.png',
    joined: true,
  },
];