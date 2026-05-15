import { Alert, StyleSheet, Text, TextInput, View, Linking } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../navigation/types'
import { DocumentData, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
import { AppButton } from '../ButtonComponents'
import { useNavigation } from '@react-navigation/native'
import { EventCard } from '../../components/events/EventCard'
import { acceptProviderForEvent, declineProviderForEvent } from '../../services/events'
import { DocDataPair, ProviderInfo } from '../../types/events'
import { ScreenContainer } from '../../components/layout/ScreenContainer'
import { commonStyles } from '../../theme/styles'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'

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
  const [eventData, setEventData] = useState<DocDataPair>(event);
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
    addAcceptedProvider(providerId);
    Alert.alert('The provider has been notified.', '', [
      {text: 'Ok', onPress: () => navigation.goBack()},
    ]);
  };
  
  const addAcceptedProvider = async (currProviderId: string) => {
    await acceptProviderForEvent(eventData, currProviderId);
  }
  
  // Removing a provider from the consumer view if they have been declined
  const removeLocalData = (id: string) => {
    setUnwantedProviders(current => [...current, id]);
    const updatedProviders = eventData.doc.interestedProviders
      .filter((pro: DocumentData) => pro.id !== id);
    setEventData(prevEventData => {
      return {
        ...prevEventData,
        doc: {
          ...prevEventData.doc,
          interestedProviders: updatedProviders,
        },
      }
    });

    declineUserId(id, updatedProviders);
  }

  const declineUserId = async (id: string, updatedProviders: ProviderInfo[]) =>
    declineProviderForEvent(event.id, id, updatedProviders);

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

  return (
    <ScreenContainer scroll>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.eventHeader}>
                {eventData.doc.eventName}
              </Text>
                <AppButton
                  title="Cancel"
                  onPress={showConfirmDel}
                  extraStyles={styles.smallButton}
                />
            </View>
            <EventCard event={eventData} showName={false} showSpaces={false} textStyle={styles.eventText} />
            <Text style={styles.eventText}>
              Current Spaces: {event.doc.accSpaceCount}
            </Text>
            <View style={styles.editRow}>
              <Text style={styles.eventText}>Requested Spaces:</Text>
              <TextInput 
                ref={refInput}
                value={editSpaces}
                onChangeText={setEditSpaces}
                placeholder={spacePlaceholder}
                keyboardType='numeric'
                placeholderTextColor={colors.textMuted}
                style={styles.inlineInput}
              />
              <AppButton
                  title={focus ? "Cancel" : "Edit"}
                  onPress={changeSpaceCount}
                  extraStyles={styles.smallButton}
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
          <Text style={styles.providerHeader}>Interested Providers</Text>
            {eventData.doc.interestedProviders
              .filter((pro: DocumentData) =>
                // only want providers who haven't already been accepted or denied
                (!unwantedProviders.includes(pro.id) && !eventData.doc.acceptedProviderIds.includes(pro.id)))
              .map((providerInfo: DocumentData) => (
                <View style={styles.card} key={providerInfo.id}>
                  <ProviderBlock providerInfo={providerInfo}/>
                </View>
              ))
            }
          <Text style={styles.providerHeader}>Accepted Providers</Text>
          {eventData.doc.acceptedProviderIds
            .map((proId: string) => eventData.doc.interestedProviders
              .find((proObj: ProviderInfo) => proObj.id == proId))
            .filter((providerInfo): providerInfo is ProviderInfo => Boolean(providerInfo))
            .map((accProInfo) => (
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
    </ScreenContainer>
  )
}



export default ChooseProviderView

const styles = StyleSheet.create({
  eventHeader: { 
    color: colors.text,
    flex: 1,
    fontSize: 28,
    fontWeight: "800",
  },
  providerBlock: { 
    ...commonStyles.card,
    marginVertical: spacing.sm,
  },
  providerText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
  eventButton: {
    width: 175, 
    alignSelf: "center"
  },
  card: {
    ...commonStyles.card,
    marginBottom: spacing.md,
  },
  accProviderBlock: { 
    ...commonStyles.card,
    overflow: 'hidden',
    marginVertical: 5,
    padding: spacing.md,
  },
  providerHeader: { 
    ...commonStyles.sectionTitle,
    marginTop: spacing.xl,
  },
  eventText: {
    fontSize: 17,
    paddingVertical: 2,
    color: colors.textMuted,
    lineHeight: 23,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inlineInput: {
    color: colors.text,
    fontSize: 17,
    minWidth: 36,
    paddingHorizontal: spacing.xs,
  },
  editRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  link: {
    ...commonStyles.link,
    marginTop: spacing.md,
  },
  smallButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
})