import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { DocumentData, doc, updateDoc } from 'firebase/firestore'
import { Divider } from '@rneui/base'
import { db } from '../../firebaseConfig'

type Props = NativeStackScreenProps<ConsumerStackParams, 'singleProviderDetailsView'>
/*
    Is there some way that I can have one onSnapshot function listen and update both these pages?
    It isn't necessary since a user may only need updates from one screen, but it could be a good addition
    I could pass in the doc id and just listen to that document. however, i would be opening up many snapshots
    since many events could be looked at. 
*/
const SingleProviderDetailsView = ({ route }: Props) => {
  const { event } = route.params;
  const [timeRemaining, setTimeRemaining] = useState('');
  const targetDate = event.doc.startTime.toDate();
  const [diff, setDiff] = useState<number>();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      setDiff(difference);
      if (difference <= 0) {
        clearInterval(interval);
        setTimeRemaining("Parking Time!");
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);

        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateParkingStatus = async () => {
    await updateDoc(doc(db, 'events/', event.id), { 
      consumerParkingStatus: true,
    });
  }
  const renderContent = () => {
    if (diff) {
      if (diff <= 0) {
        return (
          <View style={styles.container}>
            <View style={styles.countContainer}>
              <Text>Mark status as "here" by clicking on the button below. The provider will be notified.</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={updateParkingStatus}>
              <Text>I'm Here!</Text>
            </TouchableOpacity>        
          </View>
        )
      } else {
        return (
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
            {timeRemaining} till your parking event.
          </Text>
        )
      }
    }
  }

  return (
    <SafeAreaView style={{ marginLeft: 20 }}>
        {renderContent()}
    </SafeAreaView>
  )
}

export default SingleProviderDetailsView

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 300,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
  countContainer: {
    alignItems: 'center',
  },
})