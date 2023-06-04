import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { FirebaseError } from "firebase/app";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../App';
import { doc, getDoc } from 'firebase/firestore';

type signupScreenProp = NativeStackNavigationProp<RootStackParams, 'Login'>;

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
  
    const navigation = useNavigation<signupScreenProp>();

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async user => {
        if (user) {
          const docRef = doc(db, 'users/', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            if (docSnap.data().provider) navigation.navigate('providerRequestsView'); 
            else navigation.navigate('Home');
          }
      }});
      return unsubscribe;
    }, [])

    const loginUser = async () => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        if ((error as FirebaseError).code === 'auth/invalid-email' || (error as FirebaseError).code === 'auth/wrong-password') {
          setError('Your email or password was incorrect');
        } else if ((error as FirebaseError).code === 'auth/email-already-in-use') {
          setError('An account with this email already exists');
        } else {
          setError('There was a problem with your request');
        }
      }
    };
  
    return (
      <View style={styles.outer}>
        <View style={styles.inner}>
          <Text style={styles.header}>Login</Text>
  
          {error && <Text style={styles.error}>{error}</Text>}
  
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.link}>Create an account</Text>
          </TouchableOpacity>
  
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter email address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            // secureTextEntry
            placeholder="Enter password"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
            style={styles.input}
          />
  
          <TouchableOpacity onPress={() => navigation.navigate('resetPassword')}>
            <Text style={[styles.link, { color: '#333' }]}>I've forgotten my password</Text>
          </TouchableOpacity>
  
          <Button title="Login" onPress={loginUser} disabled={!email || !password} />
        </View>
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