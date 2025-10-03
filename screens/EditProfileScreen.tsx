import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import { COLORS, SIZES } from '../theme';

/**
 * Validates a user's full name based on a set of rules.
 * @param name The full name string to validate.
 * @returns A string with an error message if validation fails, otherwise null.
 */
const validateName = (name: string): string | null => {
  const trimmedName = name.trim();
  if (trimmedName.length < 3) {
    return 'Please enter a name with at least 3 characters.';
  }
  if (trimmedName.length > 50) {
    return 'Name cannot exceed 50 characters.';
  }
  // This regex allows letters (including common international characters), spaces, hyphens, and apostrophes.
  const nameRegex = /^[A-Za-z\u00C0-\u017F' -]+$/;
  if (!nameRegex.test(trimmedName)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
  }
  return null; // Validation passed
};

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { session } = useUser();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(session?.user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.user_metadata?.avatar_url || null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Ensure this is a square for circular avatars
      // @ts-ignore - This property is valid for Android but may not be in the TS definitions
      cropperCircleOverlay: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0]);
    }
  };

  const handleImageUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.uri || !session?.user) return;

    setUploading(true);

    try {
      // Before uploading a new avatar, delete the old one to prevent orphaned files.
      const oldAvatarPath = session.user.user_metadata.avatar_url?.split('/avatars/').pop();
      if (oldAvatarPath) {
        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove([oldAvatarPath]);
        if (removeError) {
          // Log the error but don't block the upload process
          console.error('Failed to remove old avatar:', removeError);
        }
      }

      const arraybuffer = await fetch(asset.uri).then((res) => res.arrayBuffer());
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `${session.user.id}/${new Date().getTime()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const newAvatarUrl = urlData.publicUrl;

      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    const validationError = validateName(fullName);
    if (validationError) {
      Alert.alert('Invalid Name', validationError);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });
      if (error) throw error;
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          <Image
            source={{ uri: avatarUrl || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png' }}
            style={styles.avatar}
          />
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color={COLORS.white} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.instructionText}>Tap the image to upload a new profile picture.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.border,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  instructionText: {
    marginTop: 20,
    color: COLORS.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginTop: 40,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    padding: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});