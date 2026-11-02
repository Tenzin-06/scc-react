import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors, typography } from '../theme';
import PresidentDashboardScreen from '../screens/president/PresidentDashboardScreen';
import ManageClubScreen from '../screens/president/ManageClubScreen';
import ManageMembersScreen from '../screens/president/ManageMembersScreen';
import ManageEventsScreen from '../screens/president/ManageEventsScreen';
import ManageAnnouncementsScreen from '../screens/president/ManageAnnouncementsScreen';

const Stack = createNativeStackNavigator();

const routes = [
  ['PresidentHome', PresidentDashboardScreen, 'President Home'],
  ['ManageMembers', ManageMembersScreen, 'Manage Members'],
  ['ManageEvents', ManageEventsScreen, 'Manage Events'],
  ['ManageAnnouncements', ManageAnnouncementsScreen, 'Manage Announcements'],
  ['ManageClubInfo', ManageClubScreen, 'Manage Club Info'],
];

export default function PresidentNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="PresidentHome"
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: typography.cardTitle,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.surface },
      }}
    >
      {routes.map(([name, component, title]) => (
        <Stack.Screen
          component={component}
          initialParams={{ title }}
          key={name}
          name={name}
          options={{ title }}
        />
      ))}
    </Stack.Navigator>
  );
}
