import { Alert, Text, View } from 'react-native'
import React from 'react'
import { AuthButton, DeleteAccountButton } from './ButtonComponents'
import { deleteDoc, doc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';

const SettingsScreen = () => {
    const showConfirmDel = () =>
      Alert.alert('Are you sure you want to delete your account?', 'Click cancel to keep your account. ', [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => delAccount()},
      ]);
    
  const delAccount = async () => {
    await deleteDoc(doc(db, "users", auth.currentUser!.uid));
    await deleteUser(auth.currentUser!)
  }
  const showConfirmLogout = () =>
    Alert.alert('Are you sure you want to log out?', 'Click cancel to stay on. ', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Log out', onPress: () => logout()},
    ]);
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <View style={{ alignItems: "center", marginTop: 120 }}>
      <Text style={{ fontSize: 25 }}>Settings</Text>
      <AuthButton title="Log out" onPress={showConfirmLogout} extraStyles={{ marginTop: 30 }}/>
      <DeleteAccountButton title="Delete account" onPress={showConfirmDel} extraStyles={{ marginTop: 30, borderColor: "red" }}/>
    </View>
  )
}

export default SettingsScreen