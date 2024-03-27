import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Platform } from 'react-native';
import { DocumentData, collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TouchableOpacity } from 'react-native';
import { docDataPair } from '../providerComponents/ProviderRequestsView';
import { AppButton } from '../ButtonComponents';
import { User, onAuthStateChanged } from 'firebase/auth';

export type consumerScreenProp = NativeStackNavigationProp<ConsumerStackParams, 'consumerRequestsView'>;

export function ConsumerRequestsView() {
  const [pendingEvents, setPendingEvents] = useState<docDataPair[]>([]);
  const [completedEvents, setCompletedEvents] = useState<docDataPair[]>([]);
  const [userName, setUserName] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => setUser(user));
    
    return unsubscribe;
  }, [])

  useEffect(() => {
    if (user?.uid) {
      updateName();
      getEvents();
    }
  }, [user])

  const navigation = useNavigation<consumerScreenProp>();

  const switchView = () => navigation.navigate('makeRequestScreen');

  const updateName = async () => {
    const userSnap = await getDoc(doc(db, 'users', user!.uid))
    if (userSnap.exists())
      setUserName(userSnap.data().name);
  }

  const modProviders = (eventData: DocumentData) => {
    if (eventData)
      return eventData.interestedProviders
      .filter((proData: DocumentData) => 
        eventData.interestedProviderIds.includes(proData.id));
  }

  const getEvents = async () => {
    if (user) {
      const q = query(collection(db, 'events'), where('consumer_id', '==', user.uid))
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
          
          // Can add another condition to add previously ended events to an ended event list. 
          if (!e.data().isOpen || e.data().eventEnded)
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

  const EventBlock = ({event, showSpaces}: any) => {
    const formatTime = (time: any) => time.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const formatDate = (date: any) => date.toDate().toLocaleDateString();
    
    return (
      <View>
        <Text key={event.doc.eventName+event.id} style={styles.eventText} >
          {'Event name: ' + event.doc.eventName}
        </Text>
        <Text key={event.doc.address} style={styles.eventText}>
          {'Address: ' + event.doc.address}
        </Text>
        <Text key={event.doc.accepted_provider_id} style={styles.eventText}>
          {'Date: ' + formatDate(event.doc.startTime)}
        </Text>
        <Text key={event.doc.startTime} style={styles.eventText}>
          {'Time Range: ' + formatTime(event.doc.startTime) + '-' + formatTime(event.doc.endTime)}
        </Text>
        {showSpaces && 
          <View>
            <Text key={event.doc.requestedSpaces + 1} style={styles.eventText}>
              {`Spaces: ${event.doc.accSpaceCount} / ${event.doc.requestedSpaces}`}
            </Text>
          </View>
        }
      </View>
    );
  }

  return (
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center'  }}>
      <View style={{ paddingTop: Platform.OS === "android" ? 30 : 0 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {pendingEvents.length !== 0 && (
            <Text style={[styles.requestHeader, { marginTop: 15 }]}>
              Pending
            </Text>
          )}
          <View>
            {pendingEvents.map(event => (
              <TouchableOpacity style={styles.eventBlock} key={event.id} onPress={() => navigation.navigate('chooseProviderView', { event })}>
                <View style={{ padding: 10 }}>
                  <EventBlock event={event} showSpaces={true} />
                  {event.doc.interestedProviders.length !== 0
                    && ( 
                    <View>
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
                  }
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {completedEvents.length !== 0 && (
            <Text style={[styles.requestHeader, { marginTop: 15 }]}>
              Accepted
            </Text>
          )}
          {(completedEvents.length == 0 && pendingEvents.length == 0) && <Text style={styles.requestHeader}>No events as of now!</Text>}
          <View>
            {completedEvents.map((event) => (
              <TouchableOpacity style={styles.eventBlock} key={event.id} onPress={() => navigation.navigate('eventInfoView', { event })}>
                <View style={{ padding: 10 }}>
                <EventBlock event={event} showSpaces={false} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <AppButton
            title="Request Spaces"
            onPress={switchView}
            extraStyles={{ marginTop: 7, marginBottom: 30 }}
          />
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
  },
  headerStyleIOS: { 
    fontSize: 16, 
    marginTop: 10, 
    marginRight: -5 
  },
  headerStyleAndroid: {
    fontSize: 16, 
    marginTop: 10, 
    marginRight: -5 
  }
});