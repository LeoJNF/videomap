import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import NewServiceScreen from '../screens/NewServiceScreen';
import AccountScreen from '../screens/AccountScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import LeadFormScreen from '../screens/LeadFormScreen';
import LeadsManagementScreen from '../screens/LeadsManagementScreen';
import AnalyticsDashboardScreen from '../screens/AnalyticsDashboardScreen';
import PremiumUpgradeScreen from '../screens/PremiumUpgradeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { user } = useAuth();
  const isProvider = user?.role === 'PROVIDER';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Início" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      {/* Só mostra a aba Publicar para videomakers (PROVIDER) */}
      {isProvider && (
        <Tab.Screen 
          name="Publicar" 
          component={NewServiceScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle" size={size} color={color} />
            ),
          }}
        />
      )}
      
      <Tab.Screen 
        name="Conta" 
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Routes() {
  const { signed, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {signed ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Details" component={DetailsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="LeadForm" component={LeadFormScreen} />
            <Stack.Screen name="LeadsManagement" component={LeadsManagementScreen} />
            <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} />
            <Stack.Screen name="PremiumUpgrade" component={PremiumUpgradeScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}