import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams, ProviderStackParams } from '../../App'
import { DocumentData, arrayRemove, doc, getDoc, updateDoc } from 'firebase/firestore'
import { Divider } from '@rneui/base'
import { db } from '../../firebaseConfig'
import { docDataTrio } from '../ConsumerRequestsView'
import { EventBlock } from '../consumerComponents/EventBlock'
import { docDataPair } from '../ProviderRequestsView'

type Props = NativeStackScreenProps<ProviderStackParams, 'consumerStatusView'>
/*
    Is there some way that I can have one onSnapshot function listen and update both these pages?
    It isn't necessary since a user may only need updates from one screen, but it could be a good addition
    I could pass in the doc id and just listen to that document. however, i would be opening up many snapshots
    since many events could be looked at. 
*/
const ConsumerStatusView = ({ route }: Props) => {
  const { event } = route.params;
  const [eventData, setEventData] = useState<docDataPair>(event);
  const [providerInfo, setProviderInfo] = useState<DocumentData>();
  
  const getProviderInfo = async () => {
    const userSnap = await getDoc(doc(db, 'users/', eventData.doc.accepted_provider_id))
    if (userSnap.exists())   
      setProviderInfo(userSnap.data());
  }
  useEffect(() => {
    getProviderInfo();
  }, [])
  
  const hasArrived = () => {
    if (eventData.doc.consumerParkingStatus)
      return (
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40}}>The guest has arrived at your space!</Text>
      )
    return (
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40}}>The guest isn't there yet!</Text>
    )
  
  }
  return (
    <SafeAreaView style={{ marginLeft: 30 }}>
      <Text>Provider Info:</Text>
      <Text>{providerInfo!.name}</Text>
      <Text>{providerInfo!.address}</Text>
      <Text style={{ paddingTop: 30 }}>Event Info:</Text>
      <EventBlock event={eventData} proView={true}/>
      <View style={{ paddingTop: 30}}>
        {hasArrived()}
      </View>
    </SafeAreaView>
  )
}

export default ConsumerStatusView

const styles = StyleSheet.create({})