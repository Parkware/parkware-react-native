import { Alert, Button, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AuthButton, DeleteAccountButton } from './ButtonComponents'
import { deleteDoc, doc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import * as Notifications from 'expo-notifications';


const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
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
  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      // If notifications are currently enabled, turn them off
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      setNotificationsEnabled(false);
    } else {
      // If notifications are currently disabled, turn them on
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
      setNotificationsEnabled(true);
    }
  };
  return (
    <View style={{ alignItems: "center", marginTop: 120 }}>
      <Text style={{ fontSize: 25 }}>Settings</Text>
      <AuthButton title="Log out" onPress={showConfirmLogout} extraStyles={{ marginTop: 30 }}/>
      <Text style={{ fontSize: 18, marginVertical: 10 }}>Notifications are {notificationsEnabled ? 'enabled' : 'disabled'}</Text>
      <AuthButton title={notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'} onPress={toggleNotifications} />
      <DeleteAccountButton title="Delete account" onPress={showConfirmDel} extraStyles={{ marginTop: 30, borderColor: "red" }}/>
    </View>
  )
}

export default SettingsScreen