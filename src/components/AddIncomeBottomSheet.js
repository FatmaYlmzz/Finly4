import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native";
import Modal from "react-native-modal";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import API from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

const AddIncomeBottomSheet = ({ isVisible, onClose, onIncomeAdded }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("₺");
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleConfirmDate = (selectedDate) => {
    setDate(selectedDate);
    setDatePickerVisibility(false);
  };

  const handleAddIncome = async () => {
    if (!title || !amount) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");  
      if (!token) {
        Alert.alert("Hata", "Oturum bulunamadı!");
        return;
      }

      const response = await API.post(
        "/transactions/incomes",
        {
          title,
          amount,
          currency,
          date,
          note,
        },
        {
          headers: { Authorization: `Bearer ${token}` }, 
        }
      );

      console.log("📌 API Response:", response.data); // burayı ekle

  if (response.data?.success) {
    Alert.alert("Başarılı", "Gelir eklendi!");
    if (typeof onIncomeAdded === "function") onIncomeAdded();
    onClose();
  } else {
    Alert.alert("Hata", response.data?.error || "Beklenmeyen yanıt formatı");
  }
} catch (err) {
  console.error("❌ API Hatası:", err.response?.data || err.message);
  Alert.alert("Hata", "Sunucuya bağlanırken bir hata oluştu.");
}
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Gelir Ekle</Text>
        <TextInput
          style={styles.input}
          placeholder="Başlık"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Tutar"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Picker
          selectedValue={currency}
          onValueChange={(itemValue) => setCurrency(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="₺ (TL)" value="₺" />
          <Picker.Item label="$ (USD)" value="$" />
          <Picker.Item label="€ (EUR)" value="€" />
        </Picker>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setDatePickerVisibility(true)}
        >
          <Text>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Not"
          value={note}
          onChangeText={setNote}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handleAddIncome}>
          <Text style={styles.buttonText}>Ekle</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AddIncomeBottomSheet;
