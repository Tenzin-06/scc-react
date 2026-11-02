import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors, typography } from '../theme';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageAnnouncementsScreen from '../screens/admin/ManageAnnouncementsScreen';
import ManageClubsScreen from '../screens/admin/ManageClubsScreen';
import ManageEventsScreen from '../screens/admin/ManageEventsScreen';
import ManagePresidentsScreen from '../screens/admin/ManagePresidentsScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';

const Stack = createNativeStackNavigator();

const routes = [
  ['AdminDashboard', 'Admin Dashboard', AdminDashboardScreen],
  ['ManageUsers', 'Manage Users', ManageUsersScreen],
  ['ManageClubs', 'Manage Clubs', ManageClubsScreen],
  ['ManageEvents', 'Manage Events', ManageEventsScreen],
  ['ManageAnnouncements', 'Manage Announcements', ManageAnnouncementsScreen],
  ['ManagePresidents', 'Manage Presidents', ManagePresidentsScreen],
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
      {routes.map(([name, title, component]) => (
        <Stack.Screen
          component={component}
          key={name}
          name={name}
          options={{ title }}
        />
      ))}
    </Stack.Navigator>
  );
}
