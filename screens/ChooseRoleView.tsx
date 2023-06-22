import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../App';
import { signOut } from 'firebase/auth';

type Props = NativeStackScreenProps<RootStackParams, 'chooseRoleView'>;

export const ChooseRoleView = ({ navigation, route }: Props) => {
  const { user } = route.params;
  
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };
  
  const changeScreen = (provider: boolean) => {
    if (provider)
      navigation.navigate('ProviderStack', {
        screen: 'providerRequestsView'
      });
    else
      navigation.navigate('ConsumerStack', {
        screen: 'consumerRequestsView'
      });
  }

  const setRole = async (provider: boolean) => {
    await updateDoc(doc(db, 'users', user.uid), {
      provider
    });
    changeScreen(provider);
  };
  
  return (
    <View>
      <View style={{ justifyContent: "center", alignContent: "center", marginTop: 250, flexDirection: "row"}}>
        <Text>Choose Role</Text>
        <View>
          <Button title="Provider" onPress={() => setRole(true)}/>
        </View>
        <View>
          <Button title="Consumer" onPress={() => setRole(false)}/>
        </View>
      </View>
      <Button title="Log out" onPress={logout} />
    </View>
  )
}