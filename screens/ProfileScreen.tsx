import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import MainLayout from './MainLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const name = 'Tyler Mastrangelo';
  const email = 'tmastrangelo@elon.edu';
  const handle = '@' + email.split('@')[0]; // ➜ @tmastrangelo

  return (
    <MainLayout>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://elonphoenix.com/images/2025/8/29/Tyler_Mastrangelo_20250821_XC_Media_Day_JK_1863.jpg?width=146' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>{handle}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit-2" size={16} color="#5669FF" />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Attended</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>RSVP’d</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Clubs</Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <MenuItem icon="bookmark" label="My Saved Events" />
          <MenuItem icon="users" label="My Clubs" />
          <MenuItem icon="bell" label="Notification Settings" />
          <MenuItem icon="message-square" label="Feedback / Support" />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
          <Feather name="log-out" size={16} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </MainLayout>
  );
}

function MenuItem({ icon, label }: { icon: any; label: string }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Feather name={icon} size={18} color="#5669FF" />
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  handle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF0FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editText: {
    marginLeft: 6,
    color: '#5669FF',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  statLabel: {
    color: '#666',
    fontSize: 13,
  },
  menuSection: {
    marginBottom: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuLabel: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#5669FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});