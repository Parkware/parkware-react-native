import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { DocumentData, arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { Divider } from '@rneui/base'
import { db } from '../../firebaseConfig'
import { EventBlock } from './EventBlock'
import { docDataPair } from '../providerComponents/ProviderRequestsView'

type Props = NativeStackScreenProps<ConsumerStackParams, 'multiProviderDetailsView'>
/*
    Is there some way that I can have one onSnapshot function listen and update both these pages?
    It isn't necessary since a user may only need updates from one screen, but it could be a good addition
    I could pass in the doc id and just listen to that document. however, i would be opening up many snapshots
    since many events could be looked at. 
*/
const MultiProviderDetailsView = ({ route }: Props) => {
  const { event } = route.params;
  const [eventData, setEventData] = useState<docDataPair>(event);
  const [disabledButtons, setDisabledButtons] = useState<DocumentData>({});
  const [unwantedPros, setUnwantedPros] = useState<string[]>([]);
  const [currAvailPros, setCurrAvailPros] = useState<number | undefined>();

  useEffect(() => {
    let spaceCount = 0;
    eventData.doc.interestedProviders.map((pro: any) => {
      spaceCount += pro.providerSpaces;
    });
    setCurrAvailPros(spaceCount);
  }, [])
  
  const disableButton = (providerId: string) => {
    setDisabledButtons((prevState) => ({
      ...prevState,
      [providerId]: true, // Set the specific provider's button as disabled
    }));
    setAcceptStatus(providerId);
  };
  
  const setAcceptStatus = async (currProviderId: string) => {
    await updateDoc(doc(db, 'events', event.id), { 
      acceptedProviderIds: arrayUnion(currProviderId),
      consumerParkingStatus: false,
    });
  }
  
  // Removing a provider from the consumer view if they have been declined...sorry:(
  const removeLocalData = (id: string) => {
    setUnwantedPros(current => [...current, id]);
    const updatedProviders = eventData.doc.interestedProviders
    .filter((pro: DocumentData) => pro.id !== id);

    setEventData(prevEventData => {
      return {
        ...prevEventData,
        interestedProviders: updatedProviders
      }
    });
    
    declineUserId(id);
  }

  const declineUserId = async (decProId: string) => {
    await updateDoc(doc(db, 'events', event.id), { 
      interestedProviderIds: arrayRemove(decProId),
    });
  }
  
  return (
    <SafeAreaView style={{ marginLeft: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
          Event: {eventData.doc.eventName}
      </Text>
      <EventBlock event={eventData} proView={false}/>
      <Text style={{ fontSize: 20, marginTop: 10 }}>Available Providers:</Text>
      <Divider width={5} style={{ marginTop: 10 }}/>
      {eventData.doc.interestedProviders
        .filter((pro: DocumentData) => !unwantedPros.includes(pro.id))
        .map((providerInfo: DocumentData) => (
          <View key={providerInfo.id}>
            <Text key={providerInfo.name}>
            {'Name: ' + providerInfo.name}
            </Text>
            <Text key={providerInfo.address}>
            {'Address: ' + providerInfo.address}
            </Text>
            <Text>
              {currAvailPros 
                ? `Spaces able to provide: ${currAvailPros} / ${eventData.doc.requestedSpaces}`
                : "Loading..."}
            </Text>
            <Button
              title='Accept' 
              onPress={() => disableButton(providerInfo.id)} 
              disabled={disabledButtons[providerInfo.id]} 
            />
            <Button 
              title='Decline' 
              onPress={() => removeLocalData(providerInfo.id)} 
              disabled={disabledButtons[providerInfo.id]} 
            />
            <Divider width={5} style={{ marginTop: 10 }}/>
          </View >
        ))
      }
    </SafeAreaView>
  )
}

export default MultiProviderDetailsView

const styles = StyleSheet.create({})