import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  Switch,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../theme';
import { RootStackParamList, RootStackNavigationProp } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { Event } from '../data/mockData';

type Location = { id: number; name: string; is_building: boolean; coordinates: any };
type Room = { id: number; name: string };

export default function CreateEditEventScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateEditEvent'>>();
  const { clubId, clubName, event, onGoBack } = route.params;

  const isEditMode = event !== undefined;

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [locationString, setLocationString] = useState(event?.location || '');
  const [roomString, setRoomString] = useState(event?.room || '');
  const [date, setDate] = useState(event ? new Date(event.date) : new Date());
  // Default end date to 1 hour after start date
  const [endDate, setEndDate] = useState(event?.end_date ? new Date(event.end_date) : new Date(new Date().getTime() + 60 * 60 * 1000));
  const [imageUri, setImageUri] = useState<string | null>(event?.image || null);
  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(event?.is_recurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState(event?.recurrence_pattern || 'weekly');
  const [rsvpsEnabled, setRsvpsEnabled] = useState(event?.rsvps_enabled ?? true);
  const [membersOnly, setMembersOnly] = useState(event?.members_only || false);

  // State for managing which date picker is open
  const [pickerMode, setPickerMode] = useState<'start' | 'end' | null>(null);

  // State for location selection modals
  const [locations, setLocations] = useState<Location[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');

  const onDateChange = (e: DateTimePickerEvent, selectedDate?: Date) => {
    // This function now only updates the state. Closing is handled by the modal buttons.
    const currentDate = selectedDate || (pickerMode === 'start' ? date : endDate);
    if (pickerMode === 'start') setDate(currentDate);
    if (pickerMode === 'end') setEndDate(currentDate);
    if (Platform.OS === 'android') setPickerMode(null); // Android closes itself after selection
  };

  useEffect(() => {
    // Fetch all locations when the component mounts
    const fetchLocations = async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (data) setLocations(data as Location[]);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    // When editing an event, find and set the initial location object
    // to ensure coordinates are preserved if only the room is changed.
    if (isEditMode && event?.location && locations.length > 0) {
      const initialLocation = locations.find(loc => loc.name === event.location);
      if (initialLocation) {
        setSelectedLocation(initialLocation);
      }
    }
  }, [isEditMode, event, locations]);

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    setLocationString(location.name);
    setLocationSearch(''); // Reset search on select
    setLocationModalVisible(false);
    setSelectedRoom(null); // Reset room selection
    setRoomString('');

    if (location.is_building) {
      const { data, error } = await supabase.from('rooms').select('*').eq('location_id', location.id);
      if (data) setRooms(data as Room[]);
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setRoomString(room.name);
    setRoomSearch(''); // Reset search on select
    setRoomModalVisible(false);
  };

  const filteredLocations = locations.filter(loc => loc.name.toLowerCase().includes(locationSearch.toLowerCase()));
  const filteredRooms = rooms.filter(room => room.name.toLowerCase().includes(roomSearch.toLowerCase()));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Use a rectangular aspect ratio for event images
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
      const path = `events/${clubId}/${new Date().getTime()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images') // Assuming you have a bucket named 'images'
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
    if (!title.trim() || !locationString.trim()) {
      Alert.alert('Missing Information', 'Please fill out all required fields.');
      return;
    }
    setLoading(true);

    let finalImageUrl = imageUri;
    // If the image URI is a local file path, it needs to be uploaded
    if (imageUri && imageUri.startsWith('file://')) {
      finalImageUrl = await uploadImage(imageUri);
      if (!finalImageUrl) {
        Alert.alert('Upload Error', 'Failed to upload event image.');
        setLoading(false);
        return;
      }
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      location: locationString.trim(),
      room: roomString.trim() || null,
      date: date.toISOString(),
      end_date: endDate.toISOString(),
      image: finalImageUrl,
      host: clubName,
      coordinates: selectedLocation?.coordinates || null,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      rsvps_enabled: rsvpsEnabled,
      members_only: membersOnly,
    };

    let error;
    if (isEditMode) {
      const { error: updateError } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', event.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('events').insert(eventData);
      error = insertError;
    }

    if (error) {
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} event.`);
      console.error('Event submission error:', error);
    } else {
      Alert.alert('Success', `Event ${isEditMode ? 'updated' : 'created'} successfully!`);
      if (onGoBack) onGoBack(); // Call the refresh function
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
        <Text style={styles.headerText}>{isEditMode ? 'Edit Event' : 'Create Event'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.imagePlaceholderText}>Upload Event Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Event Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g., Fall Bake Sale" />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Tell everyone about the event..." multiline />

        <Text style={styles.label}>Location</Text>
        <TouchableOpacity style={styles.input} onPress={() => setLocationModalVisible(true)}>
          <Text style={locationString ? styles.inputText : styles.placeholderText}>
            {locationString || 'Select a building or area'}
          </Text>
        </TouchableOpacity>

        {selectedLocation?.is_building && (
          <>
            <Text style={styles.label}>Room (Optional)</Text>
            <TouchableOpacity style={styles.input} onPress={() => { setRoomSearch(''); setRoomModalVisible(true); }}>
              <Text style={roomString ? styles.inputText : styles.placeholderText}>{roomString || 'Select a room'}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.timeRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Starts</Text>
            <TouchableOpacity onPress={() => setPickerMode('start')} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={styles.datePickerSubText}>{date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Ends</Text>
            <TouchableOpacity onPress={() => setPickerMode('end')} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>{endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={styles.datePickerSubText}>{endDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Recurrence</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Make this a recurring event</Text>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            thumbColor={isRecurring ? COLORS.primary : COLORS.border}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          />
        </View>

        <Text style={styles.label}>Event Settings</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Enable RSVPs</Text>
          <Switch
            value={rsvpsEnabled}
            onValueChange={setRsvpsEnabled}
            thumbColor={rsvpsEnabled ? COLORS.primary : COLORS.border}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          />
        </View>
        <View style={[styles.switchRow, { marginTop: 10 }]}>
          <Text style={styles.switchLabel}>Members-Only Event</Text>
          <Switch
            value={membersOnly}
            onValueChange={setMembersOnly}
            thumbColor={membersOnly ? COLORS.primary : COLORS.border}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          />
        </View>

        {isRecurring && (
          <View style={styles.recurrenceOptions}>
            {(['weekly', 'bi-weekly', 'monthly'] as const).map((pattern) => (
              <TouchableOpacity
                key={pattern}
                style={[
                  styles.recurrenceChip,
                  recurrencePattern === pattern && styles.activeRecurrenceChip,
                ]}
                onPress={() => setRecurrencePattern(pattern)}
              >
                <Text style={[styles.recurrenceChipText, recurrencePattern === pattern && styles.activeRecurrenceChipText]}>
                  {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>{isEditMode ? 'Save Changes' : 'Create Event'}</Text>
          )}
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Delete Event',
                'Are you sure you want to permanently delete this event?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await supabase.from('events').delete().eq('id', event.id);
                      navigation.goBack();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Date/Time Picker Modal */}
      {pickerMode && Platform.OS === 'ios' && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={pickerMode !== null}
          onRequestClose={() => setPickerMode(null)}
        >
          <TouchableWithoutFeedback onPress={() => setPickerMode(null)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.dateTimePickerContainer}>
                  <DateTimePicker
                    value={pickerMode === 'start' ? date : endDate}
                    mode="datetime"
                    display="spinner" // A much cleaner UI for the modal
                    onChange={onDateChange}
                  />
                  <TouchableOpacity style={styles.doneButton} onPress={() => setPickerMode(null)}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Location Selection Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={locationModalVisible}
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
              <Ionicons name="close" size={28} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          >
            <View style={styles.searchBox}>
              <Feather name="search" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search locations..."
                value={locationSearch}
                onChangeText={setLocationSearch}
              />
            </View>
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }: { item: Location }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleLocationSelect(item)}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Room Selection Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={roomModalVisible}
        onRequestClose={() => setRoomModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Room</Text>
            <TouchableOpacity onPress={() => setRoomModalVisible(false)}>
              <Ionicons name="close" size={28} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          >
            <View style={styles.searchBox}>
              <Feather name="search" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search rooms..."
                value={roomSearch}
                onChangeText={setRoomSearch}
              />
            </View>
            <FlatList
              data={filteredRooms}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }: { item: Room }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoomSelect(item)}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  inputText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  imagePicker: {
    width: '100%',
    height: 180,
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
  datePickerButton: {
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  datePickerSubText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  recurrenceOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  recurrenceChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.input,
  },
  activeRecurrenceChip: {
    backgroundColor: COLORS.primary,
  },
  recurrenceChipText: {
    color: COLORS.textSecondary,
  },
  activeRecurrenceChipText: {
    color: COLORS.white,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalItem: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalContent: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    marginVertical: 10,
    marginHorizontal: SIZES.padding,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    marginLeft: 8,
  },
  modalItemText: { fontSize: 16 },
  // Styles for the new DateTimePicker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimePickerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});