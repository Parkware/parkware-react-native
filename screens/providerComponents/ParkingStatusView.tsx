import { StyleSheet, Text, TextInput, View } from 'react-native'
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
  const startTime = event.doc.startTime.toDate();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [guestArrived, setGuestArrived] = useState<boolean | null>(null);
  const [providerNotes, setProviderNotes] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'events', eventData.id), (eventSnap) => {
      if (eventSnap.exists()) {
        // Order matters!
        if (eventSnap.data().departedProviderSpaces.includes(auth.currentUser!.uid)) 
          setGuestArrived(false);
        else if (eventSnap.data().arrivedProviderSpaces.includes(auth.currentUser!.uid)) 
          setGuestArrived(true);
        else 
          setGuestArrived(null); 
      }
    })
    return () => unsub()
  }, [])
  
  const getConsumerInfo = async () => {
    const userSnap = await getDoc(doc(db, 'users', eventData.doc.consumer_id))
    if (userSnap.exists())   
      setConsumerInfo(userSnap.data());
  }
  
  useEffect(() => {
    getConsumerInfo();
  }, [])
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = startTime.getTime() - now.getTime();
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

  const ArrivalText = () => {
    let text: string = '';
    if (guestArrived == null) {
      text = "The guest isn't there yet!";
    } else if (guestArrived) {
      text = "Your guest is currently at the spot.";
    } else {
      text = "Your guest has left the spot.";
    }
    
    return (
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
          {text}
        </Text>
        {guestArrived == false 
        ? <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
            Thank you for providing your space!
          </Text>
        : <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
            Event ends: {endTime.toLocaleString()}
          </Text>
        }
      </View>
    )
  }

  const ShowArrivalStatus = () => {
    if (diff) {
      if (diff <= 0) 
        return <ArrivalText />
      else
      // need to create push notifications if the guest leaves. this needs to alert the provider
        return (
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
              {timeRemaining} till the parking event starts. 
              {'\n'}Please add notes for the following info to be shown to the guest:
            </Text>
            <Text style={{ fontSize: 18 }}>
              {'\n'}- Which side(s) of the driveway should be used (while facing the house)
            </Text>
            
          </View>
        )
    }
    return <Text>Loading...</Text>
  }

  const RenderUserInfo = () => {
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
      <Text style={{ fontSize: 20 }}>Organizer Info:</Text>
      <RenderUserInfo />
      <Text style={{ paddingTop: 30, fontSize: 20 }}>Event Info:</Text>
      <EventBlock event={eventData} showSpaces={true}/>
      <View style={{ paddingTop: 30}}>
        <ShowArrivalStatus />
      </View>
      <TextInput
        value={providerNotes}
        onChangeText={setProviderNotes}
        placeholder="Enter notes here"
        placeholderTextColor="#aaa"
        multiline={true}
        style={styles.input}
      />
    </SafeAreaView>
  )
}

export default ParkingStatusView


const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: 240,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    marginTop: 10,
  },
  error: {
    marginBottom: 20,
    color: 'red',
  },
  link: {
    color: 'blue',
    marginBottom: 20,
  },
});