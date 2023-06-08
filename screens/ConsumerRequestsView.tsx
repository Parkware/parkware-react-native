import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { DocumentData, collection, doc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Divider } from '@rneui/themed';

interface docDuo {
  id: string,
  doc: DocumentData,
}
interface docDataPair {
  id: string,
  doc: DocumentData,
  interestedProviders: docDuo[]
  /*
  Fields:
    address
    startTime
    endTime
    interestedProviders
  */
}

export function ConsumerRequestsView() {
  const [eventData, setEventData] = useState<docDataPair[]>([]);

  const getProviders = async (e_id: string) => {
    // Get interested providers within each event
    // onSnapshot(collection(db, `events/${e_id}/interested_providers/`), async (proSnap) => {   
    const proSnap = await getDocs(collection(db, `events/${e_id}/interested_providers/`));      
    const providers: DocumentData[] = [];
    proSnap.forEach((pro) => {
      providers.push({ 
        id: pro.id,
        doc: pro.data()
      } as docDuo);
    });
    return providers;
    // });
  }

  useEffect(() => {
      try {
        if (auth.currentUser) {
          const unsub = onSnapshot(doc(db, `users/${auth.currentUser.uid}`), async (eventSnap) => {
            if (!eventSnap.exists()) return;
            const eventIds = eventSnap.data().user_events;
          
            const eventPromises = eventIds.map(async (e_id: string) => {
              const userSnap = await getDoc(doc(db, 'events/', e_id));
              const providers = await getProviders(e_id);
              return {
                id: e_id,
                doc: userSnap.data(),
                interestedProviders: providers
              } as docDataPair;
            });
          
            const events = await Promise.all(eventPromises);
            setEventData(events);
          });
          
          return () => unsub();          
        };
        
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
        <Text key={event.doc.endTime}>
          {'Accepted: ' + event.doc.accepted}
        </Text>
        <Text style={{ fontSize: 20 }}>Available Providers:</Text>
        {event.interestedProviders.map((providerInfo: docDuo) => (
          <View key={providerInfo.id}>
          <Text key={providerInfo.doc.name}>
          {'Name: ' + providerInfo.doc.name}
          </Text>
          <Text key={providerInfo.doc.address}>
          {'Address: ' + providerInfo.doc.address}
          </Text>
          </View >
        ))}
        {/* <Button title='Accept' onPress={() => sendRequest(event.doc.address, true)}/>
        <Button title='Decline' onPress={() => sendRequest(event.doc.address, false)}/> */}
        <Divider width={5}/>
        </View>
        
      ))}
    </SafeAreaView>
  );
}