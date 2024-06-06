import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { FirebaseError } from "firebase/app";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../App';
import { AuthButton } from './ButtonComponents';

type signupScreenProp = NativeStackNavigationProp<AuthStackParams, 'Login'>;

export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<signupScreenProp>();

    const loginUser = async () => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        if ((error as FirebaseError).code === 'auth/invalid-email' || (error as FirebaseError).code === 'auth/wrong-password') {
          setError('Your email or password was incorrect');
        } else if ((error as FirebaseError).code === 'auth/email-already-in-use') {
          setError('An account with this email already exists');
        } else if ((error as FirebaseError).code === 'auth/user-not-found') {
          setError('User not found');
        } else {
          setError('There was a problem with your request');
        }
      }
    };
  
    return (
      <View style={styles.outer}>
        <View style={[styles.shadowProp, styles.card, { width: 330 }]}>
          <Text style={styles.header}>Login</Text>
          {error && 
            <View style={styles.contrastBg}>
              <Text style={styles.error}>{error}</Text>
            </View>
          }
          <TouchableOpacity onPress={() => navigation.navigate('Signup', { screen: 'SignupScreen' })}>
            <Text style={styles.link}>Create an account</Text>
          </TouchableOpacity>
  
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter email address"
            autoCapitalize="none"
            placeholderTextColor="#ccc"
            selectionColor={'white'}
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
            autoCapitalize="none"
            placeholderTextColor="#ccc"
            selectionColor={'white'}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => navigation.navigate('resetPassword')}>
            <Text style={[styles.link, { color: '#FFFF' }]}>Forgot your password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={loginUser} disabled={!email || !password} style={{ alignSelf: "center" }}>
            <Text style={[styles.link, { fontSize: 18 }]}>Login</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity style={{ paddingTop: 30 }} onPress={() => Linking.openURL('https://linktr.ee/parkware')}>
            <Text style={styles.info}>Learn more</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    contrastBg: { 
      borderWidth: 0.5,
      overflow: 'hidden',
      borderRadius: 10,
      marginBottom: 8,
      borderColor: "#ffff",
      backgroundColor: "#bfbfbf", 
      padding: 12
    },
    outer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: '#56667A',
      borderRadius: 8,
      padding: 15,
      width: '100%',
    },
    shadowProp: {
      shadowColor: '#171717',
      shadowOffset: {width: -2, height: 4},
      shadowOpacity: 0.5,
      shadowRadius: 3,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: "#FFF",
      alignSelf: "center", 
      textAlign: "center" 
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
      color: "#f5f5f5",
    },
    error: {
      color: 'red',
    },
    link: {
      color: '#bec7ed',
      marginBottom: 20,
    },
    info: {
      color: '#919191',
      marginBottom: 20,
      textDecorationLine: 'underline'
    },
  });