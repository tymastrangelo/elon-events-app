// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import DrawerNavigator from './navigation/DrawerNavigator';
import EventDetailScreen from './screens/EventDetailScreen';
import ClubDetailScreen from './screens/ClubDetailScreen';
import MyClubsScreen from './screens/MyClubsScreen';
import MySavedEventsScreen from './screens/MySavedEventsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import { registerForPushNotificationsAsync } from './services/pushNotifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Corrected: Use the new properties
    shouldShowList: true,   // Corrected: Use the new properties
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// This will be our main stack that handles app-wide navigation.
const RootStack = createStackNavigator();

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | false>(false);
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token || ''));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
      // Here you can add logic to navigate to a specific screen
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

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
          <RootStack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerShown: false }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}