
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import GradientProgressBar from '../components/GradientProgressBar';
import { useBudgetStore } from '../store/BudgetStore';
import GradientBackground from '../components/GradientBack';
import API from '../api/api';
import AsyncStorage from "@react-native-async-storage/async-storage";

const categories = [
  { key: 'Yiyecek & İçecek', name: 'Yiyecek & İçecek', icon: 'food' },
  { key: 'Ulaşım', name: 'Ulaşım', icon: 'car' },
  { key: 'Fatura', name: 'Fatura', icon: 'file-document' },
  { key: 'Market', name: 'Market', icon: 'cart' },
  { key: 'Eğlence', name: 'Eğlence', icon: 'gamepad-variant' },
  { key: 'Sağlık', name: 'Sağlık', icon: 'heart' },
  { key: 'Eğitim', name: 'Eğitim', icon: 'book' },
  { key: 'Diğer', name: 'Diğer', icon: 'dots-horizontal' },
];

export default function Budget() {
  const {
    budget,
    setBudget,
    loadBudget,
    categoryBudgets,
    setCategoryBudget,
  } = useBudgetStore();

  const [input, setInput] = useState('');
  const [tempValues, setTempValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [realSpent, setRealSpent] = useState(0);
  const [categoryRealSpent, setCategoryRealSpent] = useState({});

  // Veritabanından gerçek harcama verilerini çek
  const fetchRealSpentData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");
      
      if (!token || !userString) {
        console.log("❌ Oturum bulunamadı");
        return;
      }

      const user = JSON.parse(userString);

      // Tüm transaction'ları çek
      const expensesRes = await API.get('/transactions?type=expense', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (expensesRes.data.success) {
        const expenses = expensesRes.data.transactions || [];

        // Toplam harcama
        const totalSpent = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        setRealSpent(totalSpent);

        // Kategori bazlı harcamalar
        const categorySpending = {};
        expenses.forEach(expense => {
          const category = expense.category || 'Diğer';
          const amount = parseFloat(expense.amount || 0);
          
          if (!categorySpending[category]) {
            categorySpending[category] = 0;
          }
          categorySpending[category] += amount;
        });
        
        setCategoryRealSpent(categorySpending);
      }
    } catch (err) {
      console.log("❌ Harcama verileri alınamadı:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudget();
    fetchRealSpentData();
  }, [loadBudget, fetchRealSpentData]);

  const progress = budget > 0 ? Math.min((realSpent / budget) * 100, 100) : 0;

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Bütçe verileri yükleniyor...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Toplam Bütçe - SABIT (ScrollView dışında) */}
        <View style={styles.fixedSection}>
          <Text style={styles.header}>Bütçe Yönetimi</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Toplam Bütçe</Text>
            <TextInput
              style={styles.input}
              placeholder="Toplam bütçe limiti girin"
              keyboardType="numeric"
              value={input}
              onChangeText={setInput}
              onBlur={() => {
                const val = parseFloat(input);
                if (!isNaN(val) && val > 0) {
                  setBudget(val);
                  setInput('');
                  Alert.alert('Başarılı', `Toplam bütçe limiti ${val}₺ olarak ayarlandı.`);
                } else if (input !== '') {
                  Alert.alert('Hata', 'Geçerli bir sayı girin.');
                }
              }}
            />
            
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetText}>
                📊 Gerçek Harcama: <Text style={styles.amount}>{realSpent.toFixed(2)}₺</Text>
              </Text>
              <Text style={styles.budgetText}>
                🎯 Bütçe Limit: <Text style={styles.amount}>{budget}₺</Text>
              </Text>
              <Text style={styles.budgetText}>
                📈 Kalan: <Text style={[
                  styles.amount, 
                  { color: (budget - realSpent) >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {(budget - realSpent).toFixed(2)}₺
                </Text>
              </Text>
            </View>

            <GradientProgressBar 
              progress={progress}
              color={progress >= 100 ? '#EF4444' : progress >= 90 ? '#F59E0B' : '#10B981'}
            />
            
            <Text style={[
              styles.progressText,
              { color: progress >= 100 ? '#EF4444' : progress >= 90 ? '#F59E0B' : '#10B981' }
            ]}>
              %{progress.toFixed(1)}
              {progress >= 100 && ' 🚨 TOPLAM LIMIT AŞILDI'}
              {progress >= 90 && progress < 100 && ' ⚠️ TOPLAM LIMITE YAKLAŞTI'}
            </Text>

            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchRealSpentData}
            >
              <Text style={styles.refreshButtonText}>🔄 Verileri Yenile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Kategori Bazlı Bütçe - HAREKETLI (ScrollView içinde) */}
        <ScrollView 
          style={styles.scrollSection}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kategori Bazlı Bütçe</Text>
            <Text style={styles.sectionSubtitle}>
              Her kategori için limit belirleyin
            </Text>
            
            {categories.map((category) => {
              const catKey = category.key;
              const catName = category.name;
              const catLimit = categoryBudgets[catKey] || 0;
              const catSpent = categoryRealSpent[catKey] || 0;
              const catProgress = catLimit > 0 ? Math.min((catSpent / catLimit) * 100, 100) : 0;

              return (
                <View key={catKey} style={styles.categoryRow}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryText}>{catName}</Text>
                    <Text style={styles.categorySpentBadge}>
                      {catSpent.toFixed(2)}₺
                    </Text>
                  </View>
                  
                  <TextInput
                    style={styles.categoryInput}
                    placeholder={`${catName} limiti girin`}
                    keyboardType="numeric"
                    value={tempValues[catKey] ?? (categoryBudgets[catKey] ? categoryBudgets[catKey].toString() : '')}
                    onChangeText={(val) => setTempValues((prev) => ({ ...prev, [catKey]: val }))}
                    onBlur={() => {
                      const num = parseFloat(tempValues[catKey]);
                      if (!isNaN(num) && num >= 0) {
                        setCategoryBudget(catKey, num);
                        setTempValues(prev => {
                          const newValues = { ...prev };
                          delete newValues[catKey];
                          return newValues;
                        });
                      }
                    }}
                  />
                  
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categorySpent}>
                      📊 Toplam Harcama: <Text style={styles.amount}>{catSpent.toFixed(2)}₺</Text>
                    </Text>
                    {catLimit > 0 && (
                      <Text style={styles.categoryLimit}>
                        🎯 Limit: <Text style={styles.amount}>{catLimit}₺</Text>
                      </Text>
                    )}
                  </View>
                  
                  {catLimit > 0 ? (
                    <>
                      <GradientProgressBar 
                        progress={catProgress}
                        color={catProgress >= 100 ? '#EF4444' : catProgress >= 90 ? '#F59E0B' : '#10B981'}
                      />
                      <Text style={[
                        styles.progressText,
                        { color: catProgress >= 100 ? '#EF4444' : catProgress >= 90 ? '#F59E0B' : '#10B981' }
                      ]}>
                        %{catProgress.toFixed(1)}
                        {catProgress >= 100 && ' 🚨 LIMIT AŞILDI'}
                        {catProgress >= 90 && catProgress < 100 && ' ⚠️ YAKLAŞTI'}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.noLimitText}>
                      {catSpent > 0 ? '⚠️ Limit belirlenmemiş' : 'ℹ️ Henüz harcama yok'}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 30
  },
  fixedSection: {
    padding: 20,
    paddingBottom: 0,
  },
  scrollSection: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
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
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  budgetInfo: {
    marginBottom: 15,
  },
  budgetText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  amount: {
    fontWeight: 'bold',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#6EC3FF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryRow: { 
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#fff', 
  },
  categorySpentBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
    fontSize: 14,
  },
  categoryInfo: {
    marginBottom: 8,
  },
  categorySpent: { 
    color: '#fff', 
    fontSize: 14,
    marginBottom: 4,
  },
  categoryLimit: {
    color: '#fff',
    fontSize: 14,
  },
  noLimitText: {
    color: '#F59E0B',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
