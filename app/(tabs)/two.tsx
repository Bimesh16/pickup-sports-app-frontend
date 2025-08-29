import React, { useEffect, useMemo, useState } from 'react';
import { Button, StyleSheet, TextInput, View as RNView, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, View } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimeField from '@/src/components/DateTimeField';
import { useToast } from '@/src/components/ToastProvider';
import { createGame } from '@/src/features/games/api';
import type { CreateGameInput } from '@/src/features/games/types';
import SportSelector from '@/src/features/games/components/SportSelector';
import { parseLocalDateTime, validateCreateGame } from '@/src/utils/gameValidation';
import { useCreateTemplate } from '@/src/stores/createTemplate';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

export default function CreateGameScreen() {
  const qc = useQueryClient();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [sport, setSport] = useState('');
  const [startsAt, setStartsAt] = useState(''); // ISO string or "YYYY-MM-DDTHH:mm" local
  const [maxPlayers, setMaxPlayers] = useState<string>('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<string>('60');
  const { template, setTemplate, remember, setRemember, _rehydrated } = useCreateTemplate();

  useEffect(() => {
    if (_rehydrated && template) {
      setTitle(template.title ?? '');
      setLocation(template.location ?? '');
      setSport(template.sport ?? '');
      setStartsAt(template.startsAt ?? '');
      setMaxPlayers(template.maxPlayers ?? '');
      setDescription(template.description ?? '');
      setDurationMinutes(template.durationMinutes ?? '60');
    }
  }, [_rehydrated]); // only initial prefill

  const { errors, valid, date } = useMemo(
    () => validateCreateGame({ title, startsAt, maxPlayers }),
    [title, startsAt, maxPlayers]
  );

  const canSubmit = valid;

  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (body: CreateGameInput) => createGame(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['games'] });
      toast.success('Game created successfully! 🎉');
      if (remember) {
        setTemplate({ title, sport, location, startsAt, maxPlayers, description, durationMinutes });
      } else {
        setTemplate(null);
      }
      setTitle('');
      setLocation('');
      setSport('');
      setStartsAt('');
      setMaxPlayers('');
      setDescription('');
      setDurationMinutes('60');
    },
    onError: (e: any) => {
      toast.error(e?.message ?? 'Failed to create game');
    },
  });

  const onSubmit = () => {
    const dt = date ?? parseLocalDateTime(startsAt);
    const input: CreateGameInput = {
      title: title.trim(),
      location: location.trim() || undefined,
      sport: sport || undefined,
      startsAt: dt ? dt.toISOString() : startsAt,
      maxPlayers: maxPlayers ? Number(maxPlayers) : undefined,
      description: description.trim() || undefined,
    };
    mutation.mutate(input);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>🎮 Create a Game</Text>
              <Text style={styles.heroSubtitle}>
                Start a new sports game and invite players to join
              </Text>
            </View>
            <Ionicons name="add-circle" size={40} color={Colors.nepal.white} />
          </View>
        </View>

        {/* Error Banner */}
        {!canSubmit && (title.trim().length > 0 || startsAt.trim().length > 0) ? (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={20} color={Colors.error[500]} />
            <Text style={styles.errorText}>
              {errors.title ?? errors.startsAt ?? errors.maxPlayers ?? 'Please fix the highlighted fields'}
            </Text>
          </View>
        ) : null}

        {/* Form Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Basic Information</Text>
          <Text style={styles.sectionSubtitle}>
            Provide the essential details for your game
          </Text>
          
          <RNView style={styles.formRow}>
            <TextInput
              style={[styles.input, errors.title ? styles.inputError : null]}
              placeholder="Game Title"
              value={title}
              onChangeText={setTitle}
            />
          </RNView>

          <RNView style={styles.formRow}>
            <SportSelector
              value={sport}
              onChange={setSport}
            />
          </RNView>

          <RNView style={styles.formRow}>
            <TextInput
              style={styles.input}
              placeholder="Location (optional)"
              value={location}
              onChangeText={setLocation}
            />
          </RNView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Time & Duration</Text>
          <Text style={styles.sectionSubtitle}>
            Set when your game starts and how long it lasts
          </Text>
          
          <RNView style={styles.formRow}>
            <DateTimeField
              value={startsAt}
              onChange={setStartsAt}
              style={[styles.input, errors.startsAt ? styles.inputError : null]}
            />
          </RNView>

          <RNView style={styles.formRow}>
            <TextInput
              style={styles.input}
              placeholder="Duration (minutes)"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              keyboardType="numeric"
            />
          </RNView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Player Settings</Text>
          <Text style={styles.sectionSubtitle}>
            Configure how many players can join
          </Text>
          
          <RNView style={styles.formRow}>
            <TextInput
              style={[styles.input, errors.maxPlayers ? styles.inputError : null]}
              placeholder="Maximum Players"
              value={maxPlayers}
              onChangeText={setMaxPlayers}
              keyboardType="numeric"
            />
          </RNView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Description</Text>
          <Text style={styles.sectionSubtitle}>
            Add any additional details about your game
          </Text>
          
          <RNView style={styles.formRow}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Game description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </RNView>
        </View>

        {/* Template Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Template Settings</Text>
          <Text style={styles.sectionSubtitle}>
            Save this form as a template for future games
          </Text>
          
          <RNView style={styles.templateRow}>
            <Button
              title="Remember as template"
              onPress={() => setRemember(!remember)}
              color={remember ? Colors.nepal.crimson : Colors.text.secondary}
            />
          </RNView>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title={mutation.isPending ? 'Creating Game...' : 'Create Game'}
            onPress={onSubmit}
            disabled={!canSubmit || mutation.isPending}
            style={styles.submitButton}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  content: {
    flex: 1,
  },
  
  heroSection: {
    backgroundColor: Colors.nepal.crimson,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 20,
  },
  
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  heroLeft: {
    flex: 1,
  },
  
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.nepal.white,
    marginBottom: 4,
  },
  
  heroSubtitle: {
    fontSize: 16,
    color: Colors.nepal.white + 'CC',
    fontWeight: '500',
    lineHeight: 22,
  },
  
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error[50],
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error[200],
  },
  
  errorText: {
    color: Colors.error[700],
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  
  formRow: {
    marginBottom: 16,
  },
  
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.background.secondary,
    color: Colors.text.primary,
  },
  
  inputError: {
    borderColor: Colors.error[500],
    backgroundColor: Colors.error[50],
  },
  
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  templateRow: {
    alignItems: 'center',
  },
  
  submitSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  
  submitButton: {
    backgroundColor: Colors.nepal.crimson,
    borderRadius: 8,
    paddingVertical: 16,
  },
  
  bottomSpacing: {
    height: 20,
  },
});
