import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { HomeScreen } from './screens/MakeRequestScreen';
import { Signup } from './screens/Signup';
import { ResetPassword } from './screens/ResetPassword';
import { Login } from './screens/Login';
import { ProviderRequestsView } from './screens/ProviderRequestsView';
import { ConsumerRequestsView } from './screens/ConsumerRequestsView';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import { doc, getDoc } from 'firebase/firestore';

export type ConsumerStackParams = {
  Home: undefined;
  consumerRequestsView: undefined;
}
export type ProviderStackParams = {
  providerRequestsView: undefined;
}
export type AuthStackParams = {
  Login: undefined;
  Signup: undefined;
  resetPassword: undefined;
}

const ConsumerStack = createNativeStackNavigator<ConsumerStackParams>();
const ProviderStack = createNativeStackNavigator<ProviderStackParams>();
const AuthStack = createNativeStackNavigator<AuthStackParams>();

const AuthScreenStack = () => {
  return (
      <AuthStack.Navigator>
        <AuthStack.Screen options={{ headerShown: false }} name="Login" component={Login}/>
        <AuthStack.Screen options={{ headerShown: false }} name="Signup" component={Signup}/>
        <AuthStack.Screen options={{ headerShown: false, title: "Reset Password" }} name="resetPassword" component={ResetPassword} />
      </AuthStack.Navigator>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
        if (user) {
          const docRef = doc(db, 'users/', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("Provider? ");
            console.log(docSnap.data().provider);
            setProvider(docSnap.data().provider);
          }
        }
    });
      return unsubscribe;
    }, [])

  const renderContent = () => {
    if (user) {
      if (provider) {
        return (
        <ProviderStack.Navigator>
            <ProviderStack.Screen options={{ title: "", headerTransparent: true }} name="providerRequestsView" component={ProviderRequestsView} />
          </ProviderStack.Navigator>
        )
      } else {
        return (
        <ConsumerStack.Navigator>
            <ConsumerStack.Screen options={{ headerShown: false }} name="Home" component={HomeScreen} />
            <ConsumerStack.Screen options={{ title: "", headerTransparent: true }} name="consumerRequestsView" component={ConsumerRequestsView} />
          </ConsumerStack.Navigator>
        )
      }
    }
    else return <AuthScreenStack />;
  };
  return <NavigationContainer>{renderContent()}</NavigationContainer>;
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