import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomDrawerContent(props: any) {
  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  const isActive = (routeName: string) => currentRoute === routeName;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right', 'bottom']}>
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.drawerContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Menu</Text>
          </View>

          {/* Top Menu Items */}
          <DrawerItem
            label="Home"
            onPress={() => props.navigation.navigate('Main')}
            icon={({ color, size }) => (
              <Feather name="home" color={isActive('Main') ? '#5669FF' : color} size={size} />
            )}
            labelStyle={[styles.label, isActive('Main') && styles.activeLabel]}
            style={isActive('Main') && styles.activeItem}
          />

          <DrawerItem
            label="Clubs"
            onPress={() => props.navigation.navigate('Clubs')}
            icon={({ color, size }) => (
              <Feather name="users" color={isActive('Clubs') ? '#5669FF' : color} size={size} />
            )}
            labelStyle={[styles.label, isActive('Clubs') && styles.activeLabel]}
            style={isActive('Clubs') && styles.activeItem}
          />
        </DrawerContentScrollView>

        {/* Bottom Sticky Settings */}
        <View style={styles.bottomSection}>
          <DrawerItem
            label="Settings"
            onPress={() => props.navigation.navigate('Settings')}
            icon={({ color, size }) => (
              <Feather name="settings" color={isActive('Settings') ? '#5669FF' : color} size={size} />
            )}
            labelStyle={[styles.label, isActive('Settings') && styles.activeLabel]}
            style={isActive('Settings') && styles.activeItem}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  label: {
    fontSize: 16,
    color: '#222',
  },
  activeLabel: {
    color: '#5669FF',
    fontWeight: '600',
  },
  activeItem: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
});