import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { DocumentData, collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { Divider } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TouchableOpacity } from 'react-native';
import { EventBlock } from './EventBlock';
import { docDataPair } from '../providerComponents/ProviderRequestsView';

export type consumerScreenProp = NativeStackNavigationProp<ConsumerStackParams, 'consumerRequestsView'>;

export function ConsumerRequestsView() {
  const [pendingEvents, setPendingEvents] = useState<docDataPair[]>([]);
  const [completedEvents, setCompletedEvents] = useState<docDataPair[]>([]);
  const [userName, setUserName] = useState('');

  const navigation = useNavigation<consumerScreenProp>();
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ marginTop: 10, height: 45 }}>
          <Text style={{ fontSize: 16, fontFamily: 'Al Nile' }}>Logged in as {userName}</Text>
        </View>
      ),
    });
  }, [navigation, userName]);

  const updateName = async () => {
    const userSnap = await getDoc(doc(db, 'users', auth.currentUser!.uid))
    if (userSnap.exists())
      setUserName(userSnap.data().name);
  }
  useEffect(() => {
    updateName();
  }, [])
  
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
          const interestedProviders = modProviders(e.data());

          let eventObj = {
            id: e.id,
            doc: {
              ...e.data(),
              interestedProviders,
            },
          } as docDataPair;
          
          // Will need to ensure that accepted providers are never greater than the requested number
          if (!e.data().isOpen)
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

  return (
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
      <View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.requestHeader, { marginTop: 15 }]}>
            Pending Requests
          </Text>
          <ScrollView>
            {pendingEvents.map(event => (
              <TouchableOpacity style={styles.eventBlock} key={event.id} onPress={() => navigation.navigate('multiProviderDetailsView', { event })}>
                <View style={{ padding: 10 }}>
                  <EventBlock event={event} showSpaces={true} showEditSpaces={false} showName={true} eventText={styles.eventText}/>
                  {event.doc.interestedProviders.length !== 0
                    ? ( 
                    <View>
                      {/* <Divider width={2} color="#687487" style={{ marginVertical: 6, borderRadius: 10 }}/> */}
                      <Text style={{ fontSize: 18, marginBottom: 4, marginTop: 7, color: "white" }}>Available Providers:</Text>
                      {event.doc.interestedProviders
                        .filter((pro: DocumentData) => !event.doc.acceptedProviderIds.includes(pro.id))
                        .map((providerInfo: DocumentData) => (
                        <View key={providerInfo.id}>
                          <Text key={providerInfo.name} style={{ color: "white" }}>
                          {'Name: ' + providerInfo.name}
                          </Text>
                          <Text key={providerInfo.address} style={{ color: "white" }}>
                          {'Address: ' + providerInfo.address}
                          </Text>
                        </View>
                      ))}
                    </View>
                    )
                    : <Text style={styles.eventText}>No providers are interested yet.</Text>
                  }
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.requestHeader, { marginTop: 20 }]}>
            Accepted Requests
          </Text>
          <ScrollView>
            {completedEvents.map((event) => (
              <TouchableOpacity style={styles.eventBlock} key={event.id} onPress={() => navigation.navigate('chooseProviderView', { event })}>
                <View style={{ padding: 10 }}>
                  <EventBlock event={event} showSpaces={false} showEditSpaces={false} showName={true} eventText={styles.eventText}/>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  eventBlock: { 
    borderWidth: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 5,
    borderColor: "#9e9e9e", 
    backgroundColor: "#8797AF",
  },
  requestHeader: { 
    fontSize: 23, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    alignSelf: "center",
  },
  eventText: {
    fontSize: 17,
    padding: 1,
    color: "white"
  }
});