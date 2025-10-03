import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../theme';
import { Club } from '../data/mockData'; // Keep the type, but we'll remove the data import
import { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';

// Import useUser to access global state
import { useUser } from '../context/UserContext';

const clubCategories = [
  'All',
  'Academic',
  'Academic & Professional',
  'Arts',
  'Athletics',
  'Campus Life',
  'Campus Program/Department',
  'Career',
  'Club Sports',
  'Competition',
  'Cultural',
  'Fraternities and Sororities',
  'Gallery & Exhibits',
  'Honorary',
  'Media',
  'Music',
  'Music & Arts',
  'Performance',
  'Political',
  'Programming',
  'Service',
  'Service & Advocacy',
  'Spirituality',
  'Sports',
  'University Program/Department',
];

export default function ClubsScreen() {
  const navigation = useNavigation<any>();
  // Get clubs, loading state, and refresh function from the context
  const { allClubs, loading, refreshAllData } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Use the global refresh function
    await refreshAllData();
    setIsRefreshing(false);
  }, [refreshAllData]);

  const filteredClubs = useMemo(() => allClubs.filter(
    (club) =>
      (selectedCategory === 'All' || club.category === selectedCategory) &&
      club.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [allClubs, selectedCategory, searchQuery]);
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Feather name="menu" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Clubs</Text>
        <View style={{ width: 24 }} />
      </View>
 
      {/* Search and Filter Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput 
            style={styles.searchBar}
            placeholder="Search for clubs..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory !== 'All' && styles.activeFilterButton,
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color={selectedCategory !== 'All' ? COLORS.primary : COLORS.textMuted} />
          {/* Only render the badge if a filter is active */}
          {selectedCategory !== 'All' && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {/* Club Cards */}
      <FlatList
        data={filteredClubs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.clubCard}
            // Pass only the clubId as defined in the navigation types
            onPress={() => navigation.navigate('ClubDetail', { clubId: item.id })}
          >
            <Image
              source={{ uri: item.image || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png' }}
              style={styles.clubImage}
              onError={(e) => console.error('Error loading club image:', item.image, e.nativeEvent.error)}
            />
            <View style={styles.clubInfo}>
              {item.category && (
                <Text style={styles.clubCategory}>{item.category.toUpperCase()}</Text>
              )}
              <Text style={styles.clubName}>{item.name}</Text>
              <View style={styles.memberInfo}>
                <Text style={styles.memberText}>
                  {item.member_count} {item.member_count === 1 ? 'Member' : 'Members'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <Text style={styles.emptyState}>No clubs found in this category.</Text>
            )}
          </View>
        }
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        contentContainerStyle={styles.clubList}
      />

      {/* Category Filter Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter by Category</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={clubCategories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedCategory(item);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.modalItemText, selectedCategory === item && styles.activeModalItemText]}>
                  {item}
                </Text>
                {selectedCategory === item && <Ionicons name="checkmark" size={24} color={COLORS.primary} />}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
  },
  header: {
    marginTop: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    height: 48,
  },
  searchBar: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterButton: {
    marginLeft: 12,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.input, // Default inactive state
    borderRadius: SIZES.radius,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primaryLight, // Active state
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
  },
  clubList: {
    paddingBottom: 120,
  },
  emptyState: {
    fontSize: SIZES.font,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80, // Give it some space from the top filters
  },
  clubCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base * 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  clubImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
  },
  clubInfo: {
    padding: SIZES.base * 1.5,
  },
  clubCategory: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  memberInfo: { flexDirection: 'row', alignItems: 'center' },
  memberText: { fontSize: 13, color: COLORS.textSubtle },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'ios' ? 44 : 0, // Manually add padding for iOS notch
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  activeModalItemText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});