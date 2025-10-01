import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { COLORS, SIZES } from '../theme';

const CustomDrawerContent = (props: any) => {
  const insets = useSafeAreaInsets();
  const { session } = useUser();
  const name = session?.user?.user_metadata?.full_name || 'Elon Student';
  const email = session?.user?.email || '';

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }} // Remove padding to allow header to be at the very top
      >
        {/* Profile Header */}
        <TouchableOpacity onPress={() => props.navigation.navigate('Home', { screen: 'Profile' })}>
          <View style={[styles.profileHeader, { paddingTop: insets.top + SIZES.base }]}>
            <Image
              // Use the avatar_url from user metadata, with a fallback
              source={{ uri: session?.user?.user_metadata?.avatar_url || 'https://snworksceo.imgix.net/enn/66efa747-1661-44c4-9478-aa8a5fe881a3.sized-1000x1000.jpeg?w=1000' }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </TouchableOpacity>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Footer / Logout */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + SIZES.base }]}>
        <DrawerItem
          label="Settings"
          labelStyle={styles.settingsLabel}
          icon={({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          )}
          onPress={() => props.navigation.navigate('Settings')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    marginBottom: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: SIZES.base,
    // Add a subtle shadow and a fallback background color
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    backgroundColor: COLORS.border,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSubtle,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  settingsLabel: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default CustomDrawerContent;