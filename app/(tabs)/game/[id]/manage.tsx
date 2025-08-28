import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useParticipants } from '@/src/features/games/hooks/useParticipants';
import { useGame } from '@/src/features/games/hooks/useGame';
import { adminPromoteWaitlist, adminRemoveParticipant, adminUpdateGame } from '@/src/features/games/api';
import Avatar from '@/src/components/Avatar';
import type { Participant } from '@/src/features/games/types';
import { useToast } from '@/src/components/ToastProvider';

export default function ManageParticipantsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();

  const { data: game } = useGame(id);
  const { data, isLoading, refetch, isRefetching } = useParticipants(id as string);

  const [maxPlayersInput, setMaxPlayersInput] = useState(
    game?.maxPlayers != null ? String(game.maxPlayers) : ''
  );

  const promote = useMutation({
    mutationFn: (username: string) => adminPromoteWaitlist(id as string, username),
    onSuccess: async (_res, username) => {
      toast.success(`Promoted ${username}`);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['game', id, 'participants'] }),
        qc.invalidateQueries({ queryKey: ['game', id] }),
        qc.invalidateQueries({ queryKey: ['games'] }),
      ]);
    },
    onError: (e: any) => toast.error(e?.message ?? 'Promote failed'),
  });

  const remove = useMutation({
    mutationFn: (username: string) => adminRemoveParticipant(id as string, username),
    onSuccess: async (_res, username) => {
      toast.info(`Removed ${username}`);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['game', id, 'participants'] }),
        qc.invalidateQueries({ queryKey: ['game', id] }),
        qc.invalidateQueries({ queryKey: ['games'] }),
      ]);
    },
    onError: (e: any) => toast.error(e?.message ?? 'Remove failed'),
  });

  const saveCapacity = useMutation({
    mutationFn: async () => {
      const n = Number(maxPlayersInput);
      if (!Number.isFinite(n) || n <= 0) throw new Error('Enter a valid number');
      return adminUpdateGame(id as string, { maxPlayers: n });
    },
    onSuccess: async () => {
      toast.success('Capacity updated');
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['game', id] }),
        qc.invalidateQueries({ queryKey: ['games'] }),
      ]);
    },
    onError: (e: any) => toast.error(e?.message ?? 'Update failed'),
  });

  const waitlist: Participant[] = useMemo(() => {
    // If backend exposes waitlist via game details, prefer that. Otherwise, derive empty list.
    // This screen primarily demonstrates actions; actual waitlist fetching can be added later.
    return [];
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Manage participants' }} />
      <Text style={styles.sectionTitle}>Capacity</Text>
      <RNView style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Max players"
          keyboardType="number-pad"
          value={maxPlayersInput}
          onChangeText={setMaxPlayersInput}
        />
        <Button title={saveCapacity.isPending ? 'Saving…' : 'Save'} onPress={() => saveCapacity.mutate()} />
      </RNView>

      <View style={styles.separator} />

      <Text style={styles.sectionTitle}>Participants</Text>
      {isLoading ? (
        <RNView style={[styles.center, { paddingVertical: 8 }]}>
          <ActivityIndicator />
        </RNView>
      ) : !data || data.length === 0 ? (
        <Text style={{ opacity: 0.8 }}>No participants yet.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(p, i) => p.id ?? `${p.username}-${i}`}
          renderItem={({ item }) => (
            <RNView style={styles.row}>
              <Avatar name={item.displayName || item.username} uri={item.avatarUrl ?? undefined} size={32} />
              <Text style={styles.participantName}>{item.displayName || item.username}</Text>
              <RNView style={{ flex: 1 }} />
              <Button
                title={remove.isPending ? 'Removing…' : 'Remove'}
                color="#b91c1c"
                onPress={() =>
                  Alert.alert('Remove participant', `Remove ${item.displayName || item.username}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => remove.mutate(item.username) },
                  ])
                }
              />
            </RNView>
          )}
        />
      )}

      <View style={styles.separator} />

      <Text style={styles.sectionTitle}>Waitlist</Text>
      {!waitlist.length ? (
        <Text style={{ opacity: 0.8 }}>No one on the waitlist.</Text>
      ) : (
        <FlatList
          data={waitlist}
          keyExtractor={(p, i) => p.id ?? `${p.username}-${i}`}
          renderItem={({ item }) => (
            <RNView style={styles.row}>
              <Avatar name={item.displayName || item.username} uri={item.avatarUrl ?? undefined} size={32} />
              <Text style={styles.participantName}>{item.displayName || item.username}</Text>
              <RNView style={{ flex: 1 }} />
              <Button
                title={promote.isPending ? 'Promoting…' : 'Promote'}
                onPress={() => promote.mutate(item.username)}
              />
            </RNView>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  participantName: { fontSize: 14 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee', marginVertical: 12 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
