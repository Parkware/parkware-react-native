import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Button } from 'react-native';
import { DocumentData, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { Divider } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { EventBlock } from './EventBlock';
import { docDataPair } from '../providerComponents/ProviderRequestsView';

export type consumerScreenProp = NativeStackNavigationProp<ConsumerStackParams, 'consumerRequestsView'>;

export function ConsumerRequestsView() {
  const [pendingEvents, setPendingEvents] = useState<docDataPair[]>([]);
  const [completedEvents, setCompletedEvents] = useState<docDataPair[]>([]);

  const navigation = useNavigation<consumerScreenProp>();
  
  const modProviders = (eventData: DocumentData) => {
    if (eventData)
      return eventData.interestedProviders
      .filter((proData: DocumentData) => 
        eventData.interestedProviderIds.includes(proData.id));
  }

  const getEvents = async () => {
    if (auth.currentUser) {
      const q = query(collection(db, 'events'), where('consumer_id', '==', auth.currentUser.uid))
      const unsub = onSnapshot(q, async (snap) => {
        const compEventPromises: docDataPair[] = [];
        const penEventPromises: docDataPair[] = [];
        snap.docs.map(async e => {
          // Getting only the provider data where the provider is included in the array of provider ids. 
          const newPros = modProviders(e.data());
                            
          let eventObj = {
            id: e.id,
            doc: {
              ...e.data(),
              interestedProviders: newPros
            },
          } as docDataPair;

          // Will need to ensure that accepted providers are never greater than the requested number
          // need to check if the total spaces of the accepted providers is equal to the requestedSpaces
          if (e.data().acceptedProviderIds.length >= e.data().requestedSpaces) {
            // this should not be updated in the client-side. needs to be a separate cloud function
            compEventPromises.push(eventObj);
            await updateDoc(doc(db, 'events', e.id), {
              isOpen: false,
            })
          } else 
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

  const providerNameText = async (proId: any) => {
    const userSnap = await getDoc(doc(db, 'users/', proId))
    if (userSnap.exists()){   
      return <Text>{userSnap.data().name}</Text>
    }
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
          {event.doc.interestedProviders.map((providerInfo: DocumentData) => (
            <View key={providerInfo.id}>
              <Text key={providerInfo.name}>
              {'Name: ' + providerInfo.name}
              </Text>
              <Text key={providerInfo.address}>
              {'Address: ' + providerInfo.address}
              </Text>
            </View>
          ))}
          <Divider width={5} style={{ marginTop: 10 }}/>
        </TouchableOpacity>
      ))}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40}}>
        Accepted Requests
      </Text>
      
      {completedEvents.map((event) => (
        <TouchableOpacity style={{ marginBottom: 10 }} key={event.id} onPress={() => navigation.navigate('chooseProviderView', { event })}>
          <Text style={{ fontSize: 15 }}>Click here to get more info about your event</Text>
          <EventBlock event={event} proView={true}/>
          <Divider width={5} style={{ marginTop: 10 }}/>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}