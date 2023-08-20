import { Linking, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'
import { DocumentData, arrayUnion, collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
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
  const [eventEnded, setEventEnded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'events', event.id), async (snapshot) => {
      if (snapshot.exists() && snapshot.data().eventEnded) {
        setEventEnded(snapshot.data().eventEnded);
      }
    });           
    return () => unsub();
  }, [])
  
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


  return (
    <SafeAreaView>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10, marginTop: -34, alignSelf: "center" }}>
          {event.doc.eventName}
        </Text>
        {providerInfo ? providerInfo.map((proObj: DocumentData) => (
          <View key={proObj.id} style={styles.providerBlock}>
            <Text style={styles.text} key={proObj.name}>Provider Name: {proObj.name}</Text>
            <Text style={styles.text} key={proObj.address}>Address: {proObj.address}</Text>
            {proObj.notes === undefined 
            ? <Text style={styles.text}>The provider has not updated any notes yet</Text>
            : <Text style={styles.text} key={proObj.notes}>Notes: {proObj.notes}</Text>
            }
            <Text style={styles.text} key={proObj.providerSpaces}>Parking Spaces: {proObj.providerSpaces}</Text>
          </View>
        )) : <Text style={styles.text}>Loading...</Text>}
        {eventEnded
        ? <View>{diff && diff > 0 && 
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>
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
        </View>
        : <View style={[styles.card, styles.shadowProp]}>
            <Text style={styles.feedbackHeader}>
              Please fill out the survey form below.
            </Text>
            <Text style={{ color: 'blue', fontSize: 19, marginVertical: 10 }}
                  onPress={() => Linking.openURL('https://forms.gle/DqPH34zYAfxdgzzt6')}>
                    https://forms.gle/DqPH34zYAfxdgzzt6
            </Text>
            <Text style={styles.feedbackHeader}>
              Thank you for using Parkware!
            </Text>
          </View>
      }
      </View>
    </SafeAreaView>
  )
}

export default ChooseProviderView

const styles = StyleSheet.create({
  feedbackHeader: { 
    fontSize: 22, 
    fontWeight: "500", 
    color: "#e8e8e8" 
  },
  card: {
    backgroundColor: '#8c8c8c',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    marginVertical: 10,
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
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
  providerBlock: { 
    borderWidth: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 5,
    borderColor: "#9e9e9e", 
    backgroundColor: "#e8e8e8",
    padding: 9
  },
  text: {
    fontSize: 16,
    paddingVertical: 2
  }
})