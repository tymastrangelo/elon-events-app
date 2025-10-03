import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { COLORS, SIZES } from '../theme';
import { supabase } from '../lib/supabase';
import { Club } from '../data/mockData';

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const { managedClubIds, loading: userLoading } = useUser();
  const [managedClubs, setManagedClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchManagedClubs = useCallback(async () => {
    if (userLoading) return; // Don't fetch if user context is still loading

    if (managedClubIds.length === 0) {
      setManagedClubs([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .in('id', managedClubIds);

    if (error) {
      console.error('Error fetching managed clubs:', error);
    } else {
      setManagedClubs(data as Club[]);
    }
    setLoading(false);
  }, [managedClubIds, userLoading]);

  useEffect(() => {
    fetchManagedClubs();
  }, [fetchManagedClubs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchManagedClubs();
    setRefreshing(false);
  }, [fetchManagedClubs]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Feather name="menu" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Admin Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={managedClubs}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Select a club to manage its events and posts.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.clubCard}
            onPress={() =>
              navigation.navigate('ManageClub', { clubId: item.id, clubName: item.name })
            }
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
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <Text style={styles.emptyState}>You are not an admin for any clubs.</Text>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.padding },
  header: { marginTop: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  sectionTitle: { fontSize: 15, color: COLORS.textSubtle, marginBottom: 20, textAlign: 'center' },
  listContent: { paddingBottom: 40 },
  clubCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: SIZES.radius, marginBottom: SIZES.base * 2, padding: SIZES.base * 1.5, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  clubImage: { width: 60, height: 60, borderRadius: SIZES.radius, marginRight: SIZES.padding },
  clubInfo: { flex: 1 },
  clubName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  clubDescription: { fontSize: 14, color: COLORS.textSecondary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyState: { fontSize: SIZES.font, color: COLORS.textMuted, textAlign: 'center', marginTop: 80 },
});