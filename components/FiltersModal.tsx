// components/FiltersModal.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Modalize } from 'react-native-modalize';

const categories = ['Sports', 'Music', 'Art', 'Food'];
const timeFilters = ['Today', 'Tomorrow', 'This Week'];

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export default function FiltersModal({ visible, onClose, onApply }: FiltersModalProps) {
  const modalRef = useRef<Modalize>(null);

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedTime, setSelectedTime] = React.useState<string>('Tomorrow');

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleApply = () => {
    onApply({ categories: selectedCategories, time: selectedTime });
    modalRef.current?.close(); // close modal on apply
  };

  useEffect(() => {
    if (visible) modalRef.current?.open();
    else modalRef.current?.close();
  }, [visible]);

  return (
    <Modalize
      ref={modalRef}
      modalHeight={Dimensions.get('window').height * 0.7}
      onClosed={onClose}
      modalStyle={styles.modal}
      handleStyle={styles.handle}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Filter</Text>

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.row}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => toggleCategory(cat)}
              style={[
                styles.tag,
                selectedCategories.includes(cat) && styles.tagSelected,
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedCategories.includes(cat) && styles.tagTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Time & Date</Text>
        <View style={styles.row}>
          {timeFilters.map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => setSelectedTime(time)}
              style={[
                styles.timeButton,
                selectedTime === time && styles.timeButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  selectedTime === time && styles.timeTextSelected,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onClose} style={styles.resetBtn}>
            <Text style={styles.resetText}>RESET</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleApply} style={styles.applyBtn}>
            <Text style={styles.applyText}>APPLY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modalize>
  );
}

const styles = StyleSheet.create({
  modal: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 30,
  },
  handle: {
    marginTop: 8,
    backgroundColor: '#ccc',
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: '500',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagSelected: {
    backgroundColor: '#5669FF',
  },
  tagText: {
    color: '#444',
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#fff',
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderColor: '#E6E6E6',
    borderWidth: 1,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  timeButtonSelected: {
    backgroundColor: '#5669FF',
    borderColor: '#5669FF',
  },
  timeText: {
    color: '#666',
  },
  timeTextSelected: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  resetBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    width: '45%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetText: {
    color: '#120D26',
    fontWeight: '500',
    letterSpacing: 1,
  },
  applyBtn: {
    backgroundColor: '#5669FF',
    borderRadius: 14,
    width: '45%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: '500',
    letterSpacing: 1,
  },
});