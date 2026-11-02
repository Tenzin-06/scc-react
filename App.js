import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppIcon from './src/components/AppIcon';
import { useAuth, AuthProvider } from './src/contexts/AuthContext';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import {
  ClubsScreen,
  EventsScreen,
  HomeScreen,
} from './src/screens/student/ProfileScreen';
import ProfileScreen from './src/screens/student/ProfileScreen';
import { colors, spacing, typography } from './src/theme';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color="#0B3B78" size="large" />
    </View>
  );
}

const tabs = [
  { key: 'Home', label: 'Home', icon: 'home', component: HomeScreen },
  { key: 'Clubs', label: 'Clubs', icon: 'clubs', component: ClubsScreen },
  { key: 'Events', label: 'Events', icon: 'events', component: EventsScreen },
  { key: 'Profile', label: 'Profile', icon: 'profile', component: ProfileScreen },
];

function SignedInScreen() {
  const [activeTab, setActiveTab] = useState('Profile');
  const activeTabConfig = tabs.find((tab) => tab.key === activeTab);
  const ActiveScreen = activeTabConfig.component;

  return (
    <View style={styles.appContainer}>
      <ActiveScreen />
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={styles.tab}
            >
              <AppIcon
                color={isActive ? colors.primary : colors.secondaryText}
                name={tab.icon}
                size={21}
              />
              <Text style={[styles.tabLabel, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function AppNavigation() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <SignedInScreen />;
  }

  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen component={LoginScreen} name="Login" />
      <Stack.Screen component={SignupScreen} name="Signup" />
      <Stack.Screen component={ForgotPasswordScreen} name="ForgotPassword" />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigation />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    backgroundColor: colors.background,
    flex: 1,
  },
  tabBar: {
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 62,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tabIcon: {
    color: colors.secondaryText,
    fontSize: 21,
    height: 25,
  },
  tabLabel: {
    color: colors.secondaryText,
    ...typography.caption,
  },
  activeTabText: {
    color: colors.primary,
  },
});
