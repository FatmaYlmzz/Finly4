
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useBudgetStore = create((set, get) => ({
  budget: 0,
  spent: 0,
  categoryBudgets: {},
  categorySpent: {},
  
  setBudget: async (amount) => {
    set({ budget: amount });
    await AsyncStorage.setItem('totalBudget', amount.toString());
  },
  
  setCategoryBudget: async (category, amount) => {
    const { categoryBudgets } = get();
    const updated = { ...categoryBudgets, [category]: amount };
    set({ categoryBudgets: updated });
    await AsyncStorage.setItem('categoryBudgets', JSON.stringify(updated));
  },
  
  loadBudget: async () => {
    try {
      const totalBudget = await AsyncStorage.getItem('totalBudget');
      const categoryBudgets = await AsyncStorage.getItem('categoryBudgets');
      
      set({
        budget: totalBudget ? parseFloat(totalBudget) : 0,
        categoryBudgets: categoryBudgets ? JSON.parse(categoryBudgets) : {}
      });
    } catch (error) {
      console.log('❌ Bütçe yükleme hatası:', error);
    }
  },
  
  resetSpent: () => {

    // Gerçek veriler veritabanından gelecek
    set({ spent: 0, categorySpent: {} });
  }
}));


