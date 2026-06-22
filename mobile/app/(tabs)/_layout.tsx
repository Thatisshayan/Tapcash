import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../src/theme";

export default function TabsLayout() {
  const { user, verified, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!verified) {
    return <Redirect href={{ pathname: "/(auth)/verify-email", params: { email: user.email ?? "" } }} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.green,
        tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
        tabBarStyle: {
          backgroundColor: theme.colors.bg,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="earn"
        options={{
          title: "Earn",
          tabBarIcon: ({ color, size }) => <Ionicons name="flash" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cashout"
        options={{
          title: "Cashout",
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size ?? 24} color={color} />,
        }}
      />
    </Tabs>
  );
}
