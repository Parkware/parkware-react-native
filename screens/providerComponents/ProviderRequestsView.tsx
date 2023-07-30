import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Button, TouchableOpacity } from 'react-native';
import { DocumentData, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { EventStatusText } from './EventStatusText';
import { EventBlock } from '../consumerComponents/EventBlock';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

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

  const navigation = useNavigation<providerScreenProp>();

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };
  
  const updateDeniedEvents = async () => {
    const q = query(collection(db, 'events'), where('unwantedProviders', 'array-contains', auth.currentUser!.uid))
    const eventsSnap = await getDocs(q);
    const deniedNames: string[] = eventsSnap.docs.map((e: DocumentData) => e.data().eventName)
    setDeniedEventArr(deniedNames);
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
          } else if (e.data().isOpen 
                    && !e.data().unwantedProviders.includes(auth.currentUser!.uid)
                    && e.data().consumer_id !== auth.currentUser!.uid) {
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
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, []);

  const removeLocalEventData = (id: string) => {
    setUnwantedEvents(current => [...current, id]);
    setOpenEvents(openEvents.filter((e: DocumentData) => e.id !== id));
  }
  
  const updateDB = async (eventData: docDataPair) => {
    const id = auth.currentUser!.uid;
    const currUserSnap = await getDoc(doc(db, 'users/', id));
    if (currUserSnap.exists())
      await setDoc(doc(db, 'events/', eventData.id), {
        interestedProviders: arrayUnion({
          id,
          name: currUserSnap.data().name,
          address: currUserSnap.data().address,
          providerSpaces: currUserSnap.data().providerSpaces
        }),
        interestedProviderIds: arrayUnion(id),
      }, { merge: true });
    /*
    A provider may need to be able to revert their acceptance to an event request. 
    else {
      await deleteDoc(doc(db, "interested_providers/", auth.currentUser.uid));
    }
    */
  }

  return (
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
      <ScrollView>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Accepted Requests
        </Text>
        <ScrollView>
          {accEvents.map(event => (
            <TouchableOpacity style={{ marginBottom: 10 }} key={event.id} onPress={() => navigation.navigate('consumerStatusView', { event })}>
              <Text style={{ fontSize: 15 }}>Click here to see more info about your event</Text>
              <View style={{ marginBottom: 10 }} key={event.id}>
                <EventBlock event={event} showSpaces={false}/>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Pending Requests
        </Text>
        <ScrollView>
          {pendingEvents.map((event) => (
            <View style={{ marginBottom: 10 }} key={event.id}>
              <EventBlock event={event} showSpaces={true}/>
            </View>
          ))}
        </ScrollView>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Open Requests
        </Text>
        <ScrollView>
          {openEvents
            .filter((e: DocumentData) => !unwantedEvents.includes(e.id))
            .map((event) => (
            <View style={{ marginBottom: 10 }} key={event.id}>
              <EventBlock event={event} showSpaces={true}/>
              <Button title='Accept' onPress={() => updateDB(event)}/>
              <Button title='Decline' onPress={() => removeLocalEventData(event.id)}/>
            </View>
          ))}
        </ScrollView>
        <Text style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 10 }}>
          Denied Events
        </Text>
        {deniedEventArr
          .map((name: string) => (
            <View style={{ marginBottom: 10 }} key={name}>
              <Text>{name}</Text>
            </View>
          ))}
        <Button title="Log out" onPress={logout} />
      </ScrollView>
    </SafeAreaView>
  );
}