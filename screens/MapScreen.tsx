// screens/MapScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Event } from '../data/mockData';
import { Modalize } from 'react-native-modalize';
import { useRef } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

// Import the centralized navigation types
import { RootStackNavigationProp } from '../navigation/types';
import { COLORS, SIZES } from '../theme';

type ActiveTab = 'Saved' | 'RSVPd';

export default function MapScreen() {
  // Since MapScreen is inside the TabNavigator, which is inside the Drawer,
  // we can use the RootStackNavigationProp directly.
  const navigation = useNavigation<RootStackNavigationProp>();
  const modalRef = useRef<Modalize>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('Saved');
  const { savedEvents, rsvpdEvents, allEvents, loading: userLoading } = useUser();

  const allEventsWithCoords = useMemo(() => allEvents.filter(e => e.coordinates), [allEvents]);

  const eventsForMapPins = useMemo(() => {
    return allEventsWithCoords.filter(
      (event) =>
        savedEvents.includes(String(event.id)) || rsvpdEvents.includes(String(event.id))
    );
  }, [allEventsWithCoords, savedEvents, rsvpdEvents]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerWrapper}>
        <Text style={styles.header}>Campus Map</Text>
        <TouchableOpacity onPress={() => modalRef.current?.open()}>
          <Feather name="list" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 36.1041,
          longitude: -79.5069,
          latitudeDelta: 0.0025,
          longitudeDelta: 0.0025,
        }}
        showsUserLocation
        showsCompass
        zoomControlEnabled
      >
        {eventsForMapPins.map((event) => (
          <Marker
            key={event.id}
            coordinate={event.coordinates!}
            title={event.title}
            description={event.location || ''}
            onCalloutPress={() => navigation.navigate('EventDetail', { event })}
          />
        ))}
      </MapView>

      <Modalize
        ref={modalRef}
        adjustToContentHeight
        modalStyle={{ borderTopLeftRadius: SIZES.radius, borderTopRightRadius: SIZES.radius }}
        handleStyle={{ backgroundColor: COLORS.border }}
        withHandle
      >
        <View style={styles.modalContent}>
          <View style={styles.tabBar}>
            {(['Saved', 'RSVPd'] as ActiveTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ padding: SIZES.padding }}>
            {activeTab === 'Saved' && (
              <EventList
                events={allEventsWithCoords.filter((e) => savedEvents.includes(String(e.id)))}
                navigation={navigation}
                modalRef={modalRef}
                emptyMessage="You haven't saved any events with a location." 
                loading={userLoading}
              />
            )}
            {activeTab === 'RSVPd' && (
              <EventList
                events={allEventsWithCoords.filter((e) => rsvpdEvents.includes(String(e.id)))}
                navigation={navigation}
                modalRef={modalRef}
                emptyMessage="You haven't RSVP'd to any events with a location."
                loading={userLoading}
              />
            )}
          </View>
        </View>
      </Modalize>
    </SafeAreaView>
  );
}

const EventList = ({ events, navigation, modalRef, emptyMessage, loading }: any) => {
  if (loading) {
    return (
      <View style={styles.emptyStateContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (events.length === 0) {
    return <Text style={styles.emptyStateText}>{emptyMessage}</Text>;
  }
  return (
    <ScrollView>
      {events.map((event: Event) => {
        // Correctly determine if an event is live based on current time
        const now = new Date();
        const startDate = new Date(event.date);
        // Assume a 2-hour duration if no end date is provided
        const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        const isCurrentlyLive = now >= startDate && now <= endDate;

        return (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => {
              navigation.navigate('EventDetail', { event });
              modalRef.current?.close();
            }}
          >
            <Image source={{ uri: event.image || 'https://placekitten.com/120/120' }} style={styles.thumbnail} />
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventLocation}>{event.location || 'No location specified'}</Text>
              <Text style={styles.attendees}>{event.attendees} going</Text>
            </View>
            {isCurrentlyLive && (
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? SIZES.padding * 1.5 : 0,
  },
  headerWrapper: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  map: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.input,
    borderRadius: 50,
    padding: 4,
    marginHorizontal: SIZES.padding,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 50,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.border,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  eventLocation: {
    fontSize: 13,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
  attendees: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  emptyStateText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 15,
    paddingVertical: 40,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.live,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 10,
  },
});