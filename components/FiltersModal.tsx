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
import { COLORS, SIZES } from '../theme';

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
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    backgroundColor: COLORS.background,
  },
  handle: {
    marginTop: SIZES.base,
    backgroundColor: COLORS.border,
    width: 40,
  },
  content: {
    padding: SIZES.padding,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base * 1.5,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
    marginBottom: SIZES.padding,
  },
  tag: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 2,
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius * 2,
  },
  tagSelected: {
    backgroundColor: COLORS.primary,
  },
  tagText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: COLORS.white,
  },
  timeButton: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 2,
    borderRadius: SIZES.radius,
    borderColor: COLORS.border,
    borderWidth: 1,
    backgroundColor: COLORS.white,
  },
  timeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeText: {
    color: COLORS.textSubtle,
  },
  timeTextSelected: {
    color: COLORS.white,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.padding,
  },
  resetBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    width: '48%',
    paddingVertical: SIZES.padding * 0.8,
    alignItems: 'center',
  },
  resetText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
    letterSpacing: 1,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    width: '48%',
    paddingVertical: SIZES.padding * 0.8,
    alignItems: 'center',
  },
  applyText: {
    color: COLORS.white,
    fontWeight: '500',
    letterSpacing: 1,
  },
});