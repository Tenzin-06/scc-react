import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors, typography } from '../theme';
import PlaceholderScreen from './PlaceholderScreen';

const Stack = createNativeStackNavigator();

const routes = [
  ['AdminDashboard', 'Admin Dashboard'],
  ['ManageUsers', 'Manage Users'],
  ['ManageClubs', 'Manage Clubs'],
  ['ManageEvents', 'Manage Events'],
  ['ManageAnnouncements', 'Manage Announcements'],
  ['ManagePresidents', 'Manage Presidents'],
];

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: typography.cardTitle,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.surface },
      }}
    >
      {routes.map(([name, title]) => (
        <Stack.Screen
          component={PlaceholderScreen}
          initialParams={{ title }}
          key={name}
          name={name}
          options={{ title }}
        />
      ))}
    </Stack.Navigator>
  );
}
