import { NavigatorScreenParams } from "@react-navigation/native";
import { DocumentData } from "firebase/firestore";
import { DocDataPair } from "../types/events";

export type ConsumerStackParams = {
  makeRequestScreen: undefined;
  eventSuccessView: {
    eventID: string;
  };
  consumerRequestsView:
    | {
        eventID?: string;
      }
    | undefined;
  chooseProviderView: {
    event: DocDataPair;
  };
  eventInfoView: {
    event: DocDataPair;
  };
  departureGuestView: {
    providerInfo: DocumentData;
    eventId: string;
  };
};

export type ProviderStackParams = {
  providerRequestsView: undefined;
  parkingStatusView: {
    event: DocDataPair;
  };
};

export type LoginStackParams = {
  LoginScreen: undefined;
};

export type SignupStackParams = {
  SignupScreen: undefined;
  signupRoleView: {
    name: string;
    email: string;
    phoneNum: string;
    password: string;
  };
};

export type AuthStackParams = {
  Login: NavigatorScreenParams<LoginStackParams>;
  Signup: NavigatorScreenParams<SignupStackParams>;
  resetPassword: undefined;
};

export type RootTabParams = {
  Home: undefined;
  ConsumerStack: NavigatorScreenParams<ConsumerStackParams>;
  ProviderStack: NavigatorScreenParams<ProviderStackParams>;
  Settings: undefined;
};
