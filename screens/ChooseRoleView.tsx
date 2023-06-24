import { Button, Text, TextInput, View, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SignupStackParams } from '../App';
import { User, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

type Props = NativeStackScreenProps<SignupStackParams, 'chooseRoleView'>;

export const ChooseRoleView = ({ navigation, route }: Props) => {
  const [user, setUser] = useState<User>();
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [isProvider, setIsProvider] = useState(false);

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
      if (address.length !== 0)
        await setDoc(doc(db, "users", user.uid), {
          email,
          name,
          provider: isProvider,
          address
        });
      else 
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

  const AddressInput = () => {
    return (
      <View>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <Button title="Add address" onPress={() => createAccount(true)} />
      </View>
    )
  }
  
  const ChooseView = () => {
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
        {showAddress && <AddressInput />}
        <Button title="Log out" onPress={logout} />
      </View>
    )
  }   
  return (
    <ChooseView />
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