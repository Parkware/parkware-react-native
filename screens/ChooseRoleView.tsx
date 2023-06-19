import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'

export function ChooseRoleView() {
  const setRole = async (provider: boolean) => {
    await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
      provider
    });
  }
  useEffect(() => {
    console.log("here!")
  }, [])
  
  return (
    <View style={{ marginTop: 40, marginLeft: 49}}>
      <Text>hi</Text>
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
        flex: 1,
    }
})