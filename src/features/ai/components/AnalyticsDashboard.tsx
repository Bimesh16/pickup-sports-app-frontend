import React from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTrends, useDemandForecast, useGameOptimization } from '../hooks/useAnalytics';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}

function MetricCard({ title, value, subtitle, trend }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <View style={styles.metricRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {trend && <Text style={styles.trendIcon}>{getTrendIcon()}</Text>}
      </View>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );
}

export default function AnalyticsDashboard() {
  const { data: trends, isLoading: trendsLoading } = useTrends();
  const { data: forecast, isLoading: forecastLoading } = useDemandForecast();
  const { data: optimization, isLoading: optimizationLoading } = useGameOptimization();

  const isLoading = trendsLoading || forecastLoading || optimizationLoading;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>📊 Analytics Dashboard</Text>

      {/* Sport Popularity Trends */}
      {trends?.sportPopularity && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏅 Sport Popularity Trends</Text>
          <View style={styles.metricsGrid}>
            {trends.sportPopularity.slice(0, 4).map((sport, index) => (
              <MetricCard
                key={index}
                title={sport.sport}
                value={`${(sport.currentPopularity * 100).toFixed(1)}%`}
                subtitle={`${sport.growthRate > 0 ? '+' : ''}${(sport.growthRate * 100).toFixed(1)}%`}
                trend={sport.trend === 'RISING' ? 'up' : sport.trend === 'FALLING' ? 'down' : 'stable'}
              />
            ))}
          </View>
        </View>
      )}

      {/* Time Slot Popularity */}
      {trends?.timeSlotPopularity && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Peak Time Slots</Text>
          <View style={styles.metricsGrid}>
            {trends.timeSlotPopularity.slice(0, 4).map((slot, index) => (
              <MetricCard
                key={index}
                title={slot.timeSlot}
                value={`${(slot.popularity * 100).toFixed(0)}%`}
                subtitle="Popularity"
              />
            ))}
          </View>
        </View>
      )}

      {/* Venue Utilization */}
      {trends?.venueUtilization && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏟️ Top Venues</Text>
          {trends.venueUtilization.slice(0, 3).map((venue, index) => (
            <View key={index} style={styles.venueItem}>
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue.venueName}</Text>
                <Text style={styles.venueMetric}>
                  {(venue.utilizationRate * 100).toFixed(1)}% utilization
                </Text>
              </View>
              <View style={styles.utilizationBar}>
                <View 
                  style={[
                    styles.utilizationFill, 
                    { width: `${venue.utilizationRate * 100}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Demand Forecast */}
      {forecast?.forecasts && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 Demand Forecast</Text>
          <Text style={styles.forecastAccuracy}>
            Accuracy: {(forecast.accuracy * 100).toFixed(1)}%
          </Text>
          {forecast.forecasts.slice(0, 5).map((prediction, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastDate}>{prediction.date}</Text>
              <Text style={styles.forecastSport}>{prediction.sport}</Text>
              <Text style={styles.forecastDemand}>
                {prediction.predictedDemand} bookings expected
              </Text>
              <Text style={styles.forecastConfidence}>
                {(prediction.confidence * 100).toFixed(0)}% confidence
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Game Optimization */}
      {optimization && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Optimization Score</Text>
          <View style={styles.optimizationHeader}>
            <Text style={styles.optimizationScore}>
              {(optimization.optimizationScore * 100).toFixed(0)}/100
            </Text>
            <Text style={styles.optimizationLabel}>Overall Score</Text>
          </View>
          
          <View style={styles.improvementsContainer}>
            <Text style={styles.improvementsTitle}>Potential Improvements:</Text>
            <View style={styles.improvementItem}>
              <Text style={styles.improvementLabel}>Participation Rate</Text>
              <Text style={styles.improvementValue}>
                +{(optimization.potentialImprovements.participationRate * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.improvementItem}>
              <Text style={styles.improvementLabel}>User Satisfaction</Text>
              <Text style={styles.improvementValue}>
                +{(optimization.potentialImprovements.userSatisfaction * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.improvementItem}>
              <Text style={styles.improvementLabel}>Venue Utilization</Text>
              <Text style={styles.improvementValue}>
                +{(optimization.potentialImprovements.venueUtilization * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      )}
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: '45%',
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  trendIcon: {
    fontSize: 16,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  venueItem: {
    marginBottom: 12,
  },
  venueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  venueName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  venueMetric: {
    fontSize: 12,
    color: '#666',
  },
  utilizationBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  forecastAccuracy: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 12,
  },
  forecastItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  forecastDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  forecastSport: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  forecastDemand: {
    fontSize: 14,
    color: '#495057',
    marginTop: 4,
  },
  forecastConfidence: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 2,
  },
  optimizationHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  optimizationScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#28a745',
  },
  optimizationLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  improvementsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  improvementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  improvementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  improvementLabel: {
    fontSize: 14,
    color: '#495057',
  },
  improvementValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
});