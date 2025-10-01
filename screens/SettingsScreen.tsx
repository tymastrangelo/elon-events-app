import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { COLORS, SIZES } from '../theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';

// A reusable component for consistent settings rows
const SettingsRow = ({ label, onPress, isDestructive = false }: { label: string, onPress: () => void, isDestructive?: boolean }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Text style={[styles.rowLabel, isDestructive && { color: COLORS.destructive }]}>
      {label}
    </Text>
    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // 💡 Future: This state would be managed by a global theme context.
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
    // 🔐 Future: integrate delete account logic
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Feather name="menu" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- Preferences Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
            onValueChange={() => {
              // Temporarily show an alert until the feature is implemented
              Alert.alert('Coming Soon!', 'Dark mode is currently under development.');
            }}
              thumbColor={darkMode ? COLORS.primary : COLORS.border}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            />
          </View>
          <SettingsRow
            label="Notifications"
            onPress={() => navigation.navigate('NotificationSettings')}
          />
        </View>

        {/* --- About Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingsRow
            label="Feedback & Support"
            onPress={() => Alert.alert('Feedback', 'Link to feedback form/email.')}
          />
          <SettingsRow
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'Link to privacy policy page.')}
          />
          <SettingsRow
            label="Terms of Service"
            onPress={() => Alert.alert('Terms of Service', 'Link to terms of service page.')}
          />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>

        {/* --- Account Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.button}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAccount} style={[styles.button, styles.deleteBtn]}>
            <Text style={[styles.buttonText, { color: COLORS.destructive }]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
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
  },
  versionText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  button: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  deleteBtn: {
    backgroundColor: `${COLORS.destructive}1A`, // Destructive with ~10% opacity
  },
  buttonText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});