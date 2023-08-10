import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { DocumentData, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
import { Divider } from '@rneui/base'

type Props = NativeStackScreenProps<ConsumerStackParams, 'chooseProviderView'>

/*
    Is there some way that I can have one onSnapshot function listen and update both these pages?
    It isn't necessary since a user may only need updates from one screen, but it could be a good addition
    I could pass in the doc id and just listen to that document. however, i would be opening up many snapshots
    since many events could be looked at. 
*/

const ChooseProviderView = ({ route }: Props) => {
  const { event } = route.params;
  const [timeRemaining, setTimeRemaining] = useState('');
  const startTime = event.doc.startTime.toDate();
  const [diff, setDiff] = useState<number>();
  const [providerInfo, setProviderInfo] = useState<DocumentData>();
  const [shareableLink, setShareableLink] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = startTime.getTime() - now.getTime();
      setDiff(difference);
      if (difference <= 0) {
        clearInterval(interval);
        setTimeRemaining("Parking Time!");
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);

        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getProviderInfo = async () => {
    const eventSnap = await getDoc(doc(db, 'events/', event.id))
    if (eventSnap.exists()) {
      const proInfo: any = eventSnap.data().acceptedProviderIds
        .map((proId: string) => eventSnap.data().interestedProviders
        .find((proObj: any) => proObj.id == proId))
      setProviderInfo(proInfo);
      setShareableLink('https://parkware1.web.app/' + event.id);
    }
  }

  useEffect(() => {
    getProviderInfo();
  }, [])


  // if (providerInfo && chosenProviderId.length != 0) {
  //   const chosenProInfo = providerInfo.find((info: any) => info.id == chosenProviderId);
  //   navigation.replace('departureGuestView', {
  //     providerInfo: chosenProInfo, 
  //     eventId: event.id 
  //   })
  // }

  return (
    <SafeAreaView style={{ marginLeft: 25, marginTop: 30 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 20 }}>
          Event: {event.doc.eventName}
        </Text>
      {providerInfo ? providerInfo.map((proObj: DocumentData) => (
        <View key={proObj.id} style={{ marginBottom: 10}}>
          <Text key={proObj.name}>Provider Name: {proObj.name}</Text>
          <Text key={proObj.address}>Address: {proObj.address}</Text>
          {proObj.notes === undefined 
           ? <Text>The provider has not updated any notes yet</Text>
           : <Text key={proObj.notes}>Notes: {proObj.notes}</Text>
          }
          <Text key={proObj.providerSpaces}>Parking Spaces: {proObj.providerSpaces}</Text>
        </View>
      )) : <Text>Loading...</Text>}
      {diff && diff > 0 && 
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
          {timeRemaining} till your parking event.
        </Text>
      }
      <View style={{ marginTop: 75 }}>
        <Text style={{ marginBottom: 10, fontSize: 17 }}>
          Share the link below with other guests so that they can update their status to the providers
        </Text>
        <Text style={{ color: 'blue', fontSize: 17 }}
              onPress={() => Linking.openURL(shareableLink)}>
          {shareableLink.replace('https://', '')}
        </Text>
      </View>
    </SafeAreaView>
  )
}

export default ChooseProviderView

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
})