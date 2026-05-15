import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuthProfile } from "./auth/AuthProvider";
import { AuthNavigator } from "./navigation/AuthNavigator";
import { RootTabs } from "./navigation/RootTabs";
import LoadingScreen from "./screens/LoadingScreen";

const AppContent = () => {
  const { user, loading } = useAuthProfile();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <RootTabs /> : <AuthNavigator />;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}
