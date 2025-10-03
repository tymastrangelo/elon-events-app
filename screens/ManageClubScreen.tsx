import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';
import { RootStackParamList, RootStackNavigationProp } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { Event } from '../data/mockData';
import { SwipeListView } from 'react-native-swipe-list-view';

type ActiveTab = 'Events' | 'Posts' | 'Members';

type Post = { id: number; caption: string | null; created_at: string; image: string | null };
type Member = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin?: boolean;
};

export default function ManageClubScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ManageClub'>>();
  const { clubId, clubName } = route.params;
  const { refreshAllData, allEvents, allClubs } = useUser();
  const [activeTab, setActiveTab] = useState<ActiveTab>('Events');
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Fetch members and posts specific to this club
    const [postsRes, membersRes, adminsRes] = await Promise.all([
      supabase.from('posts').select('id, caption, created_at, image').eq('club_id', clubId).order('created_at', { ascending: false }),
      supabase.from('club_members_with_profiles').select('user_id, full_name, avatar_url').eq('club_id', clubId),
      supabase.from('club_admins_with_profiles').select('user_id, full_name, avatar_url').eq('club_id', clubId),
    ]);

    // Combine members and admins, marking admins and removing duplicates
    const memberMap = new Map<string, Member>();

    if (membersRes.data) {
      (membersRes.data as Member[]).forEach(member => memberMap.set(member.user_id, { ...member, is_admin: false }));
    }

    if (adminsRes.data) {
      (adminsRes.data as Member[]).forEach(admin => {
        memberMap.set(admin.user_id, { ...admin, is_admin: true });
      });
    }

    if (postsRes.data) setPosts(postsRes.data as Post[]);
    setMembers(Array.from(memberMap.values()));

    setLoading(false);
  }, [clubId]);

  // Derive events from global context state
  const events = useMemo(() => {
    return allEvents.filter(event => event.host === clubName);
  }, [allEvents, clubName]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery) {
      return members;
    }
    return members.filter(member =>
      member.full_name?.toLowerCase().includes(memberSearchQuery.toLowerCase())
    );
  }, [members, memberSearchQuery]);

  // Refetch data when the screen comes into focus after navigating back
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleRemoveMember = (member: Member) => {
    // Prevent admins from removing other admins
    if (member.is_admin) {
      Alert.alert('Action Not Allowed', 'Admins cannot be removed from this screen.');
      return;
    }
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.full_name || 'this member'} from the club?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('club_memberships')
              .delete()
              .match({ club_id: clubId, user_id: member.user_id });

            if (error) {
              Alert.alert('Error', 'Failed to remove member.');
              console.error('Error removing member:', error);
            } else {
              // Trigger a global refresh to ensure data consistency across the app
              await refreshAllData();
            }
          },
        },
      ]
    );
  };

  const handleDelete = (type: 'event' | 'post', id: number) => {
    Alert.alert(
      `Delete ${type === 'event' ? 'Event' : 'Post'}`,
      `Are you sure you want to permanently delete this ${type}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const tableName = type === 'event' ? 'events' : 'posts';
            const { error } = await supabase.from(tableName).delete().eq('id', id);

            if (error) {
              Alert.alert('Error', `Failed to delete ${type}.`);
              console.error(`Error deleting ${type}:`, error);
            } else {
              // Instead of local state update, trigger a global refresh
              await refreshAllData();
            }
          },
        },
      ]
    );
  };

  const renderHiddenItem = (type: 'event' | 'post', data: any, rowMap: any) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => {
          handleDelete(type, data.item.id);
          rowMap[data.item.id]?.closeRow();
        }}
      >
        <Feather name="trash-2" size={20} color={COLORS.white} />
        <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMemberHiddenItem = (data: any, rowMap: any) => {
    // Do not render a swipe-to-remove option for admins
    if (data.item.is_admin) {
      return null;
    }
    return (
      <View style={styles.rowBack}>
        <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnRight, { backgroundColor: COLORS.destructive }]}
          onPress={() => {
            handleRemoveMember(data.item);
            rowMap[data.item.user_id]?.closeRow();
          }}
        >
          <Feather name="user-x" size={20} color={COLORS.white} />
          <Text style={styles.backTextWhite}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText} numberOfLines={1}>{clubName}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditClub', { clubId, clubName })}>
          <Feather name="settings" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Events' && styles.activeTab]}
          onPress={() => setActiveTab('Events')}
        >
          <Feather name="calendar" size={16} color={activeTab === 'Events' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'Events' && styles.activeTabText]}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Posts' && styles.activeTab]}
          onPress={() => setActiveTab('Posts')}
        >
          <Feather name="file-text" size={16} color={activeTab === 'Posts' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'Posts' && styles.activeTabText]}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Members' && styles.activeTab]}
          onPress={() => setActiveTab('Members')}
        >
          <Feather name="users" size={16} color={activeTab === 'Members' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'Members' && styles.activeTabText]}>Members</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={COLORS.primary} />
      ) : (
        <>
          {activeTab === 'Events' && (
            <SwipeListView
              data={events}
              keyExtractor={(item) => `event-${item.id}`}
              ListHeaderComponent={
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate('CreateEditEvent', { clubId, clubName, onGoBack: refreshAllData })}
                >
                  <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.createButtonText}>Create New Event</Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {item.is_recurring && (
                        <Feather name="repeat" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                      )}
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </View>
                    <Text style={styles.itemSubtitle}>{new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    {item.rsvps_enabled && (
                      <TouchableOpacity
                        style={styles.manageButton}
                        onPress={() => navigation.navigate('RsvpList', { eventId: item.id, eventName: item.title })}
                      >
                        <Text style={styles.manageButtonText}>RSVPs</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => navigation.navigate('CreateEditEvent', { clubId, clubName, event: item, onGoBack: refreshAllData })}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              renderHiddenItem={(data, rowMap) => renderHiddenItem('event', data, rowMap)}
              rightOpenValue={-95}
              disableRightSwipe
            />
          )}
          {activeTab === 'Posts' && (
            <SwipeListView
              data={posts}
              keyExtractor={(item) => `post-${item.id}`}
              ListHeaderComponent={
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate('CreateEditPost', { clubId, onGoBack: refreshAllData })}
                >
                  <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.createButtonText}>Create New Post</Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.caption}</Text>
                    <Text style={styles.itemSubtitle}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('CreateEditPost', { clubId, post: item, onGoBack: refreshAllData })}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
              renderHiddenItem={(data, rowMap) => renderHiddenItem('post', data, rowMap)}
              rightOpenValue={-95}
              disableRightSwipe
            />
          )}
          {activeTab === 'Members' && (
            <>
              <View style={styles.searchContainer}>
                <Feather name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search members..."
                  placeholderTextColor={COLORS.textMuted}
                  value={memberSearchQuery}
                  onChangeText={setMemberSearchQuery}
                />
              </View>
              <SwipeListView
                data={filteredMembers}
                keyExtractor={(item) => `member-${item.user_id}`}
                ListFooterComponent={
                  <Text style={styles.listFooterInfo}>
                    Showing {filteredMembers.length} of {members.length} members
                  </Text>
                }
                renderItem={({ item }, rowMap) => (
                <View style={styles.itemCard}>
                  <Image source={{ uri: item.avatar_url || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png' }} style={styles.memberAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{item.full_name || 'Unnamed User'}</Text>
                      {item.is_admin && (
                        <View style={styles.adminTag}><Text style={styles.adminTagText}>Admin</Text></View>
                      )}
                    </View>
                  </View>
                </View>
                )}
                renderHiddenItem={renderMemberHiddenItem}
                rightOpenValue={-95}
                disableRightSwipe
              />
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.padding },
  header: { marginTop: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: 10 },
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.input, borderRadius: SIZES.radius, padding: 4, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: SIZES.radius - 4 },
  activeTab: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { marginLeft: 8, fontSize: 14, fontWeight: '500', color: COLORS.textMuted },
  activeTabText: { color: COLORS.primary },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    marginBottom: 20,
  },
  createButtonText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base * 1.5,
  },
  itemTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  itemSubtitle: { fontSize: 13, color: COLORS.textSubtle },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageButton: {
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    marginRight: 8,
  },
  manageButtonText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  editButton: { backgroundColor: COLORS.input, paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radius, },
  editButtonText: { color: COLORS.textSecondary, fontWeight: '500' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  listHeaderInfo: { textAlign: 'center', color: COLORS.textMuted, marginBottom: 20, fontSize: 14 },
  listFooterInfo: { textAlign: 'center', color: COLORS.textMuted, marginTop: 20, fontSize: 14 },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 16 },
  adminTag: {
    backgroundColor: `${COLORS.primary}2A`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  adminTagText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: COLORS.card, // Background behind the item
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base * 1.5,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 95,
  },
  backRightBtnRight: { backgroundColor: COLORS.destructive, right: 0, borderTopRightRadius: SIZES.radius, borderBottomRightRadius: SIZES.radius },
  backTextWhite: { color: COLORS.white, marginTop: 4, fontWeight: '600' },
});