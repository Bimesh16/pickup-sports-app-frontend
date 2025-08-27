import React, { useEffect, useMemo, useState } from 'react';
import { Button, StyleSheet, View as RNView } from 'react-native';
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

export default function EditProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const toast = useToast();
  const router = useRouter();

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

  const mutation = useMutation({
    mutationFn: async () => {
      let finalAvatarUrl = avatarUrl || null;

      if (pickedUri) {
        try {
          setUploadProgress(0.01);
          const uploaded = await uploadAvatar(pickedUri, (p) => setUploadProgress(Math.max(0.01, Math.min(0.99, p))));
          setUploadProgress(1);
          finalAvatarUrl = uploaded;
        } catch (e: any) {
          setUploadProgress(0);
          toast.error(e?.message ?? 'Avatar upload failed');
          // continue with other changes even if upload fails
        }
      }

      return updateProfile({ displayName: displayName || undefined, avatarUrl: finalAvatarUrl });
    },
    onSuccess: (u) => {
      setUser(u);
      toast.success('Profile updated');
      router.back();
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Edit profile' }} />
      <RNView style={{ alignItems: 'center', marginBottom: 12, gap: 8 }}>
        <Avatar name={displayName || user?.username || ''} uri={(pickedUri ?? avatarUrl) || undefined} size={72} />
        <AvatarPicker onPicked={(uri) => setPickedUri(uri)} />
        {uploadProgress > 0 && uploadProgress < 1 ? (
          <RNView style={{ width: '60%', height: 6, backgroundColor: '#eee', borderRadius: 4 }}>
            <RNView style={{ width: `${Math.round(uploadProgress * 100)}%`, height: 6, backgroundColor: '#16a34a', borderRadius: 4 }} />
          </RNView>
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

      <Button
        title={mutation.isPending ? 'Saving...' : 'Save'}
        onPress={() => mutation.mutate()}
        disabled={mutation.isPending || !canSave || (uploadProgress > 0 && uploadProgress < 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
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
