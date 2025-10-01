import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientBackground from "../components/GradientBack";
import axios from "axios";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      // Backend route: /auth/login
      const response = await axios.post("http://10.0.2.2:3000/auth/login", { email, password });

      if (response.data.token) {
        // Token ve user bilgilerini kaydet
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

        Alert.alert("Başarılı", `Hoş geldin, ${response.data.user.name}!`);
        navigation.replace("MainApp"); // Ana ekrana yönlendir
      }
    } catch (error) {
      console.error(error.response?.data || error);
      Alert.alert(
        "Giriş Başarısız",
        error.response?.data?.error || "Sunucuya bağlanılamıyor."
      );
    }
  };

  return (
    <GradientBackground overlay>
      <View style={styles.container}>
        <View style={styles.box}>
          <Text style={styles.title}>Giriş Yap</Text>

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
            placeholder="Şifre"
            placeholderTextColor="#ddd"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>Hesabın yok mu? Kayıt Ol</Text>
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
    backgroundColor: "#8A5BFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  link: { fontSize: 14, color: "#fff", textAlign: "center" },
});
