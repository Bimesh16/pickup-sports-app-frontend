import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import VenuesList from '@/src/features/venues/components/VenuesList';

export default function VenuesScreen() {
  return (
    <View style={styles.container}>
      <VenuesList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});