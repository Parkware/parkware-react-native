import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, Button } from 'react-native';
import { DocumentData, DocumentReference, collection, doc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface docDataPair {
  id: string,
  doc: DocumentData
}

export function ConsumerRequestsView() {
  const [eventData, setEventData] = useState<docDataPair[]>([]);

  useEffect(() => {
    // const fetchData = async () => {
      try {
        // Remove the next keyword and see if it still works. 
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
        /*
        const eventData = querySnapshot.docs.map((doc) => {          
          const providersSnapshot = await getDocs(collection(db, 'events/3fKQI195b57xW1ot8Q7W/interested_providers/'));
          const proData = providersSnapshot.docs.map(d => console.log(d.data()));
          return {
            id: doc.id,
            doc: doc.data()
          };
        });
        */
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    // };

    // fetchData();
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
  
  const sendRequest = (event_addr: any, to_accept: boolean) => {
    setEventData(prevEventData => {
      return prevEventData.map(e => {
        if (e.doc.address !== event_addr && e.doc.accepted) return { id: e.id, doc: { ...e.doc, accepted: false } }
        if (e.doc.address === event_addr) return { id: e.id, doc: { ...e.doc, accepted: to_accept } };
        return e;
      });
    });
  };
  
  const updateDB = async (doc_id: string, accepted: boolean) => {
    const docRef = doc(collection(db, 'events/'), doc_id);
    await updateDoc(docRef, {
      accepted
    });
  }
  return (
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>
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