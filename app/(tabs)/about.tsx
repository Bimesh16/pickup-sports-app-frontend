import React from 'react';
import { Linking, ScrollView, Text, Pressable, StyleSheet } from 'react-native';

export default function AboutScreen() {
  const openTerms = () => Linking.openURL('https://example.com/terms');
  const openPrivacy = () => Linking.openURL('https://example.com/privacy');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>About</Text>
      <Pressable onPress={openTerms} style={styles.linkContainer}>
        <Text style={styles.link}>Terms of Service</Text>
      </Pressable>
      <Pressable onPress={openPrivacy} style={styles.linkContainer}>
        <Text style={styles.link}>Privacy Policy</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  linkContainer: {
    marginBottom: 8,
  },
  link: {
    color: '#2f95dc',
  },
});
