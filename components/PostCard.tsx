import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Post, clubs } from '../data/mockData';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SIZES } from '../theme';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClubPress = () => {
    const fullClub = clubs.find((c) => c.id === post.club.id);
    if (fullClub) navigation.navigate('ClubDetail', { club: fullClub });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const toggleTextExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const timeAgo = (timestamp: string) => {
    // In a real app, you'd use a library like `date-fns` for accurate time formatting
    return '2h ago';
  };

  return (
    <View style={styles.card}>
      {/* Card Header - Now Touchable */}
      <TouchableOpacity onPress={handleClubPress} activeOpacity={0.8}>
        <View style={styles.header}>
          <Image source={{ uri: post.club.avatar }} style={styles.avatar} />
          <Text style={styles.clubName}>{post.club.name}</Text>
        </View>
      </TouchableOpacity>

      {/* Post Image */}
      <Image source={{ uri: post.image }} style={styles.postImage} />

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={28}
            color={isLiked ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={26} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="send" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Likes and Caption */}
      <View style={styles.content}>
        <Text style={styles.likes}>{likeCount.toLocaleString()} likes</Text>
        <Text style={styles.captionContainer} numberOfLines={isExpanded ? undefined : 2}>
          {/* Club name is clickable for navigation */}
          <Text style={styles.clubName} onPress={handleClubPress}>{post.club.name} </Text>
          {/* Caption is clickable for expansion */}
          <Text style={styles.caption} onPress={toggleTextExpansion}>{post.caption}</Text>
        </Text>
      </View>

      {/* Event Details (if applicable) */}
      {post.type === 'event' && post.eventDetails && (
        <View style={styles.eventDetails}>
          <View style={styles.eventInfoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSubtle} />
            <Text style={styles.eventText}>{new Date(post.eventDetails.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at {new Date(post.eventDetails.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.eventInfoRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSubtle} />
            <Text style={styles.eventText}>{post.eventDetails.location}</Text>
          </View>
        </View>
      )}

      <Text style={styles.timestamp}>{timeAgo(post.timestamp)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    marginBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.base * 1.5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  clubName: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1 / 1, // Square image
  },
  actions: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: SIZES.base * 1.5,
  },
  actionButton: {
    marginRight: 16,
  },
  content: {
    paddingHorizontal: SIZES.base * 1.5,
  },
  likes: {
    fontWeight: '600',
    marginBottom: 6,
    color: COLORS.textPrimary,
  },
  captionContainer: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  caption: {
    fontWeight: '400',
  },
  eventDetails: {
    marginTop: 10,
    marginHorizontal: SIZES.base * 1.5,
    padding: SIZES.base * 1.5,
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventText: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textMuted,
    paddingHorizontal: SIZES.base * 1.5,
    paddingTop: 8,
    paddingBottom: SIZES.padding,
  },
});

export default PostCard;