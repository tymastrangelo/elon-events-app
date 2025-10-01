// navigation/DrawerNavigator.tsx
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigator from './TabNavigator';
import ClubsScreen from '../screens/ClubsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomDrawerContent from './CustomDrawerContent';
import ClubsStackNavigator from './ClubsStackNavigator';
import { useUser } from '../context/UserContext';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { isAdmin } = useUser();

  return (
    <Drawer.Navigator
      screenOptions={{
        swipeEnabled: false,
        drawerType: 'front',
        headerShown: false,
        overlayColor: 'rgba(0,0,0,0.1)',
        drawerStyle: {
          backgroundColor: COLORS.card,
          width: 250,
        },
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.textSecondary,
        drawerLabelStyle: {
          fontWeight: '500',
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Clubs"
        component={ClubsStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      {/* Conditionally render the Admin Dashboard link */}
      {isAdmin && (
        <Drawer.Screen
          name="Admin Dashboard"
          component={AdminDashboardScreen}
          options={{
            drawerIcon: ({ color, size }) => <Ionicons name="build-outline" size={size} color={color} />,
          }}
        />
      )}
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerItemStyle: { display: 'none' }, // Hides it from the main list
        }}
      />
    </Drawer.Navigator>
  );
}