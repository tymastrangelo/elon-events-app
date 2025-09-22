import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';

const CustomDrawerContent = (props: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: insets.top }}>
        {/* This renders the screens from the navigator that aren't handled manually */}
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