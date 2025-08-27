import React, { useEffect, useMemo, useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View as RNView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Text, View } from '@/components/Themed';
import Avatar from '@/src/components/Avatar';
import AvatarPicker from '@/src/components/AvatarPicker';
import FormField from '@/src/components/FormField';
import { useToast } from '@/src/components/ToastProvider';
import { useAuthStore } from '@/src/stores/auth';
import { getProfile, updateProfile, uploadAvatar } from '@/src/features/user/api';
import { validateDisplayName, validateUrlOptional } from '@/src/utils/validation';
import { useUnsavedChangesWarning } from '@/src/hooks/useUnsavedChangesWarning';

export default function EditProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const toast = useToast();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // refresh from server on mount to ensure latest
    (async () => {
      try {
        const fresh = await getProfile();
        setUser(fresh);
        setDisplayName(fresh.displayName ?? '');
        setAvatarUrl(fresh.avatarUrl ?? '');
      } catch {
        // ignore
      }
    })();
  }, [setUser]);

  const abortRef = React.useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      let finalAvatarUrl = avatarUrl || null;

      if (pickedUri) {
        try {
          setUploadProgress(0.01);
          abortRef.current = new AbortController();
          const uploaded = await uploadAvatar(
            pickedUri,
            (p) => setUploadProgress(Math.max(0.01, Math.min(0.99, p))),
            abortRef.current.signal
          );
          setUploadProgress(1);
          finalAvatarUrl = uploaded;
        } catch (e: any) {
          setUploadProgress(0);
          if (e?.name === 'CanceledError' || e?.message?.toString?.()?.includes?.('aborted')) {
            toast.info('Upload canceled');
          } else {
            toast.error(e?.message ?? 'Avatar upload failed');
          }
          // continue with other changes even if upload fails
        } finally {
          abortRef.current = null;
        }
      }

      return updateProfile({ displayName: displayName || undefined, avatarUrl: finalAvatarUrl });
    },
    onSuccess: (u) => {
      // Reflect latest user data in form
      setUser(u);
      setDisplayName(u.displayName ?? '');
      setAvatarUrl(u.avatarUrl ?? '');
      setPickedUri(null);
      setUploadProgress(0);
      // Show saved indicator without leaving the screen
      toast.success('Profile updated');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (e: any) => toast.error(e?.message ?? 'Update failed'),
  });

  const nameError = useMemo(() => validateDisplayName(displayName), [displayName]);
  const urlError = useMemo(() => validateUrlOptional(avatarUrl), [avatarUrl]);

  const changed =
    displayName !== (user?.displayName ?? '') ||
    (avatarUrl ?? '') !== (user?.avatarUrl ?? '') ||
    !!pickedUri;

  const canSave = changed && !nameError && !urlError;

  // Warn if user tries to navigate away with unsaved changes (and not actively saving)
  useUnsavedChangesWarning(changed && !mutation.isPending);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.containerScroll} keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{ title: 'Edit profile' }} />
        {(nameError || urlError) ? (
          <View style={{ backgroundColor: '#fef3c7', padding: 8, borderRadius: 6, marginBottom: 8 }}>
            <Text style={{ color: '#92400e' }}>
              {nameError ?? urlError}
            </Text>
          </View>
        ) : null}
        <RNView style={{ alignItems: 'center', marginBottom: 12, gap: 8 }}>
        <Avatar name={displayName || user?.username || ''} uri={(pickedUri ?? avatarUrl) || undefined} size={72} />
        <AvatarPicker onPicked={(uri) => setPickedUri(uri)} />
        {(pickedUri || avatarUrl) ? (
          <Button
            title="Remove photo"
            onPress={() => {
              // Ask before removing
              import('react-native').then(({ Alert }) => {
                Alert.alert('Remove photo', 'Are you sure you want to remove your photo?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => { setPickedUri(null); setAvatarUrl(''); } },
                ]);
              });
            }}
          />
        ) : null}
        {uploadProgress > 0 && uploadProgress < 1 ? (
          <>
            <RNView style={{ width: '60%', height: 6, backgroundColor: '#eee', borderRadius: 4 }}>
              <RNView style={{ width: `${Math.round(uploadProgress * 100)}%`, height: 6, backgroundColor: '#16a34a', borderRadius: 4 }} />
            </RNView>
            <Text style={{ opacity: 0.8 }}>{Math.round(uploadProgress * 100)}%</Text>
            <Button title="Cancel upload" onPress={() => abortRef.current?.abort()} />
          </>
        ) : null}
      </RNView>

      <FormField
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        error={nameError || undefined}
      />

      <FormField
        label="Avatar URL"
        value={avatarUrl ?? ''}
        onChangeText={setAvatarUrl}
        placeholder="https://..."
        autoCapitalize="none"
        error={urlError || undefined}
      />

      <RNView style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          title={mutation.isPending ? 'Saving...' : 'Save'}
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending || !canSave || (uploadProgress > 0 && uploadProgress < 1)}
        />
        <Button
          title="Reset changes"
          onPress={() => {
            // Revert to latest user data in store
            setDisplayName(user?.displayName ?? '');
            setAvatarUrl(user?.avatarUrl ?? '');
            setPickedUri(null);
            setUploadProgress(0);
          }}
          disabled={!changed || mutation.isPending}
        />
      </RNView>
      {saved ? <Text style={{ color: '#16a34a', textAlign: 'center' }}>Saved</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  containerScroll: { padding: 16, gap: 12 },
  row: { gap: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
