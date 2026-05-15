import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldShowAlert: true,
    shouldSetBadge: false,
  }),
});

const getProjectId = () => Constants.expoConfig?.extra?.eas?.projectId;

export const configureAndroidNotificationChannel = async () => {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
};

export const registerForPushNotificationsAsync = async () => {
  await configureAndroidNotificationChannel();

  if (!Device.isDevice) {
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const response = await Notifications.requestPermissionsAsync();
    finalStatus = response.status;
  }

  if (finalStatus !== "granted") {
    return undefined;
  }

  const projectId = getProjectId();
  if (!projectId) {
    return undefined;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
};
