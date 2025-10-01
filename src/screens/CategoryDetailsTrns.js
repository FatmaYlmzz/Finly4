import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  LayoutAnimation, 
  UIManager, 
  Platform, 
  Alert,
  ActivityIndicator
} from 'react-native';
import AddBudgetBottomSheet from '../components/AddBudgetBottomSheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBack';
import API from '../api/api';
import AsyncStorage from "@react-native-async-storage/async-storage";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CategoryDetail({ route, navigation }) {
  const { categoryKey, categoryName, onUpdate } = route.params;

  const [txList, setTxList] = useState([]);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");
      
      if (!token || !userString) {
        Alert.alert("Hata", "Oturum bulunamadı.");
        return;
      }

      const user = JSON.parse(userString);
      const userId = user.id;

      const res = await API.get('/transactions', { 
        params: { category: categoryName },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("📥 Category Detail API Response:", res.data);

      if (res.data.success) {
        setTxList(res.data.transactions || []);
      } else {
        Alert.alert("Hata", "İşlem verileri alınamadı.");
      }
    } catch (err) {
      console.log("❌ Category Detail Error:", err.response?.data || err);
      Alert.alert("Hata", "İşlem verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (tx) => {
    setTxList(prev => [...prev, tx]);
    if (onUpdate) onUpdate();
    setBottomSheetVisible(false);
  };

  const handleDelete = async (id) => {
    // Hemen kapat butonunu devre dışı bırak
    setDeletingId(id);
    
    Alert.alert(
      'İşlemi Sil',
      'Bu işlemi silmek istediğinizden emin misiniz?',
      [
        { 
          text: 'İptal', 
          style: 'cancel',
          onPress: () => setDeletingId(null)
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log("🗑️ Silme işlemi başlatılıyor:", id);
              
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Hata", "Oturum bulunamadı.");
                setDeletingId(null);
                return;
              }

              const res = await API.delete(`/transactions/${id}`, {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              console.log("✅ Silme yanıtı:", res.data);

              if (res.data.success) {
                // Listeden kaldır
                setTxList(prev => prev.filter(tx => tx.id !== id));
                
                // Parent component'i güncelle
                if (onUpdate) onUpdate();
                
                // Expanded index'i sıfırla
                setExpandedIndex(null);
                
                Alert.alert("Başarılı", "İşlem başarıyla silindi.");
              } else {
                Alert.alert('Hata', res.data.error || 'İşlem silinemedi');
              }
            } catch (err) {
              console.log("❌ Silme hatası detayları:");
              console.log("   - Error:", err);
              console.log("   - Response:", err.response?.data);
              console.log("   - Status:", err.response?.status);
              
              let errorMessage = "İşlem silinemedi";
              
              if (err.response?.status === 404) {
                errorMessage = "İşlem bulunamadı";
              } else if (err.response?.status === 401) {
                errorMessage = "Yetkiniz yok";
              } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
              } else if (err.message) {
                errorMessage = err.message;
              }
              
              Alert.alert('Hata', errorMessage);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleTxPress = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const colors = ['#D6F0FF', '#E6F7FF', '#F0F9FF', '#EBF5FF', '#E3F2FD', '#E1F5FE'];

  const renderTransactionItem = ({ item, index }) => {
    const bgColor = colors[index % colors.length];
    const isExpanded = expandedIndex === index;
    const isDeleting = deletingId === item.id;

    return (
      <View style={[styles.txItem, { backgroundColor: bgColor }]}>
        <TouchableOpacity onPress={() => handleTxPress(index)} disabled={isDeleting}>
          <View style={styles.txRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.txTitle}>{item.title}</Text>
              <Text style={styles.txAmount}>
                {item.amount} {item.currency || '₺'}
              </Text>
              <Text style={styles.txDate}>
                {new Date(item.date).toLocaleDateString('tr-TR')}
              </Text>
              
              {isExpanded && (
                <View style={[styles.noteBox, { backgroundColor: bgColor }]}>
                  <Text style={styles.noteLabel}>Not:</Text>
                  <Text style={styles.noteText}>
                    {item.note || 'Not eklenmemiş'}
                  </Text>
                </View>
              )}
            </View>
            
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={28}
              color="#2E86AB"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[
                styles.deleteButton, 
                isDeleting && styles.disabledButton
              ]} 
              onPress={() => !isDeleting && handleDelete(item.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons name="delete" size={18} color="#fff" />
              )}
              <Text style={[styles.actionText, { color: '#fff' }]}>
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>İşlemler yükleniyor...</Text>
        </View>
      </GradientBackground>
    );
  }

  const totalAmount = txList.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <Text style={styles.subTitle}>
            {txList.length} işlem • Toplam: {totalAmount.toFixed(2)} ₺
          </Text>
        </View>

        {/* İstatistik Kartı */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#2E86AB" />
            <Text style={styles.statNumber}>{txList.length}</Text>
            <Text style={styles.statLabel}>Toplam İşlem</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="currency-usd" size={24} color="#2E86AB" />
            <Text style={styles.statNumber}>{totalAmount.toFixed(2)} ₺</Text>
            <Text style={styles.statLabel}>Toplam Tutar</Text>
          </View>
        </View>

        {/* İşlem Ekle Butonu */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setBottomSheetVisible(true)}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>İşlem Ekle</Text>
        </TouchableOpacity>

        {/* İşlem Listesi */}
        {txList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="receipt" size={64} color="#6c757d" />
            <Text style={styles.emptyText}>Henüz işlem bulunmuyor</Text>
            <Text style={styles.emptySubText}>
              Bu kategoriye işlem ekleyerek başlayın
            </Text>
          </View>
        ) : (
          <FlatList
            data={txList}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderTransactionItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Yenile Butonu */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchTransactions}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.refreshText}>Yenile</Text>
        </TouchableOpacity>

        <AddBudgetBottomSheet
          isVisible={isBottomSheetVisible}
          onClose={() => setBottomSheetVisible(false)}
          onSave={handleSave}
          categories={[{ key: categoryKey, name: categoryName }]}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
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
    marginBottom: 20,
    alignItems: 'center'
  },
  headerTitle: { 
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "bold",
    marginBottom: 5
  },
  subTitle: { 
    color: "#fff", 
    fontSize: 14, 
    opacity: 0.8,
    textAlign: 'center'
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statSeparator: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  addButton: { 
    flexDirection: 'row', 
    backgroundColor: '#5B8CFF', 
    padding: 12, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20 
  },
  addButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  listContent: { 
    paddingBottom: 20 
  },
  txItem: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 4 
  },
  txAmount: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#EF4444', 
    marginBottom: 2 
  },
  txDate: { 
    fontSize: 14, 
    color: '#6B7280' 
  },
  noteBox: { 
    marginTop: 10, 
    padding: 12, 
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2E86AB',
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E86AB',
    marginBottom: 4,
  },
  noteText: { 
    color: '#374151', 
    fontSize: 15,
    lineHeight: 20,
  },
  actionRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 12,
    gap: 10,
  },
  deleteButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EF4444', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 12 
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  actionText: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginLeft: 6 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    marginTop: 8,
    textAlign: "center",
  },
  refreshButton: {
    flexDirection: "row",
    backgroundColor: "#6EC3FF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  refreshText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

