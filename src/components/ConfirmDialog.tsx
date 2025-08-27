import React from 'react';
import { Alert } from 'react-native';

type Options = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

export function confirm(options: Options): Promise<boolean> {
  const { title = 'Confirm', message = 'Are you sure?', confirmText = 'OK', cancelText = 'Cancel', destructive } = options;
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
}
