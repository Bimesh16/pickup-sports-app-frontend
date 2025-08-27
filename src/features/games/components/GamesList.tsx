import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Link } from 'expo-router';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, View } from '@/components/Themed';
import EmptyState from '@/src/components/EmptyState';
import { SkeletonCard } from '@/src/components/Skeleton';
import { useToast } from '@/src/components/ToastProvider';
import { joinGame, leaveGame } from '@/src/features/games/api';
import type { Game } from '@/src/features/games/types';
import { usePrefs } from '@/src/stores/prefs';
import { useDebouncedValue } from '@/src/hooks/useDebouncedValue';
import { useOnline } from '@/src/components/OfflineBanner';
import { useInfiniteGames } from '@/src/features/games/hooks/useInfiniteGames';
import { useAuthStore } from '@/src/stores/auth';

type Props = {
  initialShowJoined?: boolean;
  allowToggle?: boolean;
};

type TimeFilter = 'all' | 'today' | 'week';

function isToday(dateISO: string) {
  const d = new Date(dateISO);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isThisWeek(dateISO: string) {
  const d = new Date(dateISO);
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const diff = d.getTime() - start.getTime();
  return diff >= 0 && diff <= 7 * oneDay;
}

function useJoinLeaveOptimistic() {
  const qc = useQueryClient();
  const toast = useToast();
  const [joinPendingId, setJoinPendingId] = useState<string | null>(null);
  const [leavePendingId, setLeavePendingId] = useState<string | null>(null);

  const patchGame = (id: string, updater: (g: Game) => Game) => {
    qc.setQueryData<InfiniteData<{ items: Game[]; nextPage: number | null }> | undefined>(['games'], (current) => {
      if (!current) return current;
      const pages = current.pages.map((p) => ({
        ...p,
        items: Array.isArray(p.items) ? p.items.map((g) => (g.id === id ? updater(g) : g)) : p.items,
      }));
      return { ...current, pages };
    });
  };

  const join = useMutation({
    mutationFn: (id: string) => joinGame(id),
    onMutate: async (id) => {
      setJoinPendingId(id);
      await qc.cancelQueries({ queryKey: ['games'] });
      patchGame(id, (g) => ({ ...g, joined: true, playersCount: (g.playersCount ?? 0) + 1 }));
    },
    onError: (_e, id) => {
      patchGame(id, (g) => ({ ...g, joined: false, playersCount: Math.max((g.playersCount ?? 1) - 1, 0) }));
      toast.error('Join failed');
    },
    onSettled: async (_res, _err, id) => {
      setJoinPendingId((prev) => (prev === id ? null : prev));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['games'] }),
        qc.invalidateQueries({ queryKey: ['game', id] }),
      ]);
    },
  });

  const leave = useMutation({
    mutationFn: (id: string) => leaveGame(id),
    onMutate: async (id) => {
      setLeavePendingId(id);
      await qc.cancelQueries({ queryKey: ['games'] });
      patchGame(id, (g) => ({ ...g, joined: false, playersCount: Math.max((g.playersCount ?? 1) - 1, 0) }));
    },
    onError: (_e, id) => {
      patchGame(id, (g) => ({ ...g, joined: true, playersCount: (g.playersCount ?? 0) + 1 }));
      toast.error('Leave failed');
    },
    onSettled: async (_res, _err, id) => {
      setLeavePendingId((prev) => (prev === id ? null : prev));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['games'] }),
        qc.invalidateQueries({ queryKey: ['game', id] }),
      ]);
    },
  });

  return { join, leave, joinPendingId, leavePendingId };
}

function Chip({ text, color = '#e5e7eb' }: { text: string; color?: string }) {
  return (
    <View style={{ backgroundColor: color, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 }}>
      <Text style={{ fontSize: 12 }}>{text}</Text>
    </View>
  );
}

function GameCard({
  game,
  onJoin,
  onLeave,
  disabled,
  pending,
  isOwner,
}: {
  game: Game;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  disabled?: boolean;
  pending?: boolean;
  isOwner?: boolean;
}) {
  const starts = new Date(game.startsAt);
  const when = `${starts.toLocaleDateString()} ${starts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const joined = !!game.joined;

  return (
    <View style={styles.card}>
      <Link href={`/(tabs)/game/${game.id}`} asChild>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1.0 }]}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.cardTitle}>{game.title}</Text>
              {joined ? <Chip text="Joined" color="#d1fae5" /> : null}
              {isOwner ? <Chip text="Owner" color="#e0e7ff" /> : null}
            </View>
            {game.location ? <Text>{game.location}</Text> : null}
            <Text>{when}</Text>
            {typeof game.playersCount === 'number' && typeof game.maxPlayers === 'number' ? (
              <Text>{game.playersCount} / {game.maxPlayers} players</Text>
            ) : null}
            {game.sport ? <Text>{game.sport}</Text> : null}
          </View>
        </Pressable>
      </Link>
      <RNView style={{ height: 8 }} />
      <Button
        title={pending ? 'Please wait...' : joined ? 'Leave' : 'Join'}
        onPress={() => (joined ? onLeave(game.id) : onJoin(game.id))}
        disabled={!!disabled || pending}
      />
    </View>
  );
}

export default function GamesList({ initialShowJoined = false, allowToggle = true }: Props) {
  const { lastQuery, showJoinedDefault, setLastQuery, setShowJoinedDefault, _rehydrated } = usePrefs();

  const [showJoined, setShowJoined] = useState<boolean>(initialShowJoined || showJoinedDefault);
  const [query, setQuery] = useState<string>(lastQuery);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data, isLoading, isError, error, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteGames({
    q: debouncedQuery || undefined,
    joined: showJoined || undefined,
  });
  const { join, leave, joinPendingId, leavePendingId } = useJoinLeaveOptimistic();
  const online = useOnline();

  // Keep prefs in sync (after hydration)
  useEffect(() => {
    if (_rehydrated) setShowJoinedDefault(showJoined);
  }, [showJoined, _rehydrated, setShowJoinedDefault]);

  useEffect(() => {
    if (_rehydrated) setLastQuery(query);
  }, [query, _rehydrated, setLastQuery]);

  const user = useAuthStore((s) => s.user);

  const all: Game[] = useMemo(() => {
    if (!data?.pages) return [];
    const pages = Array.isArray(data.pages) ? data.pages : [];
    const combined = pages.flatMap((p: any) => (Array.isArray(p?.items) ? (p.items as Game[]) : []));
    // Sort by upcoming time ascending
    return combined.slice().sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [data]);

  const list = useMemo(() => {
    let filtered = showJoined ? all.filter((g) => g.joined) : all;
    if (timeFilter === 'today') filtered = filtered.filter((g) => isToday(g.startsAt));
    else if (timeFilter === 'week') filtered = filtered.filter((g) => isThisWeek(g.startsAt));
    if (!debouncedQuery.trim()) return filtered;
    const q = debouncedQuery.toLowerCase();
    return filtered.filter((g) =>
      [g.title, g.location, g.sport, g.description].some((v) => (v ?? '').toLowerCase().includes(q))
    );
  }, [all, showJoined, debouncedQuery, timeFilter]);

  if (isLoading && !data) {
    return (
      <View style={styles.container}>
        <RNView style={styles.toolbar}>
          <TextInput style={styles.search} placeholder="Search games..." value={query} onChangeText={setQuery} />
          {allowToggle ? <Button title={showJoined ? 'Show all' : 'Show joined'} onPress={() => setShowJoined((v) => !v)} /> : null}
        </RNView>
        <FlatList
          data={[...Array(6).keys()]}
          keyExtractor={(i) => `sk-${i}`}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <RNView style={styles.toolbar}>
          <TextInput style={styles.search} placeholder="Search games..." value={query} onChangeText={setQuery} />
          {allowToggle ? <Button title={showJoined ? 'Show all' : 'Show joined'} onPress={() => setShowJoined((v) => !v)} /> : null}
        </RNView>
        <EmptyState
          title="Couldn’t load games"
          subtitle={(error as any)?.message ?? 'Please try again.'}
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNView style={styles.toolbar}>
        <TextInput
          style={styles.search}
          placeholder="Search games..."
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {allowToggle ? (
          <Button title={showJoined ? 'Show all' : 'Show joined'} onPress={() => setShowJoined((v) => !v)} />
        ) : null}
      </RNView>
      <RNView style={styles.filterRow}>
        <Button title="All" onPress={() => setTimeFilter('all')} />
        <Button title="Today" onPress={() => setTimeFilter('today')} />
        <Button title="This week" onPress={() => setTimeFilter('week')} />
      </RNView>

      {!list?.length ? (
        <EmptyState
          title={`No games ${showJoined ? 'joined yet' : 'found'}`}
          subtitle={showJoined ? undefined : 'Try a different search or create a game from the Create tab.'}
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(g) => g.id}
          renderItem={({ item }) => {
            const isOwner = !!(user && item.createdBy?.username && user.username === item.createdBy.username);
            const pending = joinPendingId === item.id || leavePendingId === item.id;
            return (
              <GameCard
                game={item}
                onJoin={(id) => join.mutate(id)}
                onLeave={(id) => leave.mutate(id)}
                disabled={!online}
                pending={pending}
                isOwner={isOwner}
              />
            );
          }}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={[styles.center, { paddingVertical: 16 }]}>
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  search: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee', marginVertical: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
});
