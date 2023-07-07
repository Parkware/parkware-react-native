import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import {
  signOut,
} from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { addDoc, arrayUnion, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import NumericInput from 'react-native-numeric-input'

type homeScreenProp = NativeStackNavigationProp<ConsumerStackParams, 'makeRequestScreen'>;

export function MakeRequestScreen() {
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [address, setAddress] = useState<string>('');
  const [sentMessage, setSentMessage] = useState(false);
  const [eventName, setEventName] = useState<string>();
  const [error, setError] = useState('')
  const [sendable, setSendable] = useState(false)
  const [requestedSpaces, setParkingSpaces] = useState<number>();
  const navigation = useNavigation<homeScreenProp>();

  const logout = async () => {
    try {
      const userRef = doc(db, 'users/', auth.currentUser!.uid);
      const userSnap = await getDoc(userRef)
      if (userSnap.exists() && userSnap.data().isProvider)
        await updateDoc(userRef, { loggedAsProvider: true })
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };
  
  const clicked = async () => {
    await updateDoc(doc(db, 'users/', auth.currentUser!.uid), {loggedAsProvider: true})
  }
  
  const switchView = () => 
    navigation.navigate('consumerRequestsView');

  const createEventRequest = async () => {
    if (auth.currentUser) {
      const consRef = doc(db, 'users/', auth.currentUser.uid);
      const userSnap = await getDoc(consRef)
      if (userSnap.exists()) {
        await addDoc(collection(db, 'events/'), {
          eventName,
          consumer_id: auth.currentUser.uid,
          name: userSnap.data().name,
          address,
          startTime,
          endTime,
          acceptedProviderIds: [],
          interestedProviders: [],
          interestedProviderIds: [],
          arrivedProviderSpaces: [],
          unwantedProviders: [],
          requestedSpaces,
          isOpen: true
        });
                
        setStartTime(new Date());
        setEndTime(new Date());
        setAddress('');
        setSentMessage(true);
        switchView();
      }
    }
  }
  const startTimeFun = (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      setStartTime(selectedDate);
      const diff = endTime.getTime()-selectedDate.getTime();
      findDiff(diff);
    }
  };
  const endTimeFun = (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      setEndTime(selectedDate);
      const diff = selectedDate.getTime()-startTime.getTime();
      findDiff(diff);
    }
  };
  const dateFun = (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      setStartTime(selectedDate);
      setEndTime(selectedDate);
    }
  };
  const findDiff = (diff: number) => {
    const min = Math.ceil(diff / (1000 * 60));
    if (min < 10) {
      setSendable(false);
      setError('Events must be at least 10 minutes!')
    } else
      setSendable(true);
  }
  const spaceCountFun = (count: number) => {
    if (count < 1) {
      setSendable(false);
      setError('At least one parking spot needs to be requested!')
    } else {
      setParkingSpaces(count)
      setSendable(true);
    }
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.header}>Request a Space</Text>
      <Button title="Log out" onPress={logout} />
      <TextInput
        value={eventName}
        onChangeText={setEventName}
        keyboardType="default"
        placeholder="Event Name"
        autoCapitalize="none"
        placeholderTextColor="#aaa"
        autoCorrect={false}
        style={styles.input}
      />
      <DateTimePicker
        testID="dateTimePicker"
        value={startTime}
        mode='date'
        is24Hour={true}
        onChange={dateFun}
      />
      <DateTimePicker
        testID="dateTimePicker"
        value={startTime}
        mode='time'
        is24Hour={true}
        onChange={startTimeFun}
      />
      <DateTimePicker
        testID="dateTimePicker"
        value={endTime}
        mode='time'
        is24Hour={true}
        onChange={endTimeFun}
      />
      <TextInput
        value={address}
        onChangeText={setAddress}
        keyboardType="default"
        placeholder="Address"
        autoCapitalize="none"
        placeholderTextColor="#aaa"
        autoCorrect={false}
        style={styles.input}
      />
      <NumericInput rounded totalHeight={50} minValue={1} maxValue={10} onChange={value => spaceCountFun(value)} />
      {sentMessage && <Text>Sent Request!</Text>}
      <Button
        title="Send Request"
        onPress={createEventRequest}
        disabled={!sendable || address.length == 0 }
      />
      <Button
        title="Skip"
        onPress={switchView}
      />
      <Button
        title="click"
        onPress={clicked}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: 240,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  error: {
    marginBottom: 20,
    color: 'red',
  },
  link: {
    color: 'blue',
    marginBottom: 20,
  },
});