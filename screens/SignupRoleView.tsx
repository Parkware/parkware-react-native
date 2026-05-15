import { Text, TextInput, View, StyleSheet, Alert } from 'react-native'
import React, { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SignupStackParams } from '../navigation/types';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import NumericInput from 'react-native-numeric-input';
import { AppButton, AuthButton } from './ButtonComponents';
import { FirebaseError } from 'firebase/app';
import { Picker } from '@react-native-picker/picker';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { commonStyles } from '../theme/styles';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<SignupStackParams, 'signupRoleView'>;

export const SignupRoleView = ({ route }: Props) => {
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [providerSpaces, setProviderSpaces] = useState<number>();
  const { name, email, phoneNum, password }  = route.params;
  const [error, setError] = useState('');
  const [neighborhood, setNeighborhood] = useState('birkshires');
  
  // Create user
  const createAccount = async (isProvider: boolean) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCred.user;
      let userObj: any = {
        email,
        phoneNumber: phoneNum,
        name,
        isProvider,
        neighborhood,
        loggedAsProvider: isProvider
      };

      if (address.length !== 0)
        userObj = {
          ...userObj,
          address,
          providerSpaces
        }

      await setDoc(doc(db, "users", user.uid), userObj);
      showAccountSuccess();
    } catch (error) {
      if ((error as FirebaseError).code === 'auth/invalid-email' || (error as FirebaseError).code === 'auth/wrong-password') {
        setError('Your email is invalid.');
      } else if ((error as FirebaseError).code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else {
        setError('There was a problem with your request');
      }
    }
  };
  
  const showAccountSuccess = () =>
    Alert.alert('Your account has been created!', '', [
      {text: 'Continue'},
    ]);
    
  return (
    <ScreenContainer scroll>
      <Text style={styles.eyebrow}>Final step</Text>
      <Text style={styles.title}>Choose your lane.</Text>
      <Text style={styles.subtitle}>Select a neighborhood, then continue as an organizer or provider.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Neighborhood</Text>
        <View style={styles.pickerShell}>
          <Picker
            selectedValue={neighborhood}
            onValueChange={itemValue => setNeighborhood(itemValue)}>
            <Picker.Item color={colors.text} label="Birkshires" value="birkshires" />
            <Picker.Item color={colors.text} label="Providence" value="providence" />
            <Picker.Item color={colors.text} label="Kitts Creek" value="kittscreek" />
          </Picker>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.roleGrid}>
        <View style={styles.roleCard}>
          <Text style={styles.roleTitle}>Organizer</Text>
          <Text style={styles.roleText}>Request parking spaces and track provider interest.</Text>
          <AppButton title="Continue" onPress={() => createAccount(false)}/>
        </View>
        <View style={styles.roleCard}>
          <Text style={styles.roleTitle}>Provider</Text>
          <Text style={styles.roleText}>Offer available spaces to neighborhood events.</Text>
          <AppButton title="Add provider info" onPress={() => setShowAddress(true)}/>
        </View>
      </View>
    {showAddress && (
      <View style={styles.card}>
        <Text style={styles.label}>Provider address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <View style={styles.spaceRow}>
          <Text style={styles.roleText}>Spaces able to provide</Text>
          <NumericInput rounded totalHeight={50} minValue={1} maxValue={10} onChange={value => setProviderSpaces(value)} />
        </View>
          <AuthButton title="Create Account" onPress={() => createAccount(true)} />
        </View>
    )}
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    marginBottom: spacing.lg,
  },
  eyebrow: commonStyles.label,
  error: {
    ...commonStyles.errorText,
    marginBottom: spacing.md,
  },
  input: commonStyles.input,
  label: commonStyles.label,
  pickerShell: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  roleCard: {
    ...commonStyles.card,
    flex: 1,
    marginBottom: spacing.md,
  },
  roleGrid: {
    gap: spacing.md,
  },
  roleText: {
    ...commonStyles.subtitle,
    marginBottom: spacing.lg,
  },
  roleTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  spaceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...commonStyles.subtitle,
    marginBottom: spacing.xl,
  },
  title: {
    ...commonStyles.screenTitle,
    marginBottom: spacing.sm,
  },
})