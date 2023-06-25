import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ProviderStackParams } from '../../App'
import { DocumentData, doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
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
  const [consumerInfo, setConsumerInfo] = useState<DocumentData>();
  
  const getConsumerInfo = async () => {
    const userSnap = await getDoc(doc(db, 'users/', eventData.doc.consumer_id))
    if (userSnap.exists())   
      setConsumerInfo(userSnap.data());
  }
  
  useEffect(() => {
    getConsumerInfo();
  }, [])
  
  const GetArrivalStatus = () => {
    if (eventData.doc.consumerParkingStatus)
      return (
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40}}>
          The guest has arrived at your space!
        </Text>
      )
    return (
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40}}>
        The guest isn't there yet!
      </Text>
    )
  }

  const RenderConsInfo = () => {
    if (consumerInfo)
      return (
        <View>
          <Text>{consumerInfo.name}</Text>
          <Text>{consumerInfo.email}</Text>
        </View>
      )
    return (
      <Text>Loading...</Text>
    )
  }
  return (
    <SafeAreaView style={{ marginLeft: 30 }}>
      <Text>Consumer Info:</Text>
      <RenderConsInfo />
      <Text style={{ paddingTop: 30 }}>Event Info:</Text>
      <EventBlock event={eventData} proView={true}/>
      <View style={{ paddingTop: 30}}>
        <GetArrivalStatus />
      </View>
    </SafeAreaView>
  )
}

export default ConsumerStatusView

const styles = StyleSheet.create({})