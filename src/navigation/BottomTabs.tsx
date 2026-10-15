import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  BarChart3,
  CalendarDays,
  Home,
  PlusCircle,
  User,
} from 'lucide-react-native';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CreateScreen } from '../screens/CreateScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DarkTheme } from '../theme/customTheme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: DarkTheme.colors.primary,
        tabBarInactiveTintColor: DarkTheme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: DarkTheme.colors.surface,
          borderTopColor: DarkTheme.colors.outline,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? size + 1 : size;
          switch (route.name) {
            case 'Home':
              return <Home color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
            case 'Create':
              return <PlusCircle color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
            case 'Calendar':
              return <CalendarDays color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
            case 'Insights':
              return <BarChart3 color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
            case 'Profile':
              return <User color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
