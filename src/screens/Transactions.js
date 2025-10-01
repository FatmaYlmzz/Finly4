/*import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import GradientBackground from '../components/GradientBack';
import CategoryCardTrns from '../components/CategoryCardTrns';
import AddBudgetBottomSheet from '../components/AddBudgetBottomSheet';
import TransactionList from './TransactionList';
import { useNavigation } from '@react-navigation/native';
import { useBudgetStore } from '../store/BudgetStore';

export default function Transactions() {
  const navigation = useNavigation();

  const [categories, setCategories] = useState([
    { key: 'Food', name: 'Yiyecek & İçecek', icon: 'food' },
    { key: 'Transport', name: 'Ulaşım', icon: 'car' },
    { key: 'Bill', name: 'Fatura', icon: 'file-document' },
    { key: 'Shopping', name: 'Market', icon: 'cart' },
    { key: 'Entertainment', name: 'Eğlence', icon: 'gamepad-variant' },
    { key: 'Health', name: 'Sağlık', icon: 'heart' },
    { key: 'Education', name: 'Eğitim', icon: 'book' },
    { key: 'Other', name: 'Diğer', icon: 'dots-horizontal' },
  ]);

  const [transactions, setTransactions] = useState({});
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  const { addExpense, removeExpense, updateExpense, loadBudget } = useBudgetStore();

  useEffect(() => {
    loadBudget();
  }, []);

  // Yeni işlem kaydet
  const saveTransaction = (data) => {
    setTransactions((prev) => {
      const cat = data.category;
      const updated = { ...prev };
      if (!updated[cat]) updated[cat] = [];
      updated[cat].push(data);

      addExpense(data.amount, cat);
      return updated;
    });
  };

  // İşlem sil
  const deleteTransaction = (catKey, index) => {
    setTransactions((prev) => {
      const updated = { ...prev };
      const [removed] = updated[catKey].splice(index, 1);

      if (removed) {
        removeExpense(removed.amount, catKey);
      }
      return updated;
    });
  };

  // İşlem güncelle
  const editTransaction = (catKey, index, newData) => {
    setTransactions((prev) => {
      const updated = { ...prev };
      const oldData = updated[catKey][index];

      if (oldData) {
        updated[catKey][index] = newData;
        updateExpense(oldData.amount, newData.amount, catKey);
      }
      return updated;
    });
  };

  const handleCategoryPress = (catKey, catName) => {
    navigation.navigate('CategoryDetail', {
      categoryKey: catKey,
      categoryName: catName,
      transactions: transactions[catKey] || [],
      onDelete: (index) => deleteTransaction(catKey, index),
      onEdit: (index, newData) => editTransaction(catKey, index, newData),
    });
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ padding: 30 }}>
        <Text style={styles.header}>Add Budget Category</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setBottomSheetVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add New Categories</Text>
        </TouchableOpacity>

        <View style={{ marginVertical: 20 }}>
          {categories.map((cat) => (
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

        <TransactionList
          transactions={transactions}
          onDelete={deleteTransaction}
          onEdit={editTransaction}
        />
      </ScrollView>

      <AddBudgetBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onSave={saveTransaction}
        categories={categories}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  addButton: { backgroundColor: '#6EC3FF', padding: 12, borderRadius: 12, alignItems: 'center' },
});*/

// src/screens/Transactions.js
/*import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import GradientBackground from '../components/GradientBack';
import CategoryCardTrns from '../components/CategoryCardTrns';
import AddBudgetBottomSheet from '../components/AddBudgetBottomSheet';
import TransactionList from './TransactionList';
import { useNavigation } from '@react-navigation/native';
import { useBudgetStore } from '../store/BudgetStore';

export default function Transactions() {
  const navigation = useNavigation();
  const { addExpense, loadBudget } = useBudgetStore();

  const [categories, setCategories] = useState([
    { key: 'Yemek', name: 'Yiyecek & İçecek', icon: 'food' },
    { key: 'Ulaşım', name: 'Ulaşım', icon: 'car' },
    { key: 'Fatura', name: 'Fatura', icon: 'file-document' },
    { key: 'Market', name: 'Market', icon: 'cart' },
    { key: 'Eğlence', name: 'Eğlence', icon: 'gamepad-variant' },
    { key: 'Sağlık', name: 'Sağlık', icon: 'heart' },
    { key: 'Eğitim', name: 'Eğitim', icon: 'book' },
    { key: 'Diğer', name: 'Diğer', icon: 'dots-horizontal' },
  ]);

  const [transactions, setTransactions] = useState({});
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  useEffect(() => {
    loadBudget();
  }, []);

  const saveTransaction = (data) => {
    setTransactions(prev => {
      const cat = data.category;
      const updated = { ...prev };
      if (!updated[cat]) updated[cat] = [];
      updated[cat].push(data);

      // BudgetStore'a ekle
      addExpense(data.amount, cat);

      return updated;
    });
  };

  const handleCategoryPress = (catKey, catName) => {
    navigation.navigate('CategoryDetail', {
      categoryKey: catKey,
      categoryName: catName,
      transactions: transactions[catKey] || [],
      onSave: (tx) => saveTransaction(tx)
    });
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ padding: 30 }}>
        <Text style={styles.header}>Add Budget Category</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => setBottomSheetVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add New Categories</Text>
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

        <TransactionList transactions={transactions} />
      </ScrollView>

      <AddBudgetBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onSave={saveTransaction}
        categories={categories}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  addButton: { backgroundColor: '#6EC3FF', padding: 12, borderRadius: 12, alignItems: 'center' },
}); ENNN SONNN*/

/*import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import GradientBackground from '../components/GradientBack';
import CategoryCardTrns from '../components/CategoryCardTrns';
import AddBudgetBottomSheet from '../components/AddBudgetBottomSheet';
import TransactionList from './TransactionList';
import { useNavigation } from '@react-navigation/native';
export default function Transactions() {
      const navigation = useNavigation();
  const [categories, setCategories] = useState([
    { key: 'Food', name: 'Yiyecek & İçecek', icon: 'food' },
    { key: 'Transport', name: 'Ulaşım', icon: 'car' },
    { key: 'Bill', name: 'Fatura', icon: 'file-document' },
    { key: 'Shopping', name: 'Market', icon: 'cart' },
    { key: 'Entertainment', name: 'Eğlence', icon: 'gamepad-variant' },
    { key: 'Health', name: 'Sağlık', icon: 'heart' },
    { key: 'Education', name: 'Eğitim', icon: 'book' },
    { key: 'Other', name: 'Diğer', icon: 'dots-horizontal' },
  ]);

  const [transactions, setTransactions] = useState({});
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  const saveTransaction = (data) => {
    setTransactions(prev => {
      const cat = data.category;
      const updated = { ...prev };
      if (!updated[cat]) updated[cat] = [];
      updated[cat].push(data);
      return updated;
    });
  };
  // Kategoriye tıklayınca CategoryDetail sayfasına yönlendir
  const handleCategoryPress = (catKey, catName) => {
    navigation.navigate('CategoryDetail', {
      categoryKey: catKey,
      categoryName: catName,
      transactions: transactions[catKey] || [],
      onSave: (tx) => {
        setTransactions(prev => {
          const updated = { ...prev };
          if (!updated[catKey]) updated[catKey] = [];
          updated[catKey].push(tx);
          return updated;
        });
      }
    });
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ padding: 30 }}>
        <Text style={styles.header}>Add Budget Category</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setBottomSheetVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add New Categories</Text>
        </TouchableOpacity>

        
        <View style={{ marginVertical: 20 }}>
          {categories.map(cat => (
            <CategoryCardTrns
              key={cat.key}
              name={cat.name}
              icon={cat.icon}
              count={(transactions[cat.key] || []).length}
              onPress={() => handleCategoryPress(cat.key)}
              backgroundColor="#f6eeff"
              iconColor="#4220c9ff"
              textColor="#1F2937"
            />
          ))}
        </View>

        
        <TransactionList transactions={transactions} />
      </ScrollView>

      <AddBudgetBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onSave={saveTransaction}
        categories={categories}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  addButton: { backgroundColor: '#6EC3FF', padding: 12, borderRadius: 12, alignItems: 'center' },
});*/


/*import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import GradientBackground from '../components/GradientBack';
import CategoryCard from '../components/CategoryCardTrns';
import AddBudgetBottomSheet from '../components/AddBudgetBottomSheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TransactionList from './TransactionList';

export default function GelirGider() {
  const [categories, setCategories] = useState([
    { name: 'Food & Drinks', icon: 'food' },
    { name: 'Transport', icon: 'car' },
    
    
  { name: 'bill',  icon: 'file-document' },
  { name: 'shopping', icon: 'cart' },
  { name: 'entertainment',  icon: 'gamepad-variant' },
  { name: 'health',  icon: 'heart' },
  { name: 'education',  icon: 'book' },
  { name: 'other',  icon: 'dots-horizontal' },

  ]);

  const [transactions, setTransactions] = useState({});
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  const saveTransaction = (data) => {
    setTransactions(prev => {
      const cat = data.category;
      const updated = { ...prev };
      if (!updated[cat]) updated[cat] = [];
      updated[cat].push(data);
      return updated;
    });
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ padding: 30 }}>
        <Text style={styles.header}>Add Budget Category</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setBottomSheetVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add New Categories</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 20}}>
          {categories.map(cat => (
            <CategoryCard key={cat.name} icon={cat.icon} name={cat.name} onPress={() => console.log(transactions[cat.name] || [])} />
          ))}
        </ScrollView>
          <TransactionList transactions={transactions} />
      </ScrollView>

      <AddBudgetBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onSave={saveTransaction}
        categories={categories}
      />
    </GradientBackground>
    
  );
}

const styles = StyleSheet.create({
  header: { color: '#fff', fontSize: 25, fontWeight: 'bold', marginBottom: 10 },
  addButton: { backgroundColor: '#6EC3FF', padding: 12, borderRadius: 12, alignItems: 'center' },
});*/


/*import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import GradientBackground from '../components/GradientBack';
import CategoryCardTrns from '../components/CategoryCardTrns';
import AddBudgetBottomSheet from '../components/AddBudgetBottomSheet';
import TransactionList from './TransactionList';
import { useNavigation } from '@react-navigation/native';
import { useBudgetStore } from '../store/BudgetStore';

export default function Transactions() {
  const navigation = useNavigation();
  const { addExpense, loadBudget, removeExpense } = useBudgetStore();

  const [categories, setCategories] = useState([
    { key: 'Yemek', name: 'Yiyecek & İçecek', icon: 'food' },
    { key: 'Ulaşım', name: 'Ulaşım', icon: 'car' },
    { key: 'Fatura', name: 'Fatura', icon: 'file-document' },
    { key: 'Market', name: 'Market', icon: 'cart' },
    { key: 'Eğlence', name: 'Eğlence', icon: 'gamepad-variant' },
    { key: 'Sağlık', name: 'Sağlık', icon: 'heart' },
    { key: 'Eğitim', name: 'Eğitim', icon: 'book' },
    { key: 'Diğer', name: 'Diğer', icon: 'dots-horizontal' },
  ]);

  const [transactions, setTransactions] = useState({});
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  useEffect(() => {
    loadBudget();
  }, []);

  const saveTransaction = (data) => {
    setTransactions(prev => {
      const cat = data.category;
      const updated = { ...prev };
      if (!updated[cat]) updated[cat] = [];
      updated[cat].push(data);

      addExpense(data.amount, cat);
      return updated;
    });
  };

  const deleteTransaction = (catKey, index) => {
    setTransactions(prev => {
      const updated = { ...prev };
      if (!updated[catKey]) return prev;

      const [removed] = updated[catKey].splice(index, 1);
      removeExpense(removed.amount, catKey);
      return updated;
    });
  };

  const handleCategoryPress = (catKey, catName) => {
    navigation.navigate('CategoryDetail', {
      categoryKey: catKey,
      categoryName: catName,
      transactions: transactions[catKey] || [],
      onSave: (tx) => saveTransaction(tx)
    });
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ padding: 30 }}>
        <Text style={styles.header}>Add Budget Category</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => setBottomSheetVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add New Categories</Text>
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

        <TransactionList 
          transactions={transactions} 
          onDelete={deleteTransaction} 
        />
      </ScrollView>

      <AddBudgetBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onSave={saveTransaction}
        categories={categories}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  addButton: { backgroundColor: '#6EC3FF', padding: 12, borderRadius: 12, alignItems: 'center' },
});*/
/*import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import GradientBackground from '../components/GradientBack';
import CategoryCardTrns from '../components/CategoryCardTrns';
import AddBudgetBottomSheet from '../components/AddBudgetBottomSheet';
import TransactionList from './TransactionList';
import { useNavigation } from '@react-navigation/native';
import { useBudgetStore } from '../store/BudgetStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Transactions() {
  const navigation = useNavigation();
  const { addExpense, loadBudget } = useBudgetStore();

  const [categories, setCategories] = useState([
    { key: 'Yemek', name: 'Yiyecek & İçecek', icon: 'food' },
    { key: 'Ulaşım', name: 'Ulaşım', icon: 'car' },
    { key: 'Fatura', name: 'Fatura', icon: 'file-document' },
    { key: 'Market', name: 'Market', icon: 'cart' },
    { key: 'Eğlence', name: 'Eğlence', icon: 'gamepad-variant' },
    { key: 'Sağlık', name: 'Sağlık', icon: 'heart' },
    { key: 'Eğitim', name: 'Eğitim', icon: 'book' },
    { key: 'Diğer', name: 'Diğer', icon: 'dots-horizontal' },
  ]);

  const [transactions, setTransactions] = useState({});
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  useEffect(() => {
    loadBudget();
  }, []);

  const saveTransaction = (data, isUpdate = false) => {
    setTransactions(prev => {
      const cat = data.category;
      const updated = { ...prev };
      if (!updated[cat]) updated[cat] = [];
      if (isUpdate) {
        // 🔑 Güncelleme: aynı ID veya benzersiz alanla eşleşeni değiştir
        updated[cat] = updated[cat].map(tx =>
          tx.date === data.date && tx.title === data.title ? data : tx
        );
      } else {
        // Yeni ekleme
        updated[cat].push(data);
        addExpense(data.amount, cat); // sadece yeni ekleme olduğunda budget güncelle
      }
      return updated;
    });
  };

  const deleteTransaction = async (tx) => {
    const cat = tx.category;
    setTransactions(prev => {
      const updated = { ...prev };
      if (updated[cat]) {
        updated[cat] = updated[cat].filter(t => t !== tx);
      }
      return updated;
    });

    // BudgetStore’dan düş
    const store = useBudgetStore.getState();
    useBudgetStore.setState({
      spent: store.spent - parseFloat(tx.amount),
      categorySpent: {
        ...store.categorySpent,
        [cat]: (store.categorySpent[cat] || 0) - parseFloat(tx.amount),
      },
    });

    await AsyncStorage.setItem('spent', ((store.spent - parseFloat(tx.amount)) || 0).toString());
    await AsyncStorage.setItem(
      `categorySpent_${cat}`,
      ((store.categorySpent[cat] || 0) - parseFloat(tx.amount)).toString()
    );
  };

  const handleCategoryPress = (catKey, catName) => {
    navigation.navigate('CategoryDetail', {
      categoryKey: catKey,
      categoryName: catName,
      transactions: transactions[catKey] || [],
      onSave: saveTransaction,
      onDelete: deleteTransaction,
    });
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ padding: 30 }}>
        <Text style={styles.header}>Add Budget Category</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => setBottomSheetVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add income </Text>
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

        <TransactionList transactions={transactions} />
      </ScrollView>

      <AddBudgetBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onSave={saveTransaction}
        categories={categories}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  addButton: { backgroundColor: '#6EC3FF', padding: 12, borderRadius: 12, alignItems: 'center' },
}); en sonnnnnn*/
/*import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import GradientBackground from '../components/GradientBack';
import CategoryCardTrns from '../components/CategoryCardTrns';
import TransactionList from './TransactionList';
import { useNavigation } from '@react-navigation/native';
import { useBudgetStore } from '../store/BudgetStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddIncomeBottomSheet from '../components/AddIncomeBottomSheet'; // Yeni eklendi
import AddBudgetBottomSheet from '../components/AddBudgetBottomSheet';

export default function Transactions() {
  const navigation = useNavigation();
  const { addExpense, loadBudget } = useBudgetStore();

  const [categories, setCategories] = useState([
    { key: 'Yemek', name: 'Yiyecek & İçecek', icon: 'food' },
    { key: 'Ulaşım', name: 'Ulaşım', icon: 'car' },
    { key: 'Fatura', name: 'Fatura', icon: 'file-document' },
    { key: 'Market', name: 'Market', icon: 'cart' },
    { key: 'Eğlence', name: 'Eğlence', icon: 'gamepad-variant' },
    { key: 'Sağlık', name: 'Sağlık', icon: 'heart' },
    { key: 'Eğitim', name: 'Eğitim', icon: 'book' },
    { key: 'Diğer', name: 'Diğer', icon: 'dots-horizontal' },
  ]);

  const [transactions, setTransactions] = useState({});
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [incomes, setIncomes] = useState([]); // Income listesi
  const [isIncomeSheetVisible, setIncomeSheetVisible] = useState(false);

  useEffect(() => {
    loadBudget();
  }, []);

  // Transaction kaydetme
  const saveTransaction = (data, isUpdate = false) => {
    setTransactions(prev => {
      const cat = data.category;
      const updated = { ...prev };
      if (!updated[cat]) updated[cat] = [];
      if (isUpdate) {
        updated[cat] = updated[cat].map(tx =>
          tx.date === data.date && tx.title === data.title ? data : tx
        );
      } else {
        updated[cat].push(data);
        addExpense(data.amount, cat);
      }
      return updated;
    });
  };

  // Transaction silme
  const deleteTransaction = async (tx) => {
    const cat = tx.category;
    setTransactions(prev => {
      const updated = { ...prev };
      if (updated[cat]) {
        updated[cat] = updated[cat].filter(t => t !== tx);
      }
      return updated;
    });

    const store = useBudgetStore.getState();
    useBudgetStore.setState({
      spent: store.spent - parseFloat(tx.amount),
      categorySpent: {
        ...store.categorySpent,
        [cat]: (store.categorySpent[cat] || 0) - parseFloat(tx.amount),
      },
    });

    await AsyncStorage.setItem('spent', ((store.spent - parseFloat(tx.amount)) || 0).toString());
    await AsyncStorage.setItem(
      `categorySpent_${cat}`,
      ((store.categorySpent[cat] || 0) - parseFloat(tx.amount)).toString()
    );
  };

  // Kategoriye basınca detay sayfasına git
  const handleCategoryPress = (catKey, catName) => {
    navigation.navigate('CategoryDetail', {
      categoryKey: catKey,
      categoryName: catName,
      transactions: transactions[catKey] || [],
      onSave: saveTransaction,
      onDelete: deleteTransaction,
    });
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ padding: 30 }}>
        <Text style={styles.header}>Add Budget Category</Text>

        {/* Income ekleme butonu /}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIncomeSheetVisible(true)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add income</Text>
        </TouchableOpacity>

        {/* Kategoriler /}
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

        {/* Transaction listesi /}
        <TransactionList transactions={transactions} />
      </ScrollView>

      {/* Transaction bottom sheet /}
      <AddBudgetBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onSave={saveTransaction}
        categories={categories}
      />

      {/* Income bottom sheet /}
      <AddIncomeBottomSheet
        isVisible={isIncomeSheetVisible}
        onClose={() => setIncomeSheetVisible(false)}
        onSave={(income) => {
          setIncomes(prev => [...prev, income]);
          setIncomeSheetVisible(false);
        }}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  addButton: { backgroundColor: '#6EC3FF', padding: 12, borderRadius: 12, alignItems: 'center' },
});en son 1 çalışıyor ancak backendsiz*/
/*import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import GradientBackground from "../components/GradientBack";
import CategoryCardTrns from "../components/CategoryCardTrns";
import TransactionList from "./TransactionList";
import { useNavigation } from "@react-navigation/native";
import { useBudgetStore } from "../store/BudgetStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddIncomeBottomSheet from "../components/AddIncomeBottomSheet"; 
import AddBudgetBottomSheet from "../components/AddBudgetBottomSheet";
import API from "../api/api";

export default function Transactions() {
  const navigation = useNavigation();
  const { addExpense, loadBudget } = useBudgetStore();
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
    loadBudget();
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const user = JSON.parse(await AsyncStorage.getItem("user"));
      const token = await AsyncStorage.getItem("token");
      if (!user || !token) return;

      const res = await API.get(`/transactions/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const grouped = {};
      res.data.forEach(tx => {
        const cat = tx.category || "Diğer";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(tx);
      });
      setTransactions(grouped);
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  const saveIncome = income => {
    const cat = income.category || "Diğer";
    setTransactions(prev => {
      const updated = { ...prev };
      if (!updated[cat]) updated[cat] = [];
      updated[cat].push(income);
      return updated;
    });
  };

  const handleCategoryPress = (catKey, catName) => {
    navigation.navigate("CategoryDetail", {
      categoryKey: catKey,
      categoryName: catName,
      transactions: transactions[catKey] || [],
    });
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ padding: 30 }}>
        <Text style={styles.header}>Add Budget Category</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIncomeSheetVisible(true)}
        >
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

        <TransactionList transactions={transactions} />
      </ScrollView>

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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 15 },
  addButton: { backgroundColor: "#6EC3FF", padding: 12, borderRadius: 12, alignItems: "center" },
}); enn son 2backend çalışıyor ancak front sorunlu*/
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import GradientBackground from "../components/GradientBack";
import CategoryCardTrns from "../components/CategoryCardTrns";
import AddBudgetBottomSheet from "../components/AddBudgetBottomSheet";
import AddIncomeBottomSheet from "../components/AddIncomeBottomSheet";
import API from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    setTransactions(prev => {
      const updated = { ...prev };
      if (!updated[cat]) updated[cat] = [];
      updated[cat].push(income);
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
