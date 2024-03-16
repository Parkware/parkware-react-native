import { Button, Keyboard, SafeAreaView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, KeyboardAvoidingView, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ProviderStackParams } from '../../App'
import { DocumentData, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../firebaseConfig'
import { EventBlock } from '../consumerComponents/EventBlock'
import { docDataPair } from './ProviderRequestsView'
import { Divider } from '@rneui/base'
import { User, onAuthStateChanged } from 'firebase/auth'

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
  const [leftMargin, setLeftMargin] = useState(20)
  const [sentNotes, setSentNotes] = useState(false);
  const [eventEnded, setEventEnded] = useState(false);
  const [notesPresent, setNotesPresent] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => setUser(user));
    getConsumerInfo();
    return unsubscribe;
  }, [])

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, 'events', eventData.id), (eventSnap) => {
        if (eventSnap.exists()) {
          // Order matters!
          checkDepartStatus(eventSnap.data().departedProviderSpaces)
          checkArrivalStatus(eventSnap.data().arrivedProviderSpaces)
        }
      })
      return () => unsub()
    }
  }, [user])
  
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
      let count = 0;
      fullVal.map((val: any) => {
        if (val.includes('.1')) {
          setGuestOneLeft(true);
          count++;
        }
        else if (val.includes('.2')) {
          setGuestTwoLeft(true);
          count++;
        }
      });
      if (count == event.doc.requestedSpaces)
        setEventEnded(true);
    }
  }

  const getFullVal = (arr: DocumentData) => arr.filter((el: DocumentData) => el.replace('.1', '').replace('.2', '') == user!.uid);

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
      .find((proObj: DocumentData) => proObj.id == user!.uid);
      
    const existingList = eventData.doc.interestedProviders
      .filter((proObj: DocumentData) => proObj.id !== user!.uid);

    existingList.push({
      ...myProviderObj,
      notes: providerNotes
    })
    
    await updateDoc(doc(db, 'events', eventData.id), {
      interestedProviders: existingList
    });

    setSentNotes(true);
  }

  const ArrivalText = () => {
    if (diff && diff <= 0) {
      let text: string = '';
      let second: string = '';
      if (!guestInfo1 && !guestInfo2) {
        text = "Your guest isn't there yet!";
      }
      if (guestInfo1) {
        if (!guestOneLeft) {
          text = `${guestInfo1.name} is currently at the spot. Their phone number is ${guestInfo1.phoneNumber}`;
        } else {
          text = `${guestInfo1.name} has left the spot. Their phone number is ${guestInfo1.phoneNumber}`;
        }
      }
      if (guestInfo2) {
        if (!guestTwoLeft) {
          second = `${guestInfo2.name} is currently at the spot. Their phone number is ${guestInfo2.phoneNumber}`;
        } else {
          second = `${guestInfo2.name} has left the spot. Their phone number is ${guestInfo2.phoneNumber}`;
        }
      }
      return (
        <View>
          <Text style={[styles.infoHeader, { marginBottom: 10 }]}>
            Guest Status:
          </Text>
          <Text style={styles.infoHeader}>
            {text}
          </Text>
          {second && 
            <Text style={[styles.infoHeader, { marginTop: 40 }]}>
              {second}
            </Text>
          }
          <Divider width={3} style={{ paddingVertical: 10 }} />
          <View style={{ marginTop: 10 }}>
          {!eventEnded
            ? <Text style={[styles.infoHeader, { fontWeight: "700", fontSize: 20 }]}>
                Event ends: {endTime.toLocaleString(navigator.language, {
              hour: '2-digit',
              minute:'2-digit'
            })}
              </Text>
            : <View>
                <Text style={[styles.infoHeader, { fontWeight: "700", fontSize: 20 }]}>
                  Please fill out the survey form below.
                </Text>
                <Text style={{ color: 'blue', fontSize: 19, marginVertical: 10 }}
                      onPress={() => Linking.openURL('https://forms.gle/DqPH34zYAfxdgzzt6')}>
                        https://forms.gle/DqPH34zYAfxdgzzt6
                </Text>
                <Text style={[styles.infoHeader, { fontWeight: "700", fontSize: 20 }]}>
                  Thank you for providing your space!
                </Text>
              </View>
            }
          </View>
        </View>
      )
    }
    return <Text>Loading...</Text>
  }

  useEffect(() => {
    if (user) {
      const proObj = eventData.doc.interestedProviders.find((proObj: DocumentData) => proObj.id == user.uid)
      if (!proObj.notes || proObj.notes == "") setNotesPresent(false);
    }
  }, [user])

  const RenderUserInfo = () => {
    if (consumerInfo)
      return (
        <View>
          <Text style={styles.eventText}>Name: {consumerInfo.name}</Text>
          <Text style={styles.eventText}>Email: {consumerInfo.email}</Text>
        </View>
      )
    return (
      <Text style={styles.eventText}>Loading...</Text>
    )
  }

  const EventBlock = () => {
    const formatTime = (time: any) => time.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const formatDate = (date: any) => date.toDate().toLocaleDateString();
    
    return (
      <View>
        <Text key={event.doc.eventName+event.id} style={styles.eventText} >
          {'Event name: ' + event.doc.eventName}
        </Text>
        <Text key={event.doc.address} style={styles.eventText}>
          {'Address: ' + event.doc.address}
        </Text>
        <Text key={event.doc.accepted_provider_id} style={styles.eventText}>
          {'Date: ' + formatDate(event.doc.startTime)}
        </Text>
        <Text key={event.doc.startTime} style={styles.eventText}>
          {'Time Range: ' + formatTime(event.doc.startTime) + '-' + formatTime(event.doc.endTime)}
        </Text>
        <View>
          <Text key={event.doc.requestedSpaces + 1} style={styles.eventText}>
            {'Requested Spaces: ' + event.doc.requestedSpaces}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={[styles.card, styles.shadowProp]}>
            <Text style={styles.infoHeader}>Organizer Info:</Text>
            <RenderUserInfo />
          </View>
          <View style={[styles.card, styles.shadowProp]}>
            <Text style={styles.infoHeader}>Event Information:</Text>
            <EventBlock />
          </View>
          <View style={[styles.card, styles.shadowProp]}>
            <ArrivalText />
            {(!notesPresent && !eventEnded) && (
              <View style={[ { padding: 10 }]}>
                <TextInput
                  value={providerNotes}
                  onChangeText={setProviderNotes}
                  placeholder="Enter notes here"
                  placeholderTextColor="#000000"
                  multiline={true}
                  style={styles.input}
                />
                <View style={styles.btnContainer}>
                  <Button 
                    title="Upload notes"
                    disabled={providerNotes.length == 0 || sentNotes}
                    onPress={sendNotes}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default ParkingStatusView

const styles = StyleSheet.create({
  eventText: {
    fontSize: 19,
    padding: 1,
    color: "#454852", 
    paddingVertical: 2
  },
  inner: {
    paddingTop: 0,
    padding: 20,
    flex: 1,
    justifyContent: 'space-around',
  },
  infoHeader: { 
    fontSize: 22, 
    fontWeight: "500", 
    color: "#454852"
  },
  infoBlock: { 
    borderWidth: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 5,
    borderColor: "#9e9e9e", 
    backgroundColor: "#737373",
    padding: 9
  },
  boldText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10
  },
  card: {
    backgroundColor: '#A7ADC6',
    borderRadius: 8,
    padding: 15,
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  container: {
    flex: 1,
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
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginBottom: 5
  },
  error: {
    marginBottom: 20,
    color: 'red',
  },
  link: {
    color: 'blue',
    marginBottom: 20,
  },
  btnContainer: {
    marginTop: 2,
  }
});