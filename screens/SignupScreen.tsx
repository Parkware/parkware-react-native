import React, { useEffect, useState } from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParams } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack/lib/typescript/src/types';
import { AppButton } from './ButtonComponents';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { commonStyles } from '../theme/styles';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

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

    useEffect(() => {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
      if (!emailPattern.test(email) && email.length !== 0)
        setError("Invalid email")
      else
        setError("")
    }, [email])
    
    return (
      <ScreenContainer centered>
          <Text style={styles.eyebrow}>New account</Text>
          <Text style={styles.header}>Start with the basics.</Text>
          <Text style={styles.subtitle}>Create an account, then choose your neighborhood and role.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity onPress={() => navigation.navigate('Login', { screen: 'LoginScreen' })}>
            <Text style={styles.link}>Login to existing account</Text>
          </TouchableOpacity>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.text}
            style={styles.input}
          />
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
            value={phoneNum}
            onChangeText={setPhoneNum}
            keyboardType="phone-pad"
            placeholder="Enter phone number (optional)"
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
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm password"
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.text}
            style={styles.input}
          />
          <AppButton
            title="Next"
            onPress={navNext}
            disabled={ !email || !password || (password !== confirmPassword) || (password.length < 6)}
          />
      </ScreenContainer>
    );
  }

  const styles = StyleSheet.create({
    error: {
      ...commonStyles.errorText,
      marginBottom: spacing.md,
    },
    eyebrow: commonStyles.label,
    header: {
      ...commonStyles.screenTitle,
      marginBottom: spacing.sm,
    },
    input: {
      ...commonStyles.input,
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