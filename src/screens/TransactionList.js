import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import GradientBackground from "../components/GradientBack";
import CategoryCardTrns from "../components/CategoryCardTrns";
import AddBudgetBottomSheet from "../components/AddBudgetBottomSheet";
import AddIncomeBottomSheet from "../components/AddIncomeBottomSheet";
import API from "../api/api";
import { useNavigation } from "@react-navigation/native";

export default function Transactions() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([
    { key: "Yemek", name: "Yiyecek & İçecek", icon: "food" },
    { key: "Ulaşım", name: "Ulaşım", icon: "car" },
    { key: "Fatura", name: "Fatura", icon: "file-document" },
    { key: "Market", name: "Market", icon: "cart" },
    { key: "Eğlence", name: "Eğlence", icon: "gamepad-variant" },
    { key: "Sağlık", name: "Sağlık", icon: "heart" },
    { key: "Eğitim", name: "Eğitim", icon: "book" },
    { key: "Diğer", name: "Diğer", icon: "dots-horizontal" },
  ]);

  const [transactions, setTransactions] = useState({});
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isIncomeSheetVisible, setIncomeSheetVisible] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions');
      if (res.data.success) {
        const grouped = {};
        res.data.transactions.forEach(tx => {
          const cat = tx.category || "Diğer";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(tx);
        });
        setTransactions(grouped);
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const handleCategoryPress = (catKey, catName) => {
    navigation.navigate("CategoryDetail", {
      categoryKey: catKey,
      categoryName: catName,
    });
  };

  const saveIncome = (income) => {
    const cat = income.category || "Diğer";
    const newIncome = { ...income, id: income.id || Date.now() }; // Geçici id ekledik
    setTransactions(prev => {
      const updated = { ...prev };
      if (!updated[cat]) updated[cat] = [];
      updated[cat].push(newIncome);
      return updated;
    });
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ padding: 30 }}>
        <Text style={styles.header}>Add Budget Category</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => setIncomeSheetVisible(true)}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Add income</Text>
        </TouchableOpacity>

        <View style={{ marginVertical: 20 }}>
          {categories.map(cat => (
            <CategoryCardTrns
              key={cat.key}
              name={cat.name}
              icon={cat.icon}
              count={(transactions[cat.key] || []).length}
              onPress={() => handleCategoryPress(cat.key, cat.name)}
              backgroundColor="#f6eeff"
              iconColor="#4220c9ff"
              textColor="#1F2937"
            />
          ))}
        </View>

        <AddBudgetBottomSheet
          isVisible={isBottomSheetVisible}
          onClose={() => setBottomSheetVisible(false)}
          onSave={fetchTransactions}
          categories={categories}
        />

        <AddIncomeBottomSheet
          isVisible={isIncomeSheetVisible}
          onClose={() => setIncomeSheetVisible(false)}
          onSave={saveIncome}
        />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 15 },
  addButton: { backgroundColor: "#6EC3FF", padding: 12, borderRadius: 12, alignItems: "center" },
});
