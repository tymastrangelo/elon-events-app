import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../theme';
import { clubs } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { useUser } from '../context/UserContext';

export default function NotificationSettingsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { joinedClubs: joinedClubIds } = useUser();

  // In a real app, these preferences would be fetched and saved.
  // For now, we'll initialize all to 'on' and manage state locally.
  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    const initialPrefs: { [key: string]: boolean } = {};
    joinedClubIds.forEach(id => {
      initialPrefs[id] = true;
    });
    return initialPrefs;
  });

  const togglePreference = (clubId: string) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [clubId]: !prev[clubId],
    }));
  };

  const joinedClubs = useMemo(
    () => clubs.filter(club => joinedClubIds.includes(String(club.id))),
    [joinedClubIds]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notification Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={joinedClubs}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{item.name}</Text>
            <Switch
              value={notificationPrefs[item.id]}
              onValueChange={() => togglePreference(item.id)}
              thumbColor={notificationPrefs[item.id] ? COLORS.primary : COLORS.border}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            />
          </View>
        )}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            Manage notifications for clubs you've joined.
          </Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyState}>
            You haven't joined any clubs yet. Join a club to manage its notifications.
          </Text>
        }
        contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    color: COLORS.textSubtle,
    marginBottom: 20,
  },
  row: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1, // Allow text to wrap if needed
    marginRight: 10,
  },
  emptyState: {
    fontSize: SIZES.font,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
  },
});