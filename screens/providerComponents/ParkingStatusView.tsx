import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ProviderStackParams } from '../../App'
import { DocumentData, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../../firebaseConfig'
import { EventBlock } from '../consumerComponents/EventBlock'
import { docDataPair } from './ProviderRequestsView'

type Props = NativeStackScreenProps<ProviderStackParams, 'consumerStatusView'>
/*
    Is there some way that I can have one onSnapshot function listen and update both these pages?
    It isn't necessary since a user may only need updates from one screen, but it could be a good addition
    I could pass in the doc id and just listen to that document. however, i would be opening up many snapshots
    since many events could be looked at. 
*/
const ParkingStatusView = ({ route }: Props) => {
  const { event } = route.params;
  const [eventData, setEventData] = useState<docDataPair>(event);
  const [consumerInfo, setConsumerInfo] = useState<DocumentData>();
  const [diff, setDiff] = useState<number>();
  const endTime = event.doc.endTime.toDate();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [guestStillParking, setGuestStillParking] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'events', eventData.id), (eventSnap) => {
      if (eventSnap.exists()) {
        if (eventSnap.data().arrivedProviderSpaces.includes(auth.currentUser!.uid))
          setGuestStillParking(true);
        else
          setGuestStillParking(false);
      }
    })
  
    return () => unsub()
  }, [])
  
  const getConsumerInfo = async () => {
    const userSnap = await getDoc(doc(db, 'users/', eventData.doc.consumer_id))
    if (userSnap.exists())   
      setConsumerInfo(userSnap.data());
  }
  
  useEffect(() => {
    getConsumerInfo();
  }, [])
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();
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

  const ShowArrivalStatus = () => {
    if (eventData.doc.arrivedProviderSpaces.includes(auth.currentUser!.uid)) {
      if (diff) {
        if (diff <= 0) 
          return (
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
              {guestStillParking ? "your guest has not left the spot yet" : "your guest has left the spot"}
            </Text>
          )
        else 
        // need to create push notifications if the guest leaves. this needs to alert the provider
          return (
            <View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40}}>
                {consumerInfo && consumerInfo.name} has arrived at your space!
              </Text>
              <Text>
                {timeRemaining} till time's up for that lil' boi
              </Text>
            </View>
          )
      }
      return <Text>Loading...</Text>
    }
    return (
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40}}>
        The guest isn't there yet!
      </Text>
    )
  }

  const RenderConsInfo = () => {
    if (consumerInfo)
      return (
        <View>
          <Text>{consumerInfo.name}</Text>
          <Text>{consumerInfo.email}</Text>
        </View>
      )
    return (
      <Text>Loading...</Text>
    )
  }
  return (
    <SafeAreaView style={{ marginLeft: 30 }}>
      <Text>Organizer Info:</Text>
      <RenderConsInfo />
      <Text style={{ paddingTop: 30 }}>Event Info:</Text>
      <EventBlock event={eventData} showSpaces={true}/>
      <View style={{ paddingTop: 30}}>
        <ShowArrivalStatus />
      </View>
    </SafeAreaView>
  )
}

export default ParkingStatusView

const styles = StyleSheet.create({})