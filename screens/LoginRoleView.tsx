import { Button, Text, View, StyleSheet, Alert, SafeAreaView } from 'react-native'
import React from 'react'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParams } from '../App';
import { deleteUser, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AuthButton, DeleteAccountButton } from './ButtonComponents';

type roleScreenProp = NativeStackNavigationProp<ProviderStackParams, 'loginRoleView'>;

export const LoginRoleView = () => {
  const navigation = useNavigation<roleScreenProp>();

  const showConfirmDel = () =>
    Alert.alert('Are you sure you want to delete your account?', 'Click cancel to keep your account. ', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', onPress: () => delAccount()},
    ]);
    
  const delAccount = async () => {
    await deleteDoc(doc(db, "users", auth.currentUser!.uid));
    await deleteUser(auth.currentUser!)
  }

  const chooseConsumer = async () => {
    await updateDoc(doc(db, 'users', auth.currentUser!.uid), { loggedAsProvider: false })
  }

  const chooseProvider = async () => {
    navigation.navigate('providerRequestsView')
  }

  return (
    <SafeAreaView>
      <View style={[styles.viewBlock, { marginTop: 200 }]}>
        <Text style={{ fontSize: 35, fontWeight: "300" }}>Continue as a </Text>
      </View>
      <View style={styles.viewBlock}>
        <View>
          <AppButton title="Space Provider" onPress={chooseProvider}/>
        </View>
        <View>
          <AppButton title="Event Organizer" onPress={chooseConsumer}/>
        </View>
      </View>
        <DeleteAccountButton title="Delete account" onPress={showConfirmDel} extraStyles={{ marginTop: 70, borderColor: "red", alignSelf: "center", width: 200 }}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  authButtons: {
    marginHorizontal: 140,
    marginBottom: 10
  },
  viewBlock: {
    justifyContent: "center", 
    marginTop: 50, 
    flexDirection: "row"
  }
})