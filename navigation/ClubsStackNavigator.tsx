// navigation/ClubsStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClubsScreen from '../screens/ClubsScreen';
import ClubDetailScreen from '../screens/ClubDetailScreen';

const Stack = createNativeStackNavigator();

export default function ClubsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClubsHome" component={ClubsScreen} />
      <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
    </Stack.Navigator>
  );
}