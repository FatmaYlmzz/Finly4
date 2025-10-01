import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

export default function DonutChart({ data }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Henüz harcama verisi yok</Text>
        </View>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.population, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kategori Dağılımı</Text>

      <View style={styles.chartContainer}>
        <PieChart
          data={data.map((d, index) => ({
            value: d.population,
            color: d.color,
            text: '', // Yüzde değerlerini kaldırdık
            focused: selectedIndex === index,
          }))}
          radius={100}
          innerRadius={60}
          showText={false} // Yüzde yazılarını kapattık
          focusOnPress
          onPress={(_, index) => setSelectedIndex(index)}
          isAnimated
          donut
        />
        
        {/* Ortadaki toplam bilgisi */}
        <View style={styles.centerInfo}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.totalAmount}>{total.toFixed(2)}₺</Text>
        </View>
      </View>

      {/* Seçili kategori bilgisi */}
      {selectedIndex !== null && (
        <View style={styles.selectedInfo}>
          <View style={[styles.colorIndicator, { backgroundColor: data[selectedIndex].color }]} />
          <View style={styles.selectedDetails}>
            <Text style={styles.selectedName}>{data[selectedIndex].name}</Text>
            <Text style={styles.selectedAmount}>{data[selectedIndex].population.toFixed(2)}₺</Text>
            <Text style={styles.selectedPercentage}>
              ({(data[selectedIndex].population / total * 100).toFixed(1)}%)
            </Text>
          </View>
        </View>
      )}

      {/* Kategori Listesi */}
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.legendPercentage}>
                {(item.population / total * 100).toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.legendAmount}>
              {item.population.toFixed(2)}₺
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1F2937', 
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  centerInfo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedDetails: {
    flex: 1,
  },
  selectedName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1F2937',
    marginBottom: 2,
  },
  selectedAmount: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#6366F1',
    marginBottom: 2,
  },
  selectedPercentage: {
    fontSize: 14,
    color: '#6B7280',
  },
  legendContainer: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  legendPercentage: {
    fontSize: 12,
    color: '#6B7280',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyState: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  },
});