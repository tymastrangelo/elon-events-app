import { StackNavigationProp } from '@react-navigation/stack';
import { Event, Club } from '../data/mockData';
import { NavigatorScreenParams } from '@react-navigation/native';

/**
 * The parameter list for the main Drawer navigator.
 */
export type DrawerParamList = {
  Main: undefined; // This corresponds to the TabNavigator
  Clubs: undefined;
  Settings: undefined;
};

/**
 * The root stack navigator that sits at the top of the app.
 * It contains the main drawer navigator and any global modal screens.
 */
export type RootStackParamList = {
  MainDrawer: NavigatorScreenParams<DrawerParamList>;
  EventDetail: { event: Event };
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * The stack navigator for the "Events" tab.
 */
export type EventsStackParamList = {
  EventList: undefined; // The main list screen
  EventDetail: { event: Event };
};