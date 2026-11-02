import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen component={LoginScreen} name="Login" />
          <Stack.Screen component={SignupScreen} name="Signup" />
          <Stack.Screen component={ForgotPasswordScreen} name="ForgotPassword" />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
