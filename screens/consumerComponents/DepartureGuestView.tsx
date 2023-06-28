import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { arrayRemove, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebaseConfig'

type Props = NativeStackScreenProps<ConsumerStackParams, 'departureGuestView'>

const DepartureGuestView = ({ route }: Props) => {
  const { providerInfo, eventId } = route.params;
  
  const setLeftStatus = async (proId: string) => {
    const proIdString: string = Object.values(proId).toString();

    await updateDoc(doc(db, 'events/', eventId), { 
      arrivedProviderSpaces: arrayRemove(proIdString),
    });
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setLeftStatus(providerInfo.id)}
      >
        <Text>I have left</Text>
      </TouchableOpacity>        
    </View>
  )
}

export default DepartureGuestView

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
})