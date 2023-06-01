import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { HomeScreen } from './screens/HomeScreen';
import { Signup } from './screens/Signup';
import { ResetPassword } from './screens/ResetPassword';
import { Login } from './screens/Login';
import { RequestsView } from './screens/RequestsView';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState<string>('');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  });

  const getScreen = () => {
    if (loggedIn) return <HomeScreen />;
    if (screen === 'signup') return <Signup setScreen={setScreen} />;
    if (screen === 'reset-password') return <ResetPassword setScreen={setScreen} />;
    return <Login setScreen={setScreen} />;
  };

  // return <View style={{ flex: 1 }}>{getScreen()}</View>;
  return <View style={{ flex: 1 }}><RequestsView /></View>;
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