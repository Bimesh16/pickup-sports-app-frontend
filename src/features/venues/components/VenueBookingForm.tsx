import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useCreateVenueBooking } from '../hooks/useVenueBookings';
import DateTimeField from '@/src/components/DateTimeField';
import type { Venue } from '@/src/types/api';

interface VenueBookingFormProps {
  venue: Venue;
  onSuccess?: () => void;
}

export default function VenueBookingForm({ venue, onSuccess }: VenueBookingFormProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [participants, setParticipants] = useState('');

  const createBookingMutation = useCreateVenueBooking();

  const handleSubmit = async () => {
    if (!startTime || !endTime || !purpose || !participants) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const participantsNum = parseInt(participants, 10);
    if (isNaN(participantsNum) || participantsNum <= 0) {
      Alert.alert('Error', 'Please enter a valid number of participants');
      return;
    }

    if (participantsNum > venue.capacity) {
      Alert.alert('Error', `Maximum capacity is ${venue.capacity} people`);
      return;
    }

    try {
      await createBookingMutation.mutateAsync({
        venueId: venue.id,
        startTime,
        endTime,
        purpose,
        participants: participantsNum,
      });

      Alert.alert('Success', 'Venue booked successfully!', [
        { text: 'OK', onPress: onSuccess }
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to book venue');
    }
  };

  const isLoading = createBookingMutation.isPending;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book {venue.name}</Text>
      
      <View style={styles.field}>
        <Text style={styles.label}>Start Time</Text>
        <DateTimeField
          value={startTime}
          onChange={setStartTime}
          placeholder="Select start time"
          editable={!isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>End Time</Text>
        <DateTimeField
          value={endTime}
          onChange={setEndTime}
          placeholder="Select end time"
          editable={!isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Purpose</Text>
        <TextInput
          style={styles.input}
          value={purpose}
          onChangeText={setPurpose}
          placeholder="e.g., Basketball game, Training session"
          editable={!isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Number of Participants</Text>
        <TextInput
          style={styles.input}
          value={participants}
          onChangeText={setParticipants}
          placeholder={`Max ${venue.capacity} people`}
          keyboardType="numeric"
          editable={!isLoading}
        />
      </View>

      <View style={styles.priceInfo}>
        <Text style={styles.priceLabel}>Price per hour:</Text>
        <Text style={styles.priceValue}>${venue.pricePerHour}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Booking...' : 'Book Venue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: '#495057',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});