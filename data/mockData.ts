// data/mockData.ts

export interface Post {
  id: string;
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
  saved?: boolean;
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

export const mockPosts: Post[] = [
  {
    id: '1',
    type: 'event',
    club: {
      id: '1', // Matches 'Elon Coding Club' id
      name: 'Elon Coding Club',
      avatar: 'https://i.pravatar.cc/150?u=club1',
    },
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070',
    caption: 'Join us for our first hackathon of the semester! All skill levels welcome. Free food and prizes!',
    likes: 124,
    comments: 12,
    timestamp: '2024-10-26T19:00:00.000Z',
    eventDetails: {
      title: 'Fall Hackathon 2024',
      date: '2024-11-08T09:00:00.000Z',
      location: 'Innovation Hall, Room 204',
    },
    isLiked: false,
  },
  {
    id: '2',
    type: 'post',
    club: {
      id: '11', // Matches 'Student Union Board' id
      name: 'Black Student Union',
      avatar: 'https://i.pravatar.cc/150?u=club2',
    },
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd51622?q=80&w=2070',
    caption: 'Thanks to everyone who came out to the concert last night! It was a huge success. What artist should we bring next?',
    likes: 302,
    comments: 45,
    timestamp: '2024-10-25T22:15:00.000Z',
    isLiked: true,
  },
  {
    id: '3',
    type: 'event',
    club: {
      id: '5', // Matches 'Elon Volunteers!' id
      name: 'Elon Volunteers!',
      avatar: 'https://i.pravatar.cc/150?u=club3',
    },
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070',
    caption: 'Help us make a difference this weekend at the local animal shelter. Transportation provided. Sign up link in bio!',
    likes: 88,
    comments: 5,
    timestamp: '2024-10-25T14:30:00.000Z',
    eventDetails: {
      title: 'Animal Shelter Volunteering',
      date: '2024-11-09T10:00:00.000Z',
      location: 'Burlington Animal Services',
    },
    isLiked: false,
  },
  {
    id: '4',
    type: 'post',
    club: {
      id: '1', // Matches 'Elon Coding Club' id
      name: 'Elon Coding Club',
      avatar: 'https://i.pravatar.cc/150?u=club1',
    },
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070',
    caption: 'Quick recap of our Python workshop. We covered data structures and algorithms. Slides are now available on our PhoenixCONNECT page.',
    likes: 75,
    comments: 8,
    timestamp: '2024-10-24T18:00:00.000Z',
    isLiked: true,
  },
];

export const myEvents: Event[] = [
  {
    id: 5,
    title: 'Club Soccer Practice',
    location: 'South Campus Fields',
    attendees: '12',
    image: 'https://images.mlssoccer.com/image/private/t_editorial_landscape_8_desktop_mobile/mls-dal-prd/lb7n66r3roaa5zvzog85.png',
    date: 'Friday, Sept 20 • 5:00 PM',
    host: 'Club Soccer',
    isLive: true,
  },
  {
    id: 6,
    title: 'Code & Coffee Meetup',
    location: 'Moseley Student Center',
    attendees: '9',
    image: 'https://images.unsplash.com/flagged/photo-1556655678-9d4812e3fbe9?q=80&w=2671&auto=format&fit=crop',
    date: 'Saturday, Sept 21 • 10:00 AM',
    host: 'Elon Coding Club',
  },
  {
    id: 10,
    title: 'Fall Musical: Into the Woods',
    location: 'McCrary Theatre',
    attendees: '150',
    image: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=2670&auto=format&fit=crop',
    date: 'Friday, Nov 8 • 7:30 PM',
    host: 'Music Ensemble',
  },
];

export const exploreEvents: Event[] = [
  {
    id: 1,
    title: 'International Band Night',
    location: '36 Guild Street, London',
    attendees: '45',
    image: 'https://cdn.selakentertainment.com/wp-content/uploads/20200831085438/the-boy-band-night-cover.jpg',
    description: 'Come experience the sound of international bands rocking the stage.',
    tag: 'Music',
    date: 'Friday, Sept 20 • 8:00 PM',
    host: 'Elon Music Society',
    capacity: 100,
    contactEmail: 'contact@elonbands.org',
    externalLink: 'https://elonmusicsociety.org/events',
    category: 'Music & Arts',
    isLive: false,
  },
  {
    id: 2,
    title: "Jo Malone's Art Gala",
    location: 'Radius Gallery, Santa Cruz',
    attendees: '32',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/6c/06/c1/the-renaissance-and-baroque.jpg?w=900&h=500&s=1',
    description: 'An elegant evening showcasing Jo Malone’s latest installations.',
    tag: 'Art',
    date: 'Saturday, Sept 21 • 6:00 PM',
    host: 'Elon Fine Arts Council',
    capacity: 50,
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
    image: 'https://snworksceo.imgix.net/enn/6e4a97a9-f875-47c0-a782-3de16f7b042b.sized-1000x1000.jpg?w=1000',
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
    image: 'https://geminidjs.com/wp-content/uploads/2019/12/craps-table-casino-night.jpeg',
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
    image: 'https://www.sfasu.edu/sites/default/files/styles/primary_image/public/2022-07/career-fairs-student-primary-image.jpg?itok=p_z868P3',
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
    host: 'Elon Volunteers!',
  },
  {
    id: 11,
    title: 'Guest Speaker: Dr. Anya Sharma',
    location: 'Whitley Auditorium',
    attendees: '85',
    image: 'https://wpvip.edutopia.org/wp-content/uploads/2025/01/iStock-2160732400-CROP.jpg?w=2880&quality=85',
    date: 'Monday, Oct 7 • 5:30 PM',
    tag: 'Lecture',
    category: 'Academic',
    host: 'Society of Professional Journalists',
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
    host: 'Student Professional Development Center',
  },
  {
    id: 13,
    title: 'Outdoor Movie Night: "Dune"',
    location: 'Young Commons',
    attendees: '120',
    image: 'https://blog.uclfilm.com/wp-content/uploads/2021/12/dune-2021-movie-characters-hd-wallpaper-1920x1080-uhdpaper.com-120.0_c-1.jpg',
    date: 'Thursday, Sept 19 • 8:30 PM',
    tag: 'Movie',
    category: 'Arts',
    host: 'CinElon',
  },
  {
    id: 14,
    title: 'Hanging Rock Day Hike',
    location: 'Hanging Rock State Park',
    attendees: '18',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2670&auto=format&fit=crop',
    date: 'Saturday, Sept 28 • 9:00 AM',
    tag: 'Outdoors',
    category: 'Sports',
    host: 'Elon Outdoors',
  },
];

export const clubs: Club[] = [
  {
    id: '1',
    name: 'Elon Coding Club',
    category: 'Academic',
    description: 'Build projects, attend hackathons, and improve your coding skills.',
    image: 'https://rock-the-prototype.com/wp-content/uploads/2023/01/Coden-im-Team-Warum-gemeinsam-programmieren-so-effektiv-ist_hochaufloesend_RTP.jpg',
    joined: true,
    meetingTimes: 'Tuesdays at 7:00 PM',
    contactEmail: 'coding@elon.edu',
  },
  {
    id: '2',
    name: 'Black Student Union',
    category: 'Cultural',
    description: 'Celebrating and supporting the Black community on campus.',
    image: 'https://3.files.edl.io/6361/23/05/25/000648-f046c30b-0e20-4847-8c8f-96bbc0771249.jpg',
    meetingTimes: 'Bi-weekly on Wednesdays',
    joined: false,
  },
  {
    id: '3',
    name: 'Club Soccer',
    category: 'Sports',
    description: 'Join weekly practices and compete against other universities.',
    image: 'https://www.soccerwire.com/wp-content/uploads/2020/05/us-club-soccer-broll-npl.jpg',
    contactEmail: 'soccer-club@elon.edu',
  },
  {
    id: '4',
    name: 'Music Ensemble',
    category: 'Music',
    description: 'Perform, rehearse, and jam with other student musicians.',
    image: 'https://www.liveabout.com/thmb/KI0A7ByS7qfYjizowBJnP-2mTKI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Jarusalem-Quartet-String-Quartet-56a1541a5f9b58b7d0be5177.jpg',
    joined: true,
    meetingTimes: 'Fridays at 5:00 PM',
  },
  {
    id: '5',
    name: 'Elon Volunteers!',
    category: 'Service',
    description: 'The central hub for service opportunities on and off campus.',
    image: 'https://snworksceo.imgix.net/enn/82d26e1f-a76f-42b1-82ab-ace6052c5b8b.sized-1000x1000.jpg?w=1000',
    meetingTimes: 'Monthly General Meetings',
    contactEmail: 'ev@elon.edu',
  },
  {
    id: '6',
    name: 'CinElon',
    category: 'Arts',
    description: 'Elon\'s student-run cinema, showcasing films and hosting discussions.',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/a1/8b/33/welcome-to-our-new-outdoor.jpg?w=900&h=500&s=1',
    joined: false,
  },
  {
    id: '7',
    name: 'Society of Professional Journalists',
    category: 'Academic',
    description: 'A network for student journalists to develop skills and connect with professionals.',
    image: 'https://snworksceo.imgix.net/tms/b14da69e-06df-4619-96dc-903d6a8d8b6e.sized-1000x1000.png?w=1000',
    contactEmail: 'spj@elon.edu',
  },
  {
    id: '8',
    name: 'Elon Outdoors',
    category: 'Sports',
    description: 'Organizes hiking, climbing, and kayaking trips for all skill levels.',
    image: 'https://www.scenic.org/wp-content/uploads/2024/06/Photo-brismith933-gmail-com-202581355.jpg',
    joined: true,
  },
  {
    id: '9',
    name: 'Habitat for Humanity',
    category: 'Service',
    description: 'Building homes, communities, and hope in Alamance County.',
    image: 'https://www.agegracefullyamerica.com/wp-content/uploads/2025/04/Humanity-W1.png',
  },
  // Added clubs from events to ensure data integrity
  {
    id: '10',
    name: 'Elon Music Society',
    category: 'Music & Arts',
    description: 'A place for music lovers to unite, from classical to contemporary.',
    image: 'https://saiedmusic.com/wp-content/uploads/2022/09/music-rainbow.jpg',
    joined: false,
    contactEmail: 'contact@elonbands.org',
  },
  {
    id: '11',
    name: 'Student Union Board',
    category: 'Campus Life',
    description: 'Bringing the best events, concerts, and entertainment to campus.',
    image: 'https://se-images.campuslabs.com/clink/images/8778e489-0da4-4cee-97e3-5f366ad7f6f626db8020-342f-4387-9afd-06de95eda195.jpg?preset=med-sq',
    joined: true,
  },
  {
    id: '12',
    name: 'Elon Fine Arts Council',
    category: 'Gallery & Exhibits',
    description: 'Promoting visual arts and creative expression within the Elon community.',
    image: 'https://aaft.com/blog/wp-content/uploads/2025/01/freepik__the-style-is-candid-image-photography-with-natural__28208-1024x701.webp',
    joined: false,
  },
  {
    id: '13',
    name: 'Elon Athletics',
    category: 'Athletics',
    description: 'Support all of Elon\'s official NCAA sports teams. Go Phoenix!',
    image: 'https://img.olympics.com/images/image/private/t_s_pog_staticContent_hero_sm_2x/f_auto/primary/hiuf5ahd3cbhr11q6m5m',
  },
  {
    id: '14',
    name: 'Student Professional Development Center',
    category: 'Career',
    description: 'Your on-campus resource for resumes, interviews, and career planning.',
    image: 'https://marvel-b1-cdn.bc0a.com/f00000000297652/eloncdn.blob.core.windows.net/eu3/sites/3/2025/01/spdc-hero-4.jpg',
  },
];