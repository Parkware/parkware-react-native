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
import 'react-native-gesture-handler';
import { DocumentData, doc, getDoc, onSnapshot } from 'firebase/firestore';
import MultiProviderDetailsView from './screens/consumerComponents/MultiProviderDetailsView';
import ChooseProviderView from './screens/consumerComponents/ChooseProviderView';
import ParkingStatusView from './screens/providerComponents/ParkingStatusView';
import { ChooseRoleView } from './screens/ChooseRoleView';
import LoadingScreen from './screens/LoadingScreen';
import DepartureGuestView from './screens/consumerComponents/DepartureGuestView';

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
  chooseRoleView: {
    name: string,
    email: string,
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
        name="chooseRoleView" 
        component={ChooseRoleView} 
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

const ProviderScreenStack = (user: any) => {
  return (
    <ProviderStack.Navigator initialRouteName='providerRequestsView'>
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
    </ProviderStack.Navigator>
  )
}

const ConsumerScreenStack = () => {
  return (
    <ConsumerStack.Navigator initialRouteName='makeRequestScreen'>
      <ConsumerStack.Screen 
        options={{ headerShown: false }} 
        name="makeRequestScreen" 
        component={MakeRequestScreen} 
      />
      <ConsumerStack.Screen
        options={{ title: "", headerTransparent: true }}
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
  const [isProvider, setIsProvider] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const snapshot = await getDoc(doc(db, 'users', user.uid)) 
        if (snapshot.exists())
          setIsProvider(snapshot.data().isProvider);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, [])
  
  const RenderContent = () => {
    if (isLoading)
      return <LoadingScreen />;
    if (user) {
      if (isProvider) 
        return <ProviderScreenStack />
      else
        return <ConsumerScreenStack />
    } else {
      return <AuthScreenStack />;
    }
  };

  return <NavigationContainer><RenderContent /></NavigationContainer>;
}