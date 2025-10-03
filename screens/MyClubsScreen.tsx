import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../theme';
import { Club } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

export default function MyClubsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { joinedClubs: joinedClubIds, loading: userLoading } = useUser();
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      if (joinedClubIds.length === 0) {
        setClubsLoading(false);
        return;
      }
      setClubsLoading(true);
      const { data, error } = await supabase.from('clubs').select('*').in('id', joinedClubIds);
      if (error) console.error("Error fetching joined clubs", error);
      else setAllClubs(data as Club[]);
      setClubsLoading(false);
    };
    fetchClubs();
  }, [joinedClubIds]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Clubs</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Club List */}
      <FlatList
        data={allClubs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.clubCard}
            onPress={() => navigation.navigate('ClubDetail', { clubId: item.id })}
          >
            <Image source={{ uri: item.image || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png' }} style={styles.clubImage} />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{item.name}</Text>
              <Text style={styles.clubDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {userLoading || clubsLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <Text style={styles.emptyState}>You haven't joined any clubs yet.</Text>
            )}
          </View>
        }
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
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
    paddingTop: 80,
  },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base * 2,
    padding: SIZES.base * 1.5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  clubImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  clubDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});