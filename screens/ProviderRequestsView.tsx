import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, Button } from 'react-native';
import { DocumentData, DocumentReference, collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import 'firebase/firestore';
import { signOut } from 'firebase/auth';

interface docDataPair {
  id: string,
  doc: DocumentData
  /*
  Fields:
    consumer_id
    name
    address
    startTime
    endTime
    accepted
    accepted_provider_id
  */
}

export function ProviderRequestsView() {
  const [eventData, setEventData] = useState<docDataPair[]>([]);
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };
  
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'events'), (snapshot) => {
          const events: docDataPair[] = [];
          snapshot.docs.forEach((doc) => {          
            events.push({
              id: doc.id,
              doc: doc.data()
            } as docDataPair);
          });
          setEventData(events)
      });
      return () => unsub();
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, []);

  useEffect(() => {
    // Searching through all of the true docs and updating firebase accordingly. All these fields are local to the eventData object. 
    const doc_id_accept = eventData.find(d => d.doc.accepted === true);
    const doc_id_decline: docDataPair[] = eventData.filter(d => d.doc.accepted === false);
    
    // need to pass in the consumer id from the doc (so rm the .id)
    if (doc_id_accept) {
      updateDB(doc_id_accept, true);
    }
    if (doc_id_decline) {
      doc_id_decline.map(d => updateDB(d, false));
    }
  }, [eventData]);
  
  const sendRequest = (event_addr: any, to_accept: boolean) => {
    setEventData(prevEventData => {
      return prevEventData.map(e => {
        if (e.doc.address !== event_addr && e.doc.accepted) return { id: e.id, doc: { ...e.doc, accepted: false } }
        if (e.doc.address === event_addr) return { id: e.id, doc: { ...e.doc, accepted: to_accept } };
        return e;
      });
    });
  };
  
  const updateDB = async (ddPair: docDataPair, accepted: boolean) => {
    // const eref = doc(collection(db, 'events/'), '3fKQI195b57xW1ot8Q7W');
    // const userSnap = await getDoc(eref);
    // console.log(userSnap.data().name);
    const doc_id = ddPair.id;
    const temp_curr_uid = 'RiYVE0uK3VTtPr2Z8vmWKK7gp3u2';
    if (accepted) {
      if (auth.currentUser) {
        if (ddPair.doc.consumer_id != auth.currentUser.uid) {
          const userRef = doc(db, 'users/', auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            await setDoc(doc(db, `events/${doc_id}/interested_providers/`, "p1"), {
              p1_name: userSnap.data().name, 
              p1_address: userSnap.data().address
            });
          }
        }
      }
  }

    const eventRef = doc(collection(db, 'events/'), doc_id);

    await updateDoc(eventRef, { accepted });
  }
  return (
    <View style={{ marginTop: 30, padding: 16 }}>
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Other Requests
      </Text>
      
      {eventData.map((event) => (
        <View style={{ marginBottom: 10 }} key={event.id}>
        <Text key={event.doc.endTime}>
          {'Name: ' + event.doc.name}
        </Text>
        <Text key={event.doc.address}>
          {'Address: ' + event.doc.address}
        </Text>
        <Text key={event.doc.startTime}>
          {'Time Range: ' + event.doc.startTime + '-' + event.doc.endTime}
        </Text>
        <Button title='Accept' onPress={() => sendRequest(event.doc.address, true)}/>
        <Button title='Decline' onPress={() => sendRequest(event.doc.address, false)}/>
        </View>
      ))}
      <Button title="Log out" onPress={logout} />

    </SafeAreaView>
    </View>
  );
}