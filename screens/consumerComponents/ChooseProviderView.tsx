import { Alert, StyleSheet, Text, TextInput, View, ScrollView, Platform, SafeAreaView, Linking } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { DocumentData, arrayRemove, arrayUnion, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
import { docDataPair } from '../providerComponents/ProviderRequestsView'
import { AppButton } from '../ButtonComponents'
import { useNavigation } from '@react-navigation/native'

type Props = NativeStackScreenProps<ConsumerStackParams, 'chooseProviderView'>
type navigationProps = NativeStackNavigationProp<ConsumerStackParams, 'chooseProviderView'>;

/*
    Is there some way that I can have one onSnapshot function listen and update both these pages?
    It isn't necessary since a user may only need updates from one screen, but it could be a good addition
    I could pass in the doc id and just listen to that document. however, i would be opening up many snapshots
    since many events could be looked at. 
*/
const ChooseProviderView = ({ route }: Props) => {
  const { event } = route.params;
  const [eventData, setEventData] = useState<docDataPair>(event);
  const [disabledButtons, setDisabledButtons] = useState<DocumentData>({});
  const [unwantedProviders, setUnwantedProviders] = useState<string[]>([]);
  const [currAvailPros, setCurrAvailPros] = useState<number | undefined>();
  const [editSpaces, setEditSpaces] = useState('');
  const [focus, setFocus] = useState(false);
  const [spacePlaceholder, setSpacePlaceholder] = useState(event.doc.requestedSpaces.toString())
  const shareableLink = 'https://parkware1.web.app/' + event.id + '/provide'

  const refInput = useRef<TextInput | null>(null);

  const navigation = useNavigation<navigationProps>();

  // Getting the number of already available parking spaces by iterating through providers
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
    addAcceptedProvider(providerId);
    Alert.alert('The provider has been notified.', '', [
      {text: 'Ok', onPress: () => navigation.goBack()},
    ]);
  };
  
  const addAcceptedProvider = async (currProviderId: string) => {
    const accProObj = eventData.doc.interestedProviders
      .find((proObj: DocumentData) => currProviderId == proObj.id)
    let otherInfo = eventData.doc.interestedProviders
      .filter((proObj: DocumentData) => currProviderId !== proObj.id)
    
    // showSpaceChange(neededSpaces, accProObj.name);
    
    otherInfo.push({
      ...accProObj,
      providerSpaces: Math.min(accProObj.providerSpaces, eventData.doc.requestedSpaces - eventData.doc.accSpaceCount)
    });

    await updateDoc(doc(db, 'events', event.id), { 
      acceptedProviderIds: arrayUnion(currProviderId),
      interestedProviders: otherInfo
    });
  }

  // const showSpaceChange = (addSpacesCount: number, providerName: string) => 
  // Alert.alert(`You have booked ${addSpacesCount} space(s) at ${providerName}'s location.`, 
  //             'Spaces able to be provided was greater what the event needed.');
  
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

  const delEventReq = async () => {
    await deleteDoc(doc(db, "events", eventData.id));
    navigation.goBack()
  }

  const updateSpaces = async () => {
    await updateDoc(doc(db, "events", eventData.id), { requestedSpaces: Number(editSpaces) });
    showUpdateSuccess();
  }

  const showUpdateSuccess = () =>
    Alert.alert('Your requested space count has been updated!', '', [
      {text: 'Ok', onPress: resetEditSpaces},
    ]);

  const resetEditSpaces = () => {
    if (refInput.current != null) {
      setSpacePlaceholder(editSpaces);
      setEditSpaces('');
      refInput.current.blur();
      setFocus(false);
    }
  }

  const ProviderBlock = ({providerInfo}: DocumentData) => {
    return (
      <View key={providerInfo.id}>
        <Text key={providerInfo.name} style={styles.eventText}>
          {'Name: ' + providerInfo.name}
        </Text>
        <Text key={providerInfo.address} style={styles.eventText}>
          {'Address: ' + providerInfo.address}
        </Text>
        <Text key={providerInfo.address.slice(0, 3)} style={[styles.eventText, { marginBottom: 10 }]}>
          Spaces able to provide: {providerInfo.providerSpaces} / {eventData.doc.requestedSpaces}
        </Text>
        <AppButton title="Accept" extraStyles={styles.eventButton} onPress={() => disableButton(providerInfo.id)}/>
        <AppButton title="Decline" extraStyles={styles.eventButton} onPress={() => removeLocalData(providerInfo.id)}/>
      </View>
    )
  }
  
  const changeSpaceCount = () => {
    if (refInput.current != null)
      if (focus) {
        refInput.current.blur();
        refInput.current.clear();
        setEditSpaces('');
        setFocus(false);
      } else {
        refInput.current.focus()
        setFocus(true);
      }
  }

  const EventBlock = () => {
    const formatTime = (time: any) => time.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const formatDate = (date: any) => date.toDate().toLocaleDateString();
    
    return (
      <View>
        <Text key={event.doc.address} style={styles.eventText}>
          {'Address: ' + event.doc.address}
        </Text>
        <Text key={event.doc.endTime} style={styles.eventText}>
          {'Date: ' + formatDate(event.doc.startTime)}
        </Text>
        <Text key={event.doc.startTime} style={styles.eventText}>
          {'Time Range: ' + formatTime(event.doc.startTime) + '-' + formatTime(event.doc.endTime)}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: "#e3e3e3" }}>
      <View style={{ margin: 9, paddingTop: Platform.OS === "android" ? 90 : 0 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.card, styles.shadowProp]}>
            <View style={{ flexDirection: "row", marginTop: 7}}>
              <Text style={styles.eventHeader}>
                Name: {eventData.doc.eventName}
              </Text>
              <View style={{ marginTop: -5, marginLeft: 35 }}>
                <AppButton
                  title="Cancel"
                  onPress={showConfirmDel}
                  extraStyles={{height: 35}}
                />
              </View>
            </View>
            <EventBlock />
            <Text style={styles.eventText}>
              Current Spaces: {event.doc.accSpaceCount}
            </Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.eventText}>Requested Spaces:</Text>
              <TextInput 
                ref={refInput}
                value={editSpaces}
                onChangeText={setEditSpaces}
                placeholder={spacePlaceholder}
                keyboardType='numeric'
                placeholderTextColor="#454852"
                style={[
                  Platform.OS == 'ios' 
                  ? { marginLeft: 3, marginBottom: 10}
                  : { marginTop: -5, marginLeft: 4 },
                {fontSize: 17}
                ]}
              />
              <AppButton
                  title={focus ? "Cancel" : "Edit"}
                  onPress={changeSpaceCount}
                  extraStyles={{height: 35, marginLeft: 60, marginTop: -4}}
                />
            </View>
            {editSpaces.length !== 0 &&
              <AppButton
                title="Update Changes"
                onPress={updateSpaces}
                extraStyles={{ width: 170, alignSelf: "center" }}
              />
            }
            <Text style={styles.link} onPress={() => Linking.openURL(shareableLink)}>
                Link to share with providers
            </Text>
          </View>
          <Text style={styles.providerHeader}>Interested Providers:</Text>
            {eventData.doc.interestedProviders
              .filter((pro: DocumentData) =>
                // only want providers who haven't already been accepted or denied
                (!unwantedProviders.includes(pro.id) && !eventData.doc.acceptedProviderIds.includes(pro.id)))
              .map((providerInfo: DocumentData) => (
                <View style={[styles.card, styles.shadowProp]}>
                  <ProviderBlock providerInfo={providerInfo}/>
                </View>
              ))
            }
          <Text style={[{ marginTop: 80 }, styles.providerHeader]}>Accepted Providers:</Text>
          {eventData.doc.acceptedProviderIds
            .map((proId: string) => eventData.doc.interestedProviders
            .find((proObj: any) => proObj.id == proId))
            .map((accProInfo: DocumentData) => (
              <View key={accProInfo.id} style={styles.accProviderBlock}>
                <Text key={accProInfo.name} style={styles.providerText}>
                {'Name: ' + accProInfo.name}
                </Text>
                <Text key={accProInfo.address} style={styles.providerText}>
                {'Address: ' + accProInfo.address}
                </Text>
                <Text key={accProInfo.providerSpaces} style={styles.providerText}>
                  {currAvailPros 
                    ? `Spaces able to provide: ${accProInfo.providerSpaces} / ${eventData.doc.requestedSpaces}`
                    : "Loading..."}
                </Text>
              </View>
            ))
          }
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}



export default ChooseProviderView

const styles = StyleSheet.create({
  eventHeader: { 
    fontSize: 22, 
    fontWeight: "500", 
    color: "#454852" 
  },
  providerBlock: { 
    borderWidth: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 10,
    borderColor: "#9e9e9e", 
    backgroundColor: "#c2c2c2",
    padding: 9
  },
  providerText: {
    fontSize: 16,
  },
  eventButton: {
    width: 175, 
    alignSelf: "center"
  },
  card: {
    backgroundColor: '#A7ADC6',
    borderRadius: 8,
    padding: 15,
    width: '100%',
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  accProviderBlock: { 
    borderWidth: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 5,
    borderColor: "#9e9e9e", 
    padding: 9
  },
  providerHeader: { 
    fontSize: 23, 
    marginBottom: 10, 
    marginTop: 40, 
    alignSelf: "center"
  },
  eventText: {
    fontSize: 17,
    paddingVertical: 2,
    color: "#454852" 
  },
  link: {
    color: '#5985eb', 
    fontSize: 18 
  },
})