import { Button, Text, View, StyleSheet, Alert } from 'react-native'
import React from 'react'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParams } from '../App';
import { deleteUser, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from './consumerComponents/MakeRequestScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

type roleScreenProp = NativeStackNavigationProp<ProviderStackParams, 'loginRoleView'>;

export const LoginRoleView = () => {
  const navigation = useNavigation<roleScreenProp>();

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

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
      <View style={{ justifyContent: "center", alignContent: "center", marginTop: 240, flexDirection: "row"}}>
        <Text style={{ fontSize: 35, fontWeight: "300" }}>Continue as a </Text>
      </View>
      <View style={{ justifyContent: "center", alignContent: "center", marginTop: 50, flexDirection: "row"}}>
        <View>
          <AppButton title="Space Provider" onPress={chooseProvider}/>
        </View>
        <View>
          <AppButton title="Event Organizer" onPress={chooseConsumer}/>
        </View>
      </View>
      <AppButton title="Log out" onPress={logout} extraStyles={{ marginTop: 20 }}/>
      <AppButton title="Delete account" onPress={showConfirmDel} />
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
  }
})