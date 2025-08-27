import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSubmitRating } from '@/src/features/ratings/hooks/useSubmitRating';

export default function RateGameScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const mutation = useSubmitRating(id as string);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ title: 'Rate Game' }} />
      <Text>Rating (1-5)</Text>
      <TextInput
        accessibilityLabel="Rating"
        keyboardType="numeric"
        value={rating}
        onChangeText={setRating}
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />
      <Text>Comment</Text>
      <TextInput
        accessibilityLabel="Comment"
        value={comment}
        onChangeText={setComment}
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />
      <Button
        title={mutation.isPending ? 'Submitting...' : 'Submit'}
        onPress={() => {
          const value = parseInt(rating, 10);
          if (!Number.isFinite(value)) return;
          mutation.mutate(
            { rating: value, comment },
            { onSuccess: () => router.back() }
          );
        }}
        disabled={mutation.isPending}
      />
    </View>
  );
}
