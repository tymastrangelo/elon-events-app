// navigation/DrawerNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigator from './TabNavigator';
import ClubsScreen from '../screens/ClubsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomDrawer from '../components/CustomDrawer';
import ClubsStackNavigator from './ClubsStackNavigator';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        swipeEnabled: false,
        drawerType: 'front',
        headerShown: false,
        overlayColor: 'rgba(0,0,0,0.1)',
        drawerStyle: {
          backgroundColor: '#fff',
          width: 250,
        },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="Main" component={TabNavigator} />
      <Drawer.Screen name="Clubs" component={ClubsStackNavigator} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}