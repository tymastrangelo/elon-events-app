import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FeedScreen from '../screens/FeedScreen';
import { FeedStackParamList } from './types';

const Stack = createStackNavigator<FeedStackParamList>();

export default function FeedStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FeedList"
        component={FeedScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}