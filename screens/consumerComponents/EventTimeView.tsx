import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { DocumentData, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
import { Divider } from '@rneui/base'

type Props = NativeStackScreenProps<ConsumerStackParams, 'eventTimeView'>
/*
    Is there some way that I can have one onSnapshot function listen and update both these pages?
    It isn't necessary since a user may only need updates from one screen, but it could be a good addition
    I could pass in the doc id and just listen to that document. however, i would be opening up many snapshots
    since many events could be looked at. 
*/
const EventTimeView = ({ route }: Props) => {
  const { event } = route.params;
  const [timeRemaining, setTimeRemaining] = useState('');
  const targetDate = event.doc.startTime.toDate();
  const [diff, setDiff] = useState<number>();
  const [providerInfo, setProviderInfo] = useState<DocumentData>();

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

  const updateParkingStatus = async (proId: string) => {
    console.log(proId);
    
    await updateDoc(doc(db, 'events/', event.id), { 
      arrivedProviderSpaces: arrayUnion(proId),
    });
  }

  const getProviderInfo = async () => {
    const eventSnap = await getDoc(doc(db, 'events/', event.id))
    if (eventSnap.exists()) {
      const proInfo: any = eventSnap.data().acceptedProviderIds
        .map((proId: string) => eventSnap.data().interestedProviders
        .find((proObj: any) => proObj.id == proId))
      
      setProviderInfo(proInfo)
    }
  }

  useEffect(() => {
    getProviderInfo();
  }, [])

  const RenderStatus = (proId: any) => {
    if (diff) {
      if (diff <= 0) {
        return (
          <View style={styles.container}>
            <View style={styles.countContainer}>
              <Text>Mark status as "here" by clicking on the button below. The provider will be notified.</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => updateParkingStatus(proId)}>
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
    return <Text>Loading...</Text>
  }

  return (
    <SafeAreaView style={{ marginLeft: 30 }}>
      {providerInfo ? providerInfo.map((proObj: any) => {
        return (
          <View key={proObj.id}>
            <Text key={proObj.name}>{proObj.name}</Text>
            <Text key={proObj.address}>{proObj.address}</Text>
            <RenderStatus proId={proObj}/>
            <Divider width={5} style={{ marginTop: 10 }}/>
          </View>
        )
      }) : <Text>Loading...</Text>}
    </SafeAreaView>
  )
}

export default EventTimeView

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
  },
})