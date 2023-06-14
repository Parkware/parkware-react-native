import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConsumerStackParams } from '../App'
import { DocumentData, doc, updateDoc } from 'firebase/firestore'
import { Divider } from '@rneui/base'
import { db } from '../firebaseConfig'

type Props = NativeStackScreenProps<ConsumerStackParams, 'singleProviderDetailsView'>
/*
    Is there some way that I can have one onSnapshot function listen and update both these pages?
    It isn't necessary since a user may only need updates from one screen, but it could be a good addition
    I could pass in the doc id and just listen to that document. however, i would be opening up many snapshots
    since many events could be looked at. 
*/
const SingleProviderDetailsView = ({ route }: Props) => {
  const { event } = route.params;

  return (
    <SafeAreaView style={{ marginLeft: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 40 }}>
            interested provider id: {event.doc.accepted_provider_id}
        </Text>        
    </SafeAreaView>
  )
}

export default SingleProviderDetailsView

const styles = StyleSheet.create({})