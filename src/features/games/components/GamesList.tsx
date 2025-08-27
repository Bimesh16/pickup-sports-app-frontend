import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Pressable, RefreshControl, Share, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ErrorBoundary from '@/src/components/ErrorBoundary';
import { useToast } from '@/src/components/ToastProvider';
import { usePrefs } from '@/src/stores/prefs';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, View } from '@/components/Themed';
import EmptyState from '@/src/components/EmptyState';
import { SkeletonCard } from '@/src/components/Skeleton';
import { useToast } from '@/src/components/ToastProvider';
import { joinGame, leaveGame } from '@/src/features/games/api';
import type { Game } from '@/src/features/games/types';
import { usePrefs } from '@/src/stores/prefs';
import { useDebouncedValue } from '@/src/hooks/useDebouncedValue';
import { useOnline, onOnline } from '@/src/components/OfflineBanner';
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
  const isFull = !joined && typeof game.maxPlayers === 'number' && typeof game.playersCount === 'number' && game.playersCount >= game.maxPlayers;

  const toast = useToast();

  const share = () => {
    const url = Linking.createURL(`/game/${game.id}`);
    Share.share({ message: `Join this game: ${url}` });
  };

  const copyLink = async () => {
    const url = Linking.createURL(`/game/${game.id}`);
    let copied = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('expo-clipboard');
      if (mod?.setStringAsync) {
        await mod.setStringAsync(url);
        copied = true;
      }
    } catch {
      // ignore, try web API
    }
    if (!copied) {
      try {
        if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
          // @ts-ignore
          await navigator.clipboard.writeText(url);
          copied = true;
        }
      } catch {
        // ignore
      }
    }
    if (copied) toast.info('Link copied');
  };

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href={`/(tabs)/game/${game.id}`} asChild>
          <Pressable
            accessibilityLabel={`Open ${game.title}`}
            accessibilityRole="link"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1.0, flex: 1 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{game.title}</Text>
              {joined ? <Chip text="Joined" color="#d1fae5" /> : null}
              {isOwner ? <Chip text="Owner" color="#e0e7ff" /> : null}
              {isFull ? <Chip text="Full" color="#fee2e2" /> : null}
            </View>
          </Pressable>
        </Link>
        <Pressable
          accessibilityLabel="Share game"
          accessibilityRole="button"
          hitSlop={10}
          onPress={share}
          onLongPress={copyLink}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 6 })}
        >
          <FontAwesome name="share-alt" size={18} />
        </Pressable>
      </View>

      {game.location ? <Text>{game.location}</Text> : null}
      <Text>{when}</Text>
      {typeof game.playersCount === 'number' && typeof game.maxPlayers === 'number' ? (
        <>
          <Text>{game.playersCount} / {game.maxPlayers} players</Text>
          {(() => {
            const left = Math.max(game.maxPlayers - game.playersCount, 0);
            const low = left <= 2;
            const full = left === 0;
            const color = full ? '#991b1b' : low ? '#92400e' : '#374151';
            return (
              <Text style={{ color }}>
                {full ? 'Full' : left === 1 ? '1 slot left' : `${left} slots left`}
              </Text>
            );
          })()}
        </>
      ) : null}
      {game.sport ? <Text>{game.sport}</Text> : null}

      <RNView style={{ height: 8 }} />
      <Button
        title={pending ? 'Please wait...' : joined ? 'Leave' : isFull ? 'Full' : 'Join'}
        onPress={() => (joined ? onLeave(game.id) : onJoin(game.id))}
        disabled={!!disabled || pending || (isFull && !joined)}
      />
    </View>
  );
}

export default function GamesList({ initialShowJoined = false, allowToggle = true }: Props) {
  const { lastQuery, showJoinedDefault, timeFilter: savedTimeFilter, setLastQuery, setShowJoinedDefault, setTimeFilter: saveTimeFilter, _rehydrated } = usePrefs();

  const [showJoined, setShowJoined] = useState<boolean>(initialShowJoined || showJoinedDefault);
  const [query, setQuery] = useState<string>(lastQuery);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(savedTimeFilter ?? 'all');
  const debouncedQuery = useDebouncedValue(query, 350);
  const listRef = useRef<FlatList<Game> | null>(null);

  // Scroll to top when primary filters change
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [showJoined, timeFilter]);

  const { data, isLoading, isError, error, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteGames({
    q: debouncedQuery || undefined,
    joined: showJoined || undefined,
  });
  const { join, leave, joinPendingId, leavePendingId } = useJoinLeaveOptimistic();
  const online = useOnline();
  const toast = useToast();

  useEffect(() => {
    const unsub = onOnline(async () => {
      await refetch();
      toast.success('Updated');
    });
    return unsub;
  }, [refetch, toast]);

  // Keep prefs in sync (after hydration)
  useEffect(() => {
    if (_rehydrated) setShowJoinedDefault(showJoined);
  }, [showJoined, _rehydrated, setShowJoinedDefault]);

  useEffect(() => {
    if (_rehydrated) setLastQuery(query);
  }, [query, _rehydrated, setLastQuery]);

  useEffect(() => {
    if (_rehydrated) saveTimeFilter(timeFilter);
  }, [timeFilter, _rehydrated, saveTimeFilter]);

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

  const hasPages = !!data?.pages && (Array.isArray(data.pages) ? data.pages.length > 0 : false);

  // Auto-retry non-blocking errors (when some data already exists) with gentle backoff (max 3 tries)
  const autoRetryRef = useRef(0);
  useEffect(() => {
    if (isError && hasPages && !isRefetching && autoRetryRef.current < 3) {
      autoRetryRef.current += 1;
      const delay = Math.min(5000 * autoRetryRef.current, 15000);
      const t = setTimeout(() => {
        refetch();
      }, delay);
      return () => clearTimeout(t);
    }
    if (!isError) {
      autoRetryRef.current = 0;
    }
  }, [isError, hasPages, isRefetching, refetch]);

  if (isError && !hasPages) {
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
      {(showJoined || timeFilter !== 'all' || query.trim()) ? (
        <RNView style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
          <Pressable
            onPress={() => {
              setShowJoined(false);
              setTimeFilter('all');
              setQuery('');
              listRef.current?.scrollToOffset({ offset: 0, animated: true });
            }}
            style={({ pressed }) => [{ alignSelf: 'flex-start', backgroundColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, opacity: pressed ? 0.7 : 1 }]}
            accessibilityLabel="Clear filters"
            accessibilityRole="button"
          >
            <Text>Clear filters ✕</Text>
          </Pressable>
        </RNView>
      ) : null}

      {!list?.length ? (
        <EmptyState
          title={`No games ${showJoined ? 'joined yet' : 'found'}`}
          subtitle={showJoined ? undefined : 'Try a different search or create a game from the Create tab.'}
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <>
          <FlatList
            ref={(r) => (listRef.current = r as any)}
            data={list}
            keyExtractor={(g) => g.id}
            renderItem={({ item }) => {
              const isOwner = !!(user && item.createdBy?.username && user.username === item.createdBy.username);
              const pending = joinPendingId === item.id || leavePendingId === item.id;
              return (
                <ErrorBoundary fallback={<View style={[styles.card, { alignItems: 'center' }]}><Text>Unable to render item</Text></View>}>
                  <GameCard
                    game={item}
                    onJoin={(id) => join.mutate(id)}
                    onLeave={(id) => leave.mutate(id)}
                    disabled={!online}
                    pending={pending}
                    isOwner={isOwner}
                  />
                </ErrorBoundary>
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
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                {!online ? (
                  <RNView style={styles.pillWarning}>
                    <Text style={styles.pillWarningText}>You’re offline. Join/Leave is disabled.</Text>
                  </RNView>
                ) : null}
                {isError ? (
                  <RNView style={{ marginTop: 8, marginBottom: 4 }}>
                    <RNView style={styles.pillError}>
                      <Text style={styles.pillErrorText}>{(error as any)?.message ?? 'Some games may be out of date.'}</Text>
                    </RNView>
                    <Button title={isRefetching ? 'Retrying…' : 'Retry now'} onPress={() => refetch()} />
                  </RNView>
                ) : null}
              </View>
            }
            stickyHeaderIndices={[0]}
          />
        </>
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
  pillWarning: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillWarningText: { color: '#374151' },
  pillError: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillErrorText: { color: '#991b1b' },
});
