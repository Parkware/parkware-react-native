import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import {
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { FirebaseError } from "firebase/app";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from './ButtonComponents';
import { commonStyles } from '../theme/styles';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

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
      <ScreenContainer centered>
          <Text style={styles.eyebrow}>Account help</Text>
          <Text style={styles.header}>Reset password.</Text>
          <Text style={styles.subtitle}>Enter your email and we will send a reset link.</Text>
  
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
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
  
              <AppButton title="Send reset link" onPress={resetUserPassword} disabled={!email} />
            </>
          )}
      </ScreenContainer>
    );
  }

  const styles = StyleSheet.create({
    eyebrow: commonStyles.label,
    header: {
      ...commonStyles.screenTitle,
      marginBottom: spacing.sm,
    },
    input: {
      ...commonStyles.input,
    },
    error: {
      ...commonStyles.errorText,
      marginBottom: spacing.md,
    },
    link: {
      ...commonStyles.link,
      marginBottom: spacing.xl,
    },
    subtitle: {
      ...commonStyles.subtitle,
      marginBottom: spacing.xl,
    },
  });