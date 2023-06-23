import { Button, Text, View } from 'react-native'
import React, { useState } from 'react'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SignupStackParams } from '../App';
import { User, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

type Props = NativeStackScreenProps<SignupStackParams, 'chooseRoleView'>;

export const ChooseRoleView = ({ navigation, route }: Props) => {
  const [user, setUser] = useState<User>();
  const { name, email, password }  = route.params;
  
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };
  
  const createAccount = async (isProvider: boolean) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCred.user;
      await setDoc(doc(db, "users", user.uid), {
        email,
        name,
        provider: isProvider
      });
      setUser(user);
    } catch (e) {
      console.log('Something went wrong with sign up: ', e);
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
  
  const navConsumerReq = () => {
    // navigation.navigate('ConsumerStack', {
    //   screen: 'consumerRequestsView'
    // });
    
  }
  
  const ChooseView = () => {
    return (
      <View>
        <View style={{ justifyContent: "center", alignContent: "center", marginTop: 250, flexDirection: "row"}}>
          <Text>Sign up as a </Text>
          <View>
            <Button title="Provider" onPress={() => createAccount(true)}/>
          </View>
          <View>
            <Button title="Consumer" onPress={() => createAccount(false)}/>
          </View>
        </View>
        <Button title="Log out" onPress={logout} />
      </View>
    )
  }   
  return (
    <ChooseView />
  )
}