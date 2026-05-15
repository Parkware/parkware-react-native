import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { ResetPassword } from "../screens/ResetPassword";
import { SignupRoleView } from "../screens/SignupRoleView";
import { SignupScreen } from "../screens/SignupScreen";
import { AuthStackParams, LoginStackParams, SignupStackParams } from "./types";

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const LoginStack = createNativeStackNavigator<LoginStackParams>();
const SignupStack = createNativeStackNavigator<SignupStackParams>();

const LoginScreenStack = () => (
  <LoginStack.Navigator>
    <LoginStack.Screen options={{ headerShown: false }} name="LoginScreen" component={LoginScreen} />
  </LoginStack.Navigator>
);

const SignupScreenStack = () => (
  <SignupStack.Navigator>
    <SignupStack.Screen options={{ headerShown: false }} name="SignupScreen" component={SignupScreen} />
    <SignupStack.Screen
      options={{ headerShown: false, title: "Choose Role" }}
      name="signupRoleView"
      component={SignupRoleView}
    />
  </SignupStack.Navigator>
);

export const AuthNavigator = () => (
  <AuthStack.Navigator initialRouteName="Login">
    <AuthStack.Screen options={{ headerShown: false }} name="Login" component={LoginScreenStack} />
    <AuthStack.Screen options={{ headerShown: false }} name="Signup" component={SignupScreenStack} />
    <AuthStack.Screen options={{ headerShown: false, title: "Reset Password" }} name="resetPassword" component={ResetPassword} />
  </AuthStack.Navigator>
);
