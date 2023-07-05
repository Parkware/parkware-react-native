import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Button, TouchableOpacity } from 'react-native';
import { DocumentData, arrayUnion, collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { EventStatusText } from './EventStatusText';
import { EventBlock } from '../consumerComponents/EventBlock';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';

export interface docDataPair {
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
    acceptedProviderIds
    isOpen
  */
}

export type providerScreenProp = NativeStackNavigationProp<ProviderStackParams, 'providerRequestsView'>;

export function ProviderRequestsView() {
  const [openEvents, setOpenEvents] = useState<docDataPair[]>([]);
  const [accEvents, setAccEvents] = useState<docDataPair[]>([]);
  const [pendingEvents, setPendingEvents] = useState<docDataPair[]>([]);

  const navigation = useNavigation<providerScreenProp>();

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
      const unsub = onSnapshot(collection(db, 'events'), async (snapshot) => {            
        const openEventPromises: docDataPair[] = [];
        const penEventPromises: docDataPair[] = [];
        const accEventPromises: docDataPair[] = [];
        let currUid: string = '';
        if (auth.currentUser)
          currUid = auth.currentUser.uid;

        snapshot.docs.map(e => {
          let eventObj = {
            id: e.id,
            doc: e.data(),
          } as docDataPair
          
          // Order matters!
          if (e.data().acceptedProviderIds.includes(currUid)) {
            accEventPromises.push(eventObj);
          } else if (e.data().interestedProviderIds.includes(currUid)) {
            penEventPromises.push(eventObj);
          } else if (e.data().isOpen) {
            openEventPromises.push(eventObj);
          }
        });
      
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
    const currUid = auth.currentUser!.uid;
    if (accepted) {
      if (ddPair.doc.consumer_id != currUid) {
        const currUserRef = doc(db, 'users/', currUid);
        const currUserSnap = await getDoc(currUserRef);
        if (currUserSnap.exists()) {
          let already_providing = false;
          const eventSnap = await getDoc(curEventRef);
          // Eventually, this won't be needed since we would disable if already sent, but just to validate
          if (eventSnap.exists()) {
            eventSnap.data().interestedProviders.forEach((prov: any | undefined) => {
              if (prov.id == currUid) already_providing = true
            });
          }
          if (!already_providing) {
            await setDoc(curEventRef, {
              interestedProviders: arrayUnion({
                id: currUid,
                name: currUserSnap.data().name,
                address: currUserSnap.data().address,
                providerSpaces: currUserSnap.data().providerSpaces
              }),
              interestedProviderIds: arrayUnion(currUid),
            }, { merge: true });
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
    await updateDoc(curEventRef, { accepted });
  }

  return (
    <View style={{ marginTop: 30, padding: 16 }}>
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Accepted Requests
      </Text>
      
      {accEvents.map(event => (
        <TouchableOpacity style={{ marginBottom: 10 }} key={event.id} onPress={() => navigation.navigate('consumerStatusView', { event })}>
          <Text style={{ fontSize: 15 }}>Click here to see more info about your provider</Text>
          <View style={{ marginBottom: 10 }} key={event.id}>
            <EventBlock event={event} proView={true}/>
          </View>
        </TouchableOpacity>
      ))}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Pending Requests
      </Text>
      
      {pendingEvents.map((event) => (
        <View style={{ marginBottom: 10 }} key={event.id}>
          <EventBlock event={event} proView={true}/>
          <EventStatusText event={event} />
        </View>
      ))}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Open Requests
      </Text>
      
      {openEvents.map((event) => (
        <View style={{ marginBottom: 10 }} key={event.id}>
          <EventBlock event={event} proView={true}/>
          <Button title='Accept' onPress={() => sendRequest(event.id, true)}/>
          <Button title='Decline' onPress={() => sendRequest(event.id, false)}/>
        </View>
      ))}
      <Button title="Log out" onPress={logout} />
    </SafeAreaView>
    </View>
  );
}