import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Dashboard from '../screens/Dashboard';
//import Transactions from '../screens/Transactions';
import Budget from '../screens/Budget';
import Reports from '../screens/Reports';
import Profile from '../screens/Profile';
import TransactionStack from './TransactionStack';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#8A5BFF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#F6F8FF',
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            case 'Transactions':
              iconName = 'swap-horizontal';
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            case 'Budget':
              iconName = 'credit-card';
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            case 'Reports':
              iconName = 'activity';
              return <Feather name={iconName} size={size} color={color} />;
            case 'Profile':
              iconName = 'user';
              return <Feather name={iconName} size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Transactions" component={TransactionStack} />
      <Tab.Screen name="Budget" component={Budget} />
      <Tab.Screen name="Reports" component={Reports} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
