import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConsumerStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import NumericInput from 'react-native-numeric-input'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { AppButton } from '../ButtonComponents';
import { User, onAuthStateChanged } from 'firebase/auth';
import { color } from '@rneui/base';
import Ionicons from 'react-native-vector-icons/Ionicons';


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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => setUser(user));
    
    return unsubscribe;
  }, [])

  const createEventRequest = async () => {
    if (user) {
      const userSnap = await getDoc(doc(db, 'users/', user.uid))
      if (userSnap.exists()) {
        const event = await addDoc(collection(db, 'events/'), {
          eventName,
          consumer_id: user.uid,
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
        navigation.navigate('eventSuccessView', { eventID: event.id })
      }
    }
  }
  
  const dateAnd = (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      startTime.setDate(selectedDate.getDate());
      setStartTime(startTime);
      endTime.setDate(selectedDate.getDate());
      setEndTime(endTime);
      setDate(selectedDate);
    }
  };
  const startTimeAnd = (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      setStartTime(selectedDate);
      const diff = endTime.getTime()-selectedDate.getTime();
      findDiff(diff);
    }
  };
  const endTimeAnd = (event: any, selectedDate: any) => {
    if (event.type === 'set' && selectedDate) {
      setEndTime(selectedDate);
      const diff = selectedDate.getTime()-startTime.getTime();
      findDiff(diff);
    }
  };

  /* --------------------------- HELPER FUNCTIONS --------------------------- */
  
  const findDiff = (diff: number) => {
    const min = Math.ceil(diff / (1000 * 60));
    if (min < 0) {
      setSendable(false);
      setError('End time must be after start time.')
    } else if (min < 10) {
      setSendable(false);
      setError('Event duration must be at least 10 minutes.')
    } else {
      setError('');
      setSendable(true);
    }
  }

  const startConfirmIOS = (time: any) => {
    setStartTime(time);
    const diff = endTime.getTime()-time.getTime();
    findDiff(diff);
    setStartTimeVisible(false)
  };

  const endConfirmIOS = (time: any) => {
    setEndTime(time);
    const diff = time.getTime()-startTime.getTime();
    findDiff(diff);
    setEndTimeVisible(false);
  };
  
  const dateConfirmIOS = (date: any) => {
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
        onChange: startTimeAnd,
        mode: currentMode,
        is24Hour: false,
      });
    } else if (type === 'end') {
        DateTimePickerAndroid.open({
        value: endTime,
        onChange: endTimeAnd,
        mode: currentMode,
        is24Hour: false,
      });
    } else {
      DateTimePickerAndroid.open({
        value: startTime,
        onChange: dateAnd,
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
    const dateNow = new Date();

    return (
      <View>
        <View style={{flexDirection:"row"}}>
          <Text style={styles.labels}>Event Date:</Text>
          <DateTimePickerModal
            isVisible={isDateVisible}
            minimumDate={dateNow}
            mode='date'
            display="inline"
            onConfirm={dateConfirmIOS}
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
          <Text style={styles.labels}>Start Time:</Text>
          <DateTimePickerModal
            isVisible={isStartTimeVisible}
            mode='time'
            onConfirm={startConfirmIOS}
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
          <Text style={styles.labels}>End Time:</Text>
          <DateTimePickerModal
            isVisible={isEndTimeVisible}
            mode='time'
            onConfirm={endConfirmIOS}
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
        <AppButton onPress={showDatepicker} title="Select Date" extraStyles={styles.smallerWidth} />
        <AppButton onPress={showStartPicker} title="Select Start Time" extraStyles={styles.smallerWidth} />
        <AppButton onPress={showEndPicker} title="Select End Time" extraStyles={styles.smallerWidth} />
      </View>
    );
  }

  const homeAddressShort = async () => {
    if (user) {
      const userSnap = await getDoc(doc(db, 'users/', user.uid))
      if (userSnap.exists()) {
        setAddress(userSnap.data().address)
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.header}>Request Spaces</Text>
        {error && 
            <View style={styles.contrastBg}>
              <Text style={styles.error}>{error}</Text>
            </View>
          }
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
              <Text style={styles.selectedDate}>Selected Date: {date.toLocaleDateString()}, {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
        }
        <View style={{ flexDirection: "row" }}>
          <TextInput
            value={address}
            onChangeText={setAddress}
            keyboardType="default"
            placeholder="Event Address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
            autoCorrect={false}
            style={[styles.input, { marginTop: 3 }]}
          />
          {/* <TouchableOpacity
            onPress={homeAddressShort}
            style={{ marginLeft: 10, marginTop: 3 }}>
            <Ionicons name={"home"} size={30} color={color} />
          </TouchableOpacity> */}
        </View>
        <View style={{ flexDirection:"row", paddingBottom: 15 }}>
          <Text style={[styles.labels, { paddingRight: 10, paddingTop: 12 }]}>Spaces Needed:</Text>
          <NumericInput rounded value={requestedSpaces} totalHeight={50} minValue={1} maxValue={10} onChange={count => setRequestedSpaces(count)} />
        </View>
        <AppButton
          title="Send Request"
          onPress={createEventRequest}
          disabled={!sendable || address.length == 0 || eventName?.length == 0}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
  contrastBg: { 
    borderWidth: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 8,
    borderColor: "#FFFF",
    backgroundColor: "#FFFF", 
    padding: 12
  },
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
    color: "#4e515c"
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    marginTop: 16,
    color: "#4e515c"
  },
  error: {
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
    fontSize: 18
  },
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
  },
  labels: {
    fontSize: 18,
    color: "#4e515c"
  }
});