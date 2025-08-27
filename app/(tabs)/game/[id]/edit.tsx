import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, View } from '@/components/Themed';
import DateTimeField from '@/src/components/DateTimeField';
import { useToast } from '@/src/components/ToastProvider';
import { useGame } from '@/src/features/games/hooks/useGame';
import { updateGame } from '@/src/features/games/api';
import type { CreateGameInput } from '@/src/features/games/types';

export default function EditGameScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, isLoading } = useGame(id);
  const qc = useQueryClient();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<string>('');
  const [description, setDescription] = useState('');

  // Initialize form values once data is loaded
  useEffect(() => {
    if (data) {
      setTitle((v) => (v ? v : data.title || ''));
      setLocation((v) => (v ? v : data.location || ''));
      setStartsAt((v) => (v ? v : data.startsAt || ''));
      setMaxPlayers((v) => (v ? v : (data.maxPlayers ? String(data.maxPlayers) : '')));
      setDescription((v) => (v ? v : data.description || ''));
    }
  }, [data]);

  const canSubmit = useMemo(() => !!title && !!startsAt, [title, startsAt]);

  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (body: Partial<CreateGameInput>) => updateGame(id as string, body),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['game', id] }),
        qc.invalidateQueries({ queryKey: ['games'] }),
      ]);
      toast.success('Game updated');
      router.back();
    },
    onError: (e: any) => toast.error(e?.message ?? 'Update failed'),
  });

  const onSubmit = () => {
    const body: Partial<CreateGameInput> = {
      title,
      location: location || undefined,
      startsAt,
      maxPlayers: maxPlayers ? Number(maxPlayers) : undefined,
      description: description || undefined,
    };
    mutation.mutate(body);
  };

  if (isLoading && !data) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Edit game' }} />
      <Text style={styles.title}>Edit game</Text>

      <RNView style={styles.formRow}>
        <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      </RNView>
      <RNView style={styles.formRow}>
        <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      </RNView>
      <RNView style={styles.formRow}>
        <DateTimeField value={startsAt} onChange={setStartsAt} />
      </RNView>
      <RNView style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Max players (optional)"
          keyboardType="number-pad"
          value={maxPlayers}
          onChangeText={setMaxPlayers}
        />
      </RNView>
      <RNView style={styles.formRow}>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Description (optional)"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </RNView>

      <Button title={mutation.isPending ? 'Saving...' : 'Save changes'} onPress={onSubmit} disabled={!canSubmit || mutation.isPending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'stretch', gap: 12 },
  center: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  formRow: { marginBottom: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
