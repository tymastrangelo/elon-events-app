import { StackNavigationProp } from '@react-navigation/stack';
import { Club, Event, Post } from '../data/mockData';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type ExploreStackParamList = {
  ExploreHome: undefined;
  ClubDetail: { clubId: number };
};

export type FeedStackParamList = {
  FeedList: undefined;
};

export type RootStackParamList = {
  MainDrawer: undefined;
  EventDetail: { event: Event };
  ClubDetail: { clubId: number };
  MyClubs: undefined;
  MySavedEvents: undefined;
  MyRsvpdEvents: undefined;
  EventList: { title: string; filter: 'live' | 'upcoming' | 'recommended' | 'club'; clubName?: string; };
  Notifications: undefined;
  NotificationSettings: undefined;
  EditProfile: undefined;
  ManageClub: { clubId: number; clubName: string };
  CreateEditEvent: { clubId: number; clubName: string; event?: Event };
  CreateEditPost: { clubId: number; post?: Post; onGoBack?: () => void; };
  EditClub: { clubId: number; clubName: string };
  InviteUsers: { eventId: number; eventName: string };
  RsvpList: { eventId: number; eventName: string };
  Comments: { postId: number };
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;