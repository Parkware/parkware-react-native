import { Linking, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../navigation/types'
import { DocumentData, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
import { ScreenContainer } from '../../components/layout/ScreenContainer'
import { commonStyles } from '../../theme/styles'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'

type Props = NativeStackScreenProps<ConsumerStackParams, 'eventInfoView'>

const EventInfoView = ({ route }: Props) => {
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
      setShareableLink('https://parkware1.web.app/' + event.id + "/guest");
    }
  }

  useEffect(() => {
    getProviderInfo();
  }, [])

  return (
    <ScreenContainer scroll>
        <Text style={styles.eyebrow}>Event</Text>
        <Text style={styles.title}>
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
          ? <View style={styles.card}>
              <Text style={styles.feedbackHeader}>
                Please fill out the survey form below.
              </Text>
              <Text style={styles.link}
                    onPress={() => Linking.openURL('https://forms.gle/DqPH34zYAfxdgzzt6')}>
                      https://forms.gle/DqPH34zYAfxdgzzt6
              </Text>
              <Text style={styles.feedbackHeader}>
                Thank you for using Parkware!
              </Text>
            </View>
          : <View>{diff && diff > 0 && 
              <Text style={styles.countdown}>
                {timeRemaining} till your parking event.
              </Text>
            }
              <View style={styles.card}>
                <Text style={styles.text}>
                  Share the link below with other guests so that they can update their status to the providers
                </Text>
                <Text style={styles.link}
                      onPress={() => Linking.openURL(shareableLink)}>
                  {shareableLink.replace('https://', '')}
                </Text>
              </View>
            </View>
      }
    </ScreenContainer>
  )
}

export default EventInfoView

const styles = StyleSheet.create({
  countdown: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  eyebrow: commonStyles.label,
  feedbackHeader: { 
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  card: {
    ...commonStyles.card,
    marginVertical: spacing.sm,
  },
  link: commonStyles.link,
  providerBlock: { 
    ...commonStyles.card,
    overflow: 'hidden',
    marginVertical: 5,
  },
  text: {
    fontSize: 16,
    paddingVertical: 2,
    color: colors.textMuted,
    lineHeight: 23,
  },
  title: {
    ...commonStyles.screenTitle,
    marginBottom: spacing.xl,
  }
})