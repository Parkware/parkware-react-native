import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { FirebaseError } from "firebase/app";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../navigation/types';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from './ButtonComponents';
import { commonStyles } from '../theme/styles';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

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
      <ScreenContainer centered>
        <Text style={styles.eyebrow}>Parkware</Text>
        <Text style={styles.title}>Welcome back.</Text>
        <Text style={styles.subtitle}>Sign in to manage parking requests and provider updates.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup', { screen: 'SignupScreen' })}>
          <Text style={styles.topLink}>Create an account</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
  
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter email address"
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.text}
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.text}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => navigation.navigate('resetPassword')}>
            <Text style={styles.link}>Forgot your password?</Text>
          </TouchableOpacity>
          <AppButton title="Login" onPress={loginUser} disabled={!email || !password} extraStyles={styles.primaryButton} />
        <TouchableOpacity onPress={() => Linking.openURL('https://linktr.ee/parkware')}>
          <Text style={styles.info}>Learn more</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const styles = StyleSheet.create({
    error: {
      ...commonStyles.errorText,
      marginBottom: spacing.md,
    },
    eyebrow: commonStyles.label,
    info: {
      ...commonStyles.link,
      alignSelf: 'center',
      color: colors.textMuted,
      marginTop: spacing.xl,
    },
    input: {
      ...commonStyles.input,
    },
    link: {
      ...commonStyles.link,
      alignSelf: 'flex-start',
      marginBottom: spacing.lg,
    },
    primaryButton: {
      marginTop: spacing.xs,
    },
    subtitle: {
      ...commonStyles.subtitle,
      marginBottom: spacing.xl,
    },
    title: {
      ...commonStyles.screenTitle,
      marginBottom: spacing.sm,
    },
    topLink: {
      ...commonStyles.link,
      marginBottom: spacing.xl,
    },
  });