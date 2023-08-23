import { Button, Text, TextInput, View, StyleSheet, SafeAreaView, Alert } from 'react-native'
import React, { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SignupStackParams } from '../App';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import NumericInput from 'react-native-numeric-input';
import { AppButton, AuthButton } from './ButtonComponents';

type Props = NativeStackScreenProps<SignupStackParams, 'signupRoleView'>;

export const SignupRoleView = ({ route }: Props) => {
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [providerSpaces, setProviderSpaces] = useState<number>();
  const { name, email, phoneNum, password }  = route.params;
  
  const createAccount = async (isProvider: boolean) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCred.user;
      let userObj: any = {
        email,
        phoneNumber: phoneNum,
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
      showAccountSuccess();
    } catch (e) {
      console.log('Something went wrong with sign up: ', e);
    }
  };
  
  const showAccountSuccess = () =>
    Alert.alert('Your account has been created!', '', [
      {text: 'Continue'},
    ]);
    
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
      <View style={[styles.shadowProp, styles.card, { marginTop: 15, width: 370, alignSelf: 'center' } ]}>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
          <Text style={{ fontSize: 18 }}>Spaces able to provide: </Text>
          <NumericInput rounded totalHeight={50} minValue={1} maxValue={10} onChange={value => updateProviderSpaces(value)} />
        </View>
        <View style={{ margin: 10 }} />
          <AuthButton title="Add details" onPress={() => createAccount(true)} />
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
  },
  card: {
    backgroundColor: '#FFFF',
    borderRadius: 8,
    padding: 15,
    width: '100%',
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
})