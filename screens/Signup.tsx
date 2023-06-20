import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParams } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack/lib/typescript/src/types';

type signupScreenProp = NativeStackNavigationProp<AuthStackParams, 'Signup'>;

export function Signup() {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const navigation = useNavigation<signupScreenProp>();

    const createAccount = async () => {
      try {
        // if (password === confirmPassword) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCred.user;
        await setDoc(doc(db, "users", user.uid), {
          email, 
          name
        })
        navigation.navigate('Login') //, { user })
        // } else {
        //   setError("Passwords don't match");
        // }
      } catch (e) {
        console.log('Something went wrong with sign up: ', e);
      }
    };
  
    return (
      <View style={styles.outer}>
        <View style={styles.inner}>
          <Text style={styles.header}>Sign up</Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Login to existing account</Text>
          </TouchableOpacity>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter display name"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
            style={styles.input}
          />
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
            secureTextEntry
            placeholder="Enter password"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
            style={styles.input}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm password"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
            style={styles.input}
          />
  
          <Button
            title="Create Account"
            onPress={createAccount}
            disabled={!email || !password }
          />
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