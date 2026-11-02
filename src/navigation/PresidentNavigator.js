import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors, typography } from '../theme';
import PlaceholderScreen from './PlaceholderScreen';

const Stack = createNativeStackNavigator();

const routes = [
  ['PresidentHome', 'President Home'],
  ['ManageMembers', 'Manage Members'],
  ['ManageEvents', 'Manage Events'],
  ['ManageAnnouncements', 'Manage Announcements'],
  ['ManageClubInfo', 'Manage Club Info'],
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
