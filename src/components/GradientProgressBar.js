// src/components/GradientProgressBar.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientProgressBar({ progress = 0 }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#5B8CFF', '#8A5BFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progress, { width: `${Math.min(progress, 100)}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 20,
    backgroundColor: '#E8EDF5',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 10,
  },
});
// 