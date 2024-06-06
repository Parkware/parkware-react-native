import { Linking, StyleSheet, Text, View, SafeAreaView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../../App'

type Props = NativeStackScreenProps<ConsumerStackParams, 'eventSuccessView'>

const EventSuccessView = ({ route }: Props) => {
  const eventID: any = route.params;
  const [shareableLink, setShareableLink] = useState('');
  
  useEffect(() => {
    setShareableLink('https://parkware1.web.app/' + eventID.eventID + '/provide');
  }, [])

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.card}>
            <Text style={styles.text}>
                Your event request was successful! Share the link with space providers.
            </Text>
            <Text style={styles.link} onPress={() => Linking.openURL(shareableLink)}>
                {shareableLink.replace('https://', '')}
            </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default EventSuccessView

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === "android" ? 90 : 20,
  },
  card: {
    backgroundColor: '#56667A',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    justifyContent: "center",
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  link: {
    color: 'lightblue', 
    fontSize: 18 
  },
  text: {
    marginBottom: 10, 
    fontSize: 18, 
    color: "white"
  }
})