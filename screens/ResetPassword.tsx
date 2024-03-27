import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import {
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { FirebaseError } from "firebase/app";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams, ConsumerStackParams } from '../App';
import { useNavigation } from '@react-navigation/native';

type resetPasswordScreenProp = NativeStackNavigationProp<AuthStackParams, 'resetPassword'>;

export function ResetPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
  
    const navigation = useNavigation<resetPasswordScreenProp>();

    const resetUserPassword = async () => {
      try {
        await sendPasswordResetEmail(auth, email);
        setSubmitted(true);
        setError('');
      } catch (error) {
        if ((error as FirebaseError).code === 'auth/user-not-found') {
          setError('User not found');
        } else {
          setError('There was a problem with your request');
        }
      }
    };
  
    return (
      <View style={styles.outer}>
        <View style={[styles.shadowProp, styles.card, { width: 330 }]}>
          <Text style={styles.header}>Reset Password</Text>
  
          {error && <Text style={styles.error}>{error}</Text>}
  
          <TouchableOpacity onPress={() => navigation.navigate('Login', { screen: 'LoginScreen' })}>
            <Text style={styles.link}>Back to login</Text>
          </TouchableOpacity>
  
          {submitted ? (
            <Text>Please check your email for a reset password link.</Text>
          ) : (
            <>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Enter email address"
                autoCapitalize="none"
                placeholderTextColor="#aaa"
                style={styles.input}
              />
  
              <TouchableOpacity onPress={resetUserPassword} disabled={!email} style={{ alignSelf: "center" }}>
                <Text style={[styles.link, { fontSize: 18 }]}>Reset Password</Text>
              </TouchableOpacity>
            </>
          )}
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
      color: '#bec7ed',
      marginBottom: 20,
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
  });