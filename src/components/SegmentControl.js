import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function SegmentControl({ options, selected, onSelect }) {
  return (
    <View style={styles.container}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.segment, selected === opt && styles.selectedSegment]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.text, selected === opt && styles.selectedText]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 12, marginVertical: 10 },
  segment: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 12 },
  selectedSegment: { backgroundColor: '#4220c9ff' },
  text: { color: '#446189ff', fontWeight: '600' },
  selectedText: { color: '#fff' },
});


