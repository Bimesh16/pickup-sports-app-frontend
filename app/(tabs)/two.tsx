import React, { useEffect, useMemo, useState } from 'react';
import { Button, StyleSheet, TextInput, View as RNView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, View } from '@/components/Themed';
import DateTimeField from '@/src/components/DateTimeField';
import { useToast } from '@/src/components/ToastProvider';
import { createGame } from '@/src/features/games/api';
import type { CreateGameInput } from '@/src/features/games/types';
import SportSelector from '@/src/features/games/components/SportSelector';
import { parseLocalDateTime, validateCreateGame } from '@/src/utils/gameValidation';
import { useCreateTemplate } from '@/src/stores/createTemplate';

export default function CreateGameScreen() {
  const qc = useQueryClient();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [sport, setSport] = useState('');
  const [startsAt, setStartsAt] = useState(''); // ISO string or "YYYY-MM-DDTHH:mm" local
  const [maxPlayers, setMaxPlayers] = useState<string>('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<string>('60');
  const { template, setTemplate, remember, setRemember, _rehydrated } = useCreateTemplate();

  useEffect(() => {
    if (_rehydrated && template) {
      setTitle(template.title ?? '');
      setLocation(template.location ?? '');
      setSport(template.sport ?? '');
      setStartsAt(template.startsAt ?? '');
      setMaxPlayers(template.maxPlayers ?? '');
      setDescription(template.description ?? '');
      setDurationMinutes(template.durationMinutes ?? '60');
    }
  }, [_rehydrated]); // only initial prefill

  const { errors, valid, date } = useMemo(
    () => validateCreateGame({ title, startsAt, maxPlayers }),
    [title, startsAt, maxPlayers]
  );

  const canSubmit = valid;

  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (body: CreateGameInput) => createGame(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['games'] });
      toast.success('Game created');
      if (remember) {
        setTemplate({ title, sport, location, startsAt, maxPlayers, description, durationMinutes });
      } else {
        setTemplate(null);
      }
      setTitle('');
      setLocation('');
      setSport('');
      setStartsAt('');
      setMaxPlayers('');
      setDescription('');
      setDurationMinutes('60');
    },
    onError: (e: any) => {
      toast.error(e?.message ?? 'Create failed');
    },
  });

  const onSubmit = () => {
    const dt = date ?? parseLocalDateTime(startsAt);
    const input: CreateGameInput = {
      title: title.trim(),
      location: location.trim() || undefined,
      sport: sport || undefined,
      startsAt: dt ? dt.toISOString() : startsAt,
      maxPlayers: maxPlayers ? Number(maxPlayers) : undefined,
      description: description.trim() || undefined,
    };
    mutation.mutate(input);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a game</Text>

      {!canSubmit && (title.trim().length > 0 || startsAt.trim().length > 0) ? (
        <View style={{ backgroundColor: '#fef3c7', padding: 8, borderRadius: 6, marginBottom: 8 }}>
          <Text style={{ color: '#92400e' }}>
            {errors.title ?? errors.startsAt ?? errors.maxPlayers ?? 'Please fix the highlighted fields'}
          </Text>
        </View>
      ) : null}

      <RNView style={styles.formRow}>
        <TextInput
          style={[styles.input, errors.title ? styles.inputError : null]}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}
      </RNView>
      <RNView style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
      </RNView>
      <RNView style={styles.formRow}>
        <SportSelector value={sport} onChange={setSport} />
      </RNView>
      <RNView style={styles.formRow}>
        <DateTimeField value={startsAt} onChange={setStartsAt} />
        {errors.startsAt ? <Text style={styles.error}>{errors.startsAt}</Text> : null}
      </RNView>
      <RNView style={styles.formRow}>
        <TextInput
          style={[styles.input, errors.maxPlayers ? styles.inputError : null]}
          placeholder="Max players (optional)"
          keyboardType="number-pad"
          value={maxPlayers}
          onChangeText={setMaxPlayers}
        />
        {errors.maxPlayers ? <Text style={styles.error}>{errors.maxPlayers}</Text> : null}
      </RNView>

      <RNView style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Duration in minutes (client only, default 60)"
          keyboardType="number-pad"
          value={durationMinutes}
          onChangeText={(v) => {
            // allow empty or positive ints
            if (v === '' || /^[0-9]{0,3}$/.test(v)) setDurationMinutes(v);
          }}
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

      <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
        <Button
          title={template ? 'Use last values' : 'No template saved'}
          onPress={() => {
            if (template) {
              setTitle(template.title ?? '');
              setLocation(template.location ?? '');
              setSport(template.sport ?? '');
              setStartsAt(template.startsAt ?? '');
              setMaxPlayers(template.maxPlayers ?? '');
              setDescription(template.description ?? '');
              setDurationMinutes(template.durationMinutes ?? '60');
            }
          }}
          disabled={!template}
        />
        <Button title="Reset template" onPress={() => setTemplate(null)} disabled={!template} />
        <Button title={remember ? 'Remember: ON' : 'Remember: OFF'} onPress={() => setRemember((v) => !v)} />
      </RNView>

      <Button title={mutation.isPending ? 'Creating...' : 'Create game'} onPress={onSubmit} disabled={!canSubmit || mutation.isPending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'stretch', justifyContent: 'center', gap: 12 },
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
  inputError: {
    borderColor: '#ef4444',
  },
  error: { color: '#ef4444', marginTop: 4 },
});
