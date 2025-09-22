import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { COLORS, SIZES } from '../theme';
import { clubs, Club } from '../data/mockData'; // ✅ import shared mock data

const clubCategories = ['All', 'Academic', 'Cultural', 'Service', 'Sports', 'Music', 'Arts'];

export default function ClubsScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClubs = clubs.filter(
    (club) =>
      (selectedCategory === 'All' || club.category === selectedCategory) &&
      club.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
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
      <ScrollView contentContainerStyle={styles.clubList}>
        {filteredClubs.length === 0 ? (
          <Text style={styles.emptyState}>No clubs found in this category.</Text>
        ) : (
          filteredClubs.map((club: Club) => (
            <TouchableOpacity
              key={club.id}
              style={styles.clubCard}
              onPress={() => navigation.navigate('ClubDetail' as never, { club } as never)}
            >
              <Image source={{ uri: club.image }} style={styles.clubImage} />
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{club.name}</Text>
                <Text style={styles.clubCategory}>{club.category}</Text>
                <Text style={styles.clubDescription}>{club.description}</Text>
                <View style={[styles.joinButton, club.joined && styles.joinedButton]}>
                  <Text style={styles.joinButtonText}>
                    {club.joined ? 'Joined' : 'Join'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    paddingBottom: 100,
  },
  emptyState: {
    fontSize: SIZES.font,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 50,
  },
  clubCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: SIZES.base * 2,
    padding: SIZES.base * 1.5,
    alignItems: 'center',
  },
  clubImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 14,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  clubCategory: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  clubDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  joinButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  joinedButton: {
    backgroundColor: COLORS.textMuted,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});