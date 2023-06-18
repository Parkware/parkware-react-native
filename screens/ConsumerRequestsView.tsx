import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Button } from 'react-native';
import { DocumentData, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Divider } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../App';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { EventBlock } from './consumerComponents/EventBlock';

export interface docDataTrio {
  id: string,
  doc: DocumentData,
  interestedProviders: DocumentData[]
  /*
  Fields:
    address
    startTime
    endTime
    interestedProviders
  */
}

export type consumerScreenProp = NativeStackNavigationProp<ConsumerStackParams, 'consumerRequestsView'>;

export function ConsumerRequestsView() {
  const [pendingEvents, setPendingEvents] = useState<docDataTrio[]>([]);
  const [completedEvents, setCompletedEvents] = useState<docDataTrio[]>([]);
  const [providers, setProviders] = useState<DocumentData[]>([]);

  const navigation = useNavigation<consumerScreenProp>();

  const startProvidersListener = (e_id: string) => {
    // Get interested providers within each event
    onSnapshot(collection(db, `events/${e_id}/interested_providers/`), (proSnap) => {   
      const proList: DocumentData[] = proSnap.docs.map((pro) => ({
        id: pro.id,
        doc: pro.data()
      }));
      console.log('before ' + JSON.stringify(proList));
      
      setProviders(proList);
    });
  }
  
  const getEvents = async () => {
    if (auth.currentUser) {
      const q = query(collection(db, 'events'), where('consumer_id', '==', auth.currentUser.uid))
      const unsub = onSnapshot(q, async (snap) => {
        const compEventPromises: docDataTrio[] = [];
        const penEventPromises: docDataTrio[] = [];
        snap.docs.map(e => {
          let eventObj = {
            id: e.id,
            doc: e.data(),
            interestedProviders: e.data().interestedProviders
          } as docDataTrio;
          if (e.data().accepted_provider_id) 
            compEventPromises.push(eventObj);
          else 
            penEventPromises.push(eventObj);
        });
        
        const penEvents = await Promise.all(penEventPromises);
        const compEvents = await Promise.all(compEventPromises);
        
        setPendingEvents(penEvents);
        setCompletedEvents(compEvents);
      });
      return () => unsub;
    }
  }

  useEffect(() => {
      try {
        getEvents();
      } catch (error) {
        console.error('Error fetching events:', error);
      }
  }, []);

  useEffect(() => {
    const doc_id_true = pendingEvents.find(d => d.doc.accepted === true)?.id;
    const doc_id_false: docDataTrio[] = pendingEvents.filter(d => d.doc.accepted === false);

    if (doc_id_true) {
      updateDB(doc_id_true, true);
    }
    if (doc_id_false) {
      doc_id_false.map((d) => {
        updateDB(d.id, false);
      })
    }
  }, [pendingEvents]);
  
  const updateDB = async (doc_id: string, accepted: boolean) => {
    const docRef = doc(collection(db, 'events/'), doc_id);
    await updateDoc(docRef, {
      accepted
    });
  }

  const formatTime = (time: any) => time.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  const formatDate = (date: any) => date.toDate().toLocaleDateString();

  return (
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40}}>
        Pending Requests
      </Text>
      
      {pendingEvents.map(event => (
        <TouchableOpacity style={{ marginBottom: 10 }} key={event.id} onPress={() => navigation.navigate('multiProviderDetailsView', { event })}>
          <EventBlock event={event} proView={false}/>
          <Text style={{ fontSize: 20 }}>Available Providers:</Text>
          {event.interestedProviders.map((providerInfo: DocumentData) => (
            <View key={providerInfo.provider_id}>
              <Text key={providerInfo.name}>
              {'Name: ' + providerInfo.name}
              </Text>
              <Text key={providerInfo.address}>
              {'Address: ' + providerInfo.address}
              </Text>
            </View >
          ))}
          <Divider width={5} style={{ marginTop: 10 }}/>
        </TouchableOpacity>
      ))}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40}}>
        Accepted Requests
      </Text>
      
      {completedEvents.map((event) => (
        <TouchableOpacity style={{ marginBottom: 10 }} key={event.id} onPress={() => navigation.navigate('singleProviderDetailsView', { event })}>
          <EventBlock event={event} proView={false}/>
          <Text style={{ fontSize: 20 }}>Provider Info</Text>
          {event.interestedProviders.map((providerInfo: DocumentData) => {
            if (providerInfo.provider_id === event.doc.accepted_provider_id) {
              return (
                <View key={providerInfo.provider_id}>
                  <Text>{'Name: ' + providerInfo.name}</Text>
                  <Text>{'Address: ' + providerInfo.address}</Text>
                </View>
              );
            }
          })}
          <Divider width={5} style={{ marginTop: 10 }}/>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}