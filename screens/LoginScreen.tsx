import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import {
  User,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { FirebaseError } from "firebase/app";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../App';

type signupScreenProp = NativeStackNavigationProp<AuthStackParams, 'Login'>;

export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigation = useNavigation<signupScreenProp>();

    const navNextView = () => {
      navigation.navigate('Login', { 
                            screen: 'viewRoleView', 
                            params: { 
                              email,
                              password
                            } 
                          })
      return <></>
    }
  
    return (
      <View style={styles.outer}>
        <View style={styles.inner}>
          <Text style={styles.header}>Login</Text>
  
          {error && <Text style={styles.error}>{error}</Text>}
  
          <TouchableOpacity onPress={() => navigation.navigate('Signup', { screen: 'SignupScreen' })}>
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
  
          <Button title="Login" onPress={navNextView} disabled={!email || !password} />
          <Button title="Login Consumer" onPress={() => { 
            setEmail('naren@gmail.com');
            setPassword('naren1234');
            navNextView();
          }} />
          <Button title="Login Provider" onPress={() => { 
            setEmail('dhanya@gmail.com');
            setPassword('dhanya1234');
            navNextView();
          }} />
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