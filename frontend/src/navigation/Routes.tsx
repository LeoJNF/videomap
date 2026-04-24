import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import DetailsScreen from '../screens/DetailsScreen';
import NewServiceScreen from '../screens/NewServiceScreen';
import AccountScreen from '../screens/AccountScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import LeadFormScreen from '../screens/LeadFormScreen';
import LeadsManagementScreen from '../screens/LeadsManagementScreen';
import AnalyticsDashboardScreen from '../screens/AnalyticsDashboardScreen';
import PremiumUpgradeScreen from '../screens/PremiumUpgradeScreen';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors } from '../theme/tokens';
import { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accentStrong,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accentStrong,
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.accentStrong,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 2,
        },
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, size }) => {
          const iconByRoute: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Discover: 'compass-outline',
            Favorites: 'heart-outline',
            Studio: 'sparkles-outline',
          };

          return <Ionicons name={iconByRoute[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Discover"
        component={HomeScreen}
        options={{ title: 'Descobrir' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favoritos' }}
      />
      <Tab.Screen
        name="Studio"
        component={AccountScreen}
        options={{ title: 'Studio' }}
      />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <Text style={styles.loadingBrand}>VIDEOMAP</Text>
      <Text style={styles.loadingTitle}>Montando a experiencia do catalogo</Text>
      <Text style={styles.loadingText}>
        Carregando portfolios, favoritos e a area profissional do videomaker.
      </Text>
    </View>
  );
}

export default function Routes() {
  const { loading } = useMarketplace();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen
          name="LeadForm"
          component={LeadFormScreen}
          options={{
            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Group
          screenOptions={{
            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
            animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Group>
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="NewService" component={NewServiceScreen} />
        <Stack.Screen name="LeadsManagement" component={LeadsManagementScreen} />
        <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} />
        <Stack.Screen name="PremiumUpgrade" component={PremiumUpgradeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 74,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: 'rgba(9, 10, 13, 0.98)',
    borderTopWidth: 0,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 14,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.background,
  },
  loadingBrand: {
    color: colors.accentStrong,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
  loadingTitle: {
    marginTop: 18,
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
});
