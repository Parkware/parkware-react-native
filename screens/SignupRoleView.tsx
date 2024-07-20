import { Button, Text, TextInput, View, StyleSheet, SafeAreaView, Alert } from 'react-native'
import React, { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SignupStackParams } from '../App';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import NumericInput from 'react-native-numeric-input';
import { AppButton, AuthButton } from './ButtonComponents';
import { FirebaseError } from 'firebase/app';
import { Picker } from '@react-native-picker/picker';

type Props = NativeStackScreenProps<SignupStackParams, 'signupRoleView'>;

export const SignupRoleView = ({ route }: Props) => {
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [providerSpaces, setProviderSpaces] = useState<number>();
  const { name, email, phoneNum, password }  = route.params;
  const [error, setError] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  
  // Create user
  const createAccount = async (isProvider: boolean) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCred.user;
      let userObj: any = {
        email,
        phoneNumber: phoneNum,
        name,
        isProvider,
        neighborhood,
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
    } catch (error) {
      if ((error as FirebaseError).code === 'auth/invalid-email' || (error as FirebaseError).code === 'auth/wrong-password') {
        setError('Your email is invalid.');
      } else if ((error as FirebaseError).code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else {
        setError('There was a problem with your request');
      }
    }
  };
  
  const showAccountSuccess = () =>
    Alert.alert('Your account has been created!', '', [
      {text: 'Continue'},
    ]);
    
  return (
    <SafeAreaView>
      <View style={[styles.viewBlock, { marginTop: 150 }]}>
        <Text style={{ fontSize: 30, fontWeight: "300" }}>Select your role</Text>
      </View>
      {error && 
        <View style={styles.contrastBg}>
          <Text style={styles.error}>{error}</Text>
        </View>
      }
      <View style={styles.viewBlock}>
        <View>
          <AppButton title="Event Organizer" onPress={() => createAccount(false)}/>
        </View>
        <View>
          <AppButton title="Space Provider" onPress={() => setShowAddress(true)}/>
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
          <NumericInput rounded totalHeight={50} minValue={1} maxValue={10} onChange={value => setProviderSpaces(value)} />
        </View>
        <View style={{ margin: 10 }} />
          <AuthButton title="Create Account" onPress={() => createAccount(true)} />
        </View>
    )}
      <View style={[styles.viewBlock, { marginTop: 20 }]}>
        <Text style={{ fontSize: 30, fontWeight: "300" }}>Select your neighborhood</Text>
      </View>
      <Picker
        selectedValue={neighborhood}
        onValueChange={itemValue => setNeighborhood(itemValue)}
        itemStyle={{ marginTop: -70 }}>
        <Picker.Item color='#565a66' label="Birkshires" value="birkshires" />
        <Picker.Item color='#565a66' label="Providence" value="providence" />
        <Picker.Item color='#565a66' label="Kitts Creek" value="kittscreek" />
      </Picker>
      <View style={{ alignSelf: 'center', paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 20, marginLeft: 5 }}>
          <Text style={{fontWeight: "bold"}}>Event Organizer</Text>: You can request parking spaces. 
        </Text>
        <Text style={{ fontSize: 20, marginLeft: 5, marginTop: 15 }}>
          <Text style={{fontWeight: "bold"}}>Space Provider</Text>: You can request parking spaces and provide your space to other people.
        </Text>
      </View>
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
    marginTop: 20, 
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
  contrastBg: { 
    borderWidth: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    marginTop: 18,
    borderColor: "#ffff",
    backgroundColor: "#bfbfbf", 
    padding: 12,
    marginHorizontal: 125,
  },
  error: {
    color: 'red',
    textAlign: "center"
  },
})