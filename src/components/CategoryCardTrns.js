import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme/colors';

export default function CategoryCardTrns({
  name,
  icon,
  count = 0,
  onPress,
  backgroundColor = COLORS.light.surface,
  iconColor = COLORS.light.primary,
  textColor = COLORS.light.textPrimary,
}) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Icon name={icon} size={28} color={iconColor} />
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: textColor }]}>{name}</Text>
          <Text style={styles.count}>{count} işlem</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={28} color={textColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  count: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

