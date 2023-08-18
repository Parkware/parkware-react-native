import { Alert, Button, StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity, Platform, SafeAreaView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { DocumentData, arrayRemove, arrayUnion, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
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
  const [unwantedProviders, setUnwantedProviders] = useState<string[]>([]);
  const [currAvailPros, setCurrAvailPros] = useState<number | undefined>();
  const [showBackInfo, setShowBackInfo] = useState(false);
  const [editSpaces, setEditSpaces] = useState('');
  const [focus, setFocus] = useState(false);
  const refInput = useRef<TextInput | null>(null);

  // Getting the number of already available parking spaces
  useEffect(() => {
    let spaceCount = 0;
    eventData.doc.acceptedProviderIds
      .map((id: string) => eventData.doc.interestedProviders
      .filter((proObj: DocumentData) => proObj.id == id)
      .map((pro: DocumentData) => spaceCount += pro.providerSpaces));
    setCurrAvailPros(spaceCount);
  }, [])
  
  const disableButton = (providerId: string) => {
    setDisabledButtons((prevState) => ({
      ...prevState,
      [providerId]: true, // Set the specific provider's button as disabled
    }));
    setShowBackInfo(true);
    updateAcceptStatus(providerId);
  };
  
  const updateAcceptStatus = async (currProviderId: string) => {
    const accProObj = eventData.doc.interestedProviders
      .find((proObj: DocumentData) => currProviderId == proObj.id)
    let otherInfo = eventData.doc.interestedProviders
      .filter((proObj: DocumentData) => currProviderId !== proObj.id)
    
    if (eventData.doc.requestedSpaces - eventData.doc.accSpaceCount < accProObj.providerSpaces) {
      const addSpacesCount = eventData.doc.requestedSpaces - eventData.doc.accSpaceCount;
      otherInfo.push({
        ...accProObj,
        providerSpaces: addSpacesCount
      });
      showSpaceChange(addSpacesCount, accProObj.name);
    } else
      otherInfo.push(accProObj);

    await updateDoc(doc(db, 'events', event.id), { 
      acceptedProviderIds: arrayUnion(currProviderId),
      interestedProviders: otherInfo
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

  const showConfirmDel = () =>
    Alert.alert('Are you sure you want to delete this event?', 'All providers will be notified. ', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', onPress: () => delEventReq()},
    ]);

  const showSpaceChange = (addSpacesCount: number, providerName: string) => 
    Alert.alert(`You have booked ${addSpacesCount} space(s) at ${providerName}'s location.`, 
                'Spaces able to be provided was greater what the event needed.');
    
  const delEventReq = async () => {
    await deleteDoc(doc(db, "events", eventData.id));
  }

  const updateSpaces = async () => {
    await updateDoc(doc(db, "events", eventData.id), { requestedSpaces: Number(editSpaces) });
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
        <Text key={providerInfo.address.slice(0, 3)} style={{ marginBottom: 10 }}>
          Spaces able to provide: {providerInfo.providerSpaces} / {eventData.doc.requestedSpaces}
        </Text>
        <Button
          title='Accept' 
          onPress={() => disableButton(providerInfo.id)} 
          disabled={disabledButtons[providerInfo.id]} 
          key={providerInfo.providerSpaces[0]}
        />
        <Button 
          title='Decline' 
          onPress={() => removeLocalData(providerInfo.id)} 
          disabled={disabledButtons[providerInfo.id]} 
          key={providerInfo.providerSpaces[1]}
        />
        <Divider width={5} style={{ marginTop: 10 }}/>
      </View >
    )
  }
  
  const changeSpaceCount = () => {
    if (refInput.current != null)
      if (focus) {
        refInput.current.blur();
        setFocus(false);
      } else {
        refInput.current.focus()
        setFocus(true);
      }
  }

  return (
    <SafeAreaView style={{ paddingLeft: 20, paddingRight: 20, marginTop: 30, marginLeft: 10 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row"}}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
            Event: {eventData.doc.eventName}
          </Text>
          <View style={{ marginTop: 30, marginLeft: 35 }}>
            <Button
              title="Cancel Request"
              onPress={showConfirmDel}
            />
          </View>
        </View>
        <EventBlock event={eventData} showSpaces={false} showEditSpaces={true} showName={false}/>
        <Text>
          {eventData.doc.accSpaceCount == 0 ? 'No spaces available yet' : `Current Parking Spaces: ${event.doc.accSpaceCount}`}
        </Text>
        <View style={{flexDirection: 'row'}}>
          <Text>Requested Spaces:</Text>
          <TextInput 
            ref={refInput}
            value={editSpaces}
            onChangeText={setEditSpaces}
            placeholder={event.doc.requestedSpaces.toString()}
            keyboardType='numeric'
            placeholderTextColor="#000"
            style={
              Platform.OS == 'ios' 
              ? { marginLeft: 3, marginBottom: 20}
              : { marginTop: -3.5, marginLeft: 3}}
          />
          <TouchableOpacity onPress={changeSpaceCount} style={{ marginLeft: 20 }}>
            <Text style={{ color: '#007AFF', fontSize: 15 }}>{focus ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>
        </View>
        {editSpaces.length !== 0 &&
          <Button
            title="Update Changes"
            onPress={updateSpaces}
          />
        }
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
        {showBackInfo && <Text>Go back and re-enter screen to see changes!</Text>}
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
              <Text key={accProInfo.providerSpaces}>
                {currAvailPros 
                  ? `Spaces able to provide: ${accProInfo.providerSpaces} / ${eventData.doc.requestedSpaces}`
                  : "Loading..."}
              </Text>
              <Divider width={5} style={{ marginTop: 10 }}/>
            </View >
          ))
        }
      </ScrollView>
    </SafeAreaView>
  )
}

export default MultiProviderDetailsView

const styles = StyleSheet.create({})