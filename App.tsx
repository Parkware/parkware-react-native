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
import { DocumentData, doc, getDoc, setDoc } from 'firebase/firestore';
import ChooseProviderView from './screens/consumerComponents/ChooseProviderView';
import ParkingStatusView from './screens/providerComponents/ParkingStatusView';
import { SignupRoleView } from './screens/SignupRoleView';
import LoadingScreen from './screens/LoadingScreen';
import { Platform, Image } from 'react-native';
import EventInfoView from './screens/consumerComponents/EventInfoView';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SettingsScreen from './screens/SettingsScreen';
import { HomeScreen } from './screens/HomeScreen';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import EventSuccessView from './screens/consumerComponents/EventSuccessView';

export type ConsumerStackParams = {
  makeRequestScreen: undefined;
  eventSuccessView: any;
  consumerRequestsView: {
    eventID: string;
  }
  chooseProviderView: {
    event: docDataPair;
  };
  eventInfoView: {
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
  parkingStatusView: {
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
    <ProviderStack.Navigator initialRouteName='providerRequestsView'>
      <ProviderStack.Screen
        options={{ title: "", headerTransparent: true }}
        name="providerRequestsView"
        component={ProviderRequestsView}
      />
      <ProviderStack.Screen
        options={{ title: "", headerTransparent: false, headerStyle: {
          backgroundColor: '#f2f2f2',
        }, }}
        name="parkingStatusView"
        component={ParkingStatusView}
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
        name="eventSuccessView"
        component={EventSuccessView}
      />
    </ConsumerStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function LogoTitle() {
  const logoDim = Platform.OS == 'android' ? 150 : 115;
  return (
    <Image
      style={{ width: logoDim, height: logoDim }}
      source={require('./assets/logo_splash.png')}
    />
  );
}



export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loggedAsProvider, setLoggedAsProvider] = useState<boolean | null>(null);

  const RootTabs = () => {
    return (
      <Tab.Navigator 
        initialRouteName='Home'
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
  
            if (route.name === 'Home') {
              iconName = focused
                ? 'home'
                : 'home-outline';
            } else if (route.name === 'ConsumerStack') {
              iconName = focused ? 'send' : 'send-outline';
            } else if (route.name === 'ProviderStack') {
              iconName = focused ? 'car' : 'car-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'ios-list';
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#8797AF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          options={{ 
            title: "Home", 
            headerShown: true,
            headerTitleAlign: 'center',
            headerTitle: () => <LogoTitle />
          }}
          name="Home"
          component={HomeScreen}
        />
        <Tab.Screen 
          options={{ title: "Organizer", headerShown: false }}
          name="ConsumerStack"
          component={ConsumerScreenStack}
        />
        {loggedAsProvider && (
          <Tab.Screen 
            options={{ title: "Provider", headerShown: false }}
            name="ProviderStack"
            component={ProviderScreenStack}
          />
        )}
        <Tab.Screen 
          options={{ title: "Settings", headerShown: false }}
          name="Settings"
          component={SettingsScreen}
        />
      </Tab.Navigator>
    )
  }
  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const response = await Notifications.requestPermissionsAsync();
        // console.log("req perms returned: ", response);
        finalStatus = response.status;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig!.extra!.eas.projectId })).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }
    
    return token;
  }
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoggedAsProvider(null);
      if (user) {
        const snapshot = await getDoc(doc(db, 'users', user.uid))
        if (snapshot.exists()) {
          setLoggedAsProvider(snapshot.data().loggedAsProvider);
          const token = await registerForPushNotificationsAsync();
          try {
            if (token)
              // tokens are generated and saved with each user data sample
              await setDoc(doc(db, 'users', user.uid), { expoPushToken: token }, { merge: true });
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
    return unsubscribe;
  }, [])
  
  // useEffect(() => {
  //   if (user?.uid) {
  //     const unsub = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {            
  //       if (snapshot.exists())
  //         setLoggedAsProvider(snapshot.data().loggedAsProvider);
  //     });
  //     return () => unsub()
  //   }
  // }, [user])
  
  const RenderContent = () => {
    if (user) {
      if (loggedAsProvider == null)
        return <LoadingScreen />;
      else
        return <RootTabs />
    } else {
      return <AuthScreenStack />;
    }
  };

  return <NavigationContainer><RenderContent /></NavigationContainer>;
  
}