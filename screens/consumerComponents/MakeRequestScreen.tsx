import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Platform, Alert, TouchableOpacity } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import NumericInput from 'react-native-numeric-input'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { AppButton } from '../ButtonComponents';


type homeScreenProp = NativeStackNavigationProp<ConsumerStackParams, 'makeRequestScreen'>;

export function MakeRequestScreen() {
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [address, setAddress] = useState<string>('');
  const [eventName, setEventName] = useState<string>();
  const [error, setError] = useState('')
  const [sendable, setSendable] = useState(false)
  const [requestedSpaces, setRequestedSpaces] = useState<number>(1);
  const navigation = useNavigation<homeScreenProp>();
  const [date, setDate] = useState(new Date())
  const [isStartTimeVisible, setStartTimeVisible] = useState(false);
  const [isEndTimeVisible, setEndTimeVisible] = useState(false);
  const [isDateVisible, setDateVisible] = useState(false);

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
          accSpaceCount: 0,
          isOpen: true
        });
        
        setEventName('');
        setStartTime(new Date());
        setEndTime(new Date());
        setAddress('');
        showReqSuccess();
      }
    }
  }
  
  const dateFun = (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      startTime.setDate(selectedDate.getDate());
      setStartTime(startTime);
      endTime.setDate(selectedDate.getDate());
      setEndTime(endTime);
    }
  };
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
      checkIfBefore(selectedDate);
      setDate(selectedDate);
    }
  };
  const spaceCountFun = (count: number) => {
    if (count < 1) {
      setSendable(false);
      setError('At least one parking spot needs to be requested!')
    } else {
      setRequestedSpaces(count)
      setSendable(true);
    }
  }

  /* --------------------------- HELPER FUNCTIONS --------------------------- */
  const checkIfBefore = (endTime: any) => {
    if (endTime < startTime) {
      setSendable(false);
      setError('The end time must be after the start time!')
    }
  }
  
  const findDiff = (diff: number) => {
    const min = Math.ceil(diff / (1000 * 60));
    if (min < 10) {
      setSendable(false);
      setError('Events must be at least 10 minutes!')
    } else
      setSendable(true);
  }

  const handleStartConfirm = (time: any) => {
    setStartTime(time);
    const diff = endTime.getTime()-time.getTime();
    findDiff(diff);
    setStartTimeVisible(false)
  };
  const showReqSuccess = () =>
    Alert.alert('Your event request is successful!', '', [
      {text: 'Ok', onPress: () => navigation.goBack()},
    ]);

  const handleEndConfirm = (time: any) => {
    setEndTime(time);
    const diff = time.getTime()-startTime.getTime();
    findDiff(diff);
    setEndTimeVisible(false);
  };
  
  const handleDateConfirm = (date: any) => {
    startTime.setDate(date.getDate());
    setStartTime(startTime);
    endTime.setDate(date.getDate());
    setEndTime(endTime);
    setDate(date);
    setDateVisible(false);
  };
  
  const showModeAndroid = (currentMode: any, type: string) => {
    if (type === 'start') {
      DateTimePickerAndroid.open({
        value: startTime,
        onChange: startTimeFun,
        mode: currentMode,
        is24Hour: false,
      });
    } else if (type === 'end') {
        DateTimePickerAndroid.open({
        value: endTime,
        onChange: endTimeFun,
        mode: currentMode,
        is24Hour: false,
      });
    } else {
      DateTimePickerAndroid.open({
        value: startTime,
        onChange: dateFun,
        mode: currentMode,
        is24Hour: false,
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

  const DatePickeriOS = () => {
    return (
      <View>
        <View style={{flexDirection:"row"}}>
          <Text style={{ fontSize: 18 }}>Event Date:</Text>
          <DateTimePickerModal
            isVisible={isDateVisible}
            mode='date'
            display="inline"
            onConfirm={handleDateConfirm}
            onCancel={() => setDateVisible(false)}
          />
          <TextInput
            value={date.toLocaleDateString()}
            placeholder="Date"
            style={[styles.input, styles.datetimeAlgn]}
            onPressIn={() => setDateVisible(true)}
          />
        </View>
        <View style={{flexDirection:"row"}}>
          <Text style={{ fontSize: 18 }}>Start Time:</Text>
          <DateTimePickerModal
            isVisible={isStartTimeVisible}
            mode='time'
            onConfirm={handleStartConfirm}
            onCancel={() => setStartTimeVisible(false)}
          />
          <TextInput
            value={startTime.toLocaleTimeString(navigator.language, {
              hour: '2-digit',
              minute:'2-digit'
            })}
            placeholder="Start Time"
            style={[styles.input, styles.datetimeAlgn]}
            onPressIn={() => setStartTimeVisible(true)}
          />
        </View>
        <View style={{ flexDirection:"row" }}>
          <Text style={{ fontSize: 18 }}>End Time:</Text>
          <DateTimePickerModal
            isVisible={isEndTimeVisible}
            mode='time'
            onConfirm={handleEndConfirm}
            onCancel={() => setEndTimeVisible(false)}
          />
          <TextInput
            value={endTime.toLocaleTimeString(navigator.language, {
              hour: '2-digit',
              minute:'2-digit'
            })}
            placeholder="End Time"
            style={[styles.input, styles.datetimeAlgn]}
            onPressIn={() => setEndTimeVisible(true)}
          />
        </View>
      </View>
    )
  }

  const DatePickerAndroid = () => {
    return (
      <View>
        <AppButton onPress={showDatepicker} title="Show date picker" extraStyles={styles.smallerWidth} />
        <AppButton onPress={showStartPicker} title="Show Start time picker" extraStyles={styles.smallerWidth} />
        <AppButton onPress={showEndPicker} title="Show End time picker" extraStyles={styles.smallerWidth} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.header}>Make a Request</Text>
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
        : <View>
            <DatePickerAndroid />
            <Text style={styles.selectedDate}>Selected Date: {date.toLocaleDateString()}, {startTime.toLocaleTimeString()} - {endTime.toLocaleTimeString()}</Text>
          </View>
      }

      <TextInput
        value={address}
        onChangeText={setAddress}
        keyboardType="default"
        placeholder="Address"
        autoCapitalize="none"
        placeholderTextColor="#aaa"
        autoCorrect={false}
        style={[styles.input, { marginTop: 3 }]}
      />
      <View style={{ flexDirection:"row", paddingBottom: 15 }}>
        <Text style={{ fontSize: 18, paddingRight: 10, paddingTop: 12 }}>Spaces Needed:</Text>
        <NumericInput rounded value={requestedSpaces} totalHeight={50} minValue={1} maxValue={10} onChange={value => spaceCountFun(value)} />
      </View>
      <AppButton
        title="Send Request"
        onPress={createEventRequest}
        disabled={!sendable || address.length == 0 }
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
    marginTop: 16,
  },
  error: {
    marginBottom: 20,
    color: 'red',
  },
  link: {
    color: 'blue',
    marginBottom: 20,
  },
  datetimeAlgn: {
    marginLeft: 15,
    marginTop: -4
  },
  selectedDate: {
    padding: 13, 
    fontSize: 16
  },
  showPickerButton: {},
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#6b7080",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    margin: 2
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
  },
  authButtonContainer: {
    elevation: 8,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    margin: 2,
    borderWidth: 2,
    borderColor: "#4f9ee3"
  },
  authButtonText: {
    fontSize: 15,
    color: "#3a74a6",
    fontWeight: "bold",
    alignSelf: "center",
  },
  deleteButtonText: {
    fontSize: 18,
    color: "red",
    fontWeight: "bold",
    alignSelf: "center",
  },
  smallerWidth: {
    width: 250,
    alignSelf: "center"
  }
});