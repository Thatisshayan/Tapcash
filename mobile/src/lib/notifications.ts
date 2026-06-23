import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { auth } from "./firebase";
import { apiFetch } from "./api";

export async function registerPushToken(): Promise<void> {
  if (!Device.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) return;

  await apiFetch("/api/user/push-token", {
    method: "POST",
    body: JSON.stringify({ pushToken: token }),
  }).catch(() => {});
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
