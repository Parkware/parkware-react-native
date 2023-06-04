import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { HomeScreen } from './screens/HomeScreen';
import { Signup } from './screens/Signup';
import { ResetPassword } from './screens/ResetPassword';
import { Login } from './screens/Login';
import { ProviderRequestsView } from './screens/ProviderRequestsView';
import { ConsumerRequestsView } from './screens/ConsumerRequestsView';

import { NavigationContainer, NavigationContext } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';

export type RootStackParams = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  resetPassword: undefined;
  providerRequestsView: undefined;
}

const RootStack = createNativeStackNavigator<RootStackParams>();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState<string>('');

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen options={{ headerShown: false }} name="Login" component={Login}/>
        <RootStack.Screen name="Signup" component={Signup}/>
        <RootStack.Screen options={{ headerShown: false }} name="Home" component={HomeScreen}/>
        <RootStack.Screen options={{ title: "Reset Password" }} name="resetPassword" component={ResetPassword}/>
        <RootStack.Screen options={{ title: "", headerTransparent: true }} name="providerRequestsView" component={ProviderRequestsView}/>
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: 240,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  error: {
    marginBottom: 20,
    color: 'red',
  },
  link: {
    color: 'blue',
    marginBottom: 20,
  },
});