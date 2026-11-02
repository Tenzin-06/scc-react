import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppIcon from '../components/AppIcon';
import {
  ClubsScreen,
  EventsScreen,
  HomeScreen,
} from '../screens/student/ProfileScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import { colors, typography } from '../theme';
import PlaceholderScreen from './PlaceholderScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const tabOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.secondaryText,
  tabBarLabelStyle: typography.caption,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    elevation: 0,
    minHeight: 62,
    paddingTop: 4,
  },
};

function StudentTabs() {
  return (
    <Tabs.Navigator initialRouteName="Profile" screenOptions={tabOptions}>
      <Tabs.Screen
        component={HomeScreen}
        name="Home"
        options={{ tabBarIcon: ({ color }) => <AppIcon color={color} name="home" size={21} /> }}
      />
      <Tabs.Screen
        component={ClubsScreen}
        name="Clubs"
        options={{ tabBarIcon: ({ color }) => <AppIcon color={color} name="clubs" size={21} /> }}
      />
      <Tabs.Screen
        component={EventsScreen}
        name="Events"
        options={{ tabBarIcon: ({ color }) => <AppIcon color={color} name="events" size={21} /> }}
      />
      <Tabs.Screen
        component={ProfileScreen}
        name="Profile"
        options={{ tabBarIcon: ({ color }) => <AppIcon color={color} name="profile" size={21} /> }}
      />
    </Tabs.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="StudentTabs"
      screenOptions={{
        headerBackTitle: 'Back',
        headerTintColor: colors.primary,
        headerTitleStyle: typography.cardTitle,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen component={StudentTabs} name="StudentTabs" options={{ headerShown: false }} />
      <Stack.Screen component={PlaceholderScreen} name="ClubDetails" />
      <Stack.Screen component={PlaceholderScreen} name="EventDetails" />
      <Stack.Screen component={PlaceholderScreen} name="MyClubs" />
      <Stack.Screen component={PlaceholderScreen} name="MyEvents" />
      <Stack.Screen component={PlaceholderScreen} name="EditProfile" />
    </Stack.Navigator>
  );
}
