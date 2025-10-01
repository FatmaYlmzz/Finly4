/*import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}*/

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AppNavigator from "./src/navigation/AppNavigator"; 
import OnboardingScreen from "./src/screens/OnBoardingScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import IncomeDetail from "./src/screens/IncomeDetail"; // Gelir detay ekranı
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* İlk açılış ekranı */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        {/* Giriş ve kayıt ekranları */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        {/* Tab navigasyon (Dashboard, Transactions...) */}
        <Stack.Screen name="MainApp" component={AppNavigator} />
      
        <Stack.Screen name="IncomeDetail" component={IncomeDetail} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
