// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DrawerNavigator from './navigation/DrawerNavigator';
import EventDetailScreen from './screens/EventDetailScreen';
import ClubDetailScreen from './screens/ClubDetailScreen';
import MyClubsScreen from './screens/MyClubsScreen';
import MySavedEventsScreen from './screens/MySavedEventsScreen';

// This will be our main stack that handles app-wide navigation.
const RootStack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator>
          {/* The DrawerNavigator contains all our main screens (Tabs, Clubs, etc.) */}
          <RootStack.Screen
            name="MainDrawer"
            component={DrawerNavigator}
            options={{ headerShown: false }}
          />
          {/* EventDetailScreen is now a modal-style screen on top of everything else. */}
          <RootStack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: false }} />
          {/* Add ClubDetailScreen to the root stack to make it globally accessible */}
          <RootStack.Screen
            name="ClubDetail"
            component={ClubDetailScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="MyClubs"
            component={MyClubsScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="MySavedEvents"
            component={MySavedEventsScreen}
            options={{ headerShown: false }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}