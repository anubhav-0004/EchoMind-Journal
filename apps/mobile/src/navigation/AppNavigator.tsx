import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, ActivityIndicator } from "react-native";
import { isLoggedIn } from "../lib/storage";
import { colors, fontSize } from "../lib/theme";
import { SplashScreen } from "../components/SplashScreen";

import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { EditorScreen } from "../screens/EditorScreen";
import { EntriesScreen } from "../screens/EntriesScreen";
import { EntryDetailScreen } from "../screens/EntryDetailScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { ReportScreen } from "../screens/ReportScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProfileScreen } from "../screens/ProfileScreen";
import { AdminScreen } from "../screens/AdminScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Write: "✏️",
    Entries: "📅",
    Insights: "📊",
    Chat: "💬",
    Report: "📄",
    Profile: "👤",
  };
  return (
    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || "○"}
    </Text>
  );
}

function EntriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EntriesList" component={EntriesScreen} />
      <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.sageLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          marginTop: -4,
        },
      })}
    >
      <Tab.Screen name="Write" component={EditorScreen} />
      <Tab.Screen name="Entries" component={EntriesStack} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    isLoggedIn().then((result) => {
      setLoggedIn(result);
      setLoading(false);
    });
  }, []);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (loading) return <View style={{ flex: 1, backgroundColor: "#0f1e1a" }} />;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {loggedIn ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Main" component={MainTabs} />
            </>
          )}
          <Stack.Screen name="AdminPanel" component={AdminScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
