import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParams } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack/lib/typescript/src/types';

type signupScreenProp = NativeStackNavigationProp<AuthStackParams, 'Signup'>;

export function SignupScreen() {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState('');
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
          password
        } 
      });
    }
    
    const checkPassword = () => {
      if (password !== confirmPassword)
        setError("Passwords don't match");
      else if (password.length < 6)
        setError("Password must be at least 6 characters")
      else
        navNextView();
    };
  
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
            style={styles.input}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter email address"
            autoCapitalize="none"
            placeholderTextColor="#ccc"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
            autoCapitalize="none"
            placeholderTextColor="#ccc"
            style={styles.input}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm password"
            autoCapitalize="none"
            placeholderTextColor="#ccc"
            style={styles.input}
          />
          <Button
            title="Create Account"
            onPress={checkPassword}
            disabled={!email || !password }
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
      backgroundColor: '#919090',
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
      color: "#f5f5f5"
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
      color: '#f5f5f5',
      marginBottom: 20,
    },
  });