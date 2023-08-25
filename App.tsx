import React, { useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { MakeRequestScreen } from './screens/consumerComponents/MakeRequestScreen';
import { SignupScreen } from './screens/SignupScreen';
import { ResetPassword } from './screens/ResetPassword';
import { LoginScreen } from './screens/LoginScreen';
import { ProviderRequestsView, docDataPair } from './screens/providerComponents/ProviderRequestsView';
import { ConsumerRequestsView } from './screens/consumerComponents/ConsumerRequestsView';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DocumentData, doc, getDoc, onSnapshot } from 'firebase/firestore';
import MultiProviderDetailsView from './screens/consumerComponents/MultiProviderDetailsView';
import ChooseProviderView from './screens/consumerComponents/ChooseProviderView';
import ParkingStatusView from './screens/providerComponents/ParkingStatusView';
import { SignupRoleView } from './screens/SignupRoleView';
import LoadingScreen from './screens/LoadingScreen';
import DepartureGuestView from './screens/consumerComponents/DepartureGuestView';
import { LoginRoleView } from './screens/LoginRoleView';
import { Platform } from 'react-native';

export type ConsumerStackParams = {
  makeRequestScreen: undefined;
  consumerRequestsView: any;
  multiProviderDetailsView: {
    event: docDataPair;
  };
  chooseProviderView: {
    event: docDataPair;
  };
  departureGuestView: {
    providerInfo: DocumentData;
    eventId: string;
  }
}

const ConsumerStack = createNativeStackNavigator<ConsumerStackParams>();

export type ProviderStackParams = {
  providerRequestsView: undefined;
  loginRoleView: undefined;
  consumerStatusView: {
    event: docDataPair;
  };
}

const ProviderStack = createNativeStackNavigator<ProviderStackParams>();

export type AuthStackParams = {
  Login: NavigatorScreenParams<LoginStackParams>;
  Signup: NavigatorScreenParams<SignupStackParams>;
  resetPassword: undefined;
}

const AuthStack = createNativeStackNavigator<AuthStackParams>();

export type LoginStackParams = {
  LoginScreen: undefined;
};

const LoginStack = createNativeStackNavigator<LoginStackParams>();

export type SignupStackParams = {
  SignupScreen: undefined;
  signupRoleView: {
    name: string,
    email: string,
    phoneNum: string,
    password: string
  };
}

const SignupStack = createNativeStackNavigator<SignupStackParams>();

const LoginScreenStack = () => {
  return (
    <LoginStack.Navigator>
      <LoginStack.Screen options={{ headerShown: false }} name="LoginScreen" component={LoginScreen}/>
    </LoginStack.Navigator>
  )
}
const SignupScreenStack = () => {
  return (
    <SignupStack.Navigator>
      <SignupStack.Screen options={{ headerShown: false }} name="SignupScreen" component={SignupScreen}/>
      <SignupStack.Screen 
        options={{ headerShown: false, title: "Choose Role" }} 
        name="signupRoleView" 
        component={SignupRoleView} 
      />
    </SignupStack.Navigator>
  )
}
const AuthScreenStack = () => {
  return (
    <AuthStack.Navigator initialRouteName='Login'>
      <AuthStack.Screen options={{ headerShown: false }} name="Login" component={LoginScreenStack}/>
      <AuthStack.Screen options={{ headerShown: false }} name="Signup" component={SignupScreenStack}/>
      <AuthStack.Screen options={{ headerShown: false, title: "Reset Password" }} name="resetPassword" component={ResetPassword} />
    </AuthStack.Navigator>
  )
}

const ProviderScreenStack = () => {
  return (
    <ProviderStack.Navigator initialRouteName='loginRoleView'>
      <ProviderStack.Screen
        options={{ title: "", headerTransparent: true }}
        name="providerRequestsView"
        component={ProviderRequestsView}
      />
      <ProviderStack.Screen
        options={{ title: "", headerTransparent: true }}
        name="consumerStatusView"
        component={ParkingStatusView}
      />
      <ProviderStack.Screen
        options={{ title: "", headerTransparent: true }}
        name="loginRoleView"
        component={LoginRoleView}
      />
    </ProviderStack.Navigator>
  )
}

const ConsumerScreenStack = () => {
  return (
    <ConsumerStack.Navigator initialRouteName='consumerRequestsView'>
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
        name="multiProviderDetailsView"
        component={MultiProviderDetailsView}
      />
      <ConsumerStack.Screen
        options={{ title: "", headerTransparent: true }}
        name="chooseProviderView"
        component={ChooseProviderView}
      />
      <ConsumerStack.Screen
        options={{ title: "", headerTransparent: true }}
        name="departureGuestView"
        component={DepartureGuestView}
      />
    </ConsumerStack.Navigator>
  );
}
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loggedAs, setLoggedAs] = useState<boolean | null>(null);
  const [noUser, setNoUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoggedAs(null);
      if (user) {
        const snapshot = await getDoc(doc(db, 'users', user.uid))
        if (snapshot.exists())
          setLoggedAs(snapshot.data().loggedAsProvider);
        else
          setNoUser(true);
      }
    });
    return unsubscribe;
  }, [])
  
  useEffect(() => {
    if (user?.uid) {
      const unsub = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {            
        if (snapshot.exists())
          setLoggedAs(snapshot.data().loggedAsProvider);
      });
      return () => unsub()
    }
  }, [user])

  const RenderContent = () => {
    if (user) {
      if (loggedAs == null)
        return <LoadingScreen />;
      else if (noUser)
        return <AuthScreenStack />;
      else if (loggedAs)
        return <ProviderScreenStack /> 
      else
        return <ConsumerScreenStack />
    } else {
      return <AuthScreenStack />;
    }
  };

  return <NavigationContainer><RenderContent /></NavigationContainer>;
}
