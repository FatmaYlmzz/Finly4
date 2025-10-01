import { create } from 'zustand';

export const useTransactions = create((set) => ({
  transactions: [],
  addTransaction: (tx) =>
    set((state) => ({
      transactions: [
        ...state.transactions,
        { id: Date.now().toString(), ...tx }
      ],
    })),
}));
