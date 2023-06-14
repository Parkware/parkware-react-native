import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Button, ToastAndroid } from 'react-native';
import { DocumentData, arrayUnion, collection, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { docDataTrio } from './ConsumerRequestsView';

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
  const [openEvents, setOpenEvents] = useState<docDataPair[]>([]);
  const [accEvents, setAccEvents] = useState<docDataPair[]>([]);
  const [pendingEvents, setPendingEvents] = useState<docDataPair[]>([]);

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
      const unsub = onSnapshot(collection(db, 'events'), async (snapshot) => {            
        // i can remove an array element interestedprovider and then add it to the accepted providers
        const openEventPromises: docDataPair[] = [];
        const penEventPromises: docDataPair[] = [];
        const accEventPromises: docDataPair[] = [];

        snapshot.docs.map(e => {
          let eventObj = {
            id: e.id,
            doc: e.data(),
          } as docDataPair

          if (auth.currentUser) {
            if (e.data().interestedProviderIds.includes(auth.currentUser.uid)) {
              penEventPromises.push(eventObj);
            } else if (e.data().accepted_provider_id === auth.currentUser.uid) {
              accEventPromises.push(eventObj);
            } else {
              openEventPromises.push(eventObj);
            }
        }});
      
        const penEvents = await Promise.all(penEventPromises);
        const accEvents = await Promise.all(accEventPromises);
        const openEvents = await Promise.all(openEventPromises);
        
        setPendingEvents(penEvents);
        setAccEvents(accEvents);
        setOpenEvents(openEvents);
          
      });
      return () => unsub();
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, []);

  /*
    Searching through all of the true docs and updating firebase accordingly. 
    All these fields are local to the eventData object. 
  */

  useEffect(() => {
    const doc_id_accept: docDataPair[] = openEvents.filter(d => d.doc.accepted === true);
    const doc_id_decline: docDataPair[] = openEvents.filter(d => d.doc.accepted === false);
    
    if (doc_id_accept) 
      doc_id_accept.map(d => updateDB(d, true));
    if (doc_id_decline) 
      doc_id_decline.map(d => updateDB(d, false));
  }, [openEvents]);
  
  const sendRequest = (id: any, to_accept: boolean) => {
    setOpenEvents(prevEventData => {
      return prevEventData.map(e => {
        // If the user is removing acceptance, I only want to change that event's value. Else if putting acceptance, I want only that event request to be selected. 
        // if (to_accept && e.id !== id && e.doc.accepted) return { id: e.id, doc: { ...e.doc, accepted: false } }
        if (e.id === id) return { id: e.id, doc: { ...e.doc, accepted: to_accept } };
        return e;
      });
    });
  };
  
  const updateDB = async (ddPair: docDataPair, accepted: boolean) => {
    const doc_id = ddPair.id;
    const curEventRef = doc(db, 'events/', doc_id);
    if (auth.currentUser) {
      const currUid = auth.currentUser.uid;
      if (accepted) {
        if (ddPair.doc.consumer_id != currUid) {
          const currUserRef = doc(db, 'users/', currUid);
          const currUserSnap = await getDoc(currUserRef);
          if (currUserSnap.exists()) {
            let already_providing = false;
            const eventSnap = await getDoc(curEventRef);
            // Checking to see if the user is already signed up. 
            // Eventually, this won't be needed since we would disable if already sent, but just to validate
            if (eventSnap.exists()) {
              eventSnap.data().interestedProviders.forEach((prov: any | undefined) => {
                  if (prov.provider_id == currUid) already_providing = true
              });
            }
            if (!already_providing) {
              console.log('adding to db');
              
              await setDoc(curEventRef, {
                interestedProviders: arrayUnion({
                  provider_id: currUid,
                  name: currUserSnap.data().name,
                  address: currUserSnap.data().address
                }),
              }, { merge: true });
              await updateDoc(curEventRef, {
                interestedProviderIds: arrayUnion(currUid),
              });
            }
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
    await updateDoc(curEventRef, { accepted });
  }
  return (
    <View style={{ marginTop: 30, padding: 16 }}>
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Accepted Requests
      </Text>
      
      {accEvents.map(event => (
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
        </View>
      ))}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Pending Requests
      </Text>
      
      {pendingEvents.map((event) => (
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
          <Text key={event.doc.accepted_provider_id}>
            {(auth.currentUser && event.doc.accepted_provider_id == auth.currentUser.uid) ? 'Status: accepted' : 'Status: declined'}
          </Text>
        </View>
      ))}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Open Requests
      </Text>
      
      {openEvents.map((event) => (
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