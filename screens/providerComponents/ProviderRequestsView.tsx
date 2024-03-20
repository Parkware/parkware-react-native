import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { DocumentData, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import 'firebase/firestore';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { EventBlock } from '../consumerComponents/EventBlock';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AuthButton } from '../ButtonComponents';
import { FirebaseError } from 'firebase/app';

export interface docDataPair {
  id: string,
  doc: DocumentData
}

export type providerScreenProp = NativeStackNavigationProp<ProviderStackParams, 'providerRequestsView'>;

export function ProviderRequestsView() {
  const [openEvents, setOpenEvents] = useState<docDataPair[]>([]);
  const [accEvents, setAccEvents] = useState<docDataPair[]>([]);
  const [pendingEvents, setPendingEvents] = useState<docDataPair[]>([]);
  const [unwantedEvents, setUnwantedEvents] = useState<string[]>([]);
  const [deniedEventArr, setDeniedEventArr] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<FirebaseError>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => setUser(user));
    
    return unsubscribe;
  }, [])
  
  const navigation = useNavigation<providerScreenProp>();
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", marginTop: 6 }}>
          <AuthButton title="Log out" onPress={showConfirmLogout} />
        </View>
      ),
    });
  }, [navigation]);

  const showConfirmLogout = () =>
    Alert.alert('Are you sure you want to log out?', 'Click cancel to stay on. ', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Log out', onPress: () => logout()},
    ]);

  const updateDeniedEvents = async () => {
    const q = query(collection(db, 'events'), where('unwantedProviders', 'array-contains', user!.uid))
    const eventsSnap = await getDocs(q);
    const deniedNames: string[] = eventsSnap.docs.map((e: DocumentData) => e.data().eventName)
    setDeniedEventArr(deniedNames);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  // Reading the event data and setting eventData to it. 
  useEffect(() => {
    try {
      if (user) {
      const unsub = onSnapshot(collection(db, 'events'), async (snapshot) => {            
        const openEventPromises: docDataPair[] = [];
        const penEventPromises: docDataPair[] = [];
        const accEventPromises: docDataPair[] = [];
        let unwantedEvents: any[] = [];

        const userSnap = await getDoc(doc(db, 'users', user.uid))
        if (userSnap.exists()) {
          unwantedEvents = userSnap.data().unwantedEvents
          if (!unwantedEvents) unwantedEvents = [];
        }

        snapshot.docs.map(e => {
          let eventObj = {
            id: e.id,
            doc: e.data(),
          } as docDataPair
          
          // Order matters!
          if (e.data().acceptedProviderIds.includes(user!.uid)) {
            accEventPromises.push(eventObj);
          } else if (e.data().interestedProviderIds.includes(user!.uid)) {
            penEventPromises.push(eventObj);
          } else if (e.data().isOpen 
                    && !e.data().unwantedProviders.includes(user!.uid)
                    && e.data().consumer_id !== user!.uid
                    && !unwantedEvents.includes(e.id)) {
            openEventPromises.push(eventObj);
          }
        });
        const penEvents = await Promise.all(penEventPromises);
        const accEvents = await Promise.all(accEventPromises);
        const openEvents = await Promise.all(openEventPromises);
        
        setPendingEvents(penEvents);
        setAccEvents(accEvents);
        setOpenEvents(openEvents);
        updateDeniedEvents();
      });
      return () => unsub();
    }
    } catch (error) {
      setError((error) as FirebaseError);
    }
  }, [user]);

  const removeLocalEventData = (id: string) => {
    // Update the state variable
    setUnwantedEvents(current => [...current, id]);
    // Show open events without this id
    setOpenEvents(openEvents.filter((e: DocumentData) => e.id !== id));
    addToNoEventsList(id);
  }

  const addToNoEventsList = async (id: string) =>
    await setDoc(doc(db, 'users', user!.uid), { unwantedEvents: arrayUnion(id) }, { merge: true })
  
  const updateDB = async (eventData: docDataPair) => {
    const id = user!.uid;
    const currUserSnap = await getDoc(doc(db, 'users/', id));
    if (currUserSnap.exists())
      await setDoc(doc(db, 'events/', eventData.id), {
        interestedProviders: arrayUnion({
          id,
          name: currUserSnap.data().name,
          address: currUserSnap.data().address,
          providerSpaces: currUserSnap.data().providerSpaces,
          guestInfo: []
        }),
        interestedProviderIds: arrayUnion(id),
      }, { merge: true });
    /*
    A provider may need to be able to revert their acceptance to an event request. 
    */
  }

  const EventBlock = ({event, showSpaces, eventTextStyle}: any) => {
    const formatTime = (time: any) => time.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const formatDate = (date: any) => date.toDate().toLocaleDateString();
    
    return (
      <View>
        <Text key={event.doc.eventName+event.id} style={eventTextStyle} >
          {'Event name: ' + event.doc.eventName}
        </Text>
        <Text key={event.doc.address} style={eventTextStyle}>
          {'Address: ' + event.doc.address}
        </Text>
        <Text key={event.doc.accepted_provider_id} style={eventTextStyle}>
          {'Date: ' + formatDate(event.doc.startTime)}
        </Text>
        <Text key={event.doc.startTime} style={eventTextStyle}>
          {'Time Range: ' + formatTime(event.doc.startTime) + '-' + formatTime(event.doc.endTime)}
        </Text>
        {showSpaces && 
          <View>
            {event.doc.accSpaceCount !== 0 && (
              <Text style={eventTextStyle}>
                Current Parking Spaces ${event.doc.accSpaceCount}
              </Text>
            )}
            <Text key={event.doc.requestedSpaces + 1} style={eventTextStyle}>
              {'Requested Spaces: ' + event.doc.requestedSpaces}
            </Text>
          </View>
        }
      </View>
    );
  }
  
  return (
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center', marginTop: 75 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {accEvents.length !== 0 && (
          <Text style={[styles.requestHeader, { marginTop: 20 }]}>
            Accepted
          </Text>
        )}
        <View>
          {accEvents.map(event => (
            <TouchableOpacity style={styles.eventBlock} key={event.id} onPress={() => navigation.navigate('consumerStatusView', { event })}>
              <View style={{ padding: 10 }} key={event.id}>
                <EventBlock event={event} showSpaces={false} showName={true} eventTextStyle={styles.eventText} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {pendingEvents.length !== 0 && (
          <Text style={[styles.requestHeader, { marginTop: 20 }]}>
            Pending
          </Text>
        )}
        <View>
          {pendingEvents.map((event) => (
            <View style={styles.unclickableRequests} key={event.id.slice(0, 5)}>
              <EventBlock event={event} showSpaces={false} showName={true} eventTextStyle={[styles.eventText, { color: "#454852" }]} />
            </View>
          ))}
        </View>
        {openEvents.length !== 0 && (
          <Text style={[styles.requestHeader, { marginTop: 20 }]}>
            Open
          </Text>
        )}
        {(accEvents.length == 0 && openEvents.length == 0 && pendingEvents.length == 0) && <Text style={styles.requestHeader}>No events as of now!</Text>}
        <View>
          {openEvents
            .filter((e: DocumentData) => !unwantedEvents.includes(e.id))
            .map((event) => (
            <View style={[styles.unclickableRequests, { paddingHorizontal: 20 }]} key={event.id}>
              <EventBlock event={event} showSpaces={true} showName={true} eventTextStyle={[styles.eventText, { color: "#454852" }]}/>
              <View style={{ padding: 10, justifyContent: 'space-between' }}>
                <AppButton title="Accept" extraStyles={styles.eventButton} onPress={() => updateDB(event)}/>
                <AppButton title="Decline" extraStyles={styles.eventButton} onPress={() => removeLocalEventData(event.id)}/>
              </View>
            </View>
          ))}
        </View>
        {deniedEventArr.length !== 0 &&
          (
            <View>
              <Text style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 10 }}>
                Denied Events
              </Text>
              {deniedEventArr
                .map((name: string) => (
                  <View style={{ marginBottom: 10 }} key={name}>
                    <Text>{name}</Text>
                  </View>
                ))}
            </View>
          )
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  eventBlock: { 
    borderWidth: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 10,
    borderColor: "#9e9e9e", 
    backgroundColor: "#8797AF",
  },
  requestHeader: { 
    fontSize: 23, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    alignSelf: "center"
  },
  eventText: {
    fontSize: 17,
    padding: 1,
    color: "white"
  },
  unclickableRequests: { 
    borderWidth: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 5,
    borderColor: "#9e9e9e", 
    padding: 9, 
    backgroundColor: "#d5dcf5"
  },
  eventButton: {
    width: 155, 
    alignSelf: "center" 
  },
});