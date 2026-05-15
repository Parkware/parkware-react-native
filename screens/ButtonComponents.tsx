import React from 'react';
import { GestureResponderEvent, StyleProp, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  title: string;
  extraStyles?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const AppButton = ({ onPress, title, extraStyles=null, disabled }: ButtonProps) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={
      disabled 
      ? [styles.appButtonContainer, { backgroundColor: colors.disabled, elevation: 0 }]
      : [styles.appButtonContainer, extraStyles]}
    disabled={disabled}
  >
    <Text style={styles.appButtonText}>{title}</Text>
  </TouchableOpacity>
);

export const AuthButton = ({ onPress, title, extraStyles=null, disabled }: ButtonProps) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.secondaryButtonContainer, extraStyles]}
    disabled={disabled}
  >
    <Text style={styles.secondaryButtonText}>{title}</Text>
  </TouchableOpacity>
);

export const DeleteAccountButton = ({ onPress, title, extraStyles=null, disabled }: ButtonProps) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.dangerButtonContainer, extraStyles]}
    disabled={disabled}
  >
    <Text style={styles.deleteButtonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  appButtonContainer: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginVertical: spacing.xs,
  },
  appButtonText: {
    fontSize: 16,
    color: colors.textInverse,
    fontWeight: "800",
    alignSelf: "center",
  },
  dangerButtonContainer: {
    borderColor: colors.danger,
    borderRadius: 999,
    borderWidth: 1,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  secondaryButtonContainer: {
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 1,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "800",
    alignSelf: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: "800",
    alignSelf: "center",
  }
});