import React from "react";
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChooseProviderView from "../screens/consumerComponents/ChooseProviderView";
import DepartureGuestView from "../screens/consumerComponents/DepartureGuestView";
import EventInfoView from "../screens/consumerComponents/EventInfoView";
import EventSuccessView from "../screens/consumerComponents/EventSuccessView";
import { MakeRequestScreen } from "../screens/consumerComponents/MakeRequestScreen";
import { ConsumerRequestsView } from "../screens/consumerComponents/ConsumerRequestsView";
import { ConsumerStackParams } from "./types";

const ConsumerStack = createNativeStackNavigator<ConsumerStackParams>();

export const ConsumerNavigator = () => (
  <ConsumerStack.Navigator initialRouteName="consumerRequestsView">
    <ConsumerStack.Screen
      options={{ title: "", headerTransparent: true }}
      name="makeRequestScreen"
      component={MakeRequestScreen}
    />
    <ConsumerStack.Screen
      options={{ title: "", headerTransparent: Platform.OS === "android" ? false : true }}
      name="consumerRequestsView"
      component={ConsumerRequestsView}
    />
    <ConsumerStack.Screen
      options={{ title: "", headerTransparent: true }}
      name="chooseProviderView"
      component={ChooseProviderView}
    />
    <ConsumerStack.Screen
      options={{ title: "", headerTransparent: true }}
      name="eventInfoView"
      component={EventInfoView}
    />
    <ConsumerStack.Screen
      options={{ title: "", headerTransparent: true }}
      name="departureGuestView"
      component={DepartureGuestView}
    />
    <ConsumerStack.Screen
      options={{ title: "", headerTransparent: true }}
      name="eventSuccessView"
      component={EventSuccessView}
    />
  </ConsumerStack.Navigator>
);
