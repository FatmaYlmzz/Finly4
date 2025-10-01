import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Transactions from '../screens/Transactions';
import CategoryDetail from '../screens/CategoryDetailsTrns';
//import GradientBackground from '../components/GradientBack';
const Stack = createNativeStackNavigator();

export default function TransactionsStack() {
  return (
    
   
   
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransactionsMain" component={Transactions} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetail} />
    </Stack.Navigator>
     
  );
}

