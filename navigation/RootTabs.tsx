import React from "react";
import { Image, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuthProfile } from "../auth/AuthProvider";
import { HomeScreen } from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { ConsumerNavigator } from "./ConsumerNavigator";
import { ProviderNavigator } from "./ProviderNavigator";
import { RootTabParams } from "./types";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator<RootTabParams>();

function LogoTitle() {
  const logoDim = Platform.OS === "android" ? 150 : 115;
  return <Image style={{ width: logoDim, height: logoDim }} source={require("../assets/logo_splash.png")} />;
}

const getIconName = (routeName: string, focused: boolean) => {
  switch (routeName) {
    case "Home":
      return focused ? "home" : "home-outline";
    case "ConsumerStack":
      return focused ? "send" : "send-outline";
    case "ProviderStack":
      return focused ? "car" : "car-outline";
    case "Settings":
      return focused ? "settings" : "settings-outline";
    default:
      return "list";
  }
};

export const RootTabs = () => {
  const { loggedAsProvider } = useAuthProfile();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={getIconName(route.name, focused)} size={size} color={color} />
        ),
        tabBarActiveTintColor: colors.primaryMuted,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        options={{
          title: "Home",
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: () => <LogoTitle />,
        }}
        name="Home"
        component={HomeScreen}
      />
      <Tab.Screen options={{ title: "Organizer", headerShown: false }} name="ConsumerStack" component={ConsumerNavigator} />
      {loggedAsProvider && (
        <Tab.Screen options={{ title: "Provider", headerShown: false }} name="ProviderStack" component={ProviderNavigator} />
      )}
      <Tab.Screen options={{ title: "Settings", headerShown: false }} name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
