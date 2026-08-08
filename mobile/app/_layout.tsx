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
import * as Linking from "expo-linking";
import { getRouteFromUrl } from "../src/lib/deepLinks";

SplashScreen.preventAutoHideAsync();

setupNotificationHandlers();

function NotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      const route = getRouteFromUrl(url);
      if (route) {
        router.push(route as never);
      }
    }).catch(() => {});

    const urlSubscription = Linking.addEventListener("url", ({ url }) => {
      const route = getRouteFromUrl(url);
      if (route) {
        router.push(route as never);
      }
    });

    const routeFromNotification = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as { screen?: string; url?: string };
      return getRouteFromUrl(data?.url) ||
        (data?.screen === "activity" ? "/(tabs)/activity" : data?.screen === "cashout" ? "/(tabs)/cashout" : null);
    };

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      const route = routeFromNotification(lastResponse);
      if (route) {
        router.push(route as never);
      }
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = routeFromNotification(response);
      if (route) {
        router.push(route as never);
      }
    });

    return () => {
      subscription.remove();
      urlSubscription.remove();
    };
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
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0A0A0D" } }} />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#0A0A0D",
    alignItems: "center",
    justifyContent: "center",
  },
  splashText: {
    color: "#D9B678",
    fontSize: 32,
    fontWeight: "900",
  },
});
