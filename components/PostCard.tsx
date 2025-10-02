import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Share, Alert, ActionSheetIOS } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Post } from '../data/mockData';
import { COLORS, SIZES } from '../theme'; // Assuming you have a theme file
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../navigation/types';
import { formatDistanceToNow } from 'date-fns';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

interface PostCardProps {
  // The data from the Supabase function is slightly different from the mock Post type.
  // Let's create a more accurate type for the props.
  post: Post & {
    club_id: number;
    club_name: string;
    club_avatar: string;
    is_liked: boolean;
    comments: number;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { session } = useUser();

  // Local state for optimistic updates
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.likes);

  // For double-tap animation
  const scale = useSharedValue(0);

  const handleLike = async () => {
    if (!session?.user) return;

    const currentlyLiked = isLiked;
    const newLikeCount = currentlyLiked ? likeCount - 1 : likeCount + 1;

    // Optimistic UI update
    setIsLiked(!currentlyLiked);
    setLikeCount(newLikeCount);

    try {
      if (currentlyLiked) {
        // Unlike the post
        const { error } = await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: session.user.id });
        if (error) throw error;
      } else {
        // Like the post
        const { error } = await supabase.from('post_likes').insert({ post_id: post.id, user_id: session.user.id });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating like status:', error);
      // Revert optimistic update on failure
      setIsLiked(currentlyLiked);
      setLikeCount(likeCount);
    }
  };

  const handleClubPress = () => {
    navigation.navigate('ClubDetail', { clubId: post.club_id });
  };

  const handleShare = async () => {
    try {
      let shareMessage = post.caption;
      // Add more context if it's an event post
      if (post.type === 'event' && post.eventDetails?.title) {
        shareMessage = `Check out this event: ${post.eventDetails.title}\n\n${post.caption}`;
      }

      await Share.share({
        message: `${shareMessage}\n\nShared from Elon Events App`,
        // In a production app, you could add a URL for deep linking
        // url: `yourappscheme://post/${post.id}`
      });
    } catch (error: any) {
      Alert.alert('Error', 'Could not share post.');
    }
  };

  const handleMoreOptions = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Report Post'],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light',
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          // Report Post
          if (!session?.user.id) {
            Alert.alert('Error', 'You must be logged in to report a post.');
            return;
          }
          const { error } = await supabase.from('reports').insert({
            post_id: post.id,
            reporter_id: session.user.id,
            reason: 'User reported this post.',
          });

          if (error) {
            Alert.alert('Error', 'Could not submit report. Please try again.');
            console.error('Error reporting post:', error);
          } else {
            Alert.alert('Report Submitted', 'Thank you for your feedback. We will review this post.');
          }
        }
      }
    );
  };

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      handleLike();
      scale.value = withSequence(withSpring(1), withTiming(0, { duration: 800 }));
    });

  const animatedHeartStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.clubInfo} onPress={handleClubPress}>
          <Image source={{ uri: post.club_avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.clubName}>{post.club_name}</Text>
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMoreOptions}>
          <Feather name="more-horizontal" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <Text style={styles.caption}>{post.caption}</Text>

      {/* Image */}
      {post.image && (
        <GestureDetector gesture={doubleTap}>
          <View>
            <Image source={{ uri: post.image }} style={styles.postImage} />
            <Animated.View style={[styles.animatedHeart, animatedHeartStyle]}>
              <Ionicons name="heart" size={80} color={COLORS.white} />
            </Animated.View>
          </View>
        </GestureDetector>
      )}

      {/* Event Snippet */}
      {post.type === 'event' && post.eventDetails?.date && (
        <View style={styles.eventSnippet}>
          <Text style={styles.eventSnippetTitle}>{post.eventDetails.title}</Text>
          <Text style={styles.eventSnippetDetails}>
            {/* Ensure date is valid before formatting to prevent crash */} 
            {new Date(post.eventDetails.date).toLocaleDateString()} - {post.eventDetails.location || 'TBA'}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? COLORS.destructive : COLORS.textSecondary}
          />
          <Text style={styles.actionText}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="paper-plane-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    padding: SIZES.base * 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  clubInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  clubName: { fontWeight: '600', color: COLORS.textPrimary },
  timestamp: { fontSize: 12, color: COLORS.textMuted },
  caption: {
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SIZES.base,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
  },
  animatedHeart: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventSnippet: {
    marginTop: SIZES.base,
    padding: SIZES.base,
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
  },
  eventSnippetTitle: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  eventSnippetDetails: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    paddingTop: SIZES.base * 1.5,
    marginTop: SIZES.base,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  actionText: {
    marginLeft: 6,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});