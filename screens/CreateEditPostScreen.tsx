import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../theme';
import { RootStackParamList, RootStackNavigationProp } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

export default function CreateEditPostScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateEditPost'>>();
  const { session } = useUser();
  const { clubId, post, onGoBack } = route.params;

  const isEditMode = post !== undefined;

  const [caption, setCaption] = useState(post?.caption || '');
  const [imageUri, setImageUri] = useState<string | null>(post?.image || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const arraybuffer = await fetch(uri).then((res) => res.arrayBuffer());
      const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `posts/${clubId}/${new Date().getTime()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(path, arraybuffer, { contentType: `image/${fileExt}` });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(path);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      Alert.alert('Missing Caption', 'Please write a caption for your post.');
      return;
    }
    if (!session?.user) {
      Alert.alert('Authentication Error', 'You must be logged in to create a post.');
      return;
    }
    setLoading(true);

    let finalImageUrl = imageUri;
    if (imageUri && imageUri.startsWith('file://')) {
      finalImageUrl = await uploadImage(imageUri);
      if (!finalImageUrl) {
        Alert.alert('Upload Error', 'Failed to upload post image.');
        setLoading(false);
        return;
      }
    }

    const postData = {
      caption: caption.trim(),
      image: finalImageUrl,
      club_id: clubId,
      user_id: session.user.id,
    };

    let error;
    if (isEditMode) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ caption: postData.caption, image: postData.image }) // Only allow caption/image updates
        .eq('id', post.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('posts').insert(postData);
      error = insertError;
    }

    if (error) {
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} post.`);
      console.error('Post submission error:', error);
    } else {
      Alert.alert('Success', `Post ${isEditMode ? 'updated' : 'created'} successfully!`);
      if (onGoBack) onGoBack();
      navigation.goBack();
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{isEditMode ? 'Edit Post' : 'Create Post'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Caption</Text>
        <TextInput style={[styles.input, styles.textArea]} value={caption} onChangeText={setCaption} placeholder="What's on your mind?" multiline />

        <Text style={styles.label}>Image (Optional)</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.imagePlaceholderText}>Upload an Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>{isEditMode ? 'Save Changes' : 'Create Post'}</Text>
          )}
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Delete Post',
                'Are you sure you want to permanently delete this post?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await supabase.from('posts').delete().eq('id', post.id);
                      if (onGoBack) onGoBack();
                      navigation.goBack();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.deleteButtonText}>Delete Post</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
  },
  headerText: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  form: { paddingHorizontal: SIZES.padding },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    padding: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  imagePicker: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 10,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: COLORS.textMuted,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
    height: 50,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 50,
  },
  deleteButtonText: {
    color: COLORS.destructive,
    fontWeight: '500',
  },
});