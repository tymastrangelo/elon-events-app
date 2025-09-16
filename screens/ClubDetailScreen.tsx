// screens/ClubDetailScreen.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Linking } from 'react-native';

// Define Club type
export type Club = {
  id: number;
  name: string;
  image: string;
  description: string;
  category: string;
  meetingTimes?: string;
  contactEmail?: string;
};

export default function ClubDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { club: Club } }, 'params'>>();
  const { club } = route.params;
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      if (parent) parent.setOptions({ swipeEnabled: false });
      return () => {
        if (parent) parent.setOptions({ swipeEnabled: true });
      };
    }, [navigation])
  );

  const handleEmail = () => {
    if (club.contactEmail) {
      const email = club.contactEmail;
      const handle = email.split('@')[0];
      const mailto = `mailto:${email}`;
      Linking.openURL(mailto);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backButton, { top: insets.top + 10 }]}
      >
        <Ionicons name="arrow-back" size={20} color="#333" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: club.image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{club.name}</Text>
          <Text style={styles.category}>{club.category}</Text>

          {/* Meeting Times */}
          {club.meetingTimes && (
            <Text style={styles.metaText}>Meets: {club.meetingTimes}</Text>
          )}

          {/* Contact */}
          {club.contactEmail && (
            <TouchableOpacity onPress={handleEmail}>
              <Text style={styles.contact}>Contact: {club.contactEmail}</Text>
            </TouchableOpacity>
          )}

          {/* About */}
          <Text style={styles.sectionTitle}>About the Club</Text>
          <Text style={styles.description}>{club.description}</Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.joinWrapper, { bottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinText}>Join Club</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  image: {
    width: '100%',
    height: 240,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  category: {
    fontSize: 14,
    color: '#5669FF',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  contact: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  joinWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#5669FF',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});