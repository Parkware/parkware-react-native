import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../navigation/types'
import { arrayRemove, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
import { ScreenContainer } from '../../components/layout/ScreenContainer'
import { AppButton } from '../ButtonComponents'
import { commonStyles } from '../../theme/styles'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'

type Props = NativeStackScreenProps<ConsumerStackParams, 'departureGuestView'>

const DepartureGuestView = ({ route }: Props) => {
  const { providerInfo, eventId } = route.params;
  
  const setLeftStatus = async (proId: string) => {
    await updateDoc(doc(db, 'events/', eventId), { 
      arrivedProviderSpaces: arrayRemove(proId),
    });
  }
  
  return (
    <ScreenContainer centered>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Departure</Text>
        <Text style={styles.title}>{providerInfo.name}</Text>
        <Text style={styles.address}>{providerInfo.address}</Text>
        <AppButton title="I have left" onPress={() => setLeftStatus(providerInfo.id)} />
      </View>
    </ScreenContainer>
  )
}

export default DepartureGuestView

const styles = StyleSheet.create({
  address: {
    ...commonStyles.subtitle,
    marginBottom: spacing.xl,
  },
  card: {
    ...commonStyles.card,
  },
  eyebrow: commonStyles.label,
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
})