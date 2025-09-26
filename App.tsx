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
import MyRsvpdEventsScreen from './screens/MyRsvpdEventsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import { registerForPushNotificationsAsync } from './services/pushNotifications';
import { UserProvider } from './context/UserContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <RootStack.Navigator>
            <RootStack.Screen
              name="MainDrawer"
              component={DrawerNavigator}
              options={{ headerShown: false }}
            />
            <RootStack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: false }} />
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
              name="MyRsvpdEvents"
              component={MyRsvpdEventsScreen}
              options={{ headerShown: false }}
            />
            <RootStack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ headerShown: false }}
            />
            <RootStack.Screen
              name="NotificationSettings"
              component={NotificationSettingsScreen}
              options={{ headerShown: false }}
            />
          </RootStack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}