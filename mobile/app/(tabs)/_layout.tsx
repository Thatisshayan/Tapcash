import { Redirect, Tabs } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { useAuth } from "../../src/auth/AuthContext";

function TabMark({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.mark, { borderColor: color }]}>
      <Text style={[styles.markText, { color }]}>{label}</Text>
    </View>
  );
}

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
        tabBarActiveTintColor: "#00e6c3",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#07111d",
          borderTopColor: "rgba(255,255,255,0.08)",
          height: 64,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabMark label="H" color={color} />,
        }}
      />
      <Tabs.Screen
        name="earn"
        options={{
          title: "Earn",
          tabBarIcon: ({ color }) => <TabMark label="E" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cashout"
        options={{
          title: "Cashout",
          tabBarIcon: ({ color }) => <TabMark label="C" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) => <TabMark label="A" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <TabMark label="M" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  markText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
