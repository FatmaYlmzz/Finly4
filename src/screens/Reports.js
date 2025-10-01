import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import GradientBackground from '../components/GradientBack';
import DonutChart from '../components/DonutChart';
import TrendChart from '../components/TrendChart';
import API from '../api/api';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [donutData, setDonutData] = useState([]);
  const [trendDataList, setTrendDataList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");
      
      if (!token || !userString) return;

      const user = JSON.parse(userString);

      const expensesRes = await API.get('/transactions?type=expense', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (expensesRes.data.success) {
        const expenses = expensesRes.data.transactions || [];
        
        // Donut chart verilerini hazırla
        const categoryTotals = {};
        expenses.forEach(expense => {
          const category = expense.category || 'Diğer';
          const amount = parseFloat(expense.amount || 0);
          
          if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
          }
          categoryTotals[category] += amount;
        });

        const formattedDonutData = Object.keys(categoryTotals).map((category, index) => {
          const colors = ['#6366F1', '#60A5FA', '#8B5CF6', '#A78BFA', '#F59E0B', '#EF4444', '#10B981', '#EC4899'];
          return {
            name: category,
            population: categoryTotals[category],
            color: colors[index % colors.length]
          };
        });

        setDonutData(formattedDonutData);

        // Trend chart verilerini hazırla - DÜZELTİLDİ
        const trendData = generateTrendData(expenses);
        setTrendDataList(trendData);
      }
    } catch (err) {
      console.log("❌ Rapor verileri alınamadı:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ DÜZELTİLDİ: Trend veri hesaplaması
  const generateTrendData = (expenses) => {
    const now = new Date();
    
    // ✅ Haftalık veri - Pazartesiden Pazar'a
    const weeklyData = [];
    const weeklyLabels = [];
    
    // Pazartesi'den başla (0: Pazar, 1: Pazartesi)
    const currentDay = now.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    
     for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysFromMonday - (6 - i));
      const dateStr = date.toLocaleDateString('tr-TR', { weekday: 'short' });
      
      const dayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      });
      
      const dayTotal = dayExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      weeklyData.push(dayTotal);
      weeklyLabels.push(dateStr);
    }

     // ✅ Aylık veri - H1, H2, H3, H4 şeklinde kısalt
    const monthlyData = [];
    const monthlyLabels = [];
    
    const currentDate = new Date(now);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Ayın ilk günü
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(firstDayOfMonth);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // Hafta sonu ayın son gününü geçerse, ayın son gününe ayarla
      if (weekEnd.getMonth() !== currentMonth) {
        weekEnd.setDate(new Date(currentYear, currentMonth + 1, 0).getDate());
      }
      
      const weekExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= weekStart && expenseDate <= weekEnd;
      });
      
      const weekTotal = weekExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      monthlyData.push(weekTotal);
      monthlyLabels.push(`H${week + 1}`); // H1, H2, H3, H4
    }

       // ✅ Yıllık veri - Tüm aylar
    const yearlyData = [];
    const yearlyLabels = [];
    
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    
    for (let month = 0; month < 12; month++) {
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month && 
               expenseDate.getFullYear() === currentYear;
      });
      
      const monthTotal = monthExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      yearlyData.push(monthTotal);
      yearlyLabels.push(monthNames[month]);
    }


    return [
      {
        id: 'weekly',
        title: 'Haftalık Harcama',
        labels: weeklyLabels,
        datasets: [{ data: weeklyData }],
      },
      {
        id: 'monthly',
        title: 'Aylık Harcama',
        labels: monthlyLabels,
        datasets: [{ data: monthlyData }],
      },
      {
        id: 'yearly',
        title: 'Yıllık Harcama',
        labels: yearlyLabels,
        datasets: [{ data: yearlyData }],
      },
    ];
  };

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Raporlar yükleniyor...</Text>
        </View>
      </GradientBackground>
    );
  }

  const totalSpent = donutData.reduce((sum, item) => sum + item.population, 0);

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Finansal Raporlar</Text>

        {/* İstatistik Kartları */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {totalSpent.toFixed(2)}₺
            </Text>
            <Text style={styles.statLabel}>Toplam Harcama</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {donutData.length}
            </Text>
            <Text style={styles.statLabel}>Kategori</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {donutData.length > 0 ? Math.max(...donutData.map(item => item.population)).toFixed(2) : 0}₺
            </Text>
            <Text style={styles.statLabel}>En Yüksek</Text>
          </View>
        </View>

        {/* Donut Chart - Kategori Dağılımı */}
        <View style={styles.card}>
          {donutData.length > 0 ? (
            <DonutChart data={donutData} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Henüz harcama verisi yok</Text>
              <Text style={styles.emptyStateSubText}>Harcama yaptıkça grafikler burada görünecek</Text>
            </View>
          )}
        </View>

        {/* Trend Chart - Zaman İçinde Harcamalar */}
        <View style={styles.card}>
          <View style={styles.periodContainer}>
            <Text style={styles.trendTitle}>Zaman İçinde Harcamalar</Text>
            <View style={styles.periodSelector}>
              <TouchableOpacity 
                style={[
                  styles.periodButton,
                  selectedPeriod === 'weekly' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('weekly')}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'weekly' && styles.periodButtonTextActive
                ]}>
                  Haftalık
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.periodButton,
                  selectedPeriod === 'monthly' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('monthly')}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'monthly' && styles.periodButtonTextActive
                ]}>
                  Aylık
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.periodButton,
                  selectedPeriod === 'yearly' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('yearly')}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'yearly' && styles.periodButtonTextActive
                ]}>
                  Yıllık
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {trendDataList.length > 0 ? (
            <View style={styles.trendChartContainer}>
              <TrendChart 
                data={trendDataList.find(item => item.id === selectedPeriod)} 
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Trend verisi yok</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchReportData}
        >
          <Text style={styles.refreshButtonText}>🔄 Verileri Yenile</Text>
        </TouchableOpacity>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#fff',
    textAlign: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  periodContainer: {
    marginBottom: 20,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  periodButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  trendChartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#6EC3FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});