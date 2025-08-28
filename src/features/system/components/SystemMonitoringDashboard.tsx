import React, { useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { 
  useSystemHealth, 
  useSystemDashboard, 
  useMonitoringDashboard,
  useOptimizeSystem 
} from '../hooks/useSystemMonitoring';

interface StatusIndicatorProps {
  status: 'healthy' | 'degraded' | 'critical' | 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  label: string;
}

function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const normalizedStatus = status.toLowerCase();
  const getColor = () => {
    switch (normalizedStatus) {
      case 'healthy': return '#28a745';
      case 'degraded': return '#ffc107';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getIcon = () => {
    switch (normalizedStatus) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  };

  return (
    <View style={styles.statusIndicator}>
      <Text style={styles.statusIcon}>{getIcon()}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusText, { color: getColor() }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
}

export default function SystemMonitoringDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'LAST_HOUR' | 'LAST_DAY' | 'LAST_WEEK'>('LAST_HOUR');
  
  const { data: health, isLoading: healthLoading } = useSystemHealth();
  const { data: systemDashboard, isLoading: systemLoading } = useSystemDashboard();
  const { data: monitoring, isLoading: monitoringLoading } = useMonitoringDashboard();
  const optimizeMutation = useOptimizeSystem();

  const isLoading = healthLoading || systemLoading || monitoringLoading;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading system status...</Text>
      </View>
    );
  }

  const handleOptimize = () => {
    optimizeMutation.mutate();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🖥️ System Monitoring</Text>

      {/* System Health Overview */}
      {health && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthGrid}>
            <StatusIndicator 
              status={health.performance.status} 
              label="Performance" 
            />
            <StatusIndicator 
              status={health.loadBalancing.status} 
              label="Load Balancing" 
            />
            <StatusIndicator 
              status={health.monitoring.status} 
              label="Monitoring" 
            />
            <StatusIndicator 
              status={health.system.status} 
              label="System" 
            />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Cache Hit Rate</Text>
              <Text style={styles.metricValue}>
                {(health.performance.cacheHitRate * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Healthy Servers</Text>
              <Text style={styles.metricValue}>
                {health.loadBalancing.healthyServers}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Active Alerts</Text>
              <Text style={[styles.metricValue, { color: health.monitoring.activeAlerts > 0 ? '#dc3545' : '#28a745' }]}>
                {health.monitoring.activeAlerts}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Performance Metrics */}
      {monitoring && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>
                {monitoring.systemOverview.totalRecommendations.toLocaleString()}
              </Text>
              <Text style={styles.overviewLabel}>Total Recommendations</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>
                {(monitoring.systemOverview.successRate * 100).toFixed(1)}%
              </Text>
              <Text style={styles.overviewLabel}>Success Rate</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>
                {monitoring.systemOverview.averageResponseTime.toFixed(0)}ms
              </Text>
              <Text style={styles.overviewLabel}>Avg Response Time</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>
                {monitoring.systemOverview.activeUsers.toLocaleString()}
              </Text>
              <Text style={styles.overviewLabel}>Active Users</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>User Engagement</Text>
          <View style={styles.engagementRow}>
            <View style={styles.engagementItem}>
              <Text style={styles.engagementLabel}>Click-through Rate</Text>
              <Text style={styles.engagementValue}>
                {(monitoring.userEngagement.clickThroughRate * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.engagementItem}>
              <Text style={styles.engagementLabel}>Conversion Rate</Text>
              <Text style={styles.engagementValue}>
                {(monitoring.userEngagement.conversionRate * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.engagementItem}>
              <Text style={styles.engagementLabel}>User Satisfaction</Text>
              <Text style={styles.engagementValue}>
                {(monitoring.userEngagement.userSatisfaction * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* System Dashboard */}
      {systemDashboard && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Resources</Text>
          
          <View style={styles.resourceItem}>
            <Text style={styles.resourceLabel}>Cache Hit Rate</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${systemDashboard.performance.cacheHitRate * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.resourceValue}>
              {(systemDashboard.performance.cacheHitRate * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.resourceItem}>
            <Text style={styles.resourceLabel}>Connection Utilization</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${systemDashboard.performance.connectionUtilization * 100}%`,
                    backgroundColor: systemDashboard.performance.connectionUtilization > 0.8 ? '#ffc107' : '#28a745'
                  }
                ]} 
              />
            </View>
            <Text style={styles.resourceValue}>
              {(systemDashboard.performance.connectionUtilization * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.resourceItem}>
            <Text style={styles.resourceLabel}>System Load</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${systemDashboard.performance.systemLoad * 100}%`,
                    backgroundColor: systemDashboard.performance.systemLoad > 0.8 ? '#dc3545' : '#28a745'
                  }
                ]} 
              />
            </View>
            <Text style={styles.resourceValue}>
              {(systemDashboard.performance.systemLoad * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.loadBalancing}>
            <Text style={styles.subsectionTitle}>Load Balancing</Text>
            <Text style={styles.loadBalancingText}>
              Strategy: {systemDashboard.loadBalancing.strategy}
            </Text>
            <Text style={styles.loadBalancingText}>
              Servers: {systemDashboard.loadBalancing.healthyServers}/{systemDashboard.loadBalancing.totalServers} healthy
            </Text>
            <Text style={styles.loadBalancingText}>
              Current Load: {(systemDashboard.loadBalancing.currentLoad * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      )}

      {/* Optimization Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Optimization</Text>
        <TouchableOpacity 
          style={[styles.optimizeButton, optimizeMutation.isPending && styles.optimizeButtonDisabled]}
          onPress={handleOptimize}
          disabled={optimizeMutation.isPending}
        >
          <Text style={styles.optimizeButtonText}>
            {optimizeMutation.isPending ? 'Optimizing...' : '⚡ Run System Optimization'}
          </Text>
        </TouchableOpacity>
        
        {optimizeMutation.isSuccess && (
          <Text style={styles.optimizeSuccess}>
            ✅ System optimization completed successfully
          </Text>
        )}
        
        {optimizeMutation.isError && (
          <Text style={styles.optimizeError}>
            ❌ Optimization failed: {(optimizeMutation.error as any)?.message}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statusIndicator: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  overviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 12,
  },
  engagementItem: {
    flex: 1,
    alignItems: 'center',
  },
  engagementLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  engagementValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resourceItem: {
    marginBottom: 16,
  },
  resourceLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  resourceValue: {
    fontSize: 12,
    color: '#666',
  },
  loadBalancing: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  loadBalancingText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  optimizeButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  optimizeButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  optimizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  optimizeSuccess: {
    fontSize: 14,
    color: '#28a745',
    textAlign: 'center',
  },
  optimizeError: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
  },
});