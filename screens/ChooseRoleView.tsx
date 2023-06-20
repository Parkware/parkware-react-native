import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../App';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackNavigationProp<AuthStackParams, 'chooseRoleView'>;

export const ChooseRoleView = ({ route }: Props) => {
  // const { user } = route;

  const setRole = async (provider: boolean) => {
    console.log(route);
    
    await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
      provider
    });
  }
  
  return (
    <View style={{ justifyContent: "center", alignContent: "center", marginTop: 250, flexDirection: "row"}}>
      <Text>Choose Role</Text>
      <View style={styles.buttonContainer}>
        <Button title="Provider" onPress={() => setRole(true)}/>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Consumer" onPress={() => setRole(false)}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    buttonContainer: {
        // flex: 1,
    }
})