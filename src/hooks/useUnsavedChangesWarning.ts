import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * Warn before leaving the screen if there are unsaved changes.
 * Uses React Navigation's beforeRemove event (expo-router under the hood).
 */
export function useUnsavedChangesWarning(enabled: boolean) {
  const navigation = useNavigation();

  useEffect(() => {
    if (!enabled) return;

    const sub = navigation.addListener('beforeRemove', (e: any) => {
      if (!enabled) return;
      e.preventDefault();
      Alert.alert('Discard changes?', 'You have unsaved changes. Are you sure you want to leave this screen?', [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });

    return sub;
  }, [enabled, navigation]);
}
