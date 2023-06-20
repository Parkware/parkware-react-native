import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { HomeScreen } from './screens/providerComponents/MakeRequestScreen';
import { Signup } from './screens/Signup';
import { ResetPassword } from './screens/ResetPassword';
import { Login } from './screens/Login';
import { ProviderRequestsView, docDataPair } from './screens/ProviderRequestsView';
import { ConsumerRequestsView, docDataTrio } from './screens/ConsumerRequestsView';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import MultiProviderDetailsView from './screens/consumerComponents/MultiProviderDetailsView';
import SingleProviderDetailsView from './screens/consumerComponents/SingleProviderDetailsView';
import { CountdownTimer } from './screens/consumerComponents/CountdownTimer';
import ConsumerStatusView from './screens/providerComponents/ConsumerStatusView';
import { ChooseRoleView } from './screens/ChooseRoleView';

export type ConsumerStackParams = {
  Home: undefined;
  consumerRequestsView: any;
  multiProviderDetailsView: {
    event: docDataTrio;
  };
  singleProviderDetailsView: {
    event: docDataTrio;
  };
}
export type ProviderStackParams = {
  providerRequestsView: undefined;
  consumerStatusView: {
    event: docDataPair;
  };
}
export type AuthStackParams = {
  Login: undefined;
  Signup: undefined;
  resetPassword: undefined;
  chooseRoleView: {
    user: User;
  };
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
        <AuthStack.Screen options={{ headerShown: false, title: "Choose Role" }} name="chooseRoleView" component={ChooseRoleView} />
      </AuthStack.Navigator>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {      
      if (user) 
        setUser(user);
    });
    return unsubscribe;
  }, [])

  useEffect(() => {
    if(user) {
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
      if (provider) {
        return (
          <ProviderStack.Navigator>
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
        );
      } else {
        return (
          <ConsumerStack.Navigator>
            <ConsumerStack.Screen options={{ headerShown: false }} name="Home" component={HomeScreen} />
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
    } else {
      return <AuthScreenStack />;
    }
  };

  return <NavigationContainer><RenderContent /></NavigationContainer>;
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