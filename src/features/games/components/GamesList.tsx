import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  TextInput,
  View as RNView,
  Platform,
} from 'react-native';
import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { distanceKm } from '@/src/utils/geo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ErrorBoundary from '@/src/components/ErrorBoundary';
import { useToast } from '@/src/components/ToastProvider';
import { usePrefs } from '@/src/stores/prefs';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, View } from '@/components/Themed';
import EmptyState from '@/src/components/EmptyState';
import { SkeletonCard } from '@/src/components/Skeleton';
import { joinGame, leaveGame } from '@/src/features/games/api';
import type { Game } from '@/src/features/games/types';
import { useDebouncedValue } from '@/src/hooks/useDebouncedValue';
import { useOnline, onOnline } from '@/src/components/OfflineBanner';
import { useInfiniteGames } from '@/src/features/games/hooks/useInfiniteGames';
import { useAuthStore } from '@/src/stores/auth';
import { isFull as isGameFull, slotsLeft } from '@/src/utils/capacity';
import { useOnboardingStore } from '@/src/stores/onboarding';
import CitySwitcher from '@/src/features/discovery/components/CitySwitcher';
import { useSavedFilters, type SavedFilter } from '@/src/stores/savedFilters';
import { useDiscoveryPrefs } from '@/src/stores/discoveryPrefs';

type Props = {
  initialShowJoined?: boolean;
  allowToggle?: boolean;
};

type TimeFilter = 'all' | 'today' | 'week' | 'weekend';

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

function Chip({
  text,
  color = '#e5e7eb',
  textColor = '#374151',
}: {
  text: string;
  color?: string;
  textColor?: string;
}) {
  return (
    <View style={{ backgroundColor: color, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 }}>
      <Text style={{ fontSize: 12, color: textColor }} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>
        {text}
      </Text>
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
  const isFull = isGameFull(joined, game.maxPlayers, game.playersCount);
  const left = slotsLeft(game.maxPlayers, game.playersCount);

  const toast = useToast();
  const { shareHintShown, setShareHintShown } = usePrefs();

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

  const handleLongPress = async () => {
    if (!shareHintShown) {
      toast.info('Tip: Long‑press to copy link');
      setShareHintShown(true);
      return;
    }
    await copyLink();
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
              <Text
                style={styles.cardTitle}
                numberOfLines={1}
                allowFontScaling
                adjustsFontSizeToFit
              >
                {game.title}
              </Text>
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
          onLongPress={handleLongPress}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 6 })}
        >
          <FontAwesome name="share-alt" size={18} />
        </Pressable>
      </View>

      {game.location ? (
        <Text allowFontScaling numberOfLines={1}>
          {game.location}
        </Text>
      ) : null}
      {/* Distance (if user coords available and game has coords) */}
      {typeof obLat === 'number' &&
      typeof obLon === 'number' &&
      typeof (game as any).latitude === 'number' &&
      typeof (game as any).longitude === 'number' ? (
        <Text allowFontScaling numberOfLines={1}>
          {distanceKm(obLat, obLon, (game as any).latitude, (game as any).longitude).toFixed(1)} km away
        </Text>
      ) : null}
      <Text allowFontScaling numberOfLines={1}>{when}</Text>
      {typeof game.playersCount === 'number' && typeof game.maxPlayers === 'number' ? (
        <>
          <Text>{game.playersCount} / {game.maxPlayers} players</Text>
          {(() => {
            const leftCalc = Math.max(game.maxPlayers - game.playersCount, 0);
            const low = leftCalc <= 2;
            const full = leftCalc === 0;
            const color = full ? '#991b1b' : low ? '#92400e' : '#374151';
            return (
              <Text style={{ color }} allowFontScaling numberOfLines={1}>
                {full ? 'Full' : leftCalc === 1 ? '1 slot left' : `${leftCalc} slots left`}
              </Text>
            );
          })()}
        </>
      ) : null}
      {game.sport ? (
        <Text allowFontScaling numberOfLines={1}>{game.sport}</Text>
      ) : null}

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
  // Seed initial query with onboarding sports/city if no saved lastQuery
  const obCity = useOnboardingStore((s) => s.city);
  const obSports = useOnboardingStore((s) => s.sportPrefs);
  const obRadiusKm = useOnboardingStore((s) => s.radiusKm ?? undefined);
  const setCityStore = useOnboardingStore((s) => s.setCity);
  const setRadiusKmStore = useOnboardingStore((s) => s.setRadiusKm);
  const seededQuery = lastQuery && lastQuery.trim().length > 0 ? lastQuery : (obSports?.[0] ?? obCity ?? '');
  const [query, setQuery] = useState<string>(seededQuery);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(savedTimeFilter ?? 'all');
  const [skillFilter, setSkillFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [sportFilter, setSportFilter] = useState<'All' | 'Soccer' | 'Basketball' | 'Tennis' | 'Volleyball' | 'Pickleball'>(
    (obSports?.[0] as any) ?? 'All'
  );

  // Discovery defaults persistence
  const {
    lastSportFilter,
    lastSkillFilter,
    setLastSportFilter,
    setLastSkillFilter,
    _rehydrated: discoveryReady,
  } = useDiscoveryPrefs();

  // Initialize from persisted values when rehydrated (one-time align)
  useEffect(() => {
    if (!discoveryReady) return;
    if (lastSportFilter && lastSportFilter !== sportFilter) setSportFilter(lastSportFilter as any);
    if (lastSkillFilter && lastSkillFilter !== skillFilter) setSkillFilter(lastSkillFilter as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoveryReady]);

  // Persist on change after hydration
  useEffect(() => {
    if (discoveryReady) setLastSportFilter(sportFilter as any);
  }, [sportFilter, discoveryReady, setLastSportFilter]);

  useEffect(() => {
    if (discoveryReady) setLastSkillFilter(skillFilter as any);
  }, [skillFilter, discoveryReady, setLastSkillFilter]);
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);
  const debouncedQuery = useDebouncedValue(query, 350);
  const listRef = useRef<FlatList<Game> | null>(null);

  // Scroll to top when primary filters change
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [showJoined, timeFilter]);

  // Compute time window for server-side filters
  const now = new Date();
  let fromTime: string | undefined;
  let toTime: string | undefined;
  if (timeFilter === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    fromTime = start.toISOString();
    toTime = end.toISOString();
  } else if (timeFilter === 'week') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    fromTime = start.toISOString();
    toTime = end.toISOString();
  } else if (timeFilter === 'weekend') {
    // Next Friday 17:00 to Sunday 23:59:59
    const start = new Date();
    const day = start.getDay(); // 0=Sun..6=Sat
    const daysToFri = (5 - day + 7) % 7;
    start.setDate(start.getDate() + daysToFri);
    start.setHours(17, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 2); // Sunday
    end.setHours(23, 59, 59, 999);
    // If we are already past this weekend end, jump to next weekend
    if (now > end) {
      start.setDate(start.getDate() + 7);
      end.setDate(end.getDate() + 7);
    }
    fromTime = start.toISOString();
    toTime = end.toISOString();
  }

  const obLat = useOnboardingStore((s) => s.latitude ?? undefined);
  const obLon = useOnboardingStore((s) => s.longitude ?? undefined);
  const obSkill = useOnboardingStore((s) => (s.skillLevel ? String(s.skillLevel) : undefined));

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    dataUpdatedAt,
  } = useInfiniteGames({
    q: debouncedQuery || undefined,
    joined: showJoined || undefined,
    sport: sportFilter !== 'All' ? sportFilter : (obSports?.[0] || undefined),
    location: obCity || undefined,
    skillLevel: skillFilter !== 'all' ? skillFilter : obSkill,
    fromTime,
    toTime,
    lat: typeof obLat === 'number' ? obLat : undefined,
    lon: typeof obLon === 'number' ? obLon : undefined,
    radiusKm: obRadiusKm,
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

    // Text filter
    let result = filtered;
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      result = filtered.filter((g) =>
        [g.title, g.location, g.sport, g.description].some((v) => (v ?? '').toLowerCase().includes(q))
      );
    }

    // Distance sort if enabled and we have user coords + game coords
    if (sortByDistance && typeof obLat === 'number' && typeof obLon === 'number') {
      result = result
        .slice()
        .sort((a, b) => {
          const da = typeof (a as any).latitude === 'number' && typeof (a as any).longitude === 'number'
            ? distanceKm(obLat, obLon, (a as any).latitude, (a as any).longitude)
            : Number.POSITIVE_INFINITY;
          const db = typeof (b as any).latitude === 'number' && typeof (b as any).longitude === 'number'
            ? distanceKm(obLat, obLon, (b as any).latitude, (b as any).longitude)
            : Number.POSITIVE_INFINITY;
          return da - db;
        });
    }

    return result;
  }, [all, showJoined, debouncedQuery, timeFilter, sortByDistance, obLat, obLon]);

  const updatedMinutesAgo = useMemo(() => {
    if (!dataUpdatedAt) return 0;
    return Math.floor((Date.now() - dataUpdatedAt) / 60000);
  }, [dataUpdatedAt]);

  useEffect(() => {
    const t = setInterval(() => {
      refetch();
    }, 3 * 60 * 1000);
    return () => clearInterval(t);
  }, [refetch]);

  // Define hooks BEFORE any early return to keep hook order consistent
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
        <Button title="Weekend" onPress={() => setTimeFilter('weekend')} />
        <Button title="Change city" onPress={() => setCityModalVisible(true)} />
      </RNView>
      <RNView style={styles.filterRow}>
        <Button
          title={sortByDistance ? 'Sorted by distance' : 'Sort by distance'}
          onPress={() => setSortByDistance((v) => !v)}
          disabled={!(typeof obLat === 'number' && typeof obLon === 'number')}
        />
        <Button
          title="Near me"
          onPress={async () => {
            let Location: any = null;
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              Location = require('expo-location');
            } catch {
              Location = null;
            }
            if (!Location) {
              toast.error('Location module not available');
              return;
            }
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                toast.error('Location permission denied');
                return;
              }
              const { coords } = await Location.getCurrentPositionAsync({});
              if (coords?.latitude && coords?.longitude) {
                // Best effort reverse geocode for city name
                let cityName = 'Current location';
                try {
                  const places = await Location.reverseGeocodeAsync({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                  });
                  cityName = places?.[0]?.city || places?.[0]?.region || cityName;
                } catch {
                  // ignore
                }
                setCityStore(cityName, coords.latitude, coords.longitude);
                if (obRadiusKm == null) setRadiusKmStore(15);
                listRef.current?.scrollToOffset({ offset: 0, animated: true });
                refetch();
              }
            } catch (e) {
              toast.error('Unable to get location');
            }
          }}
        />
        <Button
          title="Open map"
          onPress={() => {
            const q = encodeURIComponent(`${sportFilter !== 'All' ? sportFilter + ' ' : ''}${obCity ?? ''}`.trim() || 'sports');
            const url = Platform.select({
              ios: `http://maps.apple.com/?q=${q}`,
              android: `geo:0,0?q=${q}`,
              default: `https://www.google.com/maps/search/?api=1&query=${q}`,
            }) as string;
            Linking.openURL(url);
          }}
        />
      </RNView>
      <RNView style={styles.filterRow}>
        <Button title="All skills" onPress={() => setSkillFilter('all')} />
        <Button title="Beginner" onPress={() => setSkillFilter('Beginner')} />
        <Button title="Intermediate" onPress={() => setSkillFilter('Intermediate')} />
        <Button title="Advanced" onPress={() => setSkillFilter('Advanced')} />
      </RNView>

      {/* Sport chips */}
      <RNView style={styles.filterRow}>
        <Button title={sportFilter === 'All' ? 'All sports ✓' : 'All sports'} onPress={() => setSportFilter('All')} />
        <Button title={sportFilter === 'Soccer' ? 'Soccer ✓' : 'Soccer'} onPress={() => setSportFilter('Soccer')} />
        <Button title={sportFilter === 'Basketball' ? 'Basketball ✓' : 'Basketball'} onPress={() => setSportFilter('Basketball')} />
        <Button title={sportFilter === 'Tennis' ? 'Tennis ✓' : 'Tennis'} onPress={() => setSportFilter('Tennis')} />
        <Button title={sportFilter === 'Volleyball' ? 'Volleyball ✓' : 'Volleyball'} onPress={() => setSportFilter('Volleyball')} />
        <Button title={sportFilter === 'Pickleball' ? 'Pickleball ✓' : 'Pickleball'} onPress={() => setSportFilter('Pickleball')} />
      </RNView>

      {/* Saved filters chips row */}
      <SavedFiltersChips
        onApply={(f) => {
          if (f.city != null) setCityStore(f.city, undefined, undefined);
          if (f.radiusKm !== undefined) setRadiusKmStore(f.radiusKm ?? null);
          setSportFilter((f.sport as any) ?? 'All');
          // Optional: clear text query when applying a sport preset
          setQuery(f.sport ?? '');
          setSkillFilter((f.skillLevel as any) ?? 'all');
          setTimeFilter((f.timeFilter as any) ?? 'all');
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
          refetch();
        }}
      />

      <RNView style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        <Button
          title="Save current filters"
          onPress={() => {
            const effectiveSport = sportFilter !== 'All' ? sportFilter : (obSports?.[0] || undefined);
            const nameParts: string[] = [];
            if (obCity) nameParts.push(obCity);
            if (effectiveSport) nameParts.push(effectiveSport);
            if (skillFilter !== 'all') nameParts.push(skillFilter);
            nameParts.push(timeFilter === 'all' ? 'Any time' : timeFilter === 'today' ? 'Today' : 'This week');
            const name = nameParts.join(' • ') || 'My filter';
            const toSave: SavedFilter = {
              id: `${Date.now()}`,
              name,
              city: obCity || undefined,
              sport: effectiveSport || undefined,
              skillLevel: skillFilter !== 'all' ? (skillFilter as any) : undefined,
              timeFilter,
              radiusKm: obRadiusKm ?? null,
            };
            useSavedFilters.getState().add(toSave);
          }}
        />
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
            <Text allowFontScaling numberOfLines={1}>Clear filters ✕</Text>
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
          <CitySwitcher
            visible={cityModalVisible}
            initialCity={obCity}
            initialRadiusKm={obRadiusKm}
            onClose={() => setCityModalVisible(false)}
            onApply={({ city, radiusKm }) => {
              setCityModalVisible(false);
              setCityStore(city || '', undefined, undefined);
              setRadiusKmStore(radiusKm ?? null);
              listRef.current?.scrollToOffset({ offset: 0, animated: true });
              refetch();
            }}
          />
          <FlatList
            ref={(r) => (listRef.current = r as any)}
            data={list}
            keyExtractor={(g) => g.id}
            renderItem={({ item }) => {
              const isOwner = !!(user && item.createdBy?.username && user.username === item.createdBy.username);
              const pending = joinPendingId === item.id || leavePendingId === item.id;
              return (
                <ErrorBoundary
                  fallback={
                    <View style={[styles.card, { alignItems: 'center' }]}> 
                      <Text allowFontScaling numberOfLines={1}>Unable to render item</Text>
                    </View>
                  }
                >
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
            ListHeaderComponent={() => (
              <RNView style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                {!online ? (
                  <RNView style={styles.pillWarning}>
                    <Text style={styles.pillWarningText} allowFontScaling numberOfLines={2}>
                      You’re offline. Join/Leave is disabled.
                    </Text>
                  </RNView>
                ) : null}
                {isError ? (
                  <RNView style={{ marginTop: 8, marginBottom: 4 }}>
                    <RNView style={styles.pillError}>
                      <Text style={styles.pillErrorText} allowFontScaling numberOfLines={2}>
                        {(error as any)?.message ?? 'Some games may be out of date.'}
                      </Text>
                    </RNView>
                    <Button title={isRefetching ? 'Retrying…' : 'Retry now'} onPress={() => refetch()} />
                  </RNView>
                ) : null}

                {/* Cached data indicator when offline or serving cached pages despite an error */}
                {(!online || (isError && hasPages)) && !isRefetching ? (
                  <RNView style={{ alignSelf: 'flex-start', backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginTop: 4 }}>
                    <Text style={{ color: '#9a3412' }}>Showing cached data</Text>
                  </RNView>
                ) : null}

                {(obCity || (skillFilter !== 'all') || (obSports?.[0]) || (sportFilter !== 'All')) ? (
                  <RNView style={{ marginTop: 8, marginBottom: 4, padding: 8, borderRadius: 8, backgroundColor: '#f3f4f6' }}>
                    <Text allowFontScaling numberOfLines={2}>
                      Showing results for
                      {obCity ? ` • City: ${obCity}` : ''}
                      {sportFilter !== 'All' ? ` • Sport: ${sportFilter}` : (obSports?.[0] ? ` • Sport: ${obSports[0]}` : '')}
                      {skillFilter !== 'all' ? ` • Skill: ${skillFilter}` : ''}
                      {typeof obRadiusKm === 'number' ? ` • Radius: ${obRadiusKm}km` : ''}
                    </Text>
                    <RNView style={{ marginTop: 6 }}>
                      <Button
                        title="Clear"
                        onPress={() => {
                          setCityStore('', null, null);
                          setRadiusKmStore(null);
                          setSkillFilter('all');
                          setSportFilter('All');
                          setTimeFilter('all');
                          setQuery('');
                          listRef.current?.scrollToOffset({ offset: 0, animated: true });
                          refetch();
                        }}
                      />
                    </RNView>
                  </RNView>
                ) : null}

                {!isLoading && !isRefetching ? (
                  <Text style={{ marginTop: 4, color: '#6b7280' }}>
                    Updated {updatedMinutesAgo} min ago
                  </Text>
                ) : null}
              </RNView>
            )}
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  pillWarningText: { color: '#374151' },
  pillError: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fee2e2',
  },
  pillErrorText: { color: '#991b1b' },
});

function SavedFiltersChips({ onApply }: { onApply: (f: import('@/src/stores/savedFilters').SavedFilter) => void }) {
  const { filters, remove } = useSavedFilters();
  if (!filters?.length) return null;
  return (
    <RNView style={{ paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {filters.map((f) => (
        <Pressable
          key={f.id}
          onPress={() => onApply(f)}
          onLongPress={() => remove(f.id)}
          style={({ pressed }) => [
            { backgroundColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityLabel={`Apply saved filter ${f.name}`}
        >
          <Text allowFontScaling numberOfLines={1}>{f.name}</Text>
        </Pressable>
      ))}
    </RNView>
  );
}
