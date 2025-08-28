import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Venue } from '@/src/types/api';
import { Link } from 'expo-router';

interface VenueCardProps {
  venue: Venue;
  onPress?: () => void;
}

export default function VenueCard({ venue, onPress }: VenueCardProps) {
  const content = (
    <View style={styles.card}>
      {venue.images.length > 0 && (
        <Image source={{ uri: venue.images[0] }} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.address}>{venue.address}, {venue.city}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {venue.description}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.label}>Sports:</Text>
            <Text style={styles.value}>{venue.sports.join(', ')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Price:</Text>
            <Text style={styles.value}>${venue.pricePerHour}/hour</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Capacity:</Text>
            <Text style={styles.value}>{venue.capacity} people</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Rating:</Text>
            <Text style={styles.value}>⭐ {venue.rating.toFixed(1)}</Text>
          </View>
        </View>

        {venue.amenities.length > 0 && (
          <View style={styles.amenities}>
            <Text style={styles.label}>Amenities:</Text>
            <Text style={styles.amenitiesText}>{venue.amenities.join(' • ')}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <Link href={`/venue/${venue.id}`} asChild>
      <TouchableOpacity style={styles.touchable}>
        {content}
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  amenities: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  amenitiesText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});