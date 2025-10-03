import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { COLORS, SIZES } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useUser } from '../context/UserContext';

export default function EditClubScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'EditClub'>>();
  const { clubId, clubName } = route.params;
  const { allClubs, refreshAllData } = useUser();

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentClubName, setCurrentClubName] = useState(clubName);
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const club = allClubs.find(c => c.id === clubId);
    if (club) {
      setAvatarUrl(club.image);
      setCurrentClubName(club.name);
      setDescription(club.description || '');
      setIsPrivate(club.is_private || false);
    }
  }, [clubId, allClubs]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Keep as a square for circular avatars
      // @ts-ignore - This property is valid for Android but may not be in the TS definitions
      cropperCircleOverlay: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0]);
    }
  };

  const handleImageUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.uri) return;

    setUploading(true);

    const BUCKET_NAME = 'club-images';

    try {
      // Before uploading a new avatar, delete the old one to prevent orphaned files.
      const originalClub = allClubs.find(c => c.id === clubId);
      if (originalClub?.image) {
        const oldImagePath = originalClub.image.split(`/${BUCKET_NAME}/`).pop();
        if (oldImagePath) {
          const { error: removeError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([oldImagePath]);
          if (removeError) {
            // Log the error but don't block the upload process
            console.warn('Failed to remove old club avatar:', removeError);
          }
        }
      }

      const arraybuffer = await fetch(asset.uri).then((res) => res.arrayBuffer());
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `${clubId}/${new Date().getTime()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, arraybuffer, { contentType: `image/${fileExt}` });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
      const newAvatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('clubs')
        .update({ image: newAvatarUrl })
        .eq('id', clubId);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      await refreshAllData(); // Refresh global state
      Alert.alert('Success', 'Club picture updated!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clubs')
        .update({
          name: currentClubName,
          description: description,
          is_private: isPrivate,
        })
        .eq('id', clubId);

      if (error) throw error;

      await refreshAllData();
      Alert.alert('Success', 'Club details have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error updating club details:', error);
      Alert.alert('Error', error.message || 'Failed to update club details.');
    } finally {
      setLoading(false);
    }
  };

  // A simple check to see if anything has changed
  const hasChanges = () => {
    const originalClub = allClubs.find(c => c.id === clubId);
    if (!originalClub) return false;
    return originalClub.name !== currentClubName || originalClub.description !== description || originalClub.is_private !== isPrivate;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit {clubName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            <Text style={styles.instructionText}>Tap the image to upload a new club picture.</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Club Name</Text>
              <TextInput
                style={styles.input}
                value={currentClubName}
                onChangeText={setCurrentClubName}
                placeholder="Enter club name"
              />
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Tell everyone about your club"
                multiline
              />

              <Text style={styles.label}>Club Privacy</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Private Club</Text>
                <Switch
                  value={isPrivate}
                  onValueChange={setIsPrivate}
                  thumbColor={isPrivate ? COLORS.primary : COLORS.border}
                  trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <TouchableOpacity style={[styles.saveButton, (!hasChanges() || loading) && styles.disabledButton]} onPress={handleSaveChanges} disabled={!hasChanges() || loading}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    // The horizontal padding is now on the content to avoid affecting the save button
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
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
    marginTop: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSubtle,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.input,
    padding: 15,
    borderRadius: SIZES.radius,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    padding: 14,
    borderRadius: SIZES.radius,
  },
  switchLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1,
  },
  saveButton: {
    margin: SIZES.padding, // Use margin to position it at the bottom
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.textMuted,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});