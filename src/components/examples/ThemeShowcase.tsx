import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AppLogo } from '@/src/components/branding/AppLogo';
import { Button, PrimaryButton, SecondaryButton, OutlineButton, GradientButton } from '@/src/components/ui/Button';
import { Card, ElevatedCard, OutlinedCard, GradientCard } from '@/src/components/ui/Card';
import { GradientBackground, PrimaryGradient, NepalGradient, HimalayanGradient, EverestGradient } from '@/src/components/ui/GradientBackground';
import { SportIcon, SportBadge } from '@/src/components/icons/SportIcons';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

/**
 * 🎨 Theme Showcase Component
 * Use this to preview all your design system components
 * Perfect for testing and demonstrating your app's visual identity
 */
export function ThemeShowcase() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🇳🇵 PickupSports Design System</Text>
        <Text style={styles.sectionSubtitle}>Beautiful Nepal-inspired design for your sports community</Text>
      </View>

      {/* Logo Variations */}
      <Card style={styles.section}>
        <Text style={styles.cardTitle}>App Logo Variations</Text>
        <View style={styles.logoGrid}>
          <View style={styles.logoItem}>
            <AppLogo size="small" variant="full" />
            <Text style={styles.logoLabel}>Small Full</Text>
          </View>
          <View style={styles.logoItem}>
            <AppLogo size="medium" variant="icon" />
            <Text style={styles.logoLabel}>Medium Icon</Text>
          </View>
          <View style={styles.logoItem}>
            <AppLogo size="large" variant="text" showTagline />
            <Text style={styles.logoLabel}>Large Text</Text>
          </View>
        </View>
      </Card>

      {/* Button Variations */}
      <Card style={styles.section}>
        <Text style={styles.cardTitle}>Button Variations</Text>
        <View style={styles.buttonGrid}>
          <PrimaryButton title="Primary" onPress={() => {}} />
          <SecondaryButton title="Secondary" onPress={() => {}} />
          <OutlineButton title="Outline" onPress={() => {}} />
          <GradientButton title="Gradient" onPress={() => {}} />
          <Button title="Loading" loading onPress={() => {}} />
          <Button title="Disabled" disabled onPress={() => {}} />
        </View>
      </Card>

      {/* Card Variations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Variations</Text>
        <View style={styles.cardGrid}>
          <Card>
            <Text style={styles.cardContent}>Default Card</Text>
          </Card>
          <ElevatedCard>
            <Text style={styles.cardContent}>Elevated Card</Text>
          </ElevatedCard>
          <OutlinedCard>
            <Text style={styles.cardContent}>Outlined Card</Text>
          </OutlinedCard>
          <GradientCard gradient="primary">
            <Text style={[styles.cardContent, { color: Colors.text.inverse }]}>
              Gradient Card
            </Text>
          </GradientCard>
        </View>
      </View>

      {/* Sport Icons */}
      <Card style={styles.section}>
        <Text style={styles.cardTitle}>Sport Icons & Badges</Text>
        <View style={styles.sportGrid}>
          {['basketball', 'soccer', 'tennis', 'volleyball', 'baseball', 'golf'].map((sport) => (
            <View key={sport} style={styles.sportItem}>
              <SportBadge sport={sport} size="large" variant="filled" />
              <Text style={styles.sportLabel}>{sport}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Color Palette */}
      <Card style={styles.section}>
        <Text style={styles.cardTitle}>Color Palette</Text>
        <View style={styles.colorGrid}>
          <View style={styles.colorSection}>
            <Text style={styles.colorSectionTitle}>Primary</Text>
            <View style={styles.colorRow}>
              {[300, 400, 500, 600, 700].map((shade) => (
                <View
                  key={shade}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: Colors.primary[shade as keyof typeof Colors.primary] }
                  ]}
                />
              ))}
            </View>
          </View>
          <View style={styles.colorSection}>
            <Text style={styles.colorSectionTitle}>Secondary</Text>
            <View style={styles.colorRow}>
              {[300, 400, 500, 600, 700].map((shade) => (
                <View
                  key={shade}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: Colors.secondary[shade as keyof typeof Colors.secondary] }
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </Card>

      {/* Nepal-Inspired Gradient Backgrounds */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nepal-Inspired Gradients</Text>
        <View style={styles.gradientGrid}>
          <NepalGradient style={styles.gradientSample}>
            <Text style={styles.gradientText}>Nepal Flag</Text>
          </NepalGradient>
          <HimalayanGradient style={styles.gradientSample}>
            <Text style={styles.gradientText}>Himalayan</Text>
          </HimalayanGradient>
          <EverestGradient style={styles.gradientSample}>
            <Text style={styles.gradientText}>Everest</Text>
          </EverestGradient>
        </View>
      </View>

      {/* Typography */}
      <Card style={styles.section}>
        <Text style={styles.cardTitle}>Typography Scale</Text>
        <Text style={[styles.typographyExample, { fontSize: Theme.typography.fontSize['6xl'] }]}>
          Heading 1
        </Text>
        <Text style={[styles.typographyExample, { fontSize: Theme.typography.fontSize['4xl'] }]}>
          Heading 2
        </Text>
        <Text style={[styles.typographyExample, { fontSize: Theme.typography.fontSize['2xl'] }]}>
          Heading 3
        </Text>
        <Text style={[styles.typographyExample, { fontSize: Theme.typography.fontSize.lg }]}>
          Body Large
        </Text>
        <Text style={[styles.typographyExample, { fontSize: Theme.typography.fontSize.base }]}>
          Body Regular
        </Text>
        <Text style={[styles.typographyExample, { fontSize: Theme.typography.fontSize.sm }]}>
          Body Small
        </Text>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🇳🇵 Your Nepal-inspired app looks amazing!</Text>
        <Text style={styles.footerSubtext}>नमस्ते from your beautiful sports community</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  
  section: {
    margin: Theme.spacing[4],
  },
  
  sectionTitle: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Theme.spacing[2],
  },
  
  sectionSubtitle: {
    fontSize: Theme.typography.fontSize.lg,
    color: Colors.text.secondary,
    marginBottom: Theme.spacing[4],
  },
  
  cardTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Theme.spacing[4],
  },
  
  cardContent: {
    fontSize: Theme.typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'center',
    padding: Theme.spacing[4],
  },
  
  logoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Theme.spacing[4],
  },
  
  logoItem: {
    alignItems: 'center',
    gap: Theme.spacing[2],
  },
  
  logoLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  
  buttonGrid: {
    gap: Theme.spacing[3],
  },
  
  cardGrid: {
    gap: Theme.spacing[4],
  },
  
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: Theme.spacing[4],
  },
  
  sportItem: {
    alignItems: 'center',
    gap: Theme.spacing[2],
  },
  
  sportLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  
  colorGrid: {
    gap: Theme.spacing[4],
  },
  
  colorSection: {
    gap: Theme.spacing[2],
  },
  
  colorSectionTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  
  colorRow: {
    flexDirection: 'row',
    gap: Theme.spacing[2],
  },
  
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.lg,
    flex: 1,
  },
  
  gradientGrid: {
    flexDirection: 'row',
    gap: Theme.spacing[4],
  },
  
  gradientSample: {
    flex: 1,
    height: 80,
    borderRadius: Theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  gradientText: {
    color: Colors.text.inverse,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  
  typographyExample: {
    color: Colors.text.primary,
    marginBottom: Theme.spacing[2],
  },
  
  footer: {
    alignItems: 'center',
    padding: Theme.spacing[8],
  },
  
  footerText: {
    fontSize: Theme.typography.fontSize.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  
  footerSubtext: {
    fontSize: Theme.typography.fontSize.base,
    color: Colors.nepal.blue,
    textAlign: 'center',
    marginTop: Theme.spacing[2],
    fontWeight: Theme.typography.fontWeight.medium,
  },
});
