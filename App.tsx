import React, { useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { MakeRequestScreen } from './screens/providerComponents/MakeRequestScreen';
import { Signup } from './screens/Signup';
import { ResetPassword } from './screens/ResetPassword';
import { Login } from './screens/Login';
import { ProviderRequestsView, docDataPair } from './screens/ProviderRequestsView';
import { ConsumerRequestsView, docDataTrio } from './screens/ConsumerRequestsView';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import { doc, onSnapshot } from 'firebase/firestore';
import MultiProviderDetailsView from './screens/consumerComponents/MultiProviderDetailsView';
import SingleProviderDetailsView from './screens/consumerComponents/SingleProviderDetailsView';
import ConsumerStatusView from './screens/providerComponents/ConsumerStatusView';
import { ChooseRoleView } from './screens/ChooseRoleView';

export type RootStackParams = {
  ConsumerStack: NavigatorScreenParams<ConsumerStackParams>;
  ProviderStack: NavigatorScreenParams<ProviderStackParams>;
};

const RootStack = createNativeStackNavigator<RootStackParams>();

export type ConsumerStackParams = {
  makeRequestScreen: undefined;
  consumerRequestsView: any;
  multiProviderDetailsView: {
    event: docDataTrio;
  };
  singleProviderDetailsView: {
    event: docDataTrio;
  };
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
  Login: undefined;
  Signup: undefined;
  resetPassword: undefined;
}

export type LoginStackParams = {
  Login: undefined;
   chooseRoleView: {
    user: User;
  };
}

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

const ProviderScreenStack = () => {
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
        component={ConsumerStatusView}
      />
    </ProviderStack.Navigator>
  )
}

const ConsumerScreenStack = () => {
  return (
    <ConsumerStack.Navigator initialRouteName='consumerRequestsView'>
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
        name="singleProviderDetailsView"
        component={SingleProviderDetailsView}
      />
    </ConsumerStack.Navigator>
  );
}
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {      
      setUser(user);
    });
    return unsubscribe;
  }, [])

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, 'users', user.uid), async (snapshot) => {
        if (snapshot.exists()) {
          if (snapshot.data().provider !== null)   
            setProvider(snapshot.data().provider);
        }
      });
      return unsub;
    }
  }, [])
  
  const RenderContent = () => {
    if (user) {
      return (
        <RootStack.Navigator initialRouteName='chooseRoleView'>
          <RootStack.Screen
            options={{ headerShown: false }} 
            name="ProviderStack" 
            component={ProviderScreenStack} 
          />
          <RootStack.Screen
            options={{ headerShown: false }} 
            name="ConsumerStack"
            component={ConsumerScreenStack}
          />
          <RootStack.Screen 
            options={{ headerShown: false, title: "Choose Role" }} 
            name="chooseRoleView" 
            component={ChooseRoleView} 
            initialParams={{ user }}
          />
        </RootStack.Navigator>
      );
    } else {
      return <AuthScreenStack />;
    }
  };
  return <NavigationContainer><RenderContent /></NavigationContainer>;
}