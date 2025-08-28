import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useGameChat } from '@/src/features/games/hooks/useGameChat';
import type { ChatMessage } from '@/src/features/games/types/chat';
import { useChatDrafts } from '@/src/stores/chatDrafts';
import { useAuthStore } from '@/src/stores/auth';

export default function ChatPanel({ gameId }: { gameId: string }) {
  const { messages, isLoading, isError, refetch, send, typingUsers, sendTyping } = useGameChat(gameId);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<ChatMessage> | null>(null);
  const { drafts, setDraft, clearDraft } = useChatDrafts();
  const me = useAuthStore((s) => s.user);

  // Load existing draft on mount
  useEffect(() => {
    const initial = drafts?.[gameId] ?? '';
    if (initial) setText(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Throttle typing notifications (2s)
  const lastTypingRef = useRef<number>(0);
  const onChangeText = (t: string) => {
    setText(t);
    setDraft(gameId, t);
    const now = Date.now();
    if (now - lastTypingRef.current > 2000) {
      lastTypingRef.current = now;
      sendTyping(me?.username);
    }
  };

  const canSend = useMemo(() => text.trim().length > 0 && !send.isPending, [text, send.isPending]);

  const onSend = () => {
    if (!canSend) return;
    const content = text.trim();
    setText('');
    clearDraft(gameId);
    send.mutate(content, {
      onSuccess: () => {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { flex: 1 }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.center, { flex: 1 }]}>
        <Text style={{ marginBottom: 8 }}>Failed to load chat.</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  const typingDisplay =
    typingUsers.length > 0
      ? `${typingUsers.slice(0, 2).join(', ')}${typingUsers.length > 2 ? '…' : ''} typing…`
      : '';

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          ref={(r) => (listRef.current = r as any)}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          renderItem={({ item }) => (
            <RNView style={styles.msgRow}>
              <RNView style={styles.avatar} />
              <RNView style={{ flex: 1 }}>
                <Text style={styles.msgAuthor}>{item.user.displayName || item.user.username || 'You'}</Text>
                <Text style={[styles.msgText, item.pending ? { opacity: 0.6 } : null]}>{item.content}</Text>
                <Text style={styles.msgMeta}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </RNView>
            </RNView>
          )}
        />
        {typingDisplay ? (
          <RNView style={{ paddingHorizontal: 12, paddingBottom: 4 }}>
            <Text style={{ opacity: 0.7, fontSize: 12 }}>{typingDisplay}</Text>
          </RNView>
        ) : null}
        <RNView style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={text}
            onChangeText={onChangeText}
            onSubmitEditing={onSend}
            blurOnSubmit
          />
          <Button title={send.isPending ? 'Sending…' : 'Send'} onPress={onSend} disabled={!canSend} />
        </RNView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  msgRow: { flexDirection: 'row', gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb' },
  msgAuthor: { fontSize: 12, opacity: 0.8 },
  msgText: { fontSize: 16 },
  msgMeta: { fontSize: 10, opacity: 0.6 },
  inputRow: { flexDirection: 'row', gap: 8, padding: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb' },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
});

