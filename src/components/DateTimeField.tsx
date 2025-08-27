import React, { useMemo, useState } from 'react';
import { Button, Modal, Platform, Pressable, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';

type Props = {
  value?: string; // ISO string
  onChange: (iso: string) => void;
  placeholder?: string;
};

/**
 * Cross-platform date-time field:
 * - iOS: inline modal with native DateTimePicker (mode="datetime")
 * - Android: opens date picker, then time picker, combines into one Date
 * - Web / fallback: simple text input (YYYY-MM-DDTHH:mm)
 */
export default function DateTimeField({ value, onChange, placeholder = 'Pick date & time' }: Props) {
  const [iosOpen, setIosOpen] = useState(false);

  const label = useMemo(() => {
    if (!value) return placeholder;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return placeholder;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [value, placeholder]);

  // Try to load community datetimepicker if present (without Metro static resolution)
  let DateTimePicker: any = null;
  let DateTimePickerAndroid: any = null;
  try {
    // eslint-disable-next-line no-eval
    const dynRequire = eval('require') as any;
    if (dynRequire) {
      const mod = dynRequire('@react-native-community/datetimepicker');
      DateTimePicker = mod?.default ?? mod;
      DateTimePickerAndroid = mod?.DateTimePickerAndroid;
    }
  } catch {
    // module not available, fall back to text input on all platforms
  }

  const openAndroidPickers = async () => {
    if (!DateTimePickerAndroid) return; // fallback handled below

    const current = value ? new Date(value) : new Date();

    const pickDate = () =>
      new Promise<Date | null>((resolve) => {
        DateTimePickerAndroid.open({
          value: current,
          mode: 'date',
          onChange: (_: any, date?: Date) => resolve(date ?? null),
        });
      });

    const pickTime = (base: Date) =>
      new Promise<Date | null>((resolve) => {
        DateTimePickerAndroid.open({
          value: base,
          mode: 'time',
          is24Hour: true,
          onChange: (_: any, time?: Date) => {
            if (!time) return resolve(null);
            const composed = new Date(base);
            composed.setHours(time.getHours(), time.getMinutes(), 0, 0);
            resolve(composed);
          },
        });
      });

    const pickedDate = await pickDate();
    if (!pickedDate) return;
    const pickedDateTime = await pickTime(pickedDate);
    if (!pickedDateTime) return;
    onChange(pickedDateTime.toISOString());
  };

  const onPress = () => {
    if (!DateTimePicker) return; // will render text input fallback below
    if (Platform.OS === 'android' && DateTimePickerAndroid) {
      void openAndroidPickers();
    } else if (Platform.OS === 'ios') {
      setIosOpen(true);
    }
  };

  // Web and fallback: render a simple editable input
  if (Platform.OS === 'web' || !DateTimePicker) {
    return (
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DDTHH:mm"
        autoCapitalize="none"
        value={value ?? ''}
        onChangeText={onChange}
      />
    );
  }

  // Native platforms with picker available
  return (
    <>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.field, { opacity: pressed ? 0.6 : 1 }]}>
        <Text>{label}</Text>
      </Pressable>

      {/* iOS modal with inline datetime picker */}
      {Platform.OS === 'ios' ? (
        <Modal animationType="slide" visible={iosOpen} transparent onRequestClose={() => setIosOpen(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <RNView style={{ alignItems: 'flex-end', padding: 8 }}>
                <Button title="Done" onPress={() => setIosOpen(false)} />
              </RNView>
              <DateTimePicker
                mode="datetime"
                value={value ? new Date(value) : new Date()}
                onChange={(_: any, date?: Date) => {
                  if (date) onChange(date.toISOString());
                }}
                display="inline"
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    paddingBottom: 24,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
