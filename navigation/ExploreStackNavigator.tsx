import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import ClubDetailScreen from '../screens/ClubDetailScreen';

type Event = {
  id: number;
  title: string;
  location: string;
  attendees: string;
  image: string;
};

export type ExploreStackParamList = {
  ExploreHome: undefined;
  EventDetail: { event: Event };
  ClubDetail: { club: { id: string; name: string; description: string; image: string } };
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreHome" component={HomeScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
    </Stack.Navigator>
  );
}