import React, { useState } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useVenues } from '../hooks/useVenues';
import VenueCard from './VenueCard';
import EmptyState from '@/src/components/EmptyState';
import { useDebouncedValue } from '@/src/hooks/useDebouncedValue';

export default function VenuesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  
  const debouncedQuery = useDebouncedValue(searchQuery, 500);
  
  const { data, isLoading, isError, error, refetch, isRefetching } = useVenues({
    name: debouncedQuery || undefined,
    city: selectedCity || undefined,
    sport: selectedSport || undefined,
    size: 20
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading venues...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Failed to load venues: {(error as any)?.message || 'Unknown error'}
        </Text>
      </View>
    );
  }

  const venues = data?.content || [];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={venues}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <VenueCard venue={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No venues found"
            message="Try adjusting your search criteria"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
});