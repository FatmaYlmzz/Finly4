import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TransactionItem({ transaction }) {
  return (
    <View style={styles.item}>
      <MaterialCommunityIcons name={transaction.icon || 'cash'} size={24} color="#5B8CFF" />
      <View style={styles.textContainer}>
        <Text style={styles.category}>{transaction.category}</Text>
        <Text style={styles.note}>{transaction.title}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, transaction.type === 'expense' ? styles.expense : styles.income]}>
          {transaction.currency}{transaction.amount}
        </Text>
        <Text style={styles.date}>{new Date(transaction.date).toLocaleDateString('tr-TR')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop:50,
    backgroundColor: '#4220c9ff',
    borderRadius:12,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: { flex: 1, marginLeft: 10 },
  category: { fontWeight: 'bold', color: '#cddef6ff' },
  note: { color: '#86a2dbff', fontSize: 12 },
  amountContainer: { alignItems: 'flex-end' },
  amount: { fontWeight: 'bold' },
  income: { color: '#c7d6f8ff' },
  expense: { color: '#FF5B5B' },
  date: { color: '#86a2dbff', fontSize: 12 },
});
