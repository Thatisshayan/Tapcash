import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { auth } from "./firebase";
import * as SecureStore from "expo-secure-store";

export async function registerPushToken(): Promise<void> {
  if (!Device.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) return;

  await fetch("https://tapcash.online/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`,
    },
    body: JSON.stringify({ subscription: { endpoint: token, keys: { p256dh: "", auth: "" } } }),
  }).catch(() => {});

  await SecureStore.setItemAsync("push_token", token);
}

export function setupNotificationHandlers(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  Notifications.addNotificationReceivedListener((notification) => {
    console.log("Notification received:", notification.request.content.data);
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("Notification tapped:", response.notification.request.content.data);
  });
}