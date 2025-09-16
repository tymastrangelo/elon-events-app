import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';

type Event = {
  id: number;
  title: string;
  location: string;
  attendees: string;
  image: string;
};

export type EventsStackParamList = {
  EventsHome: undefined;
  EventDetail: { event: Event };
};

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsHome" component={EventsScreen} />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{
          gestureEnabled: false, // ⛔️ disables drawer swipe gesture here
        }}
      />
    </Stack.Navigator>
  );
}