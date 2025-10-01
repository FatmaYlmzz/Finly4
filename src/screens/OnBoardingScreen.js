import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import GradientBackground from "../components/GradientBack";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Harcamalarını Takip Et",
    description:
      "Gelir ve giderlerini kolayca kaydet, nerelere harcama yaptığını gör.",
  },
  {
    id: "2",
    title: "Bütçeni Yönet",
    description:
      "Kategori bazlı limitler belirle, fazla harcama yapmadan bütçeni kontrol altında tut.",
  },
  {
    id: "3",
    title: "Finansal Geleceğini Planla",
    description:
      "Grafikler ve raporlarla finansal alışkanlıklarını öğren, geleceğini planla.",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <GradientBackground>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
      />

      {/* Nokta göstergeleri */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentIndex === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      {/* Son slaytta butonlar */}
      {currentIndex === slides.length - 1 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#fff" }]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.buttonText, { color: "#5B8CFF" }]}>
              Giriş Yap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#fff" }]}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={[styles.buttonText, { color: "#8A5BFF" }]}>
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  slide: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#f0f0f0",
    textAlign: "center",
    lineHeight: 22,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#fff",
    width: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: { fontWeight: "bold", fontSize: 16 },
});
