import { Linking, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../navigation/types'
import { ScreenContainer } from '../../components/layout/ScreenContainer'
import { commonStyles } from '../../theme/styles'
import { spacing } from '../../theme/spacing'

type Props = NativeStackScreenProps<ConsumerStackParams, 'eventSuccessView'>

const EventSuccessView = ({ route }: Props) => {
  const eventID: any = route.params;
  const [shareableLink, setShareableLink] = useState('');
  
  useEffect(() => {
    setShareableLink('https://parkware1.web.app/' + eventID.eventID + '/provide');
  }, [])

  return (
    <ScreenContainer centered>
        <View style={styles.card}>
            <Text style={styles.eyebrow}>Request sent</Text>
            <Text style={styles.text}>
                Your event request was successful! Share the link with space providers.
            </Text>
            <Text style={styles.link} onPress={() => Linking.openURL(shareableLink)}>
                {shareableLink.replace('https://', '')}
            </Text>
        </View>
    </ScreenContainer>
  )
}

export default EventSuccessView

const styles = StyleSheet.create({
  eyebrow: commonStyles.label,
  card: {
    ...commonStyles.card,
    justifyContent: "center",
  },
  link: {
    ...commonStyles.link,
  },
  text: {
    ...commonStyles.subtitle,
    marginBottom: spacing.lg,
  }
})