import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { DocumentData, arrayRemove, arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore'
import { Divider } from '@rneui/base'
import { db } from '../../firebaseConfig'
import { EventBlock } from './EventBlock'
import { docDataPair } from '../providerComponents/ProviderRequestsView'
import { FlatList, ScrollView } from 'react-native-gesture-handler'

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
  const [unwantedProviders, setUnwantedProviders] = useState<string[]>([]);
  const [currAvailPros, setCurrAvailPros] = useState<number | undefined>();

  // Getting the number of already available parking spaces
  useEffect(() => {
    let spaceCount = 0;
    eventData.doc.acceptedProviderIds
      .map((id: string) => eventData.doc.interestedProviders
      .filter((proObj: any) => proObj.id == id)
      .map((pro: DocumentData) => spaceCount += pro.providerSpaces));

    setCurrAvailPros(spaceCount);
    updateSpaceCount(spaceCount);
  }, [])

  const updateSpaceCount = async (accSpaceCount: number) => {
    await setDoc(doc(db, 'events', eventData.id), {
      accSpaceCount
    }, { merge: true });
  }
  
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
  
  // Removing a provider from the consumer view if they have been declined
  const removeLocalData = (id: string) => {
    setUnwantedProviders(current => [...current, id]);
    const updatedProviders = eventData.doc.interestedProviders
    .filter((pro: DocumentData) => pro.id !== id);

    setEventData(prevEventData => {
      return {
        ...prevEventData,
        interestedProviders: updatedProviders
      }
    });

    declineUserId(id, updatedProviders);
  }

  const declineUserId = async (id: string, updatedProviders: any) => {
    await updateDoc(doc(db, 'events', event.id), { 
      interestedProviderIds: arrayRemove(id),
      interestedProviders: updatedProviders,
      unwantedProviders: arrayUnion(id)
    });
  }

  const ProviderBlock = ({providerInfo}: DocumentData) => {
    return (
      <View key={providerInfo.id}>
        <Text key={providerInfo.name}>
        {'Name: ' + providerInfo.name}
        </Text>
        <Text key={providerInfo.address}>
        {'Address: ' + providerInfo.address}
        </Text>
        <Text>
          Spaces able to provider: {providerInfo.providerSpaces} / {eventData.doc.requestedSpaces}
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
    )
  }
  
  return (
    <SafeAreaView style={{ marginLeft: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
        Event: {eventData.doc.eventName}
      </Text>
      <EventBlock event={eventData} showSpaces={false}/>
      <Text style={{ fontSize: 20, marginTop: 10 }}>Interested Providers:</Text>
      <Divider width={5} style={{ marginTop: 10 }}/>
      <ScrollView>
        {eventData.doc.interestedProviders
          .filter((pro: DocumentData) => 
            (!unwantedProviders.includes(pro.id) && !eventData.doc.acceptedProviderIds.includes(pro.id)))
          .map((providerInfo: DocumentData) => (
            <ProviderBlock providerInfo={providerInfo}/>
          ))
        }
      </ScrollView>
      
      {/* <FlatList 
        data={interestedProviders}
        renderItem={({providerInfo}: DocumentData) => <ProviderBlock providerInfo={providerInfo}/>}
        keyExtractor={providerInfo => providerInfo.id}
      /> */}

      <Text>{(currAvailPros == eventData.doc.requestedSpaces) && "Event Request Resolved!"}</Text>
      <Text style={{ fontSize: 20, marginTop: 50 }}>Accepted Providers:</Text>
      <Divider width={5} style={{ marginTop: 10 }}/>
      {eventData.doc.acceptedProviderIds
        .map((proId: string) => eventData.doc.interestedProviders
        .find((proObj: any) => proObj.id == proId))
        .map((accProInfo: DocumentData) => (
          <View key={accProInfo.id}>
            <Text key={accProInfo.name}>
            {'Name: ' + accProInfo.name}
            </Text>
            <Text key={accProInfo.address}>
            {'Address: ' + accProInfo.address}
            </Text>
            <Text>
              {currAvailPros 
                ? `Spaces able to provide: ${accProInfo.providerSpaces} / ${eventData.doc.requestedSpaces}`
                : "Loading..."}
            </Text>
            <Divider width={5} style={{ marginTop: 10 }}/>
          </View >
        ))
      }
    </SafeAreaView>
  )
}

export default MultiProviderDetailsView

const styles = StyleSheet.create({})