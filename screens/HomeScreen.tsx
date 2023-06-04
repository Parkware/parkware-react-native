import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import {
  signOut,
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { ProviderRequestsView } from './ProviderRequestsView';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../App';
import { useNavigation } from '@react-navigation/native';

type homeScreenProp = NativeStackNavigationProp<RootStackParams, 'Home'>;

export function HomeScreen() {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState('');
  const [sentMessage, setSentMessage] = useState(false);

  const navigation = useNavigation<homeScreenProp>();

  const logout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (e) {
      console.error(e);
    }
  };

  const switchView = () => {
    navigation.navigate('providerRequestsView');
  }

  const createEventRequest = async () => {
    // Update Name field
    if (auth.currentUser) {
      const docRef = doc(db, 'users/', auth.currentUser.uid)
      await updateDoc(docRef, { ["name"]: name });
      await addDoc(collection(db, `users/${auth.currentUser.uid}/user_events`), { 
        address,
        startTime,
        endTime
      });

      await addDoc(collection(db, 'events/'), {
        consumer_id: auth.currentUser.uid,
        name, 
        address,
        startTime,
        endTime,
        accepted: false, 
        accepted_provider_id: null,
      }).then(() => { console.log("added event doc")});
      
      setStartTime('');
      setEndTime('');
      setName('');
      setAddress('');
      setSentMessage(true);

      switchView();
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.header}>Request a Space</Text>
      <Button title="Log out" onPress={logout} />

      <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor="#aaa"
            autoCapitalize="words"
            style={styles.input}
      />
      <TextInput
        value={startTime}
        onChangeText={setStartTime}
        placeholder="Start time"
        placeholderTextColor="#aaa"
        style={styles.input}
      />
      <TextInput
        value={endTime}
        onChangeText={setEndTime}
        keyboardType="default"
        placeholder="End time"
        autoCapitalize="none"
        placeholderTextColor="#aaa"
        style={styles.input}
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
      { sentMessage && <Text>Sent Request!</Text>}
      <Button
        title="Send Request"
        onPress={createEventRequest}
        disabled={!name || !startTime || !endTime}
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