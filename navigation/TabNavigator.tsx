import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, Feather } from '@expo/vector-icons';

import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExploreStackNavigator from './ExploreStackNavigator';
import EventsStackNavigator from './EventsStackNavigator';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#5669FF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          height: 75,
          paddingBottom: 10,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Explore') {
            return <Feather name="compass" size={size} color={color} />;
          }
          if (route.name === 'Events') {
            return <Feather name="calendar" size={size} color={color} />;
          }
          if (route.name === 'Map') {
            return <Ionicons name="map-outline" size={size} color={color} />;
          }
          if (route.name === 'Profile') {
            return <Feather name="user" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Explore" component={ExploreStackNavigator} />
      <Tab.Screen name="Events" component={EventsStackNavigator} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}