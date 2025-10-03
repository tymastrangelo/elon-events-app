import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  UIManager,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackNavigationProp } from '../navigation/types';
import { Event } from '../data/mockData'; // Keep the Event type
import { COLORS, SIZES } from '../theme';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

// Required for LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ', ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export default function EventsScreen() {
  // Combine types for the local stack and the root stack for full type safety
  const navigation = useNavigation<RootStackNavigationProp>();
  const { allEvents, loading } = useUser(); // Use events and loading state from context
  const [searchActive, setSearchActive] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Ongoing' | 'Past'>('Upcoming');
  const inputRef = useRef<TextInput>(null);

  const handleSearchToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchActive((prev) => !prev);

    // Focus on search input after animation
    setTimeout(() => {
      if (!searchActive) {
        inputRef.current?.focus();
      } else {
        setSearch('');
      }
    }, 200);
  };

  const filteredEvents = useMemo(() => {
    let filtered: Event[] = [];

    // 1. Filter by active tab
    if (activeTab === 'Ongoing') {
      filtered = allEvents.filter((event) => event.is_live);
    } else if (activeTab === 'Upcoming') {
      filtered = allEvents.filter((event) => !event.is_live);
    } else if (activeTab === 'Past') {
      filtered = []; // TODO: Implement logic for past events
    }

    // 2. Filter by search query
    if (search) {
      return filtered.filter((event) => event.title.toLowerCase().includes(search.toLowerCase()));
    }
    return filtered;
  }, [allEvents, activeTab, search]);

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      // Navigate directly to the 'EventDetail' screen in the root stack.
      // React Navigation will bubble this event up to the RootStack navigator.
      onPress={() => navigation.navigate('EventDetail', { event: item })}
    >
      <Image
        source={{ uri: item.image || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png' }}
        style={styles.thumbnail}
        onError={(e) => console.error('Error loading event image:', item.image, e.nativeEvent.error)}
      />
      <View style={styles.cardContent}>
        <Text style={styles.date}>{formatEventDate(item.date)}</Text>
        <Text style={styles.title}>{item.title}</Text>
        {item.host && <Text style={styles.host}>Hosted by {item.host}</Text>}
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={14} color={COLORS.textSubtle} />
          <Text style={styles.location}>{item.location || 'No location'}</Text>
        </View>
        <Text style={styles.attendees}>{item.attendees} going</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Events</Text>
          <TouchableOpacity onPress={handleSearchToggle}>
            <Feather name={searchActive ? 'x' : 'search'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        {searchActive && (
          <View style={styles.searchWrapper}>
            <Feather name="search" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
            <TextInput
              ref={inputRef}
              placeholder="Search events..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        )}

        {/* Toggle Bar */}
        <View style={styles.toggleWrapper}>
          {['Upcoming', 'Ongoing', 'Past'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.toggleButton,
                activeTab === tab && styles.activeToggleButton,
              ]}
              onPress={() => setActiveTab(tab as 'Upcoming' | 'Ongoing' | 'Past')}
            >
              <Text
                style={[
                  styles.toggleText,
                  activeTab === tab && styles.activeToggleText,
                ]}
              >
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overlay Blur when searching */}
        {searchActive && <View style={styles.blurOverlay} pointerEvents="none" />}

        {/* Events List */}
        <FlatList
          data={filteredEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <Text style={styles.emptyState}>No events found.</Text>
              )}
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SIZES.padding, backgroundColor: COLORS.background },
  header: {
    marginTop: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  toggleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.input,
    borderRadius: 50,
    padding: 4,
    marginBottom: 16,
    zIndex: 1,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 50,
  },
  activeToggleButton: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.border,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  activeToggleText: {
    color: COLORS.primary,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  date: {
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  host: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    color: COLORS.textSubtle,
    marginLeft: 4,
  },
  attendees: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  blurOverlay: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    zIndex: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyState: {
    fontSize: SIZES.font,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
});