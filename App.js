import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth, AuthProvider } from './src/contexts/AuthContext';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color="#0B3B78" size="large" />
    </View>
  );
}

function SignedInScreen() {
  const { logout, user } = useAuth();

  return (
    <View style={styles.signedInContainer}>
      <Text style={styles.signedInTitle}>You are signed in</Text>
      <Text style={styles.signedInText}>{user?.email}</Text>
      <Pressable onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
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
  signedInContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  signedInTitle: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '700',
  },
  signedInText: {
    color: '#666666',
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#0B3B78',
    borderRadius: 10,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
