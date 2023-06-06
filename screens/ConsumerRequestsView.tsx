import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, Button } from 'react-native';
import { DocumentData, DocumentReference, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

interface docDataPair {
  id: string,
  doc: DocumentData
  /*
  Fields:
    address
    startTime
    endTime
    interested_providers
  */
}

export function ConsumerRequestsView() {
  const [eventData, setEventData] = useState<docDataPair[]>([]);

  const getProviders = async () => {
    if (auth.currentUser) {
      const snap = await getDoc(doc(db, 'users/', auth.currentUser.uid))
      if (snap.exists()) {
        for (const id in snap.data().interested_provider_ids) {
          const docSnap = await getDoc(doc(db, 'interested_providers/', id));
          if (docSnap.exists()) {
            let pro_info = [];
            pro_info.push(docSnap.data())
            
          }

        }

        }
    }
    }

  useEffect(() => {
      try {
        if (auth.currentUser) {
          const unsub = onSnapshot(collection(db, `users/${auth.currentUser.uid}/user_events`), (snapshot) => {
              const events: docDataPair[] = [];
              getProviders();  
              snapshot.docs.forEach((doc) => {
                events.push({
                  id: doc.id,
                  doc: doc.data()
                } as docDataPair);
              });
              setEventData(events)
          });
          return () => unsub();
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
  }, []);

  useEffect(() => {
    const doc_id_true = eventData.find(d => d.doc.accepted === true)?.id;
    const doc_id_false: docDataPair[] = eventData.filter(d => d.doc.accepted === false);

    if (doc_id_true) {
      updateDB(doc_id_true, true);
    }
    if (doc_id_false) {
      doc_id_false.map((d) => {
        updateDB(d.id, false);
      })
    }
  }, [eventData]);
  
  const updateDB = async (doc_id: string, accepted: boolean) => {
    const docRef = doc(collection(db, 'events/'), doc_id);
    await updateDoc(docRef, {
      accepted
    });
  }
  return (
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40}}>
        My Requests
      </Text>
      
      {eventData.map((event) => (
        <View style={{ marginBottom: 10 }} key={event.id}>
        <Text key={event.doc.address}>
          {'Address: ' + event.doc.address}
        </Text>
        <Text key={event.doc.startTime}>
          {'Time Range: ' + event.doc.startTime + '-' + event.doc.endTime}
        </Text>
        <Text key={event.doc.endTime} style={{ fontSize: 20 }}>
          {'Accepted: ' + event.doc.accepted}
        </Text>
        {/* <Button title='Accept' onPress={() => sendRequest(event.doc.address, true)}/>
        <Button title='Decline' onPress={() => sendRequest(event.doc.address, false)}/> */}
        </View>
      ))}
    </SafeAreaView>
  );
}