import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ClubDetailScreen from '../screens/ClubDetailScreen';
import { ExploreStackParamList } from './types';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreHome" component={HomeScreen} />
      <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
    </Stack.Navigator>
  );
}