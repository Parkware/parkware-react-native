import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParams } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack/lib/typescript/src/types';
import { AppButton } from './ButtonComponents';

type signupScreenProp = NativeStackNavigationProp<AuthStackParams, 'Signup'>;

export function SignupScreen() {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState('');
    const [phoneNum, setPhoneNum] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<signupScreenProp>();

    const navNextView = () => {
      navigation.navigate('Signup', { 
        screen: 'signupRoleView', 
        params: {
          name,
          email,
          phoneNum,
          password
        } 
      });
    }
    
    const navNext = () => {
      navNextView();
    };

    useEffect(() => {
      if (password !== confirmPassword)
        setError("Passwords don't match");
      else
        setError('')
    }, [confirmPassword])
    
    useEffect(() => {
      if ((password.length < 6) && password.length !== 0)
        setError("Password must be at least 6 characters")
      else
        setError('')
    }, [password])
  
    return (
      <View style={styles.outer}>
        <View style={[styles.shadowProp, styles.card, { width: 330 }]}>
          <Text style={styles.header}>Welcome to Parkware!</Text>
          {error && 
            <View style={styles.contrastBg}>
              <Text style={styles.error}>{error}</Text>
            </View>
          }
          <TouchableOpacity onPress={() => navigation.navigate('Login', { screen: 'LoginScreen' })}>
            <Text style={styles.link}>Login to existing account</Text>
          </TouchableOpacity>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter display name"
            autoCapitalize="none"
            placeholderTextColor="#ccc"
            selectionColor={'white'}
            style={styles.input}
          />
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
            value={phoneNum}
            onChangeText={setPhoneNum}
            keyboardType="phone-pad"
            placeholder="Enter phone number"
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
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm password"
            autoCapitalize="none"
            placeholderTextColor="#ccc"
            selectionColor={'white'}
            style={styles.input}
          />
          <AppButton
            title="Next"
            onPress={navNext}
            disabled={ !email || !password || (password !== confirmPassword) || (password.length < 6)}
          />
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
      borderColor: "#FFFF",
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
      textAlign: "center",
      alignSelf: 'center',
      fontSize: 30,
      fontWeight: 'bold',
      marginBottom: 20,
      color: "#bec7ed"
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
      color: "#ccc"
    },
    error: {
      color: 'red',
    },
    link: {
      color: '#bec7ed',
      marginBottom: 20,
    },
  });