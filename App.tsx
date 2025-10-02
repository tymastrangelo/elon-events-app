// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
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
import EventListScreen from './screens/EventListScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import ManageClubScreen from './screens/ManageClubScreen';
import CreateEditEventScreen from './screens/CreateEditEventScreen';
import CreateEditPostScreen from './screens/CreateEditPostScreen';
import EditClubScreen from './screens/EditClubScreen';
import RsvpListScreen from './screens/RsvpListScreen';
import { UserProvider, useUser } from './context/UserContext';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import { COLORS } from './theme';
import { AuthStackParamList } from './navigation/types';
import InviteUsersScreen from './screens/InviteUsersScreen';

// Set the notification handler at the root of the app
// This ensures that the app knows how to display notifications when it's in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const RootStack = createStackNavigator(); // This will now manage the entire app flow
const AuthStack = createStackNavigator<AuthStackParamList>();

function AppContent() {
  const { session, loading } = useUser();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* If a session exists, show the main app. Otherwise, show the Login screen. */}
      {session && session.user ? <MainAppStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </SafeAreaProvider>
  );
}

// This stack contains all screens accessible *before* logging in.
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

// This stack contains all screens accessible *after* logging in.
function MainAppStack() {
  return (
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
        name="EventList"
        component={EventListScreen}
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
      <RootStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="ManageClub"
        component={ManageClubScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="CreateEditEvent"
        component={CreateEditEventScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="CreateEditPost"
        component={CreateEditPostScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="EditClub"
        component={EditClubScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="RsvpList"
        component={RsvpListScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="InviteUsers"
        component={InviteUsersScreen}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
}