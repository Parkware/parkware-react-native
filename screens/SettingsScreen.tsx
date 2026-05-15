import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AuthButton, DeleteAccountButton } from './ButtonComponents'
import { deleteDoc, doc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { useAuthProfile } from '../auth/AuthProvider';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { commonStyles } from '../theme/styles';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';


const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { profile, user } = useAuthProfile();
  
  const showConfirmDel = () =>
    Alert.alert('Are you sure you want to delete your account?', 'Click cancel to keep your account. ', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', onPress: () => delAccount()},
    ]);
    
  const delAccount = async () => {
    if (!auth.currentUser) return;

    await deleteDoc(doc(db, "users", auth.currentUser.uid));
    await deleteUser(auth.currentUser)
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

  return (
    <ScreenContainer centered>
      <Text style={styles.eyebrow}>Account</Text>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{profile?.name ?? user?.email ?? 'Parkware user'}</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>Notifications</Text>
        <Text style={styles.value}>{notificationsEnabled ? 'Enabled' : 'Not enabled'}</Text>
      </View>
      <AuthButton title="Log out" onPress={showConfirmLogout} extraStyles={styles.button}/>
      <DeleteAccountButton title="Delete account" onPress={showConfirmDel} extraStyles={styles.button}/>
    </ScreenContainer>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({
  button: {
    marginTop: spacing.md,
  },
  card: {
    ...commonStyles.card,
    marginVertical: spacing.xl,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.lg,
  },
  eyebrow: commonStyles.label,
  label: commonStyles.label,
  title: commonStyles.screenTitle,
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});