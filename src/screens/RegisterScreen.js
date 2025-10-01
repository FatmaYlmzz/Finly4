import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";
import GradientBackground from "../components/GradientBack";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const response = await axios.post("http://10.0.2.2:3000/auth/register", {
        name,
        email,
        phone,
        password,
      });

      if (response.data.message) {
        Alert.alert("Başarılı", "Kayıt işlemi başarılı!");
        navigation.replace("Login");
      }
    } catch (error) {
      console.error(error.response?.data || error);
      const message = error.response?.data?.error || "Kayıt başarısız";
      Alert.alert("Hata", message);
    }
  };

  return (
    <GradientBackground overlay>
      <View style={styles.container}>
        <View style={styles.box}>
          <Text style={styles.title}>Kayıt Ol</Text>

          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            placeholderTextColor="#ddd"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor="#ddd"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefon Numarası"
            placeholderTextColor="#ddd"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#ddd"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Zaten hesabın var mı? Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  box: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 24,
    borderRadius: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 24, textAlign: "center" },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#5B8CFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  link: { fontSize: 14, color: "#fff", textAlign: "center" },
});
