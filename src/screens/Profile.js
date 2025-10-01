import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import GradientBackground from '../components/GradientBack';
import API from '../api/api';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Profile({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Kullanıcı bilgilerini yükle
  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");
      
      if (!token || !userString) {
        Alert.alert("Hata", "Oturum bulunamadı");
        return;
      }

      const userData = JSON.parse(userString);
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });

    } catch (error) {
      console.log("❌ Kullanıcı verileri yüklenemedi:", error);
      Alert.alert("Hata", "Kullanıcı bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Profile.js içindeki updateProfile fonksiyonunu güncelleyin:

// Profil bilgilerini güncelle
const updateProfile = async () => {
  if (!formData.name.trim()) {
    Alert.alert("Hata", "İsim alanı boş olamaz");
    return;
  }

  if (!formData.email.trim()) {
    Alert.alert("Hata", "E-posta alanı boş olamaz");
    return;
  }

  try {
    setSaving(true);
    const token = await AsyncStorage.getItem("token");
    
    console.log("📤 Profil güncelleme isteği gönderiliyor...");
    
    // ✅ DÜZELTİLDİ: Doğru endpoint
    const response = await API.put('/auth/profile', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Profil güncelleme yanıtı:", response.data);

    if (response.data.success) {
      // Güncellenmiş kullanıcı bilgilerini kaydet
      const updatedUser = { ...user, ...formData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);
      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi");
    } else {
      Alert.alert("Hata", response.data.error || "Profil güncellenemedi");
    }
  } catch (error) {
    console.log(" Profil güncelleme hatası detayları:");
    console.log("   Error:", error.message);
    console.log("   Response:", error.response?.data);
    console.log("  Status:", error.response?.status);
    console.log(" URL:", error.config?.baseURL + error.config?.url);
    
    Alert.alert(
      "Hata", 
      error.response?.data?.error || 
      error.response?.data?.message || 
      "Profil güncellenemedi. Lütfen bağlantınızı kontrol edin."
    );
  } finally {
    setSaving(false);
  }
};

  // Şifre değiştir
 // Profile.js - changePassword fonksiyonunu güncelleyin
const changePassword = async () => {
  if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
    Alert.alert("Hata", "Tüm alanları doldurun");
    return;
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    Alert.alert("Hata", "Yeni şifreler eşleşmiyor");
    return;
  }

  if (passwordData.newPassword.length < 6) {
    Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalı");
    return;
  }

  try {
    setChangingPassword(true);
    const token = await AsyncStorage.getItem("token");
    
    console.log("📤 Şifre değiştirme isteği gönderiliyor...");
    
    const response = await API.put('/auth/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Şifre değiştirme başarılı:", response.data);

    if (response.data.success) {
      Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi");
      setChangePasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      Alert.alert("Hata", response.data.error || "Şifre değiştirilemedi");
    }
  } catch (error) {
    console.log("Şifre değiştirme hatası:");
    console.log("  Error:", error.message);
    console.log("  Response:", error.response?.data);
    console.log("    Status:", error.response?.status);
    
    if (!error.response) {
      Alert.alert("Bağlantı Hatası", "Sunucuya bağlanılamıyor.");
    } else {
      Alert.alert("Hata", error.response?.data?.error || "Şifre değiştirilemedi");
    }
  } finally {
    setChangingPassword(false);
  }
};

  // Çıkış yap
  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['token', 'user']);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.log("❌ Çıkış hatası:", error);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Profil yükleniyor...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Profilim</Text>

        {/* Profil Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={60} color="#6EC3FF" />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Profil Bilgileri */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Kişisel Bilgiler</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(!editing)}
            >
              <MaterialCommunityIcons 
                name={editing ? "close" : "pencil"} 
                size={20} 
                color={editing ? "#EF4444" : "#6EC3FF"} 
              />
              <Text style={[styles.editButtonText, { color: editing ? "#EF4444" : "#6EC3FF" }]}>
                {editing ? "İptal" : "Düzenle"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* İsim */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>İsim Soyisim</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="İsminizi girin"
              />
            ) : (
              <Text style={styles.value}>{user?.name}</Text>
            )}
          </View>

          {/* E-posta */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="E-posta adresinizi girin"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.value}>{user?.email}</Text>
            )}
          </View>

          {/* Telefon */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Telefon numaranızı girin"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{user?.phone || 'Belirtilmemiş'}</Text>
            )}
          </View>

          {/* Kaydet Butonu */}
          {editing && (
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={updateProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Güvenlik */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Güvenlik</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setChangePasswordModal(true)}
          >
            <MaterialCommunityIcons name="lock" size={24} color="#6366F1" />
            <Text style={styles.menuText}>Şifre Değiştir</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Hesap İşlemleri */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hesap İşlemleri</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="bell" size={24} color="#F59E0B" />
            <Text style={styles.menuText}>Bildirimler</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="help-circle" size={24} color="#6B7280" />
            <Text style={styles.menuText}>Yardım & Destek</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
            <Text style={[styles.menuText, { color: '#EF4444' }]}>Çıkış Yap</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Uygulama Bilgisi */}
        <View style={styles.footer}>
          <Text style={styles.version}>v1.0.0</Text>
          <Text style={styles.copyright}>© 2024 Finly App</Text>
        </View>
      </ScrollView>

      {/* Şifre Değiştirme Modal */}
      <Modal
        visible={changePasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChangePasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şifre Değiştir</Text>
              <TouchableOpacity onPress={() => setChangePasswordModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Mevcut Şifre"
              secureTextEntry
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Yeni Şifre"
              secureTextEntry
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Yeni Şifre (Tekrar)"
              secureTextEntry
              value={passwordData.confirmPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
            />

            <TouchableOpacity
              style={[styles.modalButton, changingPassword && styles.modalButtonDisabled]}
              onPress={changePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons name="lock-reset" size={20} color="#fff" />
              )}
              <Text style={styles.modalButtonText}>
                {changingPassword ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingTop: 60,
    paddingHorizontal: 20,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#6EC3FF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  version: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },


   modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 15,
  },
  modalButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});