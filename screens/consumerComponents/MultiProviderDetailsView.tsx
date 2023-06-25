import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { DocumentData, arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { Divider } from '@rneui/base'
import { db } from '../../firebaseConfig'
import { docDataTrio } from '../ConsumerRequestsView'
import { EventBlock } from './EventBlock'

type Props = NativeStackScreenProps<ConsumerStackParams, 'multiProviderDetailsView'>
/*
    Is there some way that I can have one onSnapshot function listen and update both these pages?
    It isn't necessary since a user may only need updates from one screen, but it could be a good addition
    I could pass in the doc id and just listen to that document. however, i would be opening up many snapshots
    since many events could be looked at. 
*/
const MultiProviderDetailsView = ({ route }: Props) => {
  const [sentEvent, setSentEvent] = useState(false);
  const { event } = route.params;
  const [eventData, setEventData] = useState<docDataTrio>(event);

  const setAcceptStatus = async (currProviderId: string) => {
    await updateDoc(doc(db, 'events/', event.id), { 
      acceptedProviderIds: arrayUnion(currProviderId),
      consumerParkingStatus: false,
    });
    setSentEvent(true);
  }
  
  // Removing a provider from the consumer view if they have been declined...sorry:(
  const removeLocalData = (provider_id: string) => {
    const updatedProviders = eventData.interestedProviders.filter(pro => {
      if (pro.provider_id !== provider_id) return pro;
    })
    
    setEventData(prevEventData => {
      return {
        ...prevEventData,
        interestedProviders: updatedProviders
      }
    })
    return updatedProviders
  }

  return (
    <SafeAreaView style={{ marginLeft: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
          Event {eventData.id.slice(0, 3)}
      </Text>
      <EventBlock event={eventData} proView={false}/>
      <Text style={{ fontSize: 20, marginTop: 10 }}>Available Providers:</Text>
      <Divider width={5} style={{ marginTop: 10 }}/>
      {eventData.interestedProviders.map((providerInfo: DocumentData) => (
        <View key={providerInfo.provider_id}>
            <Text key={providerInfo.name}>
            {'Name: ' + providerInfo.name}
            </Text>
            <Text key={providerInfo.address}>
            {'Address: ' + providerInfo.address}
            </Text>
            <Button title='Accept' onPress={() => setAcceptStatus(providerInfo.provider_id)} disabled={sentEvent}/>
            <Button title='Decline' onPress={() => removeLocalData(providerInfo.provider_id)} disabled={sentEvent}/>
            <Divider width={5} style={{ marginTop: 10 }}/>
        </View >
      ))}
    </SafeAreaView>
  )
}

export default MultiProviderDetailsView

const styles = StyleSheet.create({})