import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from '@/components/Themed';
import ChatPanel from '@/src/features/games/components/ChatPanel';

export default function GameChatScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return null;
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Game chat' }} />
      <ChatPanel gameId={id as string} />
    </View>
  );
}
