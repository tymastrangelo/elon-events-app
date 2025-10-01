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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, DrawerActions, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../theme';
import { Club } from '../data/mockData'; // Keep the type, but we'll remove the data import
import { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';

const clubCategories = ['All', 'Academic', 'Cultural', 'Service', 'Sports', 'Music', 'Arts'];

export default function ClubsScreen() {
  const navigation = useNavigation<any>();
  const [clubs, setClubs] = useState<Club[]>([]);
  // Start in a loading state until the initial fetch is complete
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClubs = useCallback(async () => {
    const { data, error } = await supabase.from('clubs').select('*');

    if (error) {
      console.error('Error fetching clubs:', error);
    } else {
      setClubs(data as Club[]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchClubs().finally(() => setLoading(false));
  }, [fetchClubs]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchClubs().finally(() => setIsRefreshing(false));
  }, []);

  const filteredClubs = useMemo(() => clubs.filter(
    (club) =>
      (selectedCategory === 'All' || club.category === selectedCategory) &&
      club.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [clubs, selectedCategory, searchQuery]);
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Feather name="menu" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Clubs</Text>
        <View style={{ width: 24 }} />
      </View>
 
      {/* Search Bar */}
      <TextInput 
        style={styles.searchBar}
        placeholder="Search for clubs..."
        placeholderTextColor={COLORS.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Category Filter */}
      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {clubCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.activeCategoryChip,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.activeCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
              source={{ uri: item.image || 'https://placekitten.com/400/240' }}
              style={styles.clubImage}
              onError={(e) => console.error('Error loading club image:', item.image, e.nativeEvent.error)}
            />
            <View style={styles.clubInfo}>
              {item.category && (
                <Text style={styles.clubCategory}>{item.category.toUpperCase()}</Text>
              )}
              <Text style={styles.clubName}>{item.name}</Text>
              <View style={styles.memberInfo}>
                <Text style={styles.memberText}>12 Members</Text>
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
  searchBar: {
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  categoryWrapper: {
    height: 48,
    marginBottom: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.input,
    marginRight: 10,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  activeCategoryText: {
    color: COLORS.white,
    fontWeight: '600',
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
});