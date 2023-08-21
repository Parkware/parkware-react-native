import { Button, Text, TextInput, View, StyleSheet, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SignupStackParams } from '../App';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import NumericInput from 'react-native-numeric-input';
import { AppButton } from './ButtonComponents';

type Props = NativeStackScreenProps<SignupStackParams, 'signupRoleView'>;

export const SignupRoleView = ({ route }: Props) => {
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [providerSpaces, setProviderSpaces] = useState<number>();
  const { name, email, password }  = route.params;
  
  const createAccount = async (isProvider: boolean) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCred.user;
      let userObj: any = {
        email,
        name,
        isProvider,
        loggedAsProvider: isProvider
      };

      if (address.length !== 0)
        userObj = {
          ...userObj,
          address,
          providerSpaces
        }

      await setDoc(doc(db, "users", user.uid), userObj);
    } catch (e) {
      console.log('Something went wrong with sign up: ', e);
    }
  };
  
  const updateProviderSpaces = (value: number) =>
    setProviderSpaces(value);

  return (
    <SafeAreaView>
      <View style={[styles.viewBlock, { marginTop: 300 }]}>
        <Text style={{ fontSize: 35, fontWeight: "300" }}>Sign up as a </Text>
      </View>
      <View style={styles.viewBlock}>
        <View>
          <AppButton title="Space Provider" onPress={() => setShowAddress(true)}/>
        </View>
        <View>
          <AppButton title="Event Organizer" onPress={() => createAccount(false)}/>
        </View>
      </View>
    {showAddress && (
      <View style={{ marginTop: 15}}>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
          <Text style={{ fontSize: 20 }}>Spaces able to provide: </Text>
          <NumericInput rounded totalHeight={50} minValue={1} maxValue={10} onChange={value => updateProviderSpaces(value)} />
        </View>
        <View style={{ margin: 10 }} />
          <Button title="Add details" onPress={() => createAccount(true)} />
        </View>
    )}
    </SafeAreaView>
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
  },
  viewBlock: {
    justifyContent: "center", 
    marginTop: 50, 
    flexDirection: "row"
  }
})