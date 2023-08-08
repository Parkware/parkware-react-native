import { Button, Text, TextInput, View, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SignupStackParams } from '../App';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import NumericInput from 'react-native-numeric-input';

type Props = NativeStackScreenProps<SignupStackParams, 'signupRoleView'>;

export const SignupRoleView = ({ route }: Props) => {
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [providerSpaces, setProviderSpaces] = useState<number>();
  const [error, setError] = useState('');
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
      setError('Something went wrong with sign up. Please exit and try again.');
      console.log('Something went wrong with sign up: ', e);
    }
  };
  
  const updateProviderSpaces = (value: number) =>
    setProviderSpaces(value);

  return (
    <View>
      <View style={{ justifyContent: "center", alignContent: "center", marginTop: 250, flexDirection: "row"}}>
        <Text style={{ color: "red" }}>{error}</Text>
        <Text>Sign up as a </Text>
        <View>
          <Button title="Provider" onPress={() => setShowAddress(true)}/>
        </View>
        <View>
          <Button title="Consumer" onPress={() => createAccount(false)}/>
        </View>
      </View>
      {showAddress && (
        <View>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
            placeholderTextColor="#aaa"
            style={styles.input}
          />
          <NumericInput rounded totalHeight={50} minValue={1} maxValue={10} onChange={value => updateProviderSpaces(value)} />
          <Button title="Add details" onPress={() => createAccount(true)} />
        </View>)}
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