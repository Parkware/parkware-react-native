import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../App'
import { DocumentData, doc, updateDoc } from 'firebase/firestore'
import { Divider } from '@rneui/base'
import { db } from '../firebaseConfig'

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

  const setAcceptStatus = async (provider_id: string) => {
    await updateDoc(doc(db, 'events/', event.id), { accepted_provider_id: provider_id });
    setSentEvent(true);
  }
  
  const setDeclineStatus = (provider_id: string) => {
    setSentEvent(true);
  }
  
  return (
    <SafeAreaView style={{ marginLeft: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
            Event {event.id.slice(0, 3)}
        </Text>
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
        <Text style={{ fontSize: 20, marginTop: 10 }}>Available Providers:</Text>
        <Divider width={5} style={{ marginTop: 10 }}/>
        {event.interestedProviders.map((providerInfo: DocumentData) => (
            <View key={providerInfo.provider_id}>
                <Text key={providerInfo.name}>
                {'Name: ' + providerInfo.name}
                </Text>
                <Text key={providerInfo.address}>
                {'Address: ' + providerInfo.address}
                </Text>
                <Button title='Accept' onPress={() => setAcceptStatus(providerInfo.provider_id)} disabled={sentEvent}/>
                <Button title='Decline' onPress={() => setDeclineStatus(providerInfo.provider_id)} disabled={sentEvent}/>
                <Divider width={5} style={{ marginTop: 10 }}/>
            </View >
        ))}
        </View>         
    </SafeAreaView>
  )
}

export default MultiProviderDetailsView

const styles = StyleSheet.create({})