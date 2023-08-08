import { Button, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ProviderStackParams } from '../../App'
import { DocumentData, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../firebaseConfig'
import { EventBlock } from '../consumerComponents/EventBlock'
import { docDataPair } from './ProviderRequestsView'

type Props = NativeStackScreenProps<ProviderStackParams, 'consumerStatusView'>

const ParkingStatusView = ({ route }: Props) => {
  const { event } = route.params;
  const endTime = event.doc.endTime.toDate();
  const startTime = event.doc.startTime.toDate();
  const [eventData, setEventData] = useState<docDataPair>(event);
  const [consumerInfo, setConsumerInfo] = useState<DocumentData>();
  const [diff, setDiff] = useState<number>();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [providerNotes, setProviderNotes] = useState('');
  const [guestInfo1, setGuestInfo1] = useState<DocumentData>();
  const [guestInfo2, setGuestInfo2] = useState<DocumentData>();
  const [modProviderId1, setModProviderId1] = useState<DocumentData>();
  const [modProviderId2, setModProviderId2] = useState<DocumentData>();
  const [guestOneLeft, setGuestOneLeft] = useState(false)
  const [guestTwoLeft, setGuestTwoLeft] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'events', eventData.id), (eventSnap) => {
      if (eventSnap.exists()) {
        // Order matters!
        checkDepartStatus(eventSnap.data().departedProviderSpaces)
        checkArrivalStatus(eventSnap.data().arrivedProviderSpaces)
      }
    })
    return () => unsub()
  }, [])
  
  const checkArrivalStatus = (arr: DocumentData) => {
    const fullVal = getFullVal(arr);
    if (fullVal) {
      fullVal.map((val: any) => {
        if (val.includes('.1'))
          setModProviderId1(val);
        else if (val.includes('.2'))
          setModProviderId2(val);
      })
    }
  }

  const checkDepartStatus = (arr: DocumentData) => {
    const fullVal = getFullVal(arr);
    if (fullVal) {
      fullVal.map((val: any) => {
        if (val.includes('.1'))
          setGuestOneLeft(true);
        else if (val.includes('.2'))
          setGuestTwoLeft(true);
      });
    }
  }

  const getFullVal = (arr: DocumentData) => arr.filter((el: DocumentData) => el.replace('.1', '').replace('.2', '') == auth.currentUser!.uid);

  const updateGuestInfo = async (modProviderId: any, setGuestInfo: any, num: number) => {
    const eventSnap = await getDoc(doc(db, 'events', event.id))
    if (eventSnap.exists()) {
      const guestObj: any = eventSnap.data().interestedProviders
        .find((proObj: DocumentData) => proObj.id == modProviderId!.replace('.1', '').replace('.2', ''))
        .guestInfo.find((info: DocumentData) => info.order == num);
      setGuestInfo(guestObj);
    }
  }
  
  useEffect(() => {
    if (modProviderId1)
      updateGuestInfo(modProviderId1, setGuestInfo1, 1);
  }, [modProviderId1])

  useEffect(() => {
    if (modProviderId2)
      updateGuestInfo(modProviderId2, setGuestInfo2, 2);
  }, [modProviderId2])
  
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

  const sendNotes = async () => {
    const myProviderObj = eventData.doc.interestedProviders
      .find((proObj: DocumentData) => proObj.id == auth.currentUser!.uid);
      
    const existingList = eventData.doc.interestedProviders
      .filter((proObj: DocumentData) => proObj.id !== auth.currentUser!.uid);

    existingList.push({
      ...myProviderObj,
      notes: providerNotes
    })
    
    await updateDoc(doc(db, 'events', eventData.id), {
      interestedProviders: existingList
    });
  }

  const ArrivalText = () => {
    let text: string = '';
    let second: string = '';
    if (!guestInfo1 && !guestInfo2) {
      text = "The guest isn't there yet!";
    }
    if (guestInfo1) {
      if (!guestOneLeft) {
        text = `${guestInfo1.name} is currently at the spot. their number is ${guestInfo1.phoneNumber}`;
      } else {
        text = `${guestInfo1.name} has left the spot. their number is ${guestInfo1.phoneNumber}`;
      }
    }
    if (guestInfo2) {
      if (!guestTwoLeft) {
        second = `${guestInfo2.name} is currently at the spot. their number is ${guestInfo2.phoneNumber}`;
      } else {
        second = `${guestInfo2.name} has left the spot. their number is ${guestInfo2.phoneNumber}`;
      }
    }
    return (
      <View>
        <Text style={{ fontSize: 20, marginBottom: 10, marginTop: 40 }}>
          {text}
        </Text>
        <Text style={{ fontSize: 20, marginBottom: 40, marginTop: 40 }}>
          {second}
        </Text>
        {!(guestOneLeft && guestTwoLeft)
        ? <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
            Event ends: {endTime.toLocaleString()}
          </Text>
        : <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
            Thank you for providing your space!
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
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 13, marginTop: 30 }}>
              {timeRemaining} till the event starts. 
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
      <Text style={{ paddingTop: 20, fontSize: 20 }}>Event Info:</Text>
      <EventBlock event={eventData} showSpaces={true} showEditSpaces={false}/>
        <ShowArrivalStatus />
        {diff && diff > 0 && (
          <View style={{ paddingRight: 10 }}>
            <TextInput
              value={providerNotes}
              onChangeText={setProviderNotes}
              placeholder="Enter notes here"
              placeholderTextColor="#aaa"
              multiline={true}
              style={styles.input}
            />
            <Button 
              title="Upload notes"
              disabled={providerNotes.length == 0}
              onPress={sendNotes}
            />
          </View>
        )}
    </SafeAreaView>
  )
}

export default ParkingStatusView


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    padding: 24,
    justifyContent: 'space-around',
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