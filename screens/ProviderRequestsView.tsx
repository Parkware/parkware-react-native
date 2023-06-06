import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, Button } from 'react-native';
import { DocumentData, DocumentReference, addDoc, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
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
      // Reading the event data and setting eventData to it. 
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
    const doc_id_accept: docDataPair | undefined = eventData.find(d => d.doc.accepted === true);
    const doc_id_decline: docDataPair[] = eventData.filter(d => d.doc.accepted === false);
    
    if (doc_id_accept) {
      updateDB(doc_id_accept, true);
    }
    if (doc_id_decline) {
      doc_id_decline.map(d => updateDB(d, false));
    }
  }, [eventData]);
  
  // If a request wasn't selected, it will be set to false (only one request can be accepted at a time)
  const sendRequest = (id: any, to_accept: boolean) => {
    setEventData(prevEventData => {
      return prevEventData.map(e => {
        if (e.id !== id && e.doc.accepted) return { id: e.id, doc: { ...e.doc, accepted: false } }
        if (e.id === id) return { id: e.id, doc: { ...e.doc, accepted: to_accept } };
        return e;
      });
    });
  };
  
  const updateDB = async (ddPair: docDataPair, accepted: boolean) => {
    const doc_id = ddPair.id;
    
    if (auth.currentUser) {
      if (accepted) {
        if (ddPair.doc.consumer_id != auth.currentUser.uid) {
          const userRef = doc(db, 'users/', auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            // This is a custom id generation method that differs with each event. 
            const proId = auth.currentUser.uid + doc_id.slice(0, 3);
            await setDoc(doc(db, 'interested_providers/', proId), {
              provider_id: auth.currentUser.uid,
              name: userSnap.data().name,
              address: userSnap.data().address,
              event_id: doc_id,
            }, { merge: true });
           
            const consRef = doc(db, 'users/', ddPair.doc.consumer_id);
            await updateDoc(consRef, {
              interested_provider_ids: arrayUnion(proId),
            });
          }
        }
      }
      /*
      A provider may need to be able to revert their acceptance to an event request. 
      else {
        await deleteDoc(doc(db, "interested_providers/", auth.currentUser.uid));
      }
      */
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
          <Button title='Accept' onPress={() => sendRequest(event.id, true)}/>
          <Button title='Decline' onPress={() => sendRequest(event.id, false)}/>
        </View>
      ))}
      <Button title="Log out" onPress={logout} />
    </SafeAreaView>
    </View>
  );
}