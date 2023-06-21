import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../App';


type Props = NativeStackScreenProps<RootStackParams, 'chooseRoleView'>;

export const ChooseRoleView = ({ route }: Props) => {
  const { user } = route.params;

  useEffect(() => {
    console.log('here!');
    
  }, [])
  
  const setRole = async (provider: boolean) => {
    await updateDoc(doc(db, 'users', user.uid), {
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