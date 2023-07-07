import { Button, Text, TextInput, View, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProviderStackParams, SignupStackParams } from '../App';
import { User, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import NumericInput from 'react-native-numeric-input';
import { useNavigation } from '@react-navigation/native';

type roleScreenProp = NativeStackNavigationProp<ProviderStackParams, 'loginRoleView'>;

export const LoginRoleView = () => {
  const [showAddress, setShowAddress] = useState(false);
  
  const navigation = useNavigation<roleScreenProp>();

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const chooseConsumer = async () => {
    await updateDoc(doc(db, 'users/', auth.currentUser!.uid), { loggedAsProvider: false })
  }

  const chooseProvider = async () => {
    navigation.navigate('providerRequestsView')
  }

  return (
    <View>
      <View style={{ justifyContent: "center", alignContent: "center", marginTop: 250, flexDirection: "row"}}>
        <Text>Continue as a </Text>
        <View>
          <Button title="Provider" onPress={chooseProvider}/>
        </View>
        <View>
          <Button title="Consumer" onPress={chooseConsumer}/>
        </View>
      </View>
      <Button title="Log out" onPress={logout} />
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  }
})