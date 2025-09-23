import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockPosts } from '../data/mockData';
import PostCard from '../components/PostCard';
import { COLORS, SIZES } from '../theme';

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // In a real app, you would re-fetch your posts here.
    // We'll simulate it with a timeout.
    setTimeout(() => {
      // Here you would update your posts data if it changed
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Feed</Text>
        </View>

        {/* Posts List */}
        <FlatList
          data={mockPosts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          onRefresh={onRefresh}
          refreshing={refreshing}
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
  },
  header: {
    marginTop: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  list: {
    flex: 1,
  },
});