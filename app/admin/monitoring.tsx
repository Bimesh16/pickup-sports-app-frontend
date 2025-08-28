import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import SystemMonitoringDashboard from '@/src/features/system/components/SystemMonitoringDashboard';
import RequireAuth from '@/src/features/auth/components/RequireAuth';

export default function MonitoringScreen() {
  return (
    <RequireAuth>
      <View style={styles.container}>
        <SystemMonitoringDashboard />
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});