import React, { useState } from 'react';
import { View, TextInput, Button, FlatList } from 'react-native';
import { Text } from '@/components/Themed';
import { Stack } from 'expo-router';
import { useAuditLogs } from '@/src/features/admin/hooks/useAuditLogs';
import { useProfanityWords } from '@/src/features/admin/hooks/useProfanityWords';

export default function AdminDashboard() {
  const { data: logs } = useAuditLogs();
  const profanity = useProfanityWords();
  const [newWord, setNewWord] = useState('');

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ title: 'Admin' }} />
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Audit Logs</Text>
      <FlatList
        data={logs ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{`${item.timestamp} - ${item.actor ?? 'system'} - ${item.action}`}</Text>
        )}
        style={{ marginBottom: 16 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Profanity Words</Text>
      <FlatList
        data={profanity.data ?? []}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ flex: 1 }}>{item}</Text>
            <Button title="Delete" onPress={() => profanity.remove.mutate(item)} />
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <TextInput
          accessibilityLabel="New word"
          value={newWord}
          onChangeText={setNewWord}
          style={{ flex: 1, borderWidth: 1, padding: 8, marginRight: 8 }}
        />
        <Button
          title="Add"
          onPress={() => {
            if (!newWord.trim()) return;
            profanity.add.mutate(newWord.trim(), { onSuccess: () => setNewWord('') });
          }}
        />
      </View>
    </View>
  );
}
