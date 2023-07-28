import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Platform, Alert } from 'react-native';
import {
  deleteUser,
  signOut,
} from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
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
  const [isProvider, setIsProvider] = useState(false);
  const navigation = useNavigation<homeScreenProp>();
  const userRef = doc(db, 'users', auth.currentUser!.uid);

  const getIfProvider = async () => {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists() && docSnap.data().isProvider) 
      setIsProvider(true);
  }

  useEffect(() => {
    getIfProvider();
  }, [])
  
  const logout = async () => {
    try {
      // Setting the loggedInAsProvider boolean to true in case the user is a provider. 
      switchToProvider();
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const showConfirmDel = () =>
    Alert.alert('Are you sure you want to delete your account?', 'Click cancel to keep your account. ', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', onPress: () => delAccount()},
    ]);
  
  const delAccount = async () => {
    await deleteDoc(doc(db, "users", auth.currentUser!.uid));
    await deleteUser(auth.currentUser!)
  }

  const switchToProvider = async () => {
    const userSnap = await getDoc(userRef)
    if (userSnap.exists() && userSnap.data().isProvider)
      await updateDoc(userRef, { loggedAsProvider: true })
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
          departedProviderSpaces: [],
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

  const DatePickeriOS = () => {
    return (
      <View>
        <View style={{flexDirection:"row"}}>
          <Text style={{ fontSize: 18 }}>Event Date:</Text>
          <DateTimePicker
            testID="dateTimePicker"
            value={startTime}
            mode='date'
            is24Hour={true}
            onChange={dateFun}
          />
        </View>
        <View style={{flexDirection:"row"}}>
          <Text style={{ fontSize: 18 }}>Start Time:</Text>
          <DateTimePicker
            testID="dateTimePicker"
            value={startTime}
            mode='time'
            is24Hour={true}
            onChange={startTimeFun}
          />
        </View>
        <View style={{flexDirection:"row"}}>
          <Text style={{ fontSize: 18 }}>End Time:</Text>
          <DateTimePicker
            testID="dateTimePicker"
            value={endTime}
            mode='time'
            is24Hour={true}
            onChange={endTimeFun}
          />
        </View>
      </View>
    )
  }
  const showModeAndroid = (currentMode: any, type: string) => {
    if (type === 'start') {
      DateTimePickerAndroid.open({
        value: startTime,
        onChange: startTimeFun,
        mode: currentMode,
        is24Hour: true,
      });
    } else if (type === 'end') {
        DateTimePickerAndroid.open({
        value: endTime,
        onChange: endTimeFun,
        mode: currentMode,
        is24Hour: true,
      });
    } else {
      DateTimePickerAndroid.open({
        value: startTime,
        onChange: endTimeFun,
        mode: currentMode,
        is24Hour: true,
      });
    }
  };

  const showDatepicker = () => {
    showModeAndroid('date', '');
  };

  const showStartPicker = () => {
    showModeAndroid('time', 'start');
  };

  const showEndPicker = () => {
    showModeAndroid('time', 'end');
  };

  const DatePickerAndroid = () => {
    return (
      <View>
        <Button onPress={showDatepicker} title="Open date picker!" />
        <Button onPress={showStartPicker} title="Open Start time picker!" />
        <Button onPress={showEndPicker} title="Open End time picker!" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.header}>Request a Space</Text>
      <Button title="Log out" onPress={logout} />
      {isProvider && <Button title="Switch to Provider" onPress={switchToProvider} />}
      <Button title="Delete account" onPress={showConfirmDel} />
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
      {Platform.OS === 'ios' 
        ? <DatePickeriOS /> 
        : <DatePickerAndroid />}
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
      <View style={{flexDirection:"row"}}>
        <Text style={{ fontSize: 18, paddingRight: 10, paddingTop: 12 }}>Spaces to Request:</Text>
        <NumericInput rounded totalHeight={50} minValue={1} maxValue={10} onChange={value => spaceCountFun(value)} />
      </View>
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