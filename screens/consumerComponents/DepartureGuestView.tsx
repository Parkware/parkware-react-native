import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { arrayRemove, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebaseConfig'

type Props = NativeStackScreenProps<ConsumerStackParams, 'departureGuestView'>

const DepartureGuestView = ({ route }: Props) => {
  const { providerInfo, eventId } = route.params;
  
  const setLeftStatus = async (proId: string) => {
    await updateDoc(doc(db, 'events/', eventId), { 
      arrivedProviderSpaces: arrayRemove(proId),
    });
  }
  
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text key={providerInfo.name}>{providerInfo.name}</Text>
        <Text style={{ marginBottom: 10 }}key={providerInfo.address}>{providerInfo.address}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setLeftStatus(providerInfo.id)}
        >
          <Text>I have left</Text>
        </TouchableOpacity>        
      </View>
    </SafeAreaView>
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