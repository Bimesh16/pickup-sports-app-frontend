import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useChat } from '../hooks/useChat';
import { useChatRead } from '../hooks/useChatRead';

type Props = { gameId: string };

export function ChatList({ gameId }: Props) {
  const { data, isLoading, refetch } = useChat(gameId);
  const markRead = useChatRead(gameId);

  useEffect(() => {
    if (data && data.length > 0) {
      const last = data[data.length - 1];
      markRead.mutate(last.id);
    }
  }, [data, markRead]);

  if (isLoading) return <ActivityIndicator />;

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      refreshing={isLoading}
      onRefresh={refetch}
      renderItem={({ item }) => (
        <View style={{ padding: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>{item.userId}</Text>
          <Text>{item.content}</Text>
        </View>
      )}
    />
  );
}
