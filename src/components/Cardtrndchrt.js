import React from "react";
import { View, StyleSheet } from "react-native";

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardContent({ children, style }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 12,
  },
  content: {
    marginTop: 8,
  },
});

