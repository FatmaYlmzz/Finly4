import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import API from "../api/api";

const screenHeight = Dimensions.get('window').height;

export default function AddBudgetBottomSheet({ isVisible, onClose, onSave, categories, type = 'expense', initialData }) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState(initialData?.amount != null ? initialData.amount.toString() : '');
  const [currency, setCurrency] = useState(initialData?.currency || '₺');
  const [startDate, setStartDate] = useState(initialData?.date ? new Date(initialData.date) : new Date());
  const [note, setNote] = useState(initialData?.note || '');
  const [isStartPickerVisible, setStartPickerVisibility] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAmount(initialData.amount != null ? initialData.amount.toString() : '');
      setCurrency(initialData.currency || '₺');
      setStartDate(initialData.date ? new Date(initialData.date) : new Date());
      setNote(initialData.note || '');
      setSelectedCategory(initialData.category || categories[0]?.name);
    }
  }, [initialData]);

  const save = async () => {
    if (!title || !amount) return Alert.alert('Hata', 'Başlık ve miktar gerekli');

    const payload = {
      title,
      amount: parseFloat(amount),
      currency,
      date: startDate.toISOString(),
      note,
    };
    if (type === 'expense') payload.category = selectedCategory;

    try {
      const endpoint = type === 'income' ? '/transactions/incomes' : '/transactions/expenses';
      const res = await API.post(endpoint, payload);
      if (res.data.success) {
        onSave({ ...payload, type, category: selectedCategory });
        setTitle('');
        setAmount('');
        setNote('');
        onClose();
      } else {
        Alert.alert('Hata', res.data.error || 'Sunucu hatası');
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert('Hata', 'Server bağlantısı başarısız');
    }
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={{ justifyContent: 'flex-end', margin: 0 }}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{type === 'income' ? 'Add Income' : 'Add Expense'}</Text>

        {type === 'expense' && (
          <>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={{ color: '#000' }}>
                {categories.map(cat => <Picker.Item key={cat.name} label={cat.name} value={cat.name} />)}
              </Picker>
            </View>
          </>
        )}

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter title" />

        <Text style={styles.label}>Amount</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
          />
          <Picker selectedValue={currency} onValueChange={setCurrency} style={{ width: 80, color: '#000' }}>
            <Picker.Item label="₺" value="₺" />
            <Picker.Item label="$" value="$" />
            <Picker.Item label="€" value="€" />
          </Picker>
        </View>

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setStartPickerVisibility(true)}>
          <Text>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isStartPickerVisible}
          mode="date"
          onConfirm={date => { setStartDate(date); setStartPickerVisibility(false); }}
          onCancel={() => setStartPickerVisibility(false)}
        />

        <Text style={styles.label}>Note</Text>
        <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Details" />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#888' }]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#8A5BFF' }]} onPress={save}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { height: screenHeight * 0.75, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  label: { fontWeight: '600', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginTop: 5 },
  dateButton: { backgroundColor: '#eee', padding: 10, borderRadius: 10, marginTop: 5, alignItems: 'center' },
  pickerContainer: { backgroundColor: '#eee', borderRadius: 10, marginTop: 5 },
  button: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
