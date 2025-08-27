import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActionSheetIOS,
    ActivityIndicator,
    Button,
    FlatList,
    Platform,
    Pressable,
    RefreshControl,
    Share,
    StyleSheet,
    View as RNView
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, View } from '@/components/Themed';
import { useToast } from '@/src/components/ToastProvider';
import Avatar from '@/src/components/Avatar';
import SkeletonDetail from '@/src/components/SkeletonDetail';
import { usePrefs } from '@/src/stores/prefs';
import { useGame } from '@/src/features/games/hooks/useGame';
import { useParticipants } from '@/src/features/games/hooks/useParticipants';
import { createInvite, deleteGame, joinGame, leaveGame } from '@/src/features/games/api';
import { useAuthStore } from '@/src/stores/auth';
import { confirm } from '@/src/components/ConfirmDialog';
import { useOnline } from '@/src/components/OfflineBanner';
import { isFull as isGameFull, slotsLeft } from '@/src/utils/capacity';

export default function GameDetailsScreen() {
  const { id, autojoin } = useLocalSearchParams<{ id?: string; autojoin?: string }>();
  const { data, isLoading, refetch, isRefetching, isError, error } = useGame(id);
  const qc = useQueryClient();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const whenText = useMemo(() => {
    if (!data) return '';
    const d = new Date(data.startsAt);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.startsAt]);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      // Prefer expo-clipboard when available
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('expo-clipboard');
      if (mod?.setStringAsync) {
        await mod.setStringAsync(text);
        return true;
      }
    } catch {
      // ignore, try web API
    }
    try {
      if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
        // @ts-ignore
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  const onShare = async () => {
    const url = Linking.createURL(`/game/${id}`);
    await Share.share({ message: `Join my game: ${url}` });
  };

  const toast = useToast();

  const openOwnerMenu = () => {
    if (!id) return;
    const goEdit = () => router.push(`/(tabs)/game/${id}/edit`);
    const doDelete = async () => {
      const ok = await confirm({
        title: 'Delete game',
        message: 'Are you sure you want to delete this game?',
        confirmText: 'Delete',
        destructive: true,
      });
      if (ok) del.mutate();
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit game', 'Delete game'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (idx) => {
          if (idx === 1) goEdit();
          if (idx === 2) void doDelete();
        }
      );
    } else {
      // Simple non-iOS flow
      (async () => {
        const ok = await confirm({
          title: 'Owner actions',
          message: 'Choose an action: Edit (OK) or use Delete button below to remove.',
          confirmText: 'Edit',
        });
        if (ok) goEdit();
      })();
    }
  };

  const join = useMutation({
    mutationFn: () => joinGame(id as string),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['game', id] }),
        qc.invalidateQueries({ queryKey: ['games'] }),
      ]);
      toast.success('Joined game');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Join failed'),
  });

  const leave = useMutation({
    mutationFn: () => leaveGame(id as string),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['game', id] }),
        qc.invalidateQueries({ queryKey: ['games'] }),
      ]);
      toast.info('Left game');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Leave failed'),
  });

  const del = useMutation({
    mutationFn: () => deleteGame(id as string),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['games'] });
      toast.success('Game deleted');
      router.back();
    },
    onError: (e: any) => toast.error(e?.message ?? 'Delete failed'),
  });

  const inviteHandledRef = useRef(false);

  useEffect(() => {
    const shouldAuto = autojoin === '1' || autojoin === 'true';
    if (shouldAuto && data && !data.joined && !join.isPending && !inviteHandledRef.current) {
      inviteHandledRef.current = true;
      (async () => {
        const summary = [
          data.title ? `Title: ${data.title}` : null,
          whenText ? `When: ${whenText}` : null,
          data.location ? `Location: ${data.location}` : null,
        ].filter(Boolean).join('\n');
        const ok = await confirm({
          title: 'Join this game?',
          message: summary || 'You followed an invite. Do you want to join this game?',
          confirmText: 'Join',
        });
        if (ok) join.mutate();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autojoin, data?.joined, join.isPending, whenText]);

  if (isError && !data) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>Couldn’t load game</Text>
        <Text style={{ opacity: 0.8, marginBottom: 12 }}>{(error as any)?.message ?? 'Please try again.'}</Text>
        <Button title={isRefetching ? 'Retrying…' : 'Retry'} onPress={() => refetch()} />
      </View>
    );
  }

  if (isLoading && !data) {
    return (
      <View style={styles.container}>
        <RNView style={{ paddingVertical: 8 }}>
          <SkeletonDetail />
        </RNView>
      </View>
    );
  }
  if (!data) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>Game not found</Text>
        <Button title={isRefetching ? 'Retrying...' : 'Retry'} onPress={() => refetch()} />
      </View>
    );
  }

  const isOwner = !!(user && data.createdBy?.username && user.username === data.createdBy.username);
  const online = useOnline();
  const joined = !!data.joined;
  const isFull = isGameFull(joined, data.maxPlayers, data.playersCount);
  const playersInfo =
    typeof data.playersCount === 'number' && typeof data.maxPlayers === 'number'
      ? `${data.playersCount} / ${data.maxPlayers} players`
      : undefined;
  const left = slotsLeft(data.maxPlayers, data.playersCount);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: data.title || 'Game',
          headerRight: () => (
            <RNView style={{ flexDirection: 'row', gap: 16, paddingRight: 8 }}>
              <Pressable onPress={onShare} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })} accessibilityLabel="Share">
                <FontAwesome name="share-alt" size={20} />
              </Pressable>
              <Pressable
                onPress={async () => {
                  const url = Linking.createURL(`/game/${id}`);
                  const ok = await copyToClipboard(url);
                  if (ok) toast.info('Link copied');
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                accessibilityLabel="Copy link"
              >
                <FontAwesome name="link" size={20} />
              </Pressable>
              <Pressable
                onPress={() => router.push(`/(tabs)/game/${id}/qr`)}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                accessibilityLabel="Show QR code"
              >
                <FontAwesome name="qrcode" size={20} />
              </Pressable>
              <Pressable
                onPress={async () => {
                  try {
                    const { url } = await createInvite(id as string);
                    // Try native share first; if dismissed, copy to clipboard
                    const res = await Share.share({ message: url });
                    // If share sheet doesn't provide an action or user dismissed, copy to clipboard as fallback
                    const maybeNoAction = (res as any)?.action == null;
                    if (maybeNoAction) {
                      const copied = await copyToClipboard(url);
                      if (copied) toast.info('Invite link copied');
                    }
                  } catch (e: any) {
                    toast.error(e?.message ?? 'Invite failed');
                  }
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                accessibilityLabel="Invite players"
              >
                <FontAwesome name="user-plus" size={20} />
              </Pressable>
              {isOwner ? (
                <Pressable
                  onPress={openOwnerMenu}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  accessibilityRole="button"
                  accessibilityLabel="Owner actions"
                >
                  <FontAwesome name="ellipsis-h" size={20} />
                </Pressable>
              ) : null}
            </RNView>
          ),
        }}
      />

      {isError ? (
        <View style={{ backgroundColor: '#fee2e2', padding: 8, borderRadius: 6, marginBottom: 8 }}>
          <Text style={{ color: '#991b1b', marginBottom: 4 }}>There was a problem updating this game.</Text>
          <Button title={isRefetching ? 'Retrying…' : 'Retry'} onPress={() => refetch()} />
        </View>
      ) : null}

      <Text style={styles.title}>{data.title}</Text>
      <Text>{whenText}</Text>
      {data.location ? <Text>{data.location}</Text> : null}
      {data.sport ? <Text>{data.sport}</Text> : null}
      {playersInfo ? <Text>{playersInfo}</Text> : null}
      {left !== undefined ? (
        (() => {
          const low = left <= 2;
          const fullText = left === 0 ? 'Full' : left === 1 ? '1 slot left' : `${left} slots left`;
          const color = left === 0 ? '#991b1b' : low ? '#92400e' : '#374151';
          return <Text style={{ color }}>{fullText}</Text>;
        })()
      ) : null}
      {isFull ? (
        <View style={{ backgroundColor: '#fee2e2', padding: 8, borderRadius: 6, marginTop: 6 }}>
          <Text style={{ color: '#991b1b' }}>This game is full. You can still open it to see details.</Text>
        </View>
      ) : null}
      {data.description ? (
        <>
          <View style={styles.separator} />
          <Text>{data.description}</Text>
          <View style={{ height: 8 }} />
          <Button title="Copy location" onPress={async () => {
            const ok = await (async () => {
              try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const mod = require('expo-clipboard');
                if (mod?.setStringAsync) { await mod.setStringAsync(data.location!); return true; }
              } catch {}
              try {
                if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
                  // @ts-ignore
                  await navigator.clipboard.writeText(data.location!);
                  return true;
                }
              } catch {}
              return false;
            })();
            if (ok) toast.info('Location copied');
          }} />
        </>
      ) : null}

      <View style={styles.separator} />
      {/* Participants */}
      <ParticipantsSection gameId={id as string} />

      <View style={{ height: 16 }} />

      <Button
        title={
          join.isPending || leave.isPending
            ? 'Please wait...'
            : joined
            ? 'Leave game'
            : isFull
            ? 'Full'
            : 'Join game'
        }
        onPress={() => (joined ? leave.mutate() : join.mutate())}
        disabled={join.isPending || leave.isPending || !online || (isFull && !joined)}
      />

      {isOwner ? (
        <>
          <View style={{ height: 16 }} />
          <Button
            color="#cc1f1a"
            title={del.isPending ? 'Deleting...' : 'Delete game'}
            onPress={async () => {
              const ok = await confirm({
                title: 'Delete game',
                message: 'Are you sure you want to delete this game?',
                confirmText: 'Delete',
                destructive: true,
              });
              if (ok) del.mutate();
            }}
          />
        </>
      ) : null}

      <View style={{ height: 16 }} />
      <Button
        title="Report issue"
        onPress={() => {
          const subject = encodeURIComponent(`Issue with game: ${data.title} (${id})`);
          const body = encodeURIComponent(
            `Please describe the issue...\n\nGame: ${data.title}\nWhen: ${whenText}\nLocation: ${data.location ?? 'N/A'}\nGame ID: ${id}`
          );
          const mailto = `mailto:support@example.com?subject=${subject}&body=${body}`;
          Linking.openURL(mailto);
        }}
      />
      <View style={{ height: 8 }} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

function SkeletonParticipant() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb' }} />
      <View style={{ flex: 1, height: 12, backgroundColor: '#e5e7eb', borderRadius: 6 }} />
    </View>
  );
}

function ParticipantsSection({ gameId }: { gameId: string }) {
  const { data, isLoading, isError, error, refetch, isRefetching } = useParticipants(gameId);

  return (
    <View>
      <Text style={styles.sectionTitle}>Participants</Text>

      {isError ? (
        <View style={{ backgroundColor: '#fee2e2', padding: 8, borderRadius: 6, marginBottom: 8 }}>
          <Text style={{ color: '#991b1b', marginBottom: 4 }}>{(error as any)?.message ?? 'Failed to load participants.'}</Text>
          <Button title={isRefetching ? 'Retrying…' : 'Retry'} onPress={() => refetch()} />
        </View>
      ) : null}

      {isLoading && !data ? (
        <>
          <SkeletonParticipant />
          <SkeletonParticipant />
          <SkeletonParticipant />
        </>
      ) : !data || data.length === 0 ? (
        <Text style={{ opacity: 0.8 }}>No participants yet.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(p, i) => p.id ?? `${p.username}-${i}`}
          renderItem={({ item }) => (
            <View style={styles.participantRow}>
              <Avatar name={item.displayName || item.username} uri={item.avatarUrl ?? undefined} size={32} />
              <Text style={styles.participantName}>{item.displayName || item.username}</Text>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      )}
    </View>
  );
}

  return (
    <View>
      <Text style={styles.sectionTitle}>Participants</Text>
      <FlatList
        data={data}
        keyExtractor={(p, i) => p.id ?? `${p.username}-${i}`}
        renderItem={({ item }) => (
          <View style={styles.participantRow}>
            <Avatar name={item.displayName || item.username} uri={item.avatarUrl ?? undefined} size={32} />
            <Text style={styles.participantName}>{item.displayName || item.username}</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  participantName: { fontSize: 14 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee', marginVertical: 8 },
});
