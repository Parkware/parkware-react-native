import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ParkingStatusView from "../screens/providerComponents/ParkingStatusView";
import { ProviderRequestsView } from "../screens/providerComponents/ProviderRequestsView";
import { ProviderStackParams } from "./types";

const ProviderStack = createNativeStackNavigator<ProviderStackParams>();

export const ProviderNavigator = () => (
  <ProviderStack.Navigator initialRouteName="providerRequestsView">
    <ProviderStack.Screen
      options={{ title: "", headerTransparent: true }}
      name="providerRequestsView"
      component={ProviderRequestsView}
    />
    <ProviderStack.Screen
      options={{
        title: "",
        headerTransparent: false,
        headerStyle: {
          backgroundColor: "#F2F2F2",
        },
      }}
      name="parkingStatusView"
      component={ParkingStatusView}
    />
  </ProviderStack.Navigator>
);
