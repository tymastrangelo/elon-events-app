// screens/MapScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { myEvents, exploreEvents, Event } from '../data/mockData';
import { Modalize } from 'react-native-modalize';
import { useRef } from 'react';

const { width, height } = Dimensions.get('window');
const eventsWithCoords: Event[] = [...myEvents, ...exploreEvents].filter(e => e.coordinates);

// Import the centralized navigation types
import { RootStackNavigationProp } from '../navigation/types';
import { COLORS, SIZES } from '../theme';

export default function MapScreen() {
  // Since MapScreen is inside the TabNavigator, which is inside the Drawer,
  // we can use the RootStackNavigationProp directly.
  const navigation = useNavigation<RootStackNavigationProp>();
  const modalRef = useRef<Modalize>(null);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Ongoing' | 'Past'>('Upcoming');

  const getFilteredEvents = () => {
    return eventsWithCoords; // You can update this to filter by tab
  };

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
        {eventsWithCoords.map((event) => (
          <Marker
            key={event.id}
            coordinate={event.coordinates!}
            title={event.title}
            description={event.location}
            onPress={() => navigation.navigate('EventDetail', { event })}
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
            {['Upcoming', 'Ongoing', 'Past'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab as 'Upcoming' | 'Ongoing' | 'Past')}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={{ padding: SIZES.padding }}>
            {getFilteredEvents().map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => {
                  navigation.navigate('EventDetail', { event });
                  modalRef.current?.close();
                }}
              >
                <Image source={{ uri: event.image }} style={styles.thumbnail} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventLocation}>{event.location}</Text>
                  <Text style={styles.attendees}>{event.attendees} going</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modalize>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
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
});