import { Alert, Button, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AuthButton, DeleteAccountButton } from './ButtonComponents'
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import * as Notifications from 'expo-notifications';


const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userName, setUserName] = useState('');
  
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

  useEffect(() => {
    // Check if notifications are enabled when component mounts
    const checkNotificationStatus = async () => {
      const enabled = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(enabled.granted);
    };
    checkNotificationStatus();
  }, []);

  useEffect(() => {
    if (auth.currentUser?.uid) updateName();
  }, [])

  const updateName = async () => {
    const userSnap = await getDoc(doc(db, 'users', auth.currentUser!.uid))
    if (userSnap.exists())
      setUserName(userSnap.data().name);
  }
  return (
    <View style={{ alignItems: "center", marginTop: 120 }}>
      <Text style={{ fontSize: 25 }}>Settings</Text>
      <Text style={{ fontSize: 18, marginTop: 20 }}>Logged in as {userName}</Text>
      <AuthButton title="Log out" onPress={showConfirmLogout} extraStyles={{ marginTop: 15 }}/>
      <DeleteAccountButton title="Delete account" onPress={showConfirmDel} extraStyles={{ marginTop: 30, borderColor: "red" }}/>
    </View>
  )
}

export default SettingsScreen