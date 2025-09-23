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
  coordinates?: { latitude: number; longitude: number };
};

// Club Type
export type Club = {
  id: string;
  name: string;
  category?: string;
  description: string;
  image: string;
  joined?: boolean;
  meetingTimes?: string;
  contactEmail?: string;
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
  {
    id: 10,
    title: 'Fall Musical: Into the Woods',
    location: 'McCrary Theatre',
    attendees: '150',
    image: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=2670&auto=format&fit=crop',
    date: 'Friday, Nov 8 • 7:30 PM',
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
    coordinates: { latitude: 36.1043, longitude: -79.5058 }, // example coordinates
  },
  {
    id: 7,
    title: 'Elon Phoenix Football vs. Richmond',
    location: 'Rhodes Stadium',
    attendees: '8k',
    image: 'https://images.unsplash.com/photo-1531415074968-1162de287c6d?q=80&w=2592&auto=format&fit=crop',
    description: 'Cheer on the Phoenix as they take on the Richmond Spiders under the lights!',
    tag: 'Sports',
    date: 'Saturday, Oct 5 • 2:00 PM',
    host: 'Elon Athletics',
    category: 'Athletics',
    isLive: true,
    coordinates: { latitude: 36.0998, longitude: -79.5061 },
  },
  {
    id: 8,
    title: 'Late Night Elon: Casino Night',
    location: 'Moseley Center',
    attendees: '250',
    image: 'https://images.unsplash.com/photo-1523528129433-53b1b2a1a4a4?q=80&w=2670&auto=format&fit=crop',
    description: 'Try your luck at blackjack, poker, and roulette for a chance to win amazing prizes. Free food and drinks!',
    tag: 'Social',
    date: 'Friday, Oct 11 • 10:00 PM',
    host: 'Student Union Board',
    category: 'Campus Life',
  },
  {
    id: 9,
    title: 'Fall Career Fair',
    location: 'Schar Center',
    attendees: '1.2k',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop',
    description: 'Connect with over 100 employers from various industries. Bring your resume and dress for success.',
    date: 'Wednesday, Oct 2 • 1:00 PM',
    host: 'Student Professional Development Center',
    category: 'Career',
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
  {
    id: 11,
    title: 'Guest Speaker: Dr. Anya Sharma',
    location: 'Whitley Auditorium',
    attendees: '85',
    image: 'https://images.unsplash.com/photo-1587825140708-df876c12b44e?q=80&w=2670&auto=format&fit=crop',
    date: 'Monday, Oct 7 • 5:30 PM',
    tag: 'Lecture',
    category: 'Academic',
  },
  {
    id: 12,
    title: 'Resume Building Workshop',
    location: 'Koury Business Center 101',
    attendees: '30',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop',
    date: 'Thursday, Sept 26 • 4:00 PM',
    tag: 'Workshop',
    category: 'Career',
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
    meetingTimes: 'Tuesdays at 7:00 PM',
    contactEmail: 'coding@elon.edu',
  },
  {
    id: '2',
    name: 'Black Student Union',
    category: 'Cultural',
    description: 'Celebrating and supporting the Black community on campus.',
    image: 'https://img.icons8.com/fluency/96/community-grants.png',
    meetingTimes: 'Bi-weekly on Wednesdays',
    joined: false,
  },
  {
    id: '3',
    name: 'Club Soccer',
    category: 'Sports',
    description: 'Join weekly practices and compete against other universities.',
    image: 'https://img.icons8.com/fluency/96/soccer-ball.png',
    contactEmail: 'soccer-club@elon.edu',
  },
  {
    id: '4',
    name: 'Music Ensemble',
    category: 'Music',
    description: 'Perform, rehearse, and jam with other student musicians.',
    image: 'https://img.icons8.com/fluency/96/musical-notes.png',
    joined: true,
    meetingTimes: 'Fridays at 5:00 PM',
  },
  {
    id: '5',
    name: 'Elon Volunteers!',
    category: 'Service',
    description: 'The central hub for service opportunities on and off campus.',
    image: 'https://img.icons8.com/fluency/96/like.png',
    meetingTimes: 'Monthly General Meetings',
    contactEmail: 'ev@elon.edu',
  },
  {
    id: '6',
    name: 'CinElon',
    category: 'Arts',
    description: 'Elon\'s student-run cinema, showcasing films and hosting discussions.',
    image: 'https://img.icons8.com/fluency/96/movie-projector.png',
    joined: false,
  },
  {
    id: '7',
    name: 'Society of Professional Journalists',
    category: 'Academic',
    description: 'A network for student journalists to develop skills and connect with professionals.',
    image: 'https://img.icons8.com/fluency/96/news.png',
    contactEmail: 'spj@elon.edu',
  },
  {
    id: '8',
    name: 'Elon Outdoors',
    category: 'Sports',
    description: 'Organizes hiking, climbing, and kayaking trips for all skill levels.',
    image: 'https://img.icons8.com/fluency/96/trekking.png',
    joined: true,
  },
  {
    id: '9',
    name: 'Habitat for Humanity',
    category: 'Service',
    description: 'Building homes, communities, and hope in Alamance County.',
    image: 'https://img.icons8.com/fluency/96/order-delivered.png',
  },
];