import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventsScreen from '../screens/EventsScreen';

export type EventsStackParamList = {
  EventsHome: undefined;
};

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsHome" component={EventsScreen} />
    </Stack.Navigator>
  );
}