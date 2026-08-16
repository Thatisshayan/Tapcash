import { Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { isDevice } from "expo-device";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!isDevice) {
    console.log("Must use physical device for push notifications");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    Alert.alert("Push notifications unavailable", "TapCash could not get permission to send notifications on this device.");
    return null;
  }

  try {
    const pushTokenData = await Notifications.getExpoPushTokenAsync();
    return pushTokenData.data;
  } catch (error: unknown) {
    console.error("Failed to get push token:", error);
    return null;
  }
}

export async function subscribeToPushNotifications(pushToken: string, authToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/push/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        subscription: {
          endpoint: pushToken,
          keys: { p256dh: "", auth: "" },
        },
      }),
    });

    if (!response.ok) {
      console.error("Push subscription failed:", response.status);
      return false;
    }

    return true;
  } catch (error: unknown) {
    console.error("Push subscription error:", error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(authToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/push/subscribe`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${authToken}`,
      },
    });

    return response.ok;
  } catch (error: unknown) {
    console.error("Push unsubscription error:", error);
    return false;
  }
}
