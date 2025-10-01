import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform 
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GradientBackground from "../components/GradientBack";
import API from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function IncomeDetail({ route, navigation }) {
  const { onUpdate } = route.params || {};
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
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

      const res = await API.get(`/transactions?type=income`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📥 Income Detail API Response:", res.data);

      if (res.data.success) {
        setIncomes(res.data.transactions || []);
      } else {
        Alert.alert("Hata", "Gelir verileri alınamadı.");
      }
    } catch (err) {
      console.log("❌ Income Detail Error:", err.response?.data || err);
      Alert.alert("Hata", "Gelir verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (incomeId) => {
    Alert.alert(
      "Geliri Sil",
      "Bu gelir kaydını silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await API.delete(`/transactions/${incomeId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (res.data.success) {
                Alert.alert("Başarılı", "Gelir silindi.");
                fetchIncomes();
                if (onUpdate) onUpdate();
              }
            } catch (err) {
              console.log("❌ Delete error:", err.response?.data || err);
              Alert.alert("Hata", "Gelir silinemedi.");
            }
          },
        },
      ]
    );
  };

  const handleIncomePress = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const colors = ['#D6F0FF', '#E6F7FF', '#F0F9FF', '#EBF5FF', '#E3F2FD', '#E1F5FE'];

  const renderIncomeItem = ({ item, index }) => {
    const bgColor = colors[index % colors.length];
    const isExpanded = expandedIndex === index;

    return (
      <View style={[styles.incomeItem, { backgroundColor: bgColor }]}>
        <TouchableOpacity onPress={() => handleIncomePress(index)}>
          <View style={styles.incomeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.incomeTitle}>{item.title}</Text>
              <Text style={styles.incomeAmount}>₺{parseFloat(item.amount).toFixed(2)}</Text>
              <Text style={styles.incomeDate}>
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
              style={styles.deleteButton} 
              onPress={() => handleDelete(item.id)}
            >
              <MaterialCommunityIcons name="delete" size={18} color="#fff" />
              <Text style={[styles.actionText, { color: '#fff' }]}>Sil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {/* Düzenleme fonksiyonu ekleyebilirsiniz */}}
            >
              <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
              <Text style={[styles.actionText, { color: '#fff' }]}>Düzenle</Text>
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
          <Text style={styles.loadingText}>Gelirler yükleniyor...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gelir Detayları</Text>
          <Text style={styles.subTitle}>
            Toplam {incomes.length} gelir kaydı
          </Text>
        </View>

        {/* İstatistik Kartları */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#D6F0FF' }]}>
            <MaterialCommunityIcons name="cash" size={24} color="#2E86AB" />
            <Text style={styles.statNumber}>{incomes.length}</Text>
            <Text style={styles.statLabel}>Toplam Gelir</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#E6F7FF' }]}>
            <MaterialCommunityIcons name="calendar" size={24} color="#2E86AB" />
            <Text style={styles.statNumber}>
              ₺{incomes.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Toplam Tutar</Text>
          </View>
        </View>

        {/* Gelir Listesi */}
        {incomes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cash-remove" size={64} color="#6c757d" />
            <Text style={styles.emptyText}>Henüz gelir kaydı bulunmuyor</Text>
            <Text style={styles.emptySubText}>
              Dashboard'dan gelir ekleyerek başlayın
            </Text>
          </View>
        ) : (
          <FlatList
            data={incomes}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={renderIncomeItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Yenile Butonu */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchIncomes}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.refreshText}>Yenile</Text>
        </TouchableOpacity>
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
    opacity: 0.8 
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  listContent: { 
    paddingBottom: 20 
  },
  incomeItem: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomeTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 4 
  },
  incomeAmount: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#10B981', 
    marginBottom: 2 
  },
  incomeDate: { 
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
  editButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#3B82F6', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 12 
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
