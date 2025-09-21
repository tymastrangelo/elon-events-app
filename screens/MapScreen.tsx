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
import { useNavigation } from '@react-navigation/native';
import { myEvents, exploreEvents, Event } from '../data/mockData';
import { Modalize } from 'react-native-modalize';
import { useRef } from 'react';

const { width, height } = Dimensions.get('window');
const eventsWithCoords: Event[] = [...myEvents, ...exploreEvents].filter(e => e.coordinates);

export default function MapScreen() {
  const navigation = useNavigation<any>();
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
          <Feather name="list" size={20} color="#5669FF" />
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
        modalStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        handleStyle={{ backgroundColor: '#ccc' }}
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

          <ScrollView contentContainerStyle={{ padding: 20 }}>
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
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  map: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f3f3f3',
    borderRadius: 50,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 50,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#ccc',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
  },
  activeTabText: {
    color: '#5669FF',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
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
    color: '#222',
  },
  eventLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  attendees: {
    fontSize: 12,
    color: '#5669FF',
    marginTop: 4,
  },
});