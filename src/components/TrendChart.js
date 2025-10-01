
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;

export default function TrendChart({ data }) {
  if (!data || !data.datasets || data.datasets[0].data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Bu periyotta veri yok</Text>
        </View>
      </View>
    );
  }

  const chartData = data.datasets[0].data.map((value, index) => ({
    value,
    label: data.labels[index],
  }));

  // Grafik ayarları
  const chartWidth = screenWidth - 80;
  const dataPoints = chartData.length;
  
  // Aylık veride daha fazla spacing, haftalıkta daha az
  const baseSpacing = data.id === 'monthly' ? 60 : 40;
  const spacing = Math.min(Math.max(baseSpacing, 30), 80);

  // Y ekseni için uygun aralık
  const maxValue = Math.max(...data.datasets[0].data);
  const minValue = Math.min(...data.datasets[0].data);
  let yAxisMax = maxValue * 1.15;
  
  if (maxValue === minValue && maxValue === 0) {
    yAxisMax = 100;
  } else if (maxValue === minValue) {
    yAxisMax = maxValue * 1.5;
  }

  return (
    <View style={styles.chartWrapper}>
      <LineChart 
        areaChart
        data={chartData}
        height={220}
        width={chartWidth}
        initialSpacing={20}
        spacing={spacing}
        curved={true}
        
        // X ekseni ayarları
        hideRules={true}
        xAxisColor="lightgray"
        xAxisThickness={0.5}
        xAxisLabelTextStyle={[
          styles.xAxisLabel,
          data.id === 'monthly' && styles.monthlyXAxisLabel // Aylık için daha küçük font
        ]}
        xAxisLabelsHeight={30}
        xAxisLabelTexts={data.labels}
        
        // Y ekseni ayarları
        yAxisColor="lightgray"
        yAxisThickness={0.5}
        yAxisTextStyle={styles.yAxisLabel}
        yAxisTextNumberOfLines={1}
        noOfSections={4}
        maxValue={yAxisMax}
        minValue={0}
        
        // Grafik çizgisi
        thickness={3}
        color="#6366F1"
        
        // Alan dolgusu
        startFillColor="#6366F1"
        endFillColor="#ffffff"
        startOpacity={0.4}
        endOpacity={0.05}
        
        // Animasyon
        isAnimated={true}
        animateOnDataChange={true}
        animationDuration={1200}
        
        // Noktalar
        showDataPoints={true}
        dataPointsColor="#6366F1"
        dataPointsRadius={4}
        dataPointsShape="circle"
        
        // Eksen etiketleri
        showVerticalLines={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  container: { 
    alignItems: 'center',
    width: '100%',
  },
  emptyState: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
  xAxisLabel: {
    color: '#374151',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    width: 35,
  },
  monthlyXAxisLabel: {
    fontSize: 10, // Aylık için daha küçük font
    width: 30,
  },
  yAxisLabel: {
    color: '#6B7280',
    fontSize: 9,
    textAlign: 'right',
    width: 35,
    marginRight: 2,
  },
});
