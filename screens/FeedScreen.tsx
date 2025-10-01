import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Post } from '../data/mockData';
import PostCard from '../components/PostCard';
import { COLORS, SIZES } from '../theme';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

// This type accurately represents the data returned by the `get_feed_posts` RPC.
type FeedPost = Post & {
  club_id: number;
  club_name: string;
  club_avatar: string;
  is_liked: boolean;
  comments: number;
};

export default function FeedScreen() {
  // Use the more accurate FeedPost type for the state.
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { joinedClubs } = useUser(); // We use this to trigger a re-fetch when clubs are joined/left

  const fetchFeed = async () => {
    const { data, error } = await supabase.rpc('get_feed_posts');

    if (error) {
      console.error('Error fetching feed:', error);
      setPosts([]);
    } else {
      // The data from the RPC already matches the FeedPost type.
      setPosts(data as FeedPost[]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFeed().finally(() => setLoading(false));
  }, [joinedClubs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeed().finally(() => setRefreshing(false));
  }, [joinedClubs]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Feed</Text>
        </View>

        {/* Posts List */}
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <Text style={styles.emptyText}>Your feed is empty. Join some clubs to see their posts!</Text>
              )}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
  },
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: SIZES.font,
    textAlign: 'center',
    paddingHorizontal: SIZES.padding,
  },
});