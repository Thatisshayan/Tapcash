import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/auth/AuthContext";
import { setupNotificationHandlers } from "../src/lib/notifications";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { NetworkBanner } from "../src/components/NetworkBanner";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

setupNotificationHandlers();

function NotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { screen?: string };
      if (data?.screen === "activity") {
        router.push("/(tabs)/activity");
      } else if (data?.screen === "cashout") {
        router.push("/(tabs)/cashout");
      }
    });

    return () => subscription.remove();
  }, [router]);

  return null;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashText}>TapCash</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <NetworkBanner />
            <NotificationHandler />
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#040913" } }} />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#040913",
    alignItems: "center",
    justifyContent: "center",
  },
  splashText: {
    color: "#00FF85",
    fontSize: 32,
    fontWeight: "900",
  },
});