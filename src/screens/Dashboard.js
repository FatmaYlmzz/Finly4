import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Alert, ActivityIndicator, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GradientBackground from "../components/GradientBack";
import API from "../api/api"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddIncomeBottomSheet from "../components/AddIncomeBottomSheet";

const screenWidth = Dimensions.get("window").width;


const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function Dashboard() {
  const navigation = useNavigation();
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  
  // Yeni state'ler
  const [quickActions, setQuickActions] = useState([
    { id: 1, title: "Yemek", icon: "food", type: "expense" },
    { id: 2, title: "Ulaşım", icon: "bus", type: "expense" },
    { id: 3, title: "Market", icon: "cart", type: "expense" },
    { id: 4, title: "Maaş", icon: "cash", type: "income" },
  ]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // Tüm işlemler için
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");

      if (!token || !userString) {
        Alert.alert("Oturum Hatası", "Lütfen tekrar giriş yapın.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userString);
      
      const res = await API.get(`/dashboard`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (res.data.success) {
        const totalIncome = res.data.totalIncome || 0;
        const totalExpense = res.data.totalExpense || 0;
        const balance = res.data.balance || 0;
        
        setSummary({
          totalIncome,
          totalExpense,
          balance,
        });
        setIncomes(res.data.incomes || []);
        setExpenses(res.data.expenses || []);
        
        // Tüm işlemleri birleştir
        const allTransactionsData = [
          ...(res.data.incomes || []).map(income => ({ 
            ...income, 
            type: 'income',
            amount: parseFloat(income.amount) || 0,
            description: income.description || 'Gelir',
            category: income.category || 'Gelir',
            date: income.date || new Date().toISOString(),
            title: income.title || income.description || 'Gelir'
          })),
          ...(res.data.expenses || []).map(expense => ({ 
            ...expense, 
            type: 'expense',
            amount: parseFloat(expense.amount) || 0,
            description: expense.description || 'Gider',
            category: expense.category || 'Gider',
            date: expense.date || new Date().toISOString(),
            title: expense.title || expense.description || 'Gider'
          }))
        ];
        
        setAllTransactions(allTransactionsData);
        
        // Son işlemleri sırala
        const sortedTransactions = [...allTransactionsData]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        
        setRecentTransactions(sortedTransactions);
        
        // Gerçek verilere dayalı bütçe uyarılarını kontrol et
        checkBudgetAlerts(totalIncome, totalExpense, balance);
        
      } else {
        Alert.alert("Hata", res.data.error || "Dashboard verileri alınamadı.");
      }
      
      setLoading(false);
    } catch (err) {
      console.log("❌ Dashboard Error:", err.message);
      Alert.alert("Hata", "Dashboard verileri alınamadı.");
      setLoading(false);
    }
  };

  // Veritabanında belirli arama fonksiyonu
  const searchInDatabase = async (query) => {
    try {
      setSearchLoading(true);
      const token = await AsyncStorage.getItem("token");
      
      console.log("🔍 Veritabanında arama yapılıyor:", query);
      
      const res = await API.get('/transactions/search', {
        params: { q: query },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Arama sonuçları:", res.data);

      if (res.data.success) {
        // Arama sonuçlarını formatla
        const formattedTransactions = res.data.transactions.map(transaction => ({
          ...transaction,
          amount: parseFloat(transaction.amount) || 0,
          description: transaction.note || transaction.title || (transaction.type === 'income' ? 'Gelir' : 'Gider'),
          category: transaction.category || 'Diğer',
          date: transaction.date || new Date().toISOString(),
          title: transaction.title || transaction.note || (transaction.type === 'income' ? 'Gelir' : 'Gider')
        }));
        
        setRecentTransactions(formattedTransactions);
      }
      
      setSearchLoading(false);
    } catch (err) {
      console.log("❌ Arama hatası:", err.message);
      console.log("❌ Arama hatası detay:", err.response?.data);
      
      // Fallback: İstemci tarafında arama yap
      console.log("🔄 İstemci tarafında arama yapılıyor...");
      const filtered = allTransactions.filter(transaction => {
        const searchLower = query.toLowerCase();
        return (
          (transaction.title && transaction.title.toLowerCase().includes(searchLower)) ||
          (transaction.category && transaction.category.toLowerCase().includes(searchLower)) ||
          (transaction.note && transaction.note.toLowerCase().includes(searchLower)) ||
          (transaction.date && transaction.date.toLowerCase().includes(searchLower)) ||
          (transaction.amount && transaction.amount.toString().includes(searchLower))
        );
      });
      
      const sortedFiltered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentTransactions(sortedFiltered);
      setSearchLoading(false);
    }
  };

  // Arama fonksiyonu
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // Arama kutusu boşsa son 5 işlemi göster
      const sortedTransactions = [...allTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentTransactions(sortedTransactions);
      return;
    }
  };

  // Debounced arama için useEffect
  useEffect(() => {
    if (debouncedSearchQuery.trim() !== '') {
      searchInDatabase(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  // Gerçek verilere dayalı bütçe uyarılarını kontrol et
  const checkBudgetAlerts = (totalIncome, totalExpense, balance) => {
    const alerts = [];
    
    // 1. Negatif bakiye kontrolü
    if (balance < 0) {
      alerts.push("💰 Bakiye negatif! Harcamalarınızı kontrol edin.");
    }
    
    // 2. Gelirin %80'inden fazla harcama yapılmışsa
    if (totalIncome > 0 && totalExpense > totalIncome * 0.8) {
      const percentage = ((totalExpense / totalIncome) * 100).toFixed(1);
      alerts.push(`📊 Gelirinizin %${percentage}'unu harcadınız!`);
    }
    
    // 3. Gelirden fazla harcama yapılmışsa
    if (totalExpense > totalIncome) {
      alerts.push("⚠️  Harcamalarınız gelirinizi aştı!");
    }
    
    // 4. Düşük bakiye uyarısı (gelirin %10'undan azsa)
    if (totalIncome > 0 && balance < totalIncome * 0.1) {
      alerts.push("🔔 Bakiyeniz düşük! Yeni gelir eklemeyi düşünün.");
    }
    
    setBudgetAlerts(alerts);
  };

  // Hızlı işlem handler'ı
  const handleQuickAction = (action) => {
    if (action.type === 'income') {
      // Gelir ekleme modalını aç
      setShowIncomeModal(true);
    } else {
      // Gider ekleme sayfasına yönlendir
      navigation.navigate("Transactions", { 
        presetCategory: action.title,
        onUpdate: fetchDashboard
      });
    }
  };

  // Güvenli amount formatlama fonksiyonu
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0.00';
    const num = parseFloat(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDashboard();
    });
    
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Dashboard yükleniyor...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>

        {/* Arama Çubuğu */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Kategori, açıklama veya tarih ara..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Arama Sonuç Bilgisi */}
        {searchQuery.length > 0 && (
          <View style={styles.searchInfo}>
            {searchLoading ? (
              <View style={styles.searchLoading}>
                <ActivityIndicator size="small" color="#6EC3FF" />
                <Text style={styles.searchInfoText}>Aranıyor...</Text>
              </View>
            ) : (
              <Text style={styles.searchInfoText}>
                {recentTransactions.length} sonuç bulundu
              </Text>
            )}
          </View>
        )}

        {/* Bütçe Uyarıları - Gerçek verilere dayalı */}
        {budgetAlerts.length > 0 && (
          <View style={styles.alertSection}>
            {budgetAlerts.map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <MaterialCommunityIcons name="alert" size={20} color="#FFA500" />
                <Text style={styles.alertText}>{alert}</Text>
              </View>
            ))}
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Ana Kartlar - Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
            
            {/* Gelir Kartı */}
            <View style={[styles.card, { backgroundColor: "#6EC3FF" }]}>
              <MaterialCommunityIcons name="arrow-up-bold" size={24} color="#fff" />
              <Text style={styles.cardTitle}>Gelir</Text>
              <Text style={styles.cardValue}>₺{formatAmount(summary.totalIncome)}</Text>

              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => navigation.navigate("IncomeDetail", { 
                  onUpdate: fetchDashboard 
                })}
              >
                <Text style={styles.detailText}>Detayları Gör</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowIncomeModal(true)}
              >
                <Text style={styles.addButtonText}>+ Ekle</Text>
              </TouchableOpacity>
            </View>

            {/* Gider Kartı */}
            <View style={[styles.card, { backgroundColor: "#8A5BFF" }]}>
              <MaterialCommunityIcons name="arrow-down-bold" size={24} color="#fff" />
              <Text style={styles.cardTitle}>Gider</Text>
              <Text style={styles.cardValue}>₺{formatAmount(summary.totalExpense)}</Text>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => navigation.navigate("Transactions", { 
                  onUpdate: fetchDashboard 
                })}
              >
                <Text style={styles.detailText}>Detayları Gör</Text>
              </TouchableOpacity>
            </View>

            {/* Kalan Bakiye Kartı */}
            <View style={[styles.card, { 
              backgroundColor: summary.balance >= 0 ? "#5B8CFF" : "#FF5B5B" 
            }]}>
              <MaterialCommunityIcons 
                name={summary.balance >= 0 ? "wallet" : "alert"} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.cardTitle}>Kalan</Text>
              <Text style={styles.cardValue}>₺{formatAmount(summary.balance)}</Text>
            </View>
          </ScrollView>

          {/* Hızlı İşlemler */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.quickActionButton,
                    { backgroundColor: action.type === 'income' ? '#4CAF50' : '#FF6B6B' }
                  ]}
                  onPress={() => handleQuickAction(action)}
                >
                  <MaterialCommunityIcons name={action.icon} size={20} color="#fff" />
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Son İşlemler */}
          <View style={styles.recentTransactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {searchQuery.length > 0 ? 'Arama Sonuçları' : 'Son İşlemler'}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("TransactionHistory")}>
                <Text style={styles.seeAllText}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <MaterialCommunityIcons 
                      name={transaction.type === 'income' ? 'arrow-up-bold' : 'arrow-down-bold'} 
                      size={20} 
                      color={transaction.type === 'income' ? '#4CAF50' : '#FF6B6B'} 
                    />
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description || (transaction.type === 'income' ? 'Gelir' : 'Gider')}
                      </Text>
                      <View style={styles.transactionMeta}>
                        <Text style={styles.transactionCategory}>
                          {transaction.category}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(transaction.date).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? '#4CAF50' : '#FF6B6B' }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}₺{formatAmount(transaction.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noTransactionText}>
                {searchQuery.length > 0 ? 'Arama kriterlerinize uygun işlem bulunamadı.' : 'Henüz işlem bulunmuyor'}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>

      <AddIncomeBottomSheet
        isVisible={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onIncomeAdded={fetchDashboard}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    color: "#fff", 
    marginTop: 10, 
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 15,
    padding: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  searchInfo: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  searchLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInfoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 5,
  },
  alertSection: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,165,0,0.2)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  alertText: {
    color: '#FFA500',
    marginLeft: 8,
    fontSize: 14,
  },
  card: { 
    width: screenWidth * 0.6, 
    borderRadius: 16, 
    padding: 15, 
    marginHorizontal: 10,
  },
  cardTitle: { color: "#fff", fontSize: 14, marginTop: 5 },
  cardValue: { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 5 },
  detailButton: { 
    marginTop: 8, 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    backgroundColor: "#fff", 
    borderRadius: 8, 
    alignSelf: "flex-start" 
  },
  detailText: { color: "#6EC3FF", fontWeight: "bold", fontSize: 12 },
  addButton: { 
    marginTop: 6, 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    backgroundColor: "#fff", 
    borderRadius: 8, 
    alignSelf: "flex-start" 
  },
  addButtonText: { color: "#6EC3FF", fontWeight: "bold", fontSize: 12 },
  quickActionsSection: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quickActionButton: {
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
  },
  recentTransactionsSection: {
    marginTop: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    color: '#6EC3FF',
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionInfo: {
    marginLeft: 10,
    flex: 1,
  },
  transactionDescription: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  transactionCategory: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  transactionDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noTransactionText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
  },
});
