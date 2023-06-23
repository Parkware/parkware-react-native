import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParams, LoginStackParams, RootStackParams } from '../App';
import { User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

type Props = NativeStackScreenProps<LoginStackParams, 'viewRoleView'>;

export const ViewRoleView = ({ navigation, route }: Props) => {
  const [user, setUser] = useState<User>();
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(false);

  const { email, password }  = route.params;
  
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };
  const loginUser = async (provider: boolean) => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCred.user);
      const userSnap = await getDoc(doc(db, 'users', userCred.user.uid));
      if (userSnap.exists())
        setProvider(userSnap.data().provider);
      
      // await updateDoc(doc(db, 'users', userCred.user.uid), {
      //   provider
      // });
    } catch (error) {
      if ((error as FirebaseError).code === 'auth/invalid-email' || (error as FirebaseError).code === 'auth/wrong-password') {
        setError('Your email or password was incorrect');
      } else if ((error as FirebaseError).code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else {
        setError('There was a problem with your request');
      }
    }
  };

  // const changeScreen = (provider: boolean) => {
  //   if (provider)
  //     navigation.navigate('ProviderStack', {
  //       screen: 'providerRequestsView'
  //     });
  //   else
  //     navigation.navigate('ConsumerStack', {
  //       screen: 'consumerRequestsView'
  //     });
  // }

  const setRole = async (provider: boolean) => {
    // if (user)
    //   await updateDoc(doc(db, 'users', user.uid), {
    //     provider
    //   });
    // changeScreen(provider);
  };

  const navConsumerReq = () => {
    // navigation.navigate('ConsumerStack', {
    //   screen: 'consumerRequestsView'
    // });
    console.log('i am here');
    
  }
  
  const ChooseView = () => {
    if (provider) 
      return (
        <View>
          <View style={{ justifyContent: "center", alignContent: "center", marginTop: 250, flexDirection: "row"}}>
            <Text>Choose Role</Text>
            <View>
              <Button title="Provider" onPress={() => loginUser(true)}/>
            </View>
            <View>
              <Button title="Consumer" onPress={() => loginUser(false)}/>
            </View>
          </View>
          <Button title="Log out" onPress={logout} />
        </View>
      ) 
    else {
      navConsumerReq();
      return <></>
    }
  }   
  return (
    <ChooseView />
  )
}