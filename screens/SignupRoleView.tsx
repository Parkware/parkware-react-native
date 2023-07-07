import { Button, Text, TextInput, View, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SignupStackParams } from '../App';
import { User, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import NumericInput from 'react-native-numeric-input';

type Props = NativeStackScreenProps<SignupStackParams, 'signupRoleView'>;

export const SignupRoleView = ({ route }: Props) => {
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [providerSpaces, setProviderSpaces] = useState<number>();
  
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

  const ProviderInput = () => {
    return (
      <View>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <NumericInput rounded totalHeight={50} minValue={1} maxValue={10} onChange={value => setProviderSpaces(value)} />
        <Button title="Add details" onPress={() => createAccount(true)} />
      </View>
    )
  }

  return (
    <View>
      <View style={{ justifyContent: "center", alignContent: "center", marginTop: 250, flexDirection: "row"}}>
        <Text>Sign up as a </Text>
        <View>
          <Button title="Provider" onPress={() => setShowAddress(true)}/>
        </View>
        <View>
          <Button title="Consumer" onPress={() => createAccount(false)}/>
        </View>
      </View>
      {showAddress && <ProviderInput />}
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