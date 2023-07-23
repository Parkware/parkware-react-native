import { Button, Text, View, StyleSheet } from 'react-native'
import React from 'react'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParams } from '../App';
import { deleteUser, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

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
    <View>
      <View style={{ justifyContent: "center", alignContent: "center", marginTop: 250, flexDirection: "row"}}>
        <Text>Continue as a </Text>
        <View>
          <Button title="Provider" onPress={chooseProvider}/>
        </View>
        <View>
          <Button title="Consumer" onPress={chooseConsumer}/>
        </View>
      </View>
      <Button title="Log out" onPress={logout} />
      <Button title="Delete account" onPress={delAccount} />
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